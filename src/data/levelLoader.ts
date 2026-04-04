import { JLPTLevel, WordEntry } from "../types/app"

const levelLoaders: Record<JLPTLevel, () => WordEntry[]> = {
  N1: () => require("./generated/n1.json") as WordEntry[],
  N2: () => require("./generated/n2.json") as WordEntry[],
  N3: () => require("./generated/n3.json") as WordEntry[],
  N4: () => require("./generated/n4.json") as WordEntry[],
  N5: () => require("./generated/n5.json") as WordEntry[]
}

const memoryCache = new Map<JLPTLevel, WordEntry[]>()

export const LEVELS_ASCENDING: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"]

export async function loadBundledLevelWords(level: JLPTLevel) {
  const cached = memoryCache.get(level)
  if (cached) {
    return cached
  }

  const words = levelLoaders[level]()
  memoryCache.set(level, words)
  return words
}
