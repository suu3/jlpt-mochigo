import { mkdir, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"

const projectRoot = resolve(new URL("..", import.meta.url).pathname)

const sources = [
  {
    name: "JMdict",
    url: "https://www.edrdg.org/pub/Nihongo/JMdict_e.gz",
    output: "data/raw/JMdict_e.gz"
  },
  {
    name: "KANJIDIC2",
    url: "https://www.edrdg.org/kanjidic/kanjidic2.xml.gz",
    output: "data/raw/kanjidic2.xml.gz"
  },
  ...["n1", "n2", "n3", "n4", "n5"].map((level) => ({
    name: `JLPT ${level.toUpperCase()} word list`,
    url: `https://raw.githubusercontent.com/elzup/jlpt-word-list/master/src/${level}.csv`,
    output: `data/raw/${level}.csv`
  }))
]

async function download(source) {
  const outputPath = resolve(projectRoot, source.output)
  await mkdir(dirname(outputPath), { recursive: true })
  const response = await fetch(source.url)

  if (!response.ok) {
    throw new Error(`Failed to download ${source.name}: ${response.status} ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  await writeFile(outputPath, Buffer.from(arrayBuffer))
  console.log(`saved ${source.output}`)
}

for (const source of sources) {
  await download(source)
}
