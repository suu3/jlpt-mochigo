import { wordsByLevel } from "../data/levels"
import { HomeDensitySetting, JLPTLevel, QuizQuestion, QuizType, WordEntry, WrongAnswerRecord } from "../types/app"
import { AppLanguage, resolveLanguage } from "./i18n"

const WORD_POOL_RATIO: Record<HomeDensitySetting, number> = {
  rich: 1,
  balanced: 0.6,
  simple: 0.3
}

function shuffle<T>(items: T[]) {
  const clone = [...items]
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]]
  }
  return clone
}

function sampleChoices(correct: string, pool: string[]) {
  const distractors = shuffle(pool.filter((item) => item !== correct)).slice(0, 3)
  return shuffle([correct, ...distractors])
}

function buildMixedQuestionTypes(count: number) {
  const meaningCount = Math.ceil(count / 2)
  const readingCount = Math.floor(count / 2)

  return shuffle<QuizType>([
    ...Array.from({ length: meaningCount }, () => "meaning"),
    ...Array.from({ length: readingCount }, () => "reading")
  ])
}

export function getLocalizedMeaning(word: WordEntry, language: AppLanguage) {
  const resolvedLanguage = resolveLanguage(language)
  if (resolvedLanguage === "ko" && word.meaningKo) {
    return word.meaningKo
  }

  return word.meaning
}

function buildQuestion(word: WordEntry, words: WordEntry[], type: QuizType, language: AppLanguage): QuizQuestion {
  const meaningPool = words.map((item) => getLocalizedMeaning(item, language))
  const readingPool = words.map((item) => item.kana)
  const isMeaning = type === "meaning"
  const localizedMeaning = getLocalizedMeaning(word, language)

  return {
    id: `${word.id}-${type}`,
    wordId: word.id,
    type,
    prompt: isMeaning ? word.kanji || word.kana : word.kanji || word.kana,
    choices: isMeaning
      ? sampleChoices(localizedMeaning, meaningPool)
      : sampleChoices(word.kana, readingPool),
    answer: isMeaning ? localizedMeaning : word.kana,
    word
  }
}

export function getWordsByLevel(level: JLPTLevel) {
  return wordsByLevel[level] ?? []
}

function rankWordsForStudy(words: WordEntry[]) {
  return [...words].sort((left, right) => {
    const leftLength = Array.from(left.kana.replace(/\s+/g, "")).length
    const rightLength = Array.from(right.kana.replace(/\s+/g, "")).length

    if (leftLength !== rightLength) {
      return leftLength - rightLength
    }

    const kanaCompare = left.kana.localeCompare(right.kana, "ja")
    if (kanaCompare !== 0) {
      return kanaCompare
    }

    const kanjiCompare = (left.kanji || left.kana).localeCompare(right.kanji || right.kana, "ja")
    if (kanjiCompare !== 0) {
      return kanjiCompare
    }

    return left.id.localeCompare(right.id)
  })
}

export function getStudyWordsByLevel(level: JLPTLevel, range: HomeDensitySetting) {
  const words = getWordsByLevel(level)
  const ratio = WORD_POOL_RATIO[range]

  if (ratio >= 1) {
    return words
  }

  const rankedWords = rankWordsForStudy(words)
  const targetCount = Math.max(12, Math.ceil(words.length * ratio))
  const candidateCount = Math.min(words.length, Math.max(targetCount, Math.ceil(targetCount * 1.8)))

  return shuffle(rankedWords.slice(0, candidateCount)).slice(0, targetCount)
}

export function buildSessionQuestions(
  level: JLPTLevel,
  wrongAnswers: WrongAnswerRecord[],
  count = 5,
  mode: "mixed" | "review" = "mixed",
  language: AppLanguage = "en",
  range: HomeDensitySetting = "rich"
) {
  const words = getStudyWordsByLevel(level, range)
  const prioritizedWords = shuffle(words).sort((left, right) => {
    const leftWrong = wrongAnswers.find((record) => record.wordId === left.id)?.wrongCount ?? 0
    const rightWrong = wrongAnswers.find((record) => record.wordId === right.id)?.wrongCount ?? 0
    return rightWrong - leftWrong
  })

  const reviewWords = prioritizedWords.filter((word) =>
    wrongAnswers.some((record) => record.wordId === word.id)
  )

  const selected = (mode === "review" ? reviewWords : prioritizedWords)
    .slice(0, count)

  const fallbackWords = prioritizedWords.slice(0, count)
  const finalWords = shuffle(selected.length >= count ? selected : fallbackWords)
  const mixedQuestionTypes = buildMixedQuestionTypes(finalWords.length)

  return finalWords.map((word, index) => {
    const forcedType = wrongAnswers.find((record) => record.wordId === word.id)?.questionType
    const type: QuizType =
      mode === "review" && forcedType
        ? forcedType
        : mixedQuestionTypes[index] ?? "meaning"

    return buildQuestion(word, words, type, language)
  })
}
