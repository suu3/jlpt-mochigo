import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

const BATCH_SIZE = 15
const DELAY_MS = 2000 // delay to prevent IP ban

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function translateText(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    if (!res.ok) {
      if (res.status === 429) {
        console.warn("⚠️ Rate limited (429). Sleeping for 30s...")
        await sleep(30000)
        return translateText(text) // retry
      }
      throw new Error(`HTTP ${res.status}`)
    }
    const data = await res.json()
    if (!data || !data[0]) return text
    
    return data[0].map((x) => x[0]).join("")
  } catch (err) {
    console.error(`  - Trans error: ${err.message}`)
    return text
  }
}

async function processLevel(level) {
  const derivedPath = path.join(ROOT, "data", "derived", `${level}.json`)
  const koPath = path.join(ROOT, "data", "localizations", "ko", `${level}.json`)

  if (!fs.existsSync(derivedPath)) {
    console.error(`❌ ${derivedPath} not found`)
    return
  }

  const derived = JSON.parse(fs.readFileSync(derivedPath, "utf-8"))
  let existing = {}
  if (fs.existsSync(koPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(koPath, "utf-8"))
    } catch(e) {}
  }

  const untranslated = derived.filter((w) => !existing[w.id])
  console.log(`\n📚 [${level.toUpperCase()}] 전체: ${derived.length}, 기존: ${Object.keys(existing).length}, 미번역: ${untranslated.length}`)

  if (untranslated.length === 0) {
    console.log("  ✅ 이미 모두 번역되어 있습니다.")
    return
  }

  const result = { ...existing }
  let cnt = 0

  for (let i = 0; i < untranslated.length; i += BATCH_SIZE) {
    const batch = untranslated.slice(i, i + BATCH_SIZE)
    
    // Combine with a more robust delimiter
    const textsToTranslate = batch.map(w => w.meanings.join(" / "))
    const comboText = textsToTranslate.join("\n|||\n")
    
    process.stdout.write(`  translating ${i + 1}~${Math.min(i + BATCH_SIZE, untranslated.length)}... `)
    
    let translatedCombo = ""
    try {
      translatedCombo = await translateText(comboText)
    } catch (e) {
      console.error(`\n    ❌ Error in batch ${i+1}: ${e.message}`)
      continue
    }

    const translatedBlocks = translatedCombo.split(/[\n\s]*\|\|\|[\n\s]*/).map(s => s.trim())

    for (let j = 0; j < batch.length; j++) {
      const w = batch[j]
      let blockTrans = translatedBlocks[j]
      
      // Validation: if block is missing or identical to English source, something went wrong with this block
      const sourceText = w.meanings.join(" / ")
      if (!blockTrans || blockTrans.toLowerCase() === sourceText.toLowerCase()) {
        // Try individual translation if batch failed for this block
        blockTrans = await translateText(sourceText)
      }
      
      let transArr = Array.from(new Set(blockTrans.split(/[\/,\n]/).map(x => x.trim()).filter(Boolean)))
      
      // Final fallback: if still no Korean, keep it untranslated for next run
      if (transArr.length === 0 || transArr[0].toLowerCase() === sourceText.toLowerCase()) {
        continue
      }

      result[w.id] = {
        meaningKo: transArr[0],
        meaningsKo: transArr
      }
      cnt++
    }
    console.log(`OK (총 ${cnt}개)`)

    fs.writeFileSync(koPath, JSON.stringify(result, null, 2), "utf-8")
    await sleep(DELAY_MS)
  }
}

async function main() {
  const levels = process.argv[2] ? [process.argv[2].toLowerCase()] : ["n5", "n4", "n3", "n2", "n1"]
  console.log(`🚀 (Free API) 한국어 번역 시작: ${levels.join(", ")}`)

  for (const level of levels) {
    await processLevel(level)
  }
}

main().catch(console.error)
