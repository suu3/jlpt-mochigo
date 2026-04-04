import { create } from "zustand"
import { quizDatabase } from "../lib/database"
import { AppLanguage } from "../lib/i18n"
import { buildSessionQuestions } from "../lib/quiz"
import { storage } from "../lib/storage"
import {
  AppSettings,
  DailyProgress,
  HomeDensitySetting,
  JLPTLevel,
  QuizQuestion,
  SpeechPitchSetting,
  SpeechRateSetting,
  SessionHistory,
  SessionSummary,
  WrongAnswerRecord
} from "../types/app"

type Screen = "setup" | "home" | "quiz" | "result" | "review" | "words" | "bookmarks" | "settings"

type AppState = {
  isReady: boolean;
  screen: Screen;
  hasCompletedOnboarding: boolean;
  settings: AppSettings;
  dailyProgress: DailyProgress;
  streak: number;
  wrongAnswers: WrongAnswerRecord[];
  history: SessionHistory[];
  bookmarkWordIds: string[];
  memorizedWordIds: string[];
  currentQuestions: QuizQuestion[];
  currentIndex: number;
  currentWrongWordIds: string[];
  lastSummary: SessionSummary | null;
  totalStudyCount: number;
  initialize: () => Promise<void>;
  setLevel: (level: JLPTLevel) => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  setTtsEnabled: (enabled: boolean) => Promise<void>;
  setSpeechRate: (rate: SpeechRateSetting) => Promise<void>;
  setSpeechPitch: (pitch: SpeechPitchSetting) => Promise<void>;
  setHomeDensity: (density: HomeDensitySetting) => Promise<void>;
  completeOnboarding: (settings: Pick<AppSettings, "level" | "language" | "homeDensity">) => Promise<void>;
  resetStudyData: () => Promise<void>;
  toggleWordBookmark: (wordId: string) => Promise<void>;
  toggleWordMemorized: (wordId: string) => Promise<void>;
  startSession: (mode?: "mixed" | "review") => void;
  answerCurrentQuestion: (isCorrect: boolean) => void;
  goHome: () => void;
  openReview: () => void;
  openWords: () => void;
  openBookmarks: () => void;
  openSettings: () => void;
  speakEnabled: () => boolean;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayKey() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().slice(0, 10)
}

function defaultSettings(): AppSettings {
  return {
    level: "N5",
    ttsEnabled: true,
    speechRate: "normal",
    speechPitch: "normal",
    homeDensity: "balanced",
    language: "system"
  }
}

function defaultProgress(): DailyProgress {
  return {
    date: todayKey(),
    completedSessions: 0,
    goal: 3
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  isReady: false,
  screen: "setup",
  hasCompletedOnboarding: false,
  settings: defaultSettings(),
  dailyProgress: defaultProgress(),
  streak: 0,
  wrongAnswers: [],
  history: [],
  bookmarkWordIds: [],
  memorizedWordIds: [],
  currentQuestions: [],
  currentIndex: 0,
  currentWrongWordIds: [],
  lastSummary: null,
  totalStudyCount: 0,

  async initialize() {
    const fallbackSettings = defaultSettings()
    const fallbackProgress = defaultProgress()

    await quizDatabase.migrateLegacyDataIfNeeded()

    const [storedSettings, onboardingCompleted, progress, streak, wrongAnswers, history, bookmarkWordIds, memorizedWordIds] = await Promise.all([
      storage.readSettings(fallbackSettings),
      storage.readOnboardingCompleted(),
      storage.readProgress(fallbackProgress),
      storage.readStreak(0),
      quizDatabase.getWrongAnswers(),
      quizDatabase.getHistory(),
      storage.readBookmarkWordIds(),
      storage.readMemorizedWordIds()
    ])

    const settings = {
      ...fallbackSettings,
      ...storedSettings
    }

    const totalStudyCount = history.reduce((sum, entry) => sum + entry.total, 0)

    const normalizedProgress =
      progress.date === todayKey()
        ? progress
        : { ...fallbackProgress, goal: progress.goal }

    set({
      isReady: true,
      screen: onboardingCompleted ? "home" : "setup",
      hasCompletedOnboarding: onboardingCompleted,
      settings,
      dailyProgress: normalizedProgress,
      streak,
      wrongAnswers,
      history,
      bookmarkWordIds,
      memorizedWordIds,
      totalStudyCount
    })
  },

  async setLevel(level) {
    const nextSettings = { ...get().settings, level }
    set({ settings: nextSettings })
    await storage.writeSettings(nextSettings)
  },

  async setLanguage(language) {
    const nextSettings = { ...get().settings, language }
    set({ settings: nextSettings })
    await storage.writeSettings(nextSettings)
  },

  async setTtsEnabled(ttsEnabled) {
    const nextSettings = { ...get().settings, ttsEnabled }
    set({ settings: nextSettings })
    await storage.writeSettings(nextSettings)
  },

  async setSpeechRate(speechRate) {
    const nextSettings = { ...get().settings, speechRate }
    set({ settings: nextSettings })
    await storage.writeSettings(nextSettings)
  },

  async setSpeechPitch(speechPitch) {
    const nextSettings = { ...get().settings, speechPitch }
    set({ settings: nextSettings })
    await storage.writeSettings(nextSettings)
  },

  async setHomeDensity(homeDensity) {
    const nextSettings = { ...get().settings, homeDensity }
    set({ settings: nextSettings })
    await storage.writeSettings(nextSettings)
  },

  async completeOnboarding(partialSettings) {
    const nextSettings = {
      ...get().settings,
      ...partialSettings
    }

    set({
      settings: nextSettings,
      hasCompletedOnboarding: true,
      screen: "home"
    })

    await Promise.all([
      storage.writeSettings(nextSettings),
      storage.writeOnboardingCompleted(true)
    ])
  },

  async resetStudyData() {
    const progress = defaultProgress()

    set({
      dailyProgress: progress,
      streak: 0,
      wrongAnswers: [],
      history: [],
      bookmarkWordIds: [],
      memorizedWordIds: [],
      currentQuestions: [],
      currentIndex: 0,
      currentWrongWordIds: [],
      lastSummary: null,
      totalStudyCount: 0,
      screen: "home"
    })

    await Promise.all([
      quizDatabase.clearStudyData(),
      storage.clearProgress(),
      storage.clearStreak(),
      storage.clearBookmarkWordIds(),
      storage.clearMemorizedWordIds()
    ])
  },

  async toggleWordBookmark(wordId) {
    const bookmarkWordIds = get().bookmarkWordIds.includes(wordId)
      ? get().bookmarkWordIds.filter((id) => id !== wordId)
      : [...get().bookmarkWordIds, wordId]

    set({ bookmarkWordIds })
    await storage.writeBookmarkWordIds(bookmarkWordIds)
  },

  async toggleWordMemorized(wordId) {
    const memorizedWordIds = get().memorizedWordIds.includes(wordId)
      ? get().memorizedWordIds.filter((id) => id !== wordId)
      : [...get().memorizedWordIds, wordId]

    set({ memorizedWordIds })
    await storage.writeMemorizedWordIds(memorizedWordIds)
  },

  startSession(mode = "mixed") {
    const { settings, wrongAnswers } = get()
    const currentQuestions = buildSessionQuestions(
      settings.level,
      wrongAnswers,
      5,
      mode,
      settings.language,
      settings.homeDensity
    )
    set({
      screen: "quiz",
      currentQuestions,
      currentIndex: 0,
      currentWrongWordIds: [],
      lastSummary: null
    })
  },

  answerCurrentQuestion(isCorrect) {
    const state = get()
    const question = state.currentQuestions[state.currentIndex]
    if (!question) {
      return
    }

    const nextWrongAnswers = [...state.wrongAnswers]
    const currentWrongWordIds = [...state.currentWrongWordIds]

    if (!isCorrect) {
      currentWrongWordIds.push(question.wordId)
      const index = nextWrongAnswers.findIndex(
        (record) => record.wordId === question.wordId && record.questionType === question.type
      )
      if (index >= 0) {
        nextWrongAnswers[index] = {
          ...nextWrongAnswers[index],
          wrongCount: nextWrongAnswers[index].wrongCount + 1,
          lastWrongAt: new Date().toISOString()
        }
      } else {
        nextWrongAnswers.push({
          wordId: question.wordId,
          questionType: question.type,
          wrongCount: 1,
          lastWrongAt: new Date().toISOString()
        })
      }

      const latestRecord = nextWrongAnswers.find(
        (record) => record.wordId === question.wordId && record.questionType === question.type
      )
      if (latestRecord) {
        quizDatabase.upsertWrongAnswer(latestRecord).catch((error: unknown) => {
          console.error("Failed to save wrong answer", error)
        })
      }
    }

    const nextIndex = state.currentIndex + 1
    const isSessionDone = nextIndex >= state.currentQuestions.length

    if (!isSessionDone) {
      set({
        currentIndex: nextIndex,
        wrongAnswers: nextWrongAnswers,
        currentWrongWordIds
      })
      return
    }

    const correctCount = state.currentQuestions.length - currentWrongWordIds.length
    const progress =
      state.dailyProgress.date === todayKey()
        ? {
            ...state.dailyProgress,
            completedSessions: state.dailyProgress.completedSessions + 1
          }
        : { date: todayKey(), completedSessions: 1, goal: state.dailyProgress.goal }

    const historyEntry: SessionHistory = {
      id: `${Date.now()}`,
      level: state.settings.level,
      completedAt: new Date().toISOString(),
      total: state.currentQuestions.length,
      correct: correctCount,
      wrongWordIds: currentWrongWordIds
    }

    const history = [historyEntry, ...state.history].slice(0, 20)
    const wrongWords = state.currentQuestions
      .map((item) => item.word)
      .filter((word, index, words) => currentWrongWordIds.includes(word.id) && words.findIndex((candidate) => candidate.id === word.id) === index)

    const completedAt = historyEntry.completedAt.slice(0, 10)
    const previousDate = state.history[0]?.completedAt.slice(0, 10)
    const shouldIncreaseStreak =
      previousDate === yesterdayKey() || state.streak === 0 || previousDate === completedAt
    const streak =
      previousDate === completedAt
        ? state.streak
        : shouldIncreaseStreak
          ? state.streak + 1
          : 1

    set({
      screen: "result",
      wrongAnswers: nextWrongAnswers,
      currentWrongWordIds,
      history,
      dailyProgress: progress,
      streak,
      totalStudyCount: state.totalStudyCount + state.currentQuestions.length,
      lastSummary: {
        correctCount,
        totalCount: state.currentQuestions.length,
        wrongWords
      }
    })

    Promise.all([
      quizDatabase.insertHistory(historyEntry),
      storage.writeProgress(progress),
      storage.writeStreak(streak)
    ]).catch((error: unknown) => {
      console.error("Failed to persist session results", error)
    })
  },

  goHome() {
    set({ screen: "home" })
  },

  openReview() {
    set({ screen: "review" })
  },

  openWords() {
    set({ screen: "words" })
  },

  openBookmarks() {
    set({ screen: "bookmarks" })
  },

  openSettings() {
    set({ screen: "settings" })
  },

  speakEnabled() {
    return get().settings.ttsEnabled
  }
}))
