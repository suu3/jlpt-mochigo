import n1 from "./generated/n1.json"
import n2 from "./generated/n2.json"
import n3 from "./generated/n3.json"
import n4 from "./generated/n4.json"
import n5 from "./generated/n5.json"
import { JLPTLevel, WordEntry } from "../types/app"

export const wordsByLevel: Record<JLPTLevel, WordEntry[]> = {
  N1: n1 as WordEntry[],
  N2: n2 as WordEntry[],
  N3: n3 as WordEntry[],
  N4: n4 as WordEntry[],
  N5: n5 as WordEntry[]
}
