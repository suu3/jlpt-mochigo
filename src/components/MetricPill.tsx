import React from "react"
import { StyleSheet, View } from "react-native"
import { AppText as Text } from "./AppText"
import { borderWidths, colors, radii, spacing } from "../constants/theme"

type Props = {
  label: string;
  value: string;
  tone?: "default" | "garden" | "rose" | "amber";
}

const toneStyles = {
  default: {
    wrap: null,
    value: null
  },
  garden: {
    wrap: { backgroundColor: colors.gardenSoft },
    value: { color: colors.garden }
  },
  rose: {
    wrap: { backgroundColor: colors.roseSoft },
    value: { color: colors.rose }
  },
  amber: {
    wrap: { backgroundColor: colors.amberSoft },
    value: { color: colors.amberDeep }
  }
} as const

export function MetricPill({ label, value, tone = "default" }: Props) {
  const palette = toneStyles[tone]

  return (
    <View style={[styles.wrap, palette.wrap]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, palette.value]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 6,
    borderWidth: borderWidths.base,
    borderColor: colors.border
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  value: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900"
  }
})
