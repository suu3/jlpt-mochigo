import { create } from "zustand";
import { LEVELS_ASCENDING } from "../data/levelLoader";
import { quizDatabase } from "../lib/database";
import { AppLanguage, resolveLanguage } from "../lib/i18n";
import { buildSessionQuestions, getStudyWords } from "../lib/quiz";
import { storage } from "../lib/storage";
import {
  AppSettings,
  DailyProgress,
  JLPTLevel,
  QuizQuestion,
  QuizSource,
  SessionHistory,
  SessionSummary,
  SpeechPitchSetting,
  SpeechRateSetting,
  WordEntry,
  WrongAnswerRecord
} from "../types/app";

type Screen = "setup" | "home" | "quiz" | "result" | "review" | "words" | "bookmarks" | "settings";

type AppState = {
  isReady: boolean;
  screen: Screen;
  hasCompletedOnboarding: boolean;
  settings: AppSettings;
  dailyProgress: DailyProgress;
  streak: number;
  wrongAnswers: WrongAnswerRecord[];
  history: SessionHistory[];
  customWords: WordEntry[];
  wordsByLevel: Partial<Record<JLPTLevel, WordEntry[]>>;
  isWordDataLoading: boolean;
  bookmarkWordIds: string[];
  memorizedWordIds: string[];
  currentQuestions: QuizQuestion[];
  currentSessionSource: QuizSource;
  currentIndex: number;
  currentWrongWordIds: string[];
  lastSummary: SessionSummary | null;
  totalStudyCount: number;
  selectedSource: QuizSource;
  initialize: () => Promise<void>;
  refreshWordData: () => Promise<void>;
  ensureLevelWords: (level: JLPTLevel) => Promise<WordEntry[]>;
  preloadAllLevels: () => Promise<void>;
  setLevel: (level: JLPTLevel) => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  setSelectedSource: (source: QuizSource) => void;
  setTtsEnabled: (enabled: boolean) => Promise<void>;
  setSpeechRate: (rate: SpeechRateSetting) => Promise<void>;
  setSpeechPitch: (pitch: SpeechPitchSetting) => Promise<void>;
  completeOnboarding: (settings: Pick<AppSettings, "level" | "language">) => Promise<void>;
  resetStudyData: () => Promise<void>;
  addCustomWord: (input: {
    kana: string;
    kanji?: string;
    meaning: string;
  }) => Promise<void>;
  removeCustomWord: (wordId: string) => Promise<void>;
  toggleWordBookmark: (wordId: string) => Promise<void>;
  toggleWordMemorized: (wordId: string) => Promise<void>;
  startSession: (mode?: "mixed" | "review", source?: QuizSource) => Promise<void>;
  answerCurrentQuestion: (isCorrect: boolean) => void;
  goHome: () => void;
  openReview: () => Promise<void>;
  openWords: () => Promise<void>;
  openBookmarks: () => Promise<void>;
  openSettings: () => void;
  speakEnabled: () => boolean;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function defaultSettings(): AppSettings {
  return {
    level: "N5",
    ttsEnabled: true,
    speechRate: "normal",
    speechPitch: "normal",
    language: "system"
  };
}

function defaultProgress(): DailyProgress {
  return {
    date: todayKey(),
    completedSessions: 0,
    goal: 3
  };
}

export const useAppStore = create<AppState>((set, get) => {
  const ensureLevelWords = async (level: JLPTLevel) => {
    const { settings, wordsByLevel } = get();
    const cachedWords = wordsByLevel[level];
    if (cachedWords) {
      return cachedWords;
    }

    set({ isWordDataLoading: true });

    try {
      const levelWords = await quizDatabase.getLevelWords(level, settings.language);
      set((state) => ({
        wordsByLevel: {
          ...state.wordsByLevel,
          [level]: levelWords
        }
      }));
      return levelWords;
    } finally {
      set({ isWordDataLoading: false });
    }
  };

  const preloadAllLevels = async () => {
    for (const level of LEVELS_ASCENDING) {
      await ensureLevelWords(level);
    }
  };

  return {
    isReady: false,
    screen: "setup",
    hasCompletedOnboarding: false,
    settings: defaultSettings(),
    dailyProgress: defaultProgress(),
    streak: 0,
    wrongAnswers: [],
    history: [],
    customWords: [],
    wordsByLevel: {},
    isWordDataLoading: false,
    bookmarkWordIds: [],
    memorizedWordIds: [],
    currentQuestions: [],
    currentSessionSource: "jlpt",
    currentIndex: 0,
    currentWrongWordIds: [],
    lastSummary: null,
    totalStudyCount: 0,
    selectedSource: "jlpt",

    async initialize() {
      const fallbackSettings = defaultSettings();
      const fallbackProgress = defaultProgress();

      await quizDatabase.migrateLegacyDataIfNeeded();
      // Removed: quizDatabase.clearWordCache() - Should not clear on every run

      const [
        storedSettings,
        onboardingCompleted,
        progress,
        streak,
        wrongAnswers,
        history,
        customWords,
        bookmarkWordIds,
        memorizedWordIds
      ] = await Promise.all([
        storage.readSettings(fallbackSettings),
        storage.readOnboardingCompleted(),
        storage.readProgress(fallbackProgress),
        storage.readStreak(0),
        quizDatabase.getWrongAnswers(),
        quizDatabase.getHistory(),
        storage.readCustomWords([]),
        storage.readBookmarkWordIds(),
        storage.readMemorizedWordIds()
      ]);

      const settings = {
        ...fallbackSettings,
        ...storedSettings
      };

      // Optimization: Only load the words for the current selected level at startup
      set({ isWordDataLoading: true });
      const wordsByLevel: Partial<Record<JLPTLevel, WordEntry[]>> = {};
      const currentLevelWords = await quizDatabase.getLevelWords(settings.level, settings.language);
      wordsByLevel[settings.level] = currentLevelWords;

      const totalStudyCount = history.reduce((sum, entry) => sum + entry.total, 0);
      const normalizedProgress =
        progress.date === todayKey()
          ? progress
          : { ...fallbackProgress, goal: progress.goal };

      set({
        isReady: true,
        screen: onboardingCompleted ? "home" : "setup",
        hasCompletedOnboarding: onboardingCompleted,
        settings,
        dailyProgress: normalizedProgress,
        streak,
        wrongAnswers,
        history,
        customWords,
        wordsByLevel,
        bookmarkWordIds,
        memorizedWordIds,
        isWordDataLoading: false,
        totalStudyCount
      });
    },

    async refreshWordData() {
      const { settings } = get();
      set({ isWordDataLoading: true });
      
      try {
        await quizDatabase.clearWordCache();
        const wordsByLevel: Partial<Record<JLPTLevel, WordEntry[]>> = {};
        // Reload all levels to ensure entire cache is fresh
        for (const level of LEVELS_ASCENDING) {
          const words = await quizDatabase.getLevelWords(level, settings.language);
          wordsByLevel[level] = words;
        }
        set({ wordsByLevel });
      } finally {
        set({ isWordDataLoading: false });
      }
    },

    ensureLevelWords,

    preloadAllLevels,

    async setLevel(level) {
      const { settings, wordsByLevel } = get();
      const needsLoad = !wordsByLevel[level];
      
      const nextSettings = { ...settings, level };
      set({ 
        settings: nextSettings,
        isWordDataLoading: needsLoad || get().isWordDataLoading
      });
      
      await storage.writeSettings(nextSettings);
      await ensureLevelWords(level);
    },

    async setLanguage(language) {
      const nextSettings = { ...get().settings, language };
      set({ 
        settings: nextSettings,
        wordsByLevel: {}, // Clear memory cache
        isWordDataLoading: true 
      });
      await storage.writeSettings(nextSettings);
      
      // Clear SQLite cache for new language to ensure fresh translations
      await quizDatabase.clearWordCache();
      
      const wordsByLevel: Partial<Record<JLPTLevel, WordEntry[]>> = {};
      // Load current level immediately
      const words = await quizDatabase.getLevelWords(nextSettings.level, nextSettings.language);
      wordsByLevel[nextSettings.level] = words;

      set({ wordsByLevel, isWordDataLoading: false });
      
      // Load other levels in background
      for (const level of LEVELS_ASCENDING) {
        if (level !== nextSettings.level) {
          quizDatabase.getLevelWords(level, nextSettings.language)
            .then(words => {
              set(state => ({
                wordsByLevel: { ...state.wordsByLevel, [level]: words }
              }));
            })
            .catch(error => console.error(`Failed to preload level ${level}`, error));
        }
      }
    },

    setSelectedSource(selectedSource) {
      set({ selectedSource });
    },

    async setTtsEnabled(ttsEnabled) {
      const nextSettings = { ...get().settings, ttsEnabled };
      set({ settings: nextSettings });
      await storage.writeSettings(nextSettings);
    },

    async setSpeechRate(speechRate) {
      const nextSettings = { ...get().settings, speechRate };
      set({ settings: nextSettings });
      await storage.writeSettings(nextSettings);
    },

    async setSpeechPitch(speechPitch) {
      const nextSettings = { ...get().settings, speechPitch };
      set({ settings: nextSettings });
      await storage.writeSettings(nextSettings);
    },



    async completeOnboarding(partialSettings) {
      const nextSettings = {
        ...get().settings,
        ...partialSettings
      };

      set({
        settings: nextSettings,
        hasCompletedOnboarding: true,
        screen: "home"
      });

      await Promise.all([
        storage.writeSettings(nextSettings),
        storage.writeOnboardingCompleted(true)
      ]);

      // After onboarding, ensure current level is loaded
      await ensureLevelWords(nextSettings.level);
    },

    async resetStudyData() {
      const progress = defaultProgress();

      set({
        dailyProgress: progress,
        streak: 0,
        wrongAnswers: [],
        history: [],
        customWords: [], // Now clearing custom words as well
        bookmarkWordIds: [],
        memorizedWordIds: [],
        currentQuestions: [],
        currentIndex: 0,
        currentWrongWordIds: [],
        lastSummary: null,
        totalStudyCount: 0,
        screen: "home"
      });

      await Promise.all([
        quizDatabase.clearStudyData(),
        storage.clearProgress(),
        storage.clearStreak(),
        storage.clearBookmarkWordIds(),
        storage.clearMemorizedWordIds(),
        storage.writeCustomWords([]) // Persist the empty custom words
      ]);
    },

    async addCustomWord(input) {
      const state = get();
      const trimmedKana = input.kana.trim();
      const trimmedKanji = (input.kanji ?? "").trim();
      const trimmedMeaning = input.meaning.trim();

      if (!trimmedKana || !trimmedMeaning) {
        return;
      }

      const customWord: WordEntry = {
        id: `custom-${Date.now()}`,
        kana: trimmedKana,
        kanji: trimmedKanji,
        meaning: trimmedMeaning,
        meaningKo: resolveLanguage(state.settings.language) === "ko" ? trimmedMeaning : undefined,
        jlptLevel: state.settings.level,
        source: "custom"
      };

      const customWords = [customWord, ...state.customWords];
      set({ customWords });
      await storage.writeCustomWords(customWords);
    },

    async removeCustomWord(wordId) {
      const state = get();
      const customWords = state.customWords.filter((word) => word.id !== wordId);
      const bookmarkWordIds = state.bookmarkWordIds.filter((id) => id !== wordId);
      const memorizedWordIds = state.memorizedWordIds.filter((id) => id !== wordId);
      const wrongAnswers = state.wrongAnswers.filter((record) => record.wordId !== wordId);

      set({
        customWords,
        bookmarkWordIds,
        memorizedWordIds,
        wrongAnswers
      });

      await Promise.all([
        storage.writeCustomWords(customWords),
        storage.writeBookmarkWordIds(bookmarkWordIds),
        storage.writeMemorizedWordIds(memorizedWordIds)
      ]);
    },

    async toggleWordBookmark(wordId) {
      const bookmarkWordIds = get().bookmarkWordIds.includes(wordId)
        ? get().bookmarkWordIds.filter((id) => id !== wordId)
        : [...get().bookmarkWordIds, wordId];

      set({ bookmarkWordIds });
      await storage.writeBookmarkWordIds(bookmarkWordIds);
    },

    async toggleWordMemorized(wordId) {
      const memorizedWordIds = get().memorizedWordIds.includes(wordId)
        ? get().memorizedWordIds.filter((id) => id !== wordId)
        : [...get().memorizedWordIds, wordId];

      set({ memorizedWordIds });
      await storage.writeMemorizedWordIds(memorizedWordIds);
    },

    async startSession(mode = "mixed", source = "jlpt") {
      const { settings, wrongAnswers, customWords } = get();
      const allJlptWords = Object.values(get().wordsByLevel).flat().filter((w): w is WordEntry => !!w);
      const currentLevelWords = get().wordsByLevel[settings.level] || [];
      
      const sourceWords =
        mode === "review"
          ? [...allJlptWords, ...customWords]
          : source === "jlpt"
            ? currentLevelWords
            : source === "custom"
              ? customWords
              : [...currentLevelWords, ...customWords];
      
      const effectiveSource = mode === "review" ? "combined" : source;
      const words = getStudyWords(sourceWords);

      if (words.length === 0) {
        return;
      }

      const currentQuestions = buildSessionQuestions(words, wrongAnswers, 3, mode, settings.language);

      set({
        screen: "quiz",
        currentQuestions,
        currentSessionSource: effectiveSource,
        currentIndex: 0,
        currentWrongWordIds: [],
        lastSummary: null
      });
    },

    answerCurrentQuestion(isCorrect) {
      const state = get();
      const question = state.currentQuestions[state.currentIndex];
      if (!question) {
        return;
      }

      const nextWrongAnswers = [...state.wrongAnswers];
      const currentWrongWordIds = [...state.currentWrongWordIds];

      if (!isCorrect) {
        currentWrongWordIds.push(question.wordId);
        const index = nextWrongAnswers.findIndex(
          (record) => record.wordId === question.wordId && record.questionType === question.type
        );
        if (index >= 0) {
          nextWrongAnswers[index] = {
            ...nextWrongAnswers[index],
            wrongCount: nextWrongAnswers[index].wrongCount + 1,
            lastWrongAt: new Date().toISOString()
          };
        } else {
          nextWrongAnswers.push({
            wordId: question.wordId,
            questionType: question.type,
            wrongCount: 1,
            lastWrongAt: new Date().toISOString()
          });
        }

        const latestRecord = nextWrongAnswers.find(
          (record) => record.wordId === question.wordId && record.questionType === question.type
        );
        if (latestRecord) {
          quizDatabase.upsertWrongAnswer(latestRecord).catch((error: unknown) => {
            console.error("Failed to save wrong answer", error);
          });
        }
      }

      const nextIndex = state.currentIndex + 1;
      const isSessionDone = nextIndex >= state.currentQuestions.length;

      if (!isSessionDone) {
        set({
          currentIndex: nextIndex,
          wrongAnswers: nextWrongAnswers,
          currentWrongWordIds
        });
        return;
      }

      const correctCount = state.currentQuestions.length - currentWrongWordIds.length;
      const progress =
        state.dailyProgress.date === todayKey()
          ? {
              ...state.dailyProgress,
              completedSessions: state.dailyProgress.completedSessions + 1
            }
          : { date: todayKey(), completedSessions: 1, goal: state.dailyProgress.goal };

      const historyEntry: SessionHistory = {
        id: `${Date.now()}`,
        level: state.settings.level,
        completedAt: new Date().toISOString(),
        total: state.currentQuestions.length,
        correct: correctCount,
        wrongWordIds: currentWrongWordIds
      };

      const history = [historyEntry, ...state.history].slice(0, 20);
      const wrongWords = state.currentQuestions
        .map((item) => item.word)
        .filter((word, index, words) => currentWrongWordIds.includes(word.id) && words.findIndex((candidate) => candidate.id === word.id) === index);

      const completedAt = historyEntry.completedAt.slice(0, 10);
      const previousDate = state.history[0]?.completedAt.slice(0, 10);
      const shouldIncreaseStreak =
        previousDate === yesterdayKey() || state.streak === 0 || previousDate === completedAt;
      const streak =
        previousDate === completedAt
          ? state.streak
          : shouldIncreaseStreak
            ? state.streak + 1
            : 1;

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
      });

      Promise.all([
        quizDatabase.insertHistory(historyEntry),
        storage.writeProgress(progress),
        storage.writeStreak(streak)
      ]).catch((error: unknown) => {
        console.error("Failed to persist session results", error);
      });
    },

    goHome() {
      set({ screen: "home" });
    },

    async openReview() {
      const { settings, wordsByLevel } = get();
      const needsLoad = !wordsByLevel[settings.level];
      
      set({ 
        screen: "review",
        isWordDataLoading: needsLoad || get().isWordDataLoading
      });
      await ensureLevelWords(settings.level);
    },

    async openWords() {
      const { settings, wordsByLevel } = get();
      const needsLoad = !wordsByLevel[settings.level];

      set({ 
        screen: "words",
        isWordDataLoading: needsLoad || get().isWordDataLoading
      });
      await ensureLevelWords(settings.level);
    },

    async openBookmarks() {
      set({ 
        screen: "bookmarks",
        isWordDataLoading: true
      });
      await preloadAllLevels();
      set({ isWordDataLoading: false });
    },

    openSettings() {
      set({ screen: "settings" });
    },

    speakEnabled() {
      return get().settings.ttsEnabled;
    }
  };
});
