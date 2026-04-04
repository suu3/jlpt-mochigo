import { JLPTLevel } from "../types/app";

type LevelTheme = {
  solid: string;
  text: string;
  tint: string;
  border: string;
  wash: string;
};

const levelThemes: Record<JLPTLevel, LevelTheme> = {
  N5: {
    solid: "#A8C686",
    text: "#35543A",
    tint: "#E6F0DF",
    border: "#6E8E62",
    wash: "#F3F8EE"
  },
  N4: {
    solid: "#9BC7E7",
    text: "#234E68",
    tint: "#E4F1FA",
    border: "#5F91B2",
    wash: "#F2F8FC"
  },
  N3: {
    solid: "#E8BE64",
    text: "#6A4515",
    tint: "#FAECCC",
    border: "#B67B2D",
    wash: "#FFF6E3"
  },
  N2: {
    solid: "#D89A8E",
    text: "#6B3C36",
    tint: "#F6E2DE",
    border: "#B87165",
    wash: "#FBEFED"
  },
  N1: {
    solid: "#A68DB8",
    text: "#493555",
    tint: "#ECE4F1",
    border: "#7A5C8E",
    wash: "#F6F0F8"
  }
};

export function getLevelTheme(level: JLPTLevel): LevelTheme {
  return levelThemes[level];
}
