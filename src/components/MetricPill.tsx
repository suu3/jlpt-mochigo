import React from "react"
import { StyleSheet, View } from "react-native"
import { AppText as Text } from "./AppText"
import { borderWidths, colors, radii, spacing } from "../constants/theme"

import { DecoratedIcon } from "./DecoratedIcon"

type Props = {
  label: string;
  value: string;
  tone?: "default" | "garden" | "rose" | "amber";
  icon?: React.ComponentProps<typeof DecoratedIcon>["name"];
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

export function MetricPill({ label, value, tone = "default", icon }: Props) {
  const palette = toneStyles[tone]

  return (
    <View style={[styles.wrap, palette.wrap]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.contentRow}>
        <Text style={[styles.value, palette.value]}>{value}</Text>
        {icon && <DecoratedIcon name={icon} size={32} style={styles.icon} />}
      </View>
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
    gap: 4,
    borderWidth: borderWidths.base,
    borderColor: colors.border
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  icon: {
    marginTop: -spacing.xs
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
