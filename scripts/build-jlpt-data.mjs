import { gunzipSync } from "node:zlib"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { XMLParser } from "fast-xml-parser"
import { parse } from "csv-parse/sync"

const __filename = fileURLToPath(import.meta.url)
const __dirname = resolve(__filename, "..")
const projectRoot = resolve(__dirname, "..")

const rawDir = resolve(projectRoot, "data/raw")
const derivedDir = resolve(projectRoot, "data/derived")
const generatedDir = resolve(projectRoot, "src/data/generated")
const localizationDir = resolve(projectRoot, "data/localizations")

const levelNames = ["N1", "N2", "N3", "N4", "N5"]

// --- JMdict Parsing Utilities ---
function ensureArray(value) {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null) return []
  return [value]
}

function toText(value) {
  if (typeof value === "string") return value
  if (value && typeof value === "object" && "#text" in value) return value["#text"]
  return ""
}

function normalizeGlosses(sense) {
  return ensureArray(sense)
    .flatMap((item) => ensureArray(item.gloss))
    .map((gloss) => toText(gloss).trim())
    .filter(Boolean)
}

function getKanjiList(entry) {
  return ensureArray(entry.k_ele).map((item) => item.keb).filter(Boolean)
}

function getKanaList(entry) {
  return ensureArray(entry.r_ele).map((item) => item.reb).filter(Boolean)
}

// --- CSV Record Normalization ---
function normalizeRecord(record) {
  const expression = (record.expression || record.kanji || record.word || "").trim()
  const reading = (record.reading || record.kana || "").trim()
  const meaning = (record.meaning || "").trim()
  return { expression, reading, meaning }
}

async function main() {
  console.log("Starting build-jlpt-data.mjs (CSV-centric mode)...")

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseTagValue: false,
    trimValues: true,
    processEntities: false
  })

  // 1. Load JMdict and build lookup maps
  console.log("Loading JMdict...")
  const jmDictCompressed = await readFile(resolve(rawDir, "JMdict_e.gz"))
  const jmDictXml = gunzipSync(jmDictCompressed).toString("utf8")
  const jmDict = parser.parse(jmDictXml)
  const entryList = ensureArray(jmDict.JMdict?.entry)

  const jmLookup = new Map() // kanji::reading -> entry
  const jmKanjiLookup = new Map() // kanji -> entry[]
  const jmReadingLookup = new Map() // reading -> entry[]

  for (const entry of entryList) {
    const kanjis = getKanjiList(entry)
    const readings = getKanaList(entry)
    const id = `jm-${entry.ent_seq}`
    
    const entryData = {
      id,
      kanjis,
      readings,
      meanings: normalizeGlosses(entry.sense)
    }

    for (const k of kanjis) {
      if (!jmKanjiLookup.has(k)) jmKanjiLookup.set(k, [])
      jmKanjiLookup.get(k).push(entryData)
      for (const r of readings) {
        const key = `${k}::${r}`
        if (!jmLookup.has(key)) jmLookup.set(key, entryData)
      }
    }
    for (const r of readings) {
      if (!jmReadingLookup.has(r)) jmReadingLookup.set(r, [])
      jmReadingLookup.get(r).push(entryData)
    }
  }

  console.log(`Indexed ${jmLookup.size} primary combinations and ${jmReadingLookup.size} readings.`)

  // 2. Prepare output directories
  const langs = ["en", "ko"]
  for (const lang of langs) {
    await mkdir(resolve(derivedDir, lang), { recursive: true })
    await mkdir(resolve(generatedDir, lang), { recursive: true })
  }

  const metadata = {
    generatedAt: new Date().toISOString(),
    sources: {
      jmDict: "https://www.edrdg.org/jmdict/j_jmdict.html",
      jlptWordList: "https://github.com/elzup/jlpt-word-list"
    },
    counts: {}
  }

  // 3. Process each level's CSV
  for (const level of levelNames) {
    console.log(`Processing ${level}...`)
    const csvPath = resolve(rawDir, `${level.toLowerCase()}.csv`)
    const csvRaw = await readFile(csvPath, "utf8")
    const records = parse(csvRaw, { columns: true, skip_empty_lines: true })
    
    // Load localizations for this level
    const localizationPath = resolve(localizationDir, "ko", `${level.toLowerCase()}.json`)
    let localizationMap = {}
    try {
      localizationMap = JSON.parse(await readFile(localizationPath, "utf8"))
    } catch (e) {}

    const enEntries = []
    const koEntries = []

    for (let i = 0; i < records.length; i++) {
      const normalized = normalizeRecord(records[i])
      const { expression, reading, meaning: csvMeaning } = normalized

      // Find best match in JMdict
      let match = null
      if (expression && reading) {
        match = jmLookup.get(`${expression}::${reading}`)
      }
      if (!match && expression) {
        const candidates = jmKanjiLookup.get(expression)
        if (candidates) {
          // If many, try to match reading
          match = candidates.find(c => reading ? c.readings.includes(reading) : true) || candidates[0]
        }
      }
      if (!match && reading) {
        const candidates = jmReadingLookup.get(reading)
        if (candidates) {
          match = candidates[0] // Pick first
        }
      }

      const id = match ? match.id : `jlpt-${level}-${i}`
      const finalKanji = expression || (match ? (match.kanjis[0] || match.readings[0]) : reading)
      const finalReading = reading || (match ? match.readings[0] : "")

      // English Entry
      const entryEn = {
        id,
        kana: finalReading,
        kanji: finalKanji,
        meaning: match ? match.meanings[0] : csvMeaning,
        meanings: match ? match.meanings.slice(0, 5) : [csvMeaning],
        jlptLevel: level,
        source: "default"
      }
      enEntries.push(entryEn)

      // Korean Entry
      const localized = localizationMap[id]
      const entryKo = {
        id,
        kana: finalReading,
        kanji: finalKanji,
        meaning: localized?.meaningKo || entryEn.meaning, // Fallback to English if no Korean available
        meanings: localized?.meaningsKo || entryEn.meanings,
        jlptLevel: level,
        source: "default"
      }
      koEntries.push(entryKo)
    }

    // Write files
    await writeFile(resolve(derivedDir, "en", `${level.toLowerCase()}.json`), JSON.stringify(enEntries, null, 2))
    await writeFile(resolve(derivedDir, "ko", `${level.toLowerCase()}.json`), JSON.stringify(koEntries, null, 2))
    await writeFile(resolve(generatedDir, "en", `${level.toLowerCase()}.json`), JSON.stringify(enEntries, null, 2))
    await writeFile(resolve(generatedDir, "ko", `${level.toLowerCase()}.json`), JSON.stringify(koEntries, null, 2))

    metadata.counts[level] = enEntries.length
  }

  await writeFile(resolve(derivedDir, "metadata.json"), JSON.stringify(metadata, null, 2))
  await writeFile(resolve(generatedDir, "metadata.json"), JSON.stringify(metadata, null, 2))

  console.log("Build complete. Counts:", metadata.counts)
}

main().catch(console.error)
