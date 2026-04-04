import * as SQLite from "expo-sqlite"
import { storage } from "./storage"
import { JLPTLevel, SessionHistory, WordEntry, WrongAnswerRecord } from "../types/app"
import { loadBundledLevelWords } from "../data/levelLoader"

const DATABASE_NAME = "jlpt-bunny.db"

type WrongAnswerRow = {
  word_id: string;
  question_type: WrongAnswerRecord["questionType"];
  wrong_count: number;
  last_wrong_at: string;
}

type HistoryRow = {
  id: string;
  level: SessionHistory["level"];
  completed_at: string;
  total: number;
  correct: number;
  wrong_word_ids: string;
}

type WordRow = {
  payload: string;
}

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null

async function getDatabase() {
  databasePromise ??= SQLite.openDatabaseAsync(DATABASE_NAME)
  return databasePromise
}

function parseWrongWordIds(value: string) {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []
  } catch {
    return []
  }
}

function parseWordPayload(value: string) {
  try {
    return JSON.parse(value) as WordEntry
  } catch {
    return null
  }
}

export const quizDatabase = {
  async initialize() {
    const db = await getDatabase()
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS wrong_answers (
        word_id TEXT NOT NULL,
        question_type TEXT NOT NULL,
        wrong_count INTEGER NOT NULL DEFAULT 0,
        last_wrong_at TEXT NOT NULL,
        PRIMARY KEY (word_id, question_type)
      );

      CREATE TABLE IF NOT EXISTS session_history (
        id TEXT PRIMARY KEY NOT NULL,
        level TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        total INTEGER NOT NULL,
        correct INTEGER NOT NULL,
        wrong_word_ids TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS word_entries (
        id TEXT PRIMARY KEY NOT NULL,
        level TEXT NOT NULL,
        payload TEXT NOT NULL,
        cached_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_word_entries_level
      ON word_entries (level);
    `)
  },

  async migrateLegacyDataIfNeeded() {
    await this.initialize()
    const hasMigrated = await storage.readSqliteMigrated()
    if (hasMigrated) {
      return
    }

    const db = await getDatabase()
    const [wrongCountRow, historyCountRow, legacyWrongAnswers, legacyHistory] = await Promise.all([
      db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM wrong_answers"),
      db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM session_history"),
      storage.legacy.readWrongAnswers([]),
      storage.legacy.readHistory([])
    ])

    const shouldMigrateWrongAnswers = (wrongCountRow?.count ?? 0) === 0 && legacyWrongAnswers.length > 0
    const shouldMigrateHistory = (historyCountRow?.count ?? 0) === 0 && legacyHistory.length > 0

    await db.withTransactionAsync(async () => {
      if (shouldMigrateWrongAnswers) {
        for (const record of legacyWrongAnswers) {
          await db.runAsync(
            `INSERT OR REPLACE INTO wrong_answers (word_id, question_type, wrong_count, last_wrong_at)
             VALUES (?, ?, ?, ?)`,
            record.wordId,
            record.questionType,
            record.wrongCount,
            record.lastWrongAt
          )
        }
      }

      if (shouldMigrateHistory) {
        for (const entry of legacyHistory) {
          await db.runAsync(
            `INSERT OR REPLACE INTO session_history (id, level, completed_at, total, correct, wrong_word_ids)
             VALUES (?, ?, ?, ?, ?, ?)`,
            entry.id,
            entry.level,
            entry.completedAt,
            entry.total,
            entry.correct,
            JSON.stringify(entry.wrongWordIds)
          )
        }
      }
    })

    await Promise.all([
      storage.writeSqliteMigrated(true),
      shouldMigrateWrongAnswers ? storage.legacy.clearWrongAnswers() : Promise.resolve(),
      shouldMigrateHistory ? storage.legacy.clearHistory() : Promise.resolve()
    ])
  },

  async getCachedLevelWords(level: JLPTLevel) {
    await this.initialize()
    const db = await getDatabase()
    const rows = await db.getAllAsync<WordRow>(
      `SELECT payload
       FROM word_entries
       WHERE level = ?
       ORDER BY id ASC`,
      level
    )

    return rows
      .map((row) => parseWordPayload(row.payload))
      .filter((word): word is WordEntry => word !== null)
  },

  async getLevelWords(level: JLPTLevel) {
    const cachedWords = await this.getCachedLevelWords(level)
    if (cachedWords.length > 0) {
      return cachedWords
    }

    const bundledWords = await loadBundledLevelWords(level)
    const db = await getDatabase()
    const cachedAt = new Date().toISOString()

    await db.withTransactionAsync(async () => {
      for (const word of bundledWords) {
        await db.runAsync(
          `INSERT OR REPLACE INTO word_entries (id, level, payload, cached_at)
           VALUES (?, ?, ?, ?)`,
          word.id,
          level,
          JSON.stringify(word),
          cachedAt
        )
      }
    })

    return bundledWords
  },

  async getWrongAnswers() {
    await this.initialize()
    const db = await getDatabase()
    const rows = await db.getAllAsync<WrongAnswerRow>(
      `SELECT word_id, question_type, wrong_count, last_wrong_at
       FROM wrong_answers
       ORDER BY last_wrong_at DESC`
    )

    return rows.map((row) => ({
      wordId: row.word_id,
      questionType: row.question_type,
      wrongCount: row.wrong_count,
      lastWrongAt: row.last_wrong_at
    }))
  },

  async upsertWrongAnswer(record: WrongAnswerRecord) {
    await this.initialize()
    const db = await getDatabase()
    await db.runAsync(
      `INSERT INTO wrong_answers (word_id, question_type, wrong_count, last_wrong_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(word_id, question_type) DO UPDATE SET
         wrong_count = excluded.wrong_count,
         last_wrong_at = excluded.last_wrong_at`,
      record.wordId,
      record.questionType,
      record.wrongCount,
      record.lastWrongAt
    )
  },

  async getHistory(limit = 20) {
    await this.initialize()
    const db = await getDatabase()
    const rows = await db.getAllAsync<HistoryRow>(
      `SELECT id, level, completed_at, total, correct, wrong_word_ids
       FROM session_history
       ORDER BY completed_at DESC
       LIMIT ?`,
      limit
    )

    return rows.map((row) => ({
      id: row.id,
      level: row.level,
      completedAt: row.completed_at,
      total: row.total,
      correct: row.correct,
      wrongWordIds: parseWrongWordIds(row.wrong_word_ids)
    }))
  },

  async insertHistory(entry: SessionHistory, limit = 20) {
    await this.initialize()
    const db = await getDatabase()
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT OR REPLACE INTO session_history (id, level, completed_at, total, correct, wrong_word_ids)
         VALUES (?, ?, ?, ?, ?, ?)`,
        entry.id,
        entry.level,
        entry.completedAt,
        entry.total,
        entry.correct,
        JSON.stringify(entry.wrongWordIds)
      )

      await db.runAsync(
        `DELETE FROM session_history
         WHERE id NOT IN (
           SELECT id
           FROM session_history
           ORDER BY completed_at DESC
           LIMIT ?
         )`,
        limit
      )
    })
  },

  async clearStudyData() {
    await this.initialize()
    const db = await getDatabase()
    await db.withTransactionAsync(async () => {
      await db.runAsync("DELETE FROM wrong_answers")
      await db.runAsync("DELETE FROM session_history")
    })

    await Promise.all([
      storage.legacy.clearWrongAnswers(),
      storage.legacy.clearHistory()
    ])
  },

  async clearWordCache() {
    await this.initialize()
    const db = await getDatabase()
    await db.runAsync("DELETE FROM word_entries")
  }
}
