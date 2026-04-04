import { JLPTLevel, SessionHistory, WordEntry, WrongAnswerRecord } from "../types/app"

export declare const quizDatabase: {
  initialize(): Promise<void>;
  migrateLegacyDataIfNeeded(): Promise<void>;
  getLevelWords(level: JLPTLevel): Promise<WordEntry[]>;
  getCachedLevelWords(level: JLPTLevel): Promise<WordEntry[]>;
  getWrongAnswers(): Promise<WrongAnswerRecord[]>;
  upsertWrongAnswer(record: WrongAnswerRecord): Promise<void>;
  getHistory(limit?: number): Promise<SessionHistory[]>;
  insertHistory(entry: SessionHistory, limit?: number): Promise<void>;
  clearStudyData(): Promise<void>;
  clearWordCache(): Promise<void>;
}
