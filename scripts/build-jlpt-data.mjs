import { gunzipSync } from "node:zlib"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { XMLParser } from "fast-xml-parser"
import { parse } from "csv-parse/sync"

const projectRoot = resolve(new URL("..", import.meta.url).pathname)
const rawDir = resolve(projectRoot, "data/raw")
const derivedDir = resolve(projectRoot, "data/derived")
const generatedDir = resolve(projectRoot, "src/data/generated")
const localizationDir = resolve(projectRoot, "data/localizations")

const levelNames = ["N1", "N2", "N3", "N4", "N5"]

function ensureArray(value) {
  if (Array.isArray(value)) {
    return value
  }
  if (value === undefined || value === null) {
    return []
  }
  return [value]
}

function toText(value) {
  if (typeof value === "string") {
    return value
  }
  if (value && typeof value === "object" && "#text" in value) {
    return value["#text"]
  }
  return ""
}

function normalizeGlosses(sense) {
  return ensureArray(sense)
    .flatMap((item) => ensureArray(item.gloss))
    .map((gloss) => toText(gloss).trim())
    .filter(Boolean)
}

function normalizeWordListRecord(record) {
  const entries = Object.fromEntries(Object.entries(record).map(([key, value]) => [key.trim(), `${value}`.trim()]))
  const expression = entries.kanji || entries.expression || entries.word || entries.vocabulary || entries.japanese || ""
  const reading = entries.kana || entries.reading || entries.yomikata || ""

  return {
    expression,
    reading
  }
}

function loadJlptMaps(rowsByLevel) {
  const lookup = new Map()

  for (const [level, rows] of rowsByLevel.entries()) {
    for (const row of rows) {
      const normalized = normalizeWordListRecord(row)
      const keys = [
        normalized.expression,
        normalized.reading,
        `${normalized.expression}::${normalized.reading}`
      ].filter(Boolean)

      for (const key of keys) {
        lookup.set(key, level)
      }
    }
  }

  return lookup
}

function choosePrimaryKanji(entry) {
  const kanji = ensureArray(entry.k_ele).map((item) => item.keb).filter(Boolean)
  return kanji[0] ?? ""
}

function choosePrimaryKana(entry) {
  const kana = ensureArray(entry.r_ele).map((item) => item.reb).filter(Boolean)
  return kana[0] ?? ""
}

function flattenKeys(kanji, kana) {
  const kanjiVariants = kanji ? [kanji] : []
  const kanaVariants = kana ? [kana] : []
  return [
    ...kanjiVariants,
    ...kanaVariants,
    ...kanjiVariants.flatMap((item) => kanaVariants.map((reading) => `${item}::${reading}`))
  ]
}

function pickLevel(keys, lookup) {
  for (const key of keys) {
    const hit = lookup.get(key)
    if (hit) {
      return hit
    }
  }
  return null
}

function dedupeById(entries) {
  const seen = new Set()
  return entries.filter((item) => {
    if (seen.has(item.id)) {
      return false
    }
    seen.add(item.id)
    return true
  })
}

async function readJsonIfExists(path, fallback) {
  try {
    const raw = await readFile(path, "utf8")
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function applyKoLocalizations(level, entries, localizationMap) {
  return entries.map((item) => {
    const localized = localizationMap[item.id]
    if (!localized) {
      return item
    }

    return {
      ...item,
      meaningKo: localized.meaningKo,
      meaningsKo: localized.meaningsKo ?? (localized.meaningKo ? [localized.meaningKo] : undefined)
    }
  })
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseTagValue: false,
  trimValues: true,
  processEntities: false
})

const jmDictCompressed = await readFile(resolve(rawDir, "JMdict_e.gz"))
const jmDictXml = gunzipSync(jmDictCompressed).toString("utf8")
const jmDict = parser.parse(jmDictXml)

const rowsByLevel = new Map()
for (const level of levelNames) {
  const csvRaw = await readFile(resolve(rawDir, `${level.toLowerCase()}.csv`), "utf8")
  const records = parse(csvRaw, {
    columns: true,
    skip_empty_lines: true
  })
  rowsByLevel.set(level, records)
}

const jlptLookup = loadJlptMaps(rowsByLevel)

const entryList = ensureArray(jmDict.JMdict?.entry)
const derivedByLevel = new Map(levelNames.map((level) => [level, []]))

for (const entry of entryList) {
  const kanji = choosePrimaryKanji(entry)
  const kana = choosePrimaryKana(entry)
  const keys = flattenKeys(kanji, kana)
  const level = pickLevel(keys, jlptLookup)

  if (!level) {
    continue
  }

  const glosses = normalizeGlosses(entry.sense)
  if (!kana || glosses.length === 0) {
    continue
  }

  const item = {
    id: `jm-${entry.ent_seq}`,
    kana,
    kanji: kanji || kana,
    meaning: glosses[0],
    meanings: glosses.slice(0, 5),
    jlptLevel: level
  }

  derivedByLevel.get(level).push(item)
}

await mkdir(derivedDir, { recursive: true })
await mkdir(generatedDir, { recursive: true })
await mkdir(resolve(localizationDir, "ko"), { recursive: true })

const metadata = {
  generatedAt: new Date().toISOString(),
  sources: {
    jmDict: "https://www.edrdg.org/pub/Nihongo/JMdict_e.gz",
    jlptWordList: "https://github.com/elzup/jlpt-word-list"
  },
  counts: {}
}

for (const level of levelNames) {
  const localizationMap = await readJsonIfExists(resolve(localizationDir, "ko", `${level.toLowerCase()}.json`), {})
  const deduped = applyKoLocalizations(
    level,
    dedupeById(derivedByLevel.get(level)).sort((left, right) =>
      left.kana.localeCompare(right.kana, "ja")
    ),
    localizationMap
  )
  metadata.counts[level] = deduped.length

  await writeFile(
    resolve(derivedDir, `${level.toLowerCase()}.json`),
    JSON.stringify(deduped, null, 2)
  )
  await writeFile(
    resolve(generatedDir, `${level.toLowerCase()}.json`),
    JSON.stringify(deduped, null, 2)
  )
}

await writeFile(resolve(derivedDir, "metadata.json"), JSON.stringify(metadata, null, 2))
await writeFile(resolve(generatedDir, "metadata.json"), JSON.stringify(metadata, null, 2))

console.log("generated counts", metadata.counts)
