import { SessionHistory, WrongAnswerRecord } from "../types/app"

export declare const quizDatabase: {
  initialize(): Promise<void>;
  migrateLegacyDataIfNeeded(): Promise<void>;
  getWrongAnswers(): Promise<WrongAnswerRecord[]>;
  upsertWrongAnswer(record: WrongAnswerRecord): Promise<void>;
  getHistory(limit?: number): Promise<SessionHistory[]>;
  insertHistory(entry: SessionHistory, limit?: number): Promise<void>;
  clearStudyData(): Promise<void>;
}
