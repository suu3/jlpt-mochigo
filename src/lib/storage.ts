import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  AppSettings,
  DailyProgress,
  SessionHistory,
  WrongAnswerRecord
} from "../types/app"

const KEYS = {
  settings: "jlpt-bunny/settings",
  onboardingCompleted: "jlpt-bunny/onboarding-completed",
  progress: "jlpt-bunny/progress",
  streak: "jlpt-bunny/streak",
  bookmarkWordIds: "jlpt-bunny/bookmark-word-ids",
  memorizedWordIds: "jlpt-bunny/memorized-word-ids",
  wrongAnswers: "jlpt-bunny/wrong-answers",
  history: "jlpt-bunny/history",
  sqliteMigrated: "jlpt-bunny/sqlite-migrated-v1"
} as const

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key)
  if (!raw) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  readSettings(fallback: AppSettings) {
    return readJson(KEYS.settings, fallback)
  },
  writeSettings(value: AppSettings) {
    return writeJson(KEYS.settings, value)
  },
  readOnboardingCompleted() {
    return readJson(KEYS.onboardingCompleted, false)
  },
  writeOnboardingCompleted(value: boolean) {
    return writeJson(KEYS.onboardingCompleted, value)
  },
  readProgress(fallback: DailyProgress) {
    return readJson(KEYS.progress, fallback)
  },
  writeProgress(value: DailyProgress) {
    return writeJson(KEYS.progress, value)
  },
  clearProgress() {
    return AsyncStorage.removeItem(KEYS.progress)
  },
  readStreak(fallback = 0) {
    return readJson(KEYS.streak, fallback)
  },
  writeStreak(value: number) {
    return writeJson(KEYS.streak, value)
  },
  clearStreak() {
    return AsyncStorage.removeItem(KEYS.streak)
  },
  readBookmarkWordIds(fallback: string[] = []) {
    return readJson(KEYS.bookmarkWordIds, fallback)
  },
  writeBookmarkWordIds(value: string[]) {
    return writeJson(KEYS.bookmarkWordIds, value)
  },
  clearBookmarkWordIds() {
    return AsyncStorage.removeItem(KEYS.bookmarkWordIds)
  },
  readMemorizedWordIds(fallback: string[] = []) {
    return readJson(KEYS.memorizedWordIds, fallback)
  },
  writeMemorizedWordIds(value: string[]) {
    return writeJson(KEYS.memorizedWordIds, value)
  },
  clearMemorizedWordIds() {
    return AsyncStorage.removeItem(KEYS.memorizedWordIds)
  },
  readSqliteMigrated() {
    return readJson(KEYS.sqliteMigrated, false)
  },
  writeSqliteMigrated(value: boolean) {
    return writeJson(KEYS.sqliteMigrated, value)
  },
  legacy: {
    readWrongAnswers(fallback: WrongAnswerRecord[] = []) {
      return readJson(KEYS.wrongAnswers, fallback)
    },
    writeWrongAnswers(value: WrongAnswerRecord[]) {
      return writeJson(KEYS.wrongAnswers, value)
    },
    clearWrongAnswers() {
      return AsyncStorage.removeItem(KEYS.wrongAnswers)
    },
    readHistory(fallback: SessionHistory[] = []) {
      return readJson(KEYS.history, fallback)
    },
    writeHistory(value: SessionHistory[]) {
      return writeJson(KEYS.history, value)
    },
    clearHistory() {
      return AsyncStorage.removeItem(KEYS.history)
    }
  }
}
