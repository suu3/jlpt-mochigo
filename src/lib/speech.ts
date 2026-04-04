import { SpeechOptions } from "expo-speech"
import { AppSettings } from "../types/app"

const speechRates: Record<AppSettings["speechRate"], number> = {
  slow: 0.85,
  normal: 1,
  fast: 1.12
}

const speechPitches: Record<AppSettings["speechPitch"], number> = {
  low: 0.9,
  normal: 1,
  high: 1.1
}

export function getSpeechOptions(settings: AppSettings): SpeechOptions {
  return {
    language: "ja-JP",
    rate: speechRates[settings.speechRate],
    pitch: speechPitches[settings.speechPitch]
  }
}
