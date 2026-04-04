import { AppLanguage, resolveLanguage } from "../lib/i18n";
import { JLPTLevel, WordEntry } from "../types/app";

type LoaderMap = Record<JLPTLevel, () => WordEntry[]>;

const loadersEn: LoaderMap = {
  N1: () => require("./generated/en/n1.json") as WordEntry[],
  N2: () => require("./generated/en/n2.json") as WordEntry[],
  N3: () => require("./generated/en/n3.json") as WordEntry[],
  N4: () => require("./generated/en/n4.json") as WordEntry[],
  N5: () => require("./generated/en/n5.json") as WordEntry[]
};

const loadersKo: LoaderMap = {
  N1: () => require("./generated/ko/n1.json") as WordEntry[],
  N2: () => require("./generated/ko/n2.json") as WordEntry[],
  N3: () => require("./generated/ko/n3.json") as WordEntry[],
  N4: () => require("./generated/ko/n4.json") as WordEntry[],
  N5: () => require("./generated/ko/n5.json") as WordEntry[]
};

const memoryCache = new Map<string, WordEntry[]>();

export const LEVELS_ASCENDING: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"];

export async function loadBundledLevelWords(level: JLPTLevel, language: AppLanguage) {
  const lang = resolveLanguage(language);
  const cacheKey = `${lang}-${level}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const loaders = lang === "ko" ? loadersKo : loadersEn;
  const words = loaders[level]();
  memoryCache.set(cacheKey, words);
  return words;
}

export function clearLoaderCache() {
  memoryCache.clear();
}
