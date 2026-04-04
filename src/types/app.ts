export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1"

export type QuizType = "meaning" | "reading"

export type WordEntry = {
  id: string;
  kana: string;
  kanji: string;
  meaning: string;
  meanings?: string[];
  meaningKo?: string;
  meaningsKo?: string[];
  jlptLevel: JLPTLevel;
}

export type QuizQuestion = {
  id: string;
  wordId: string;
  type: QuizType;
  prompt: string;
  choices: string[];
  answer: string;
  word: WordEntry;
}

export type WrongAnswerRecord = {
  wordId: string;
  questionType: QuizType;
  wrongCount: number;
  lastWrongAt: string;
}

export type SessionHistory = {
  id: string;
  level: JLPTLevel;
  completedAt: string;
  total: number;
  correct: number;
  wrongWordIds: string[];
}

export type DailyProgress = {
  date: string;
  completedSessions: number;
  goal: number;
}

export type SpeechRateSetting = "slow" | "normal" | "fast"

export type SpeechPitchSetting = "low" | "normal" | "high"

export type HomeDensitySetting = "rich" | "balanced" | "simple"

export type AppSettings = {
  level: JLPTLevel;
  ttsEnabled: boolean;
  speechRate: SpeechRateSetting;
  speechPitch: SpeechPitchSetting;
  homeDensity: HomeDensitySetting;
  language: "system" | "ko" | "en";
}

export type SessionSummary = {
  correctCount: number;
  totalCount: number;
  wrongWords: WordEntry[];
}

export type BookmarkGroup = {
  id: string;
  name: string;
  wordIds: string[];
  createdAt: string;
}
