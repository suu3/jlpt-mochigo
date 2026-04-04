import { getLocales } from "expo-localization";

export type AppLanguage = "system" | "ko" | "en";
export type ResolvedLanguage = "ko" | "en";

export type CopyKey =
  | "title"
  | "tagline"
  | "loading"
  | "heroBadge"
  | "heroTitle"
  | "homeGoalCompleteTitle"
  | "homeGoalCompleteBody"
  | "refreshing"
  | "refreshWordDataTitle"
  | "refreshWordDataHelper"
  | "refreshWordDataButton"
  | "dailyGoal"
  | "dailyProgressHint"
  | "dailyProgressCompleteHint"
  | "streak"
  | "streakValue"
  | "start"
  | "review"
  | "difficulty"
  | "languageSettings"
  | "languageHelper"
  | "languageSystem"
  | "languageSystemValue"
  | "languageKorean"
  | "languageEnglish"
  | "setupTitle"
  | "setupHelper"
  | "saveAndStart"
  | "startKicker"
  | "startBody"
  | "quizSourceLabel"
  | "quizSourceJlpt"
  | "quizSourceCustom"
  | "quizSourceCombined"
  | "quizSourceEmpty"
  | "reviewKicker"
  | "reviewBody"
  | "focusGarden"
  | "currentLevel"
  | "dashboardHelper"
  | "settingsEyebrow"
  | "settingsTitle"
  | "settingsHelper"
  | "recentLevel"
  | "meaningQuiz"
  | "readingQuiz"
  | "focusRound"
  | "chooseMeaning"
  | "chooseReading"
  | "meaningHint"
  | "readingHint"
  | "listen"
  | "correct"
  | "wrong"
  | "next"
  | "resultTitle"
  | "resultScore"
  | "resultKicker"
  | "goalCompleteKicker"
  | "goalCompletePrompt"
  | "accuracy"
  | "needsReview"
  | "perfectRound"
  | "gardenGrowth"
  | "missedWords"
  | "nothingToReview"
  | "playAgain"
  | "goHome"
  | "reviewTitle"
  | "emptyReview"
  | "startReview"
  | "question"
  | "of"
  | "adPlaceholder"
  | "encourageGood"
  | "encourageRetry"
  | "filters"
  | "sortedByRecent"
  | "sessions"
  | "knowledgeGrowth"
  | "mistakesCount"
  | "highPriorityFocus"
  | "reviewNeeded"
  | "meaningLabel"
  | "readingLabel"
  | "focusNextWord"
  | "level"
  | "wordBankEyebrow"
  | "wordBankTitle"
  | "wordBankHelper"
  | "jlptWordsTab"
  | "customNotebookTab"
  | "wordsTab"
  | "bookmarksTab"
  | "bookmarksEyebrow"
  | "bookmarksTitle"
  | "bookmarksHelper"
  | "emptyBookmarks"
  | "bookmarkAdded"
  | "memorizedAdded"
  | "memorizeWord"
  | "unmemorizeWord"
  | "kanaRowFilter"
  | "allKanaRows"
  | "kanaRowa"
  | "kanaRowka"
  | "kanaRowsa"
  | "kanaRowta"
  | "kanaRowna"
  | "kanaRowha"
  | "kanaRowma"
  | "kanaRowya"
  | "kanaRowra"
  | "kanaRowwa"
  | "wordLengthFilter"
  | "memorizedFilter"
  | "allWordsFilter"
  | "hideMemorizedFilter"
  | "memorizedOnlyFilter"
  | "emptyFilteredWords"
  | "bookmarkAdd"
  | "bookmarkRemove"
  | "newMistakes"
  | "studyLevelTitle"
  | "studyLevelStage"
  | "studyLevelProgress"
  | "studyLevelMax"
  | "allLengths"
  | "lengthOption"
  | "pageSummary"
  | "previousPage"
  | "nextPage"
  | "showingWordsSummary"
  | "loadMoreWords"
  | "englishMeaningLabel"
  | "showMeanings"
  | "hideMeanings"
  | "meaningHidden"
  | "customWordsTitle"
  | "customWordFormTitle"
  | "customWordsHelper"
  | "customWordsIncluded"
  | "customWordKanaLabel"
  | "customWordKanjiLabel"
  | "customWordMeaningLabel"
  | "customWordKanaPlaceholder"
  | "customWordKanjiPlaceholder"
  | "customWordMeaningPlaceholder"
  | "addCustomWord"
  | "customWordDelete"
  | "customWordAdded"
  | "customWordValidation"
  | "customWordSectionTitle"
  | "emptyCustomWords"
  | "customWordBadge"
  | "ttsSettings"
  | "ttsHelper"
  | "ttsOn"
  | "ttsOff"
  | "speechRate"
  | "speechPitch"
  | "speechRateSlow"
  | "speechRateNormal"
  | "speechRateFast"
  | "speechPitchLow"
  | "speechPitchNormal"
  | "speechPitchHigh"
  | "homeDensity"
  | "homeDensityHelper"
  | "densityRich"
  | "densityBalanced"
  | "densitySimple"
  | "resetStudyDataTitle"
  | "resetStudyDataHelper"
  | "resetStudyDataButton"
  | "resetStudyDataConfirmTitle"
  | "resetStudyDataConfirmBody"
  | "resetStudyDataCancel"
  | "resetStudyDataConfirm"
  | "dataSourcesTitle"
  | "dataSourcesHelper"
  | "dataSourceJmdictTitle"
  | "dataSourceJmdictDescription"
  | "dataSourceJmdictLinkLabel"
  | "dataSourceJlptWordListTitle"
  | "dataSourceJlptWordListDescription"
  | "dataSourceJlptWordListLinkLabel"
  | "externalLinkErrorTitle"
  | "externalLinkErrorBody"
  | "dataSourceDisclaimer";

const dictionary = {
  ko: {
    title: "모찌고",
    tagline: "짧게 풀고 바로 복습하는 JLPT 단어 암기 루틴을 만들어봐요",
    loading: "학습 화면을 불러오고 있어요...",
    heroBadge: "오늘 루틴",
    heroTitle: "가볍게 하나부터, 바로 시작해볼까요?",
    homeGoalCompleteTitle: "오늘 학습을 다 풀었어요.",
    homeGoalCompleteBody:
      "목표를 끝냈어요. 잠깐 쉬어도 좋고, 여유가 있으면 한 학습 더 이어가도 좋아요.",
    refreshing: "새로고침 중...",
    refreshWordDataTitle: "단어 데이터 새로고침",
    refreshWordDataHelper:
      "앱 번들에서 번역된 최신 단어 정보를 다시 불러옵니다. 학습 기록은 유지돼요.",
    refreshWordDataButton: "데이터 동기화",
    dailyGoal: "오늘 분량",
    dailyProgressHint: "오늘 목표까지 {count}학습 남았어요.",
    dailyProgressCompleteHint:
      "오늘 목표는 다 채웠어요. 그래도 더 공부해볼까요?",
    streak: "연속 학습",
    streakValue: "{count}일",
    start: "바로 시작",
    review: "오답 복습",
    difficulty: "난이도",
    languageSettings: "언어 설정",
    languageHelper:
      "기본값은 기기 언어를 따라요. 언어 설정은 언제든 바꿀 수 있어요.",
    languageSystem: "시스템",
    languageSystemValue: "기기 언어 사용",
    languageKorean: "한국어",
    languageEnglish: "English",
    setupTitle: "내 학습 설정부터 맞출게요",
    setupHelper:
      "레벨과 언어만 정하면 바로 풀 수 있어요. 나중에 설정에서 언제든 바꿀 수 있어요.",
    saveAndStart: "이대로 시작",
    startKicker: "학습하기",
    startBody:
      "{source} · {count}문제가 나와요. 틀린 단어는 다음 세션에 먼저 다시 나와요.",
    quizSourceLabel: "출제 범위",
    quizSourceJlpt: "JLPT만",
    quizSourceCustom: "나만의 단어장",
    quizSourceCombined: "둘 다 풀기",
    quizSourceEmpty: "현재 범위에 출제할 단어가 없어요.",
    reviewKicker: "복습 학습",
    reviewBody: "다시 볼 단어가 {count}개 있어요",
    focusGarden: "학습 현황",
    currentLevel: "현재 레벨 {level}",
    dashboardHelper:
      "오늘 학습 현황, 누적 학습, 다시 볼 단어를 한 화면에서 바로 확인할 수 있어요.",
    settingsEyebrow: "앱 설정",
    settingsTitle: "설정",
    settingsHelper: "학습 레벨과 앱 언어를 여기서 바로 바꿀 수 있어요.",
    recentLevel: "최근 레벨",
    meaningQuiz: "의미 맞추기",
    readingQuiz: "읽기 맞추기",
    focusRound: "집중 라운드",
    chooseMeaning: "알맞은 뜻을 골라주세요",
    chooseReading: "알맞은 읽기를 골라주세요",
    meaningHint: "이 단어와 맞는 뜻 하나를 고르면 돼요.",
    readingHint: "이 단어와 맞는 가나 읽기 하나를 고르면 돼요.",
    listen: "소리 듣기",
    correct: "정답",
    wrong: "오답",
    next: "다음 문제",
    resultTitle: "이번 학습 결과",
    resultScore: "{correct} / {total} 정답",
    resultKicker: "이번 학습 완료",
    goalCompleteKicker: "오늘 루틴 완료",
    goalCompletePrompt: "조금 더 해두면 내일이 편해져요.",
    accuracy: "정확도",
    needsReview: "복습 필요",
    perfectRound: "복습할 단어 없음",
    gardenGrowth: "이번 학습 기록",
    missedWords: "다시 볼 단어",
    nothingToReview: "이번 세션은 바로 넘어가도 괜찮아요.",
    playAgain: "한 번 더 풀기",
    goHome: "홈으로",
    reviewTitle: "복습 리스트",
    emptyReview: "아직 다시 볼 단어가 없어요. 첫 학습부터 가볍게 시작해보세요.",
    startReview: "복습 시작하기",
    question: "문제",
    of: "/",
    adPlaceholder: "학습 종료 후 전면 광고 위치",
    encourageGood: "좋아요. 감이 잘 올라오고 있어요.",
    encourageRetry: "한 번만 더 보면 훨씬 익숙해질 거예요.",
    filters: "최근 틀린 순",
    sortedByRecent: "가장 최근에 헷갈린 단어부터 보여드릴게요.",
    sessions: "학습",
    knowledgeGrowth: "복습하기",
    mistakesCount: "{count}회 틀림",
    highPriorityFocus: "먼저 다시 보기",
    reviewNeeded: "복습 추천",
    meaningLabel: "의미",
    readingLabel: "읽기",
    focusNextWord:
      '다음엔 "{word}"만 한 번 더 보면 돼요. 금방 손에 익을 거예요.',
    level: "난이도",
    wordBankEyebrow: "단어 모음",
    wordBankTitle: "단어 모아보기",
    wordBankHelper: "{level} 단어 {count}개를 빠르게 훑어볼 수 있어요.",
    jlptWordsTab: "JLPT 단어",
    customNotebookTab: "나만의 단어장",
    wordsTab: "단어",
    bookmarksTab: "북마크",
    bookmarksEyebrow: "저장한 단어",
    bookmarksTitle: "북마크",
    bookmarksHelper: "북마크한 단어만 따로 모아서 볼 수 있어요.",
    emptyBookmarks:
      "아직 저장한 단어가 없어요. 단어 화면에서 북마크해서 담아보세요.",
    bookmarkAdded: "저장됨",
    memorizedAdded: "외웠음",
    memorizeWord: "외웠어요",
    unmemorizeWord: "다시 볼래요",
    kanaRowFilter: "일본어 행 별로 보기",
    allKanaRows: "전체",
    kanaRowa: "あ行",
    kanaRowka: "か行",
    kanaRowsa: "さ行",
    kanaRowta: "た行",
    kanaRowna: "な行",
    kanaRowha: "は行",
    kanaRowma: "ま行",
    kanaRowya: "や行",
    kanaRowra: "ら行",
    kanaRowwa: "わ行",
    wordLengthFilter: "글자 수 별로 보기",
    memorizedFilter: "외운 단어 별로 보기",
    allWordsFilter: "전체 보기",
    hideMemorizedFilter: "외운 단어 숨기기",
    memorizedOnlyFilter: "외운 단어만",
    emptyFilteredWords:
      "지금 필터에서는 보이는 단어가 없어요. 외운 단어 숨기기를 풀거나 글자 수를 바꿔보세요.",
    bookmarkAdd: "북마크 추가",
    bookmarkRemove: "북마크 해제",
    newMistakes: "새로운 오답",
    studyLevelTitle: "당신의 레벨",
    studyLevelStage: "Lv.{level}",
    studyLevelProgress: "다음 레벨까지 {remaining}문제 남았어요! 화이팅! 🔥",
    studyLevelMax: "최고 레벨에 도달했어요! 당신은 단어 마스터! 👑",
    allLengths: "전체",
    lengthOption: "{count}글자",
    pageSummary: "{current} / {total} 페이지",
    previousPage: "이전",
    nextPage: "다음",
    showingWordsSummary: "{start}-{end} / {total}개",
    loadMoreWords: "더 크게 보기",
    englishMeaningLabel: "영문 뜻 원문",
    showMeanings: "뜻 보기",
    hideMeanings: "뜻 가리기",
    meaningHidden: "••••••",
    customWordsTitle: "나만의 단어장",
    customWordFormTitle: "단어 추가",
    customWordsHelper:
      "직접 추가한 단어를 따로 모아두고, 홈에서 선택했을 때만 퀴즈에 포함해요.",
    customWordsIncluded: "나만의 단어 {count}개가 저장되어 있어요.",
    customWordKanaLabel: "읽기",
    customWordKanjiLabel: "표기",
    customWordMeaningLabel: "뜻",
    customWordKanaPlaceholder: "예: たべる",
    customWordKanjiPlaceholder: "예: 食べる (선택)",
    customWordMeaningPlaceholder: "예: 먹다",
    addCustomWord: "내 단어 추가",
    customWordDelete: "삭제",
    customWordAdded: "추가됨",
    customWordValidation: "읽기와 뜻은 꼭 입력해 주세요.",
    customWordSectionTitle: "내가 추가한 단어",
    emptyCustomWords:
      "아직 직접 추가한 단어가 없어요. 자주 헷갈리는 단어를 먼저 담아보세요.",
    customWordBadge: "내 단어",
    ttsSettings: "음성 설정",
    ttsHelper: "문제와 단어 카드에서 들리는 일본어 발음의 느낌을 조절해요.",
    ttsOn: "TTS 켜기",
    ttsOff: "TTS 끄기",
    speechRate: "말하기 속도",
    speechPitch: "음성 톤",
    speechRateSlow: "느리게",
    speechRateNormal: "보통",
    speechRateFast: "빠르게",
    speechPitchLow: "낮게",
    speechPitchNormal: "보통",
    speechPitchHigh: "또렷하게",
    homeDensity: "학습 단어 범위",
    homeDensityHelper:
      "현재 레벨에서 학습 대상으로 포함할 전체 단어 수를 정해요.",
    densityRich: "많이 외우기",
    densityBalanced: "중간 외우기",
    densitySimple: "간단 외우기",
    resetStudyDataTitle: "학습 기록 초기화",
    resetStudyDataHelper:
      "학습 기록, 오답, 북마크, 외운 단어, 연속 학습 수치가 모두 삭제돼요. 설정은 그대로 남아요.",
    resetStudyDataButton: "학습 기록 전체 삭제",
    resetStudyDataConfirmTitle: "학습 기록을 모두 삭제할까요?",
    resetStudyDataConfirmBody:
      "이 작업은 되돌릴 수 없어요. 지금까지의 학습 기록이 모두 삭제됩니다.",
    resetStudyDataCancel: "취소",
    resetStudyDataConfirm: "삭제하기",
    dataSourcesTitle: "데이터 및 라이선스",
    dataSourcesHelper:
      "이 앱의 학습 데이터셋을 만드는 데 참고한 데이터 출처와 적용 라이선스를 안내합니다.",
    dataSourceJmdictTitle: "JMdict (EDRDG) · CC BY-SA 4.0",
    dataSourceJmdictDescription: "단어 표기, 읽기, 영문 뜻 구성에 참고",
    dataSourceJmdictLinkLabel: "JMdict 안내 페이지",
    dataSourceJlptWordListTitle: "jlpt-word-list by elzup · MIT",
    dataSourceJlptWordListDescription: "JLPT 레벨 매핑 참고 데이터",
    dataSourceJlptWordListLinkLabel: "jlpt-word-list 저장소",
    externalLinkErrorTitle: "링크를 열 수 없어요",
    externalLinkErrorBody: "잠시 후 다시 시도해 주세요.",
    dataSourceDisclaimer:
      "이 앱은 공식 JLPT 시험과 무관하며, 일본어능력시험을 주관하는 기관의 승인이나 후원을 받지 않았습니다."
  },
  en: {
    title: "Mochigo",
    tagline:
      "A calm Japanese vocab app with short sessions and automatic review",
    loading: "Preparing your calm study session...",
    heroBadge: "Daily Focus",
    heroTitle: "You're finding your flow.",
    homeGoalCompleteTitle: "Your garden is glowing today.",
    homeGoalCompleteBody:
      "You've finished today's goal. Rest here for a moment, or keep the calm going with one more round.",
    refreshing: "Refreshing...",
    refreshWordDataTitle: "Refresh Word Data",
    refreshWordDataHelper:
      "Reload latest translated word info from the app bundle. Your history will be kept.",
    refreshWordDataButton: "Sync Data",
    dailyGoal: "Daily Goal",
    dailyProgressHint: "{count} more sessions to reach today's calm finish.",
    dailyProgressCompleteHint:
      "Today's goal is complete. Want to keep going for one more calm round?",
    streak: "Streak",
    streakValue: "{count} days",
    start: "Start Session",
    review: "Review Mistakes",
    difficulty: "Difficulty",
    languageSettings: "Language",
    languageHelper:
      "By default the app follows your device language, and you can change it here anytime.",
    languageSystem: "System",
    languageSystemValue: "Use device language",
    languageKorean: "Korean",
    languageEnglish: "English",
    setupTitle: "Let's set things up first",
    setupHelper:
      "Choose your level and app language once before you start. You can change both later in Settings.",
    saveAndStart: "Save and Start",
    startKicker: "Start Session",
    startBody:
      "{level} level · {source} · {count} questions · missed words are mixed back in first",
    quizSourceLabel: "Quiz Source",
    quizSourceJlpt: "JLPT only",
    quizSourceCustom: "My notebook",
    quizSourceCombined: "Both together",
    quizSourceEmpty: "There are no words to quiz from this source yet.",
    reviewKicker: "Review Deck",
    reviewBody: "{count} tricky words waiting for another pass",
    focusGarden: "Study Overview",
    currentLevel: "Current level {level}",
    dashboardHelper:
      "Your existing study data stays intact. This dashboard simply reshapes your current sessions, streak, and review queue into the new layout.",
    settingsEyebrow: "App Settings",
    settingsTitle: "Settings",
    settingsHelper: "Change your study level and app language here anytime.",
    recentLevel: "Recent Level",
    meaningQuiz: "Meaning Quiz",
    readingQuiz: "Reading Quiz",
    focusRound: "Focus Round",
    chooseMeaning: "Choose the meaning",
    chooseReading: "Choose the reading",
    meaningHint: "Pick the English meaning that matches this word.",
    readingHint: "Pick the kana reading that matches this word.",
    listen: "Listen",
    correct: "Correct",
    wrong: "Wrong",
    next: "Next",
    resultTitle: "Session Result",
    resultScore: "{correct} / {total} correct",
    resultKicker: "Otsukaresama",
    goalCompleteKicker: "Today's goal is complete",
    goalCompletePrompt:
      "One more gentle round now can make tomorrow feel lighter.",
    accuracy: "Accuracy",
    needsReview: "Needs Review",
    perfectRound: "Perfect round",
    gardenGrowth: "Garden Growth",
    missedWords: "Missed words",
    nothingToReview: "Perfect round. Nothing to review this time.",
    playAgain: "Play Again",
    goHome: "Home",
    reviewTitle: "Mistake Review",
    emptyReview: "No mistakes saved yet. Let's begin with a short session.",
    startReview: "Start Review",
    question: "Question",
    of: "/",
    adPlaceholder: "Interstitial ad slot after the session",
    encourageGood: "Nice calm run. You're building momentum.",
    encourageRetry: "A few more rounds and these words will stick.",
    filters: "Recently missed",
    sortedByRecent: "Showing the words you missed most recently.",
    sessions: "sessions",
    knowledgeGrowth: "Knowledge Growth",
    mistakesCount: "{count} mistakes",
    highPriorityFocus: "High priority focus",
    reviewNeeded: "Review needed",
    meaningLabel: "Meaning",
    readingLabel: "Reading",
    focusNextWord:
      'Focus on "{word}" next. One more calm pass will help it stick.',
    level: "Level",
    wordBankEyebrow: "Memory Cards",
    wordBankTitle: "Word Bank",
    wordBankHelper: "Browse all {count} words in {level} at a glance.",
    jlptWordsTab: "JLPT Words",
    customNotebookTab: "My Notebook",
    wordsTab: "Words",
    bookmarksTab: "Bookmarks",
    bookmarksEyebrow: "Saved Words",
    bookmarksTitle: "Bookmarks",
    bookmarksHelper: "Browse only the words you've bookmarked.",
    emptyBookmarks:
      "No bookmarked words yet. Bookmark a word in the word bank to see it here.",
    bookmarkAdded: "Bookmarked",
    memorizedAdded: "Memorized",
    memorizeWord: "I know this",
    unmemorizeWord: "Show again",
    kanaRowFilter: "Kana Row Filter",
    allKanaRows: "All",
    kanaRowa: "A-row",
    kanaRowka: "Ka-row",
    kanaRowsa: "Sa-row",
    kanaRowta: "Ta-row",
    kanaRowna: "Na-row",
    kanaRowha: "Ha-row",
    kanaRowma: "Ma-row",
    kanaRowya: "Ya-row",
    kanaRowra: "Ra-row",
    kanaRowwa: "Wa-row",
    wordLengthFilter: "Length Filter",
    memorizedFilter: "Memorized Filter",
    allWordsFilter: "Show all",
    hideMemorizedFilter: "Hide memorized",
    memorizedOnlyFilter: "Memorized only",
    emptyFilteredWords:
      "No words match this filter right now. Try showing memorized words again or change the length filter.",
    bookmarkAdd: "Add Bookmark",
    bookmarkRemove: "Remove Bookmark",
    newMistakes: "New Mistakes",
    studyLevelTitle: "Your Level",
    studyLevelStage: "Lv.{level}",
    studyLevelProgress: "{remaining} more to the next level! Keep it up! 🔥",
    studyLevelMax: "You've reached the top level! You're a word master! 👑",
    allLengths: "All",
    lengthOption: "{count} characters",
    pageSummary: "Page {current} / {total}",
    previousPage: "Previous",
    nextPage: "Next",
    showingWordsSummary: "{start}-{end} of {total}",
    loadMoreWords: "Show More",
    englishMeaningLabel: "English meaning",
    showMeanings: "Show meanings",
    hideMeanings: "Hide meanings",
    meaningHidden: "••••••",
    customWordsTitle: "My Notebook",
    customWordFormTitle: "Add a Word",
    customWordsHelper:
      "Keep your own words in a separate notebook, and include them in quizzes only when you choose to.",
    customWordsIncluded: "{count} notebook words are saved.",
    customWordKanaLabel: "Reading",
    customWordKanjiLabel: "Written form",
    customWordMeaningLabel: "Meaning",
    customWordKanaPlaceholder: "Example: たべる",
    customWordKanjiPlaceholder: "Example: 食べる (optional)",
    customWordMeaningPlaceholder: "Example: to eat",
    addCustomWord: "Add Word",
    customWordDelete: "Delete",
    customWordAdded: "Added",
    customWordValidation: "Reading and meaning are required.",
    customWordSectionTitle: "Your Added Words",
    emptyCustomWords:
      "No custom words yet. Add a word you want to practice again in quizzes.",
    customWordBadge: "Custom",
    ttsSettings: "Speech",
    ttsHelper:
      "Control how Japanese pronunciation sounds on quiz and word cards.",
    ttsOn: "TTS On",
    ttsOff: "TTS Off",
    speechRate: "Speech Rate",
    speechPitch: "Voice Tone",
    speechRateSlow: "Slow",
    speechRateNormal: "Normal",
    speechRateFast: "Fast",
    speechPitchLow: "Lower",
    speechPitchNormal: "Normal",
    speechPitchHigh: "Clearer",
    homeDensity: "Study Word Range",
    homeDensityHelper:
      "Choose how many words from the current level are included in your study pool.",
    densityRich: "More Words",
    densityBalanced: "Balanced",
    densitySimple: "Light",
    resetStudyDataTitle: "Reset Study Data",
    resetStudyDataHelper:
      "This deletes session history, review mistakes, bookmarks, memorized words, and streak progress. Your settings stay as they are.",
    resetStudyDataButton: "Delete All Study Data",
    resetStudyDataConfirmTitle: "Delete all study data?",
    resetStudyDataConfirmBody:
      "This cannot be undone. Your accumulated study history will be permanently removed.",
    resetStudyDataCancel: "Cancel",
    resetStudyDataConfirm: "Delete",
    dataSourcesTitle: "Data & Licenses",
    dataSourcesHelper:
      "These are the source references and licenses used to shape the study dataset in this app.",
    dataSourceJmdictTitle: "JMdict (EDRDG) · CC BY-SA 4.0",
    dataSourceJmdictDescription:
      "Reference for word forms, readings, and English meanings",
    dataSourceJmdictLinkLabel: "JMdict overview page",
    dataSourceJlptWordListTitle: "jlpt-word-list by elzup · MIT",
    dataSourceJlptWordListDescription:
      "Community-maintained reference for JLPT level mapping",
    dataSourceJlptWordListLinkLabel: "jlpt-word-list repository",
    externalLinkErrorTitle: "Unable to open link",
    externalLinkErrorBody: "Please try again in a moment.",
    dataSourceDisclaimer:
      "This app is not affiliated with or endorsed by the official Japanese-Language Proficiency Test (JLPT)."
  }
} as const;

export function detectLanguage(): ResolvedLanguage {
  const locale = getLocales()[0]?.languageCode ?? "en";
  return locale === "ko" ? "ko" : "en";
}

export function resolveLanguage(language: AppLanguage): ResolvedLanguage {
  return language === "system" ? detectLanguage() : language;
}

export function t(language: AppLanguage, key: CopyKey): string {
  const resolved = resolveLanguage(language);
  return (dictionary[resolved] as Record<string, string>)[key] || "";
}

export function tf(
  language: AppLanguage,
  key: CopyKey,
  values: Record<string, string | number>
): string {
  return t(language, key).replace(
    /\{(\w+)\}/g,
    (_: string, token: string) => `${values[token] ?? ""}`
  );
}
