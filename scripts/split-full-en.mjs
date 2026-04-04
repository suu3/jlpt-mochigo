import fs from "fs/promises";
import path from "path";

const PAGESIZE = 600;
const SOURCE_DIR = "src/data/generated/en";
const OUTPUT_DIR = "src/data/generated/for-translation";

async function splitFiles() {
  // Ensure output dire`ctory is clean/exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const levels = ["n1", "n2", "n3", "n4", "n5"];

  for (const level of levels) {
    const sourcePath = path.join(SOURCE_DIR, `${level}.json`);

    try {
      const content = await fs.readFile(sourcePath, "utf-8");
      const words = JSON.parse(content);

      console.log(`Processing ${level} (${words.length} words)...`);

      for (let i = 0; i < words.length; i += PAGESIZE) {
        const pageNum = Math.floor(i / PAGESIZE) + 1;
        // Keep EVERYTHING (no field removal)
        const chunk = words.slice(i, i + PAGESIZE);

        const outputPath = path.join(OUTPUT_DIR, `${level}-${pageNum}.json`);
        await fs.writeFile(outputPath, JSON.stringify(chunk, null, 2));
      }
    } catch (error) {
      console.warn(`Could not process ${level}: ${error.message}`);
    }
  }

  console.log("Done re-splitting full English data for translation.");
}

splitFiles();
