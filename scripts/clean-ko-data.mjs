import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LOCALIZATION_DIR = path.join(ROOT, 'data', 'localizations', 'ko');

function containsEnglish(text) {
  // Check if text has many English letters (simple heuristic)
  // We allow some English like "IT", "App", but if it's identical to the English source, we'll mark it.
  return /[a-zA-Z]/.test(text) && text.length > 3;
}

async function cleanFile(level) {
  const filePath = path.join(LOCALIZATION_DIR, `${level}.json`);
  const derivedPath = path.join(ROOT, 'data', 'derived', `${level}.json`);

  if (!fs.existsSync(filePath) || !fs.existsSync(derivedPath)) {
    console.log(`⚠️ Skipping ${level}: files not found`);
    return;
  }

  const localized = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const derived = JSON.parse(fs.readFileSync(derivedPath, 'utf8'));
  const derivedMap = new Map(derived.map(w => [w.id, w]));

  let cleanedCount = 0;
  const result = { ...localized };

  for (const id in result) {
    const item = result[id];
    const sourceWord = derivedMap.get(id);

    if (!sourceWord) {
      delete result[id];
      continue;
    }

    // Heuristic: if meaningKo is identical to source English meaning, it's a failed translation/placeholder
    if (item.meaningKo && item.meaningKo.toLowerCase() === sourceWord.meaning.toLowerCase()) {
      delete result[id];
      cleanedCount++;
      continue;
    }

    // Clean meaningsKo array
    if (item.meaningsKo) {
      const filtered = item.meaningsKo.filter(m => {
        // If it's a direct copy of an English meaning from the source array
        if (sourceWord.meanings.some(em => em.toLowerCase() === m.toLowerCase())) return false;
        return true;
      });

      if (filtered.length === 0) {
        delete result[id];
        cleanedCount++;
      } else {
        result[id].meaningsKo = filtered;
        result[id].meaningKo = filtered[0];
      }
    }
  }

  if (cleanedCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2), 'utf8');
    console.log(`✅ [${level.toUpperCase()}] Cleaned ${cleanedCount} placeholder entries.`);
  } else {
    console.log(`✨ [${level.toUpperCase()}] Already clean!`);
  }
}

async function main() {
  const levels = ['n5', 'n4', 'n3', 'n2', 'n1'];
  for (const level of levels) {
    await cleanFile(level);
  }
}

main().catch(console.error);
