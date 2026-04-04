import { SessionHistory, WrongAnswerRecord } from "../types/app"
import { storage } from "./storage"

export const quizDatabase = {
  async initialize() {
    return
  },

  async migrateLegacyDataIfNeeded() {
    return
  },

  async getWrongAnswers() {
    return storage.legacy.readWrongAnswers([])
  },

  async upsertWrongAnswer(record: WrongAnswerRecord) {
    const existing = await storage.legacy.readWrongAnswers([])
    const index = existing.findIndex(
      (item) => item.wordId === record.wordId && item.questionType === record.questionType
    )

    if (index >= 0) {
      existing[index] = record
    } else {
      existing.push(record)
    }

    await storage.legacy.writeWrongAnswers(existing)
  },

  async getHistory(limit = 20) {
    const history = await storage.legacy.readHistory([])
    return history.slice(0, limit)
  },

  async insertHistory(entry: SessionHistory, limit = 20) {
    const history = await storage.legacy.readHistory([])
    const nextHistory = [entry, ...history].slice(0, limit)
    await storage.legacy.writeHistory(nextHistory)
  },

  async clearStudyData() {
    await Promise.all([
      storage.legacy.clearWrongAnswers(),
      storage.legacy.clearHistory()
    ])
  }
}
