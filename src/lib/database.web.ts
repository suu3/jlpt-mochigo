import { AppLanguage } from "./i18n";
import { JLPTLevel, SessionHistory, WordEntry, WrongAnswerRecord } from "../types/app";
import { loadBundledLevelWords } from "../data/levelLoader";
import { storage } from "./storage";

const wordCache = new Map<string, WordEntry[]>();

export const quizDatabase = {
  async initialize() {
    return;
  },

  async migrateLegacyDataIfNeeded() {
    return;
  },

  async getCachedLevelWords(level: JLPTLevel, language: AppLanguage) {
    return wordCache.get(`${language}-${level}`) ?? [];
  },

  async getLevelWords(level: JLPTLevel, language: AppLanguage) {
    const cacheKey = `${language}-${level}`;
    const cachedWords = wordCache.get(cacheKey);
    if (cachedWords) {
      return cachedWords;
    }

    const bundledWords = await loadBundledLevelWords(level, language);
    wordCache.set(cacheKey, bundledWords);
    return bundledWords;
  },

  async getWrongAnswers() {
    return storage.legacy.readWrongAnswers([]);
  },

  async upsertWrongAnswer(record: WrongAnswerRecord) {
    const existing = await storage.legacy.readWrongAnswers([]);
    const index = existing.findIndex(
      (item) => item.wordId === record.wordId && item.questionType === record.questionType
    );

    if (index >= 0) {
      existing[index] = record;
    } else {
      existing.push(record);
    }

    await storage.legacy.writeWrongAnswers(existing);
  },

  async deleteWrongAnswer(record: Pick<WrongAnswerRecord, "wordId" | "questionType">) {
    const existing = await storage.legacy.readWrongAnswers([]);
    const nextWrongAnswers = existing.filter(
      (item) => !(item.wordId === record.wordId && item.questionType === record.questionType)
    );

    await storage.legacy.writeWrongAnswers(nextWrongAnswers);
  },

  async getHistory(limit = 20) {
    const history = await storage.legacy.readHistory([]);
    return history.slice(0, limit);
  },

  async insertHistory(entry: SessionHistory, limit = 20) {
    const history = await storage.legacy.readHistory([]);
    const nextHistory = [entry, ...history].slice(0, limit);
    await storage.legacy.writeHistory(nextHistory);
  },

  async clearStudyData() {
    await Promise.all([
      storage.legacy.clearWrongAnswers(),
      storage.legacy.clearHistory()
    ]);
  },

  async clearWordCache() {
    wordCache.clear();
  }
};
