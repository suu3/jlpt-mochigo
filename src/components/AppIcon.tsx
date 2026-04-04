import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import {
  BookOpenText,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  House,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Volume2
} from "lucide-react-native";
import { colors } from "../constants/theme";

const icons = {
  home: House,
  review: RotateCcw,
  words: BookOpenText,
  bookmarks: Bookmark,
  bookmarkActive: BookmarkCheck,
  settings: Settings2,
  chevronRight: ChevronRight,
  eye: Eye,
  eyeOff: EyeOff,
  check: Check,
  filters: SlidersHorizontal,
  volume: Volume2
} as const;

type IconName = keyof typeof icons;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function AppIcon({
  name,
  size = 20,
  color = colors.textMuted,
  strokeWidth = 1.7,
  style
}: Props) {
  const Icon = icons[name];

  return (
    <Icon color={color} size={size} strokeWidth={strokeWidth} style={style} />
  );
}
