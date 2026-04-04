import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText as Text } from "./AppText";
import { borderWidths, colors, radii, spacing } from "../constants/theme";

import { DecoratedIcon } from "./DecoratedIcon";

type Props = {
  label: string;
  value: string;
  tone?: "default" | "garden" | "rose" | "amber";
  icon?: React.ComponentProps<typeof DecoratedIcon>["name"];
};

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
} as const;

export function MetricPill({ label, value, tone = "default", icon }: Props) {
  const palette = toneStyles[tone];

  return (
    <View style={[styles.wrap, palette.wrap]}>
      <View style={styles.contentRow}>
        <View style={styles.textColumn}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.value, palette.value]}>{value}</Text>
        </View>
        {icon && (
          <View style={styles.iconWrap}>
            <DecoratedIcon name={icon} size={28} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: borderWidths.base,
    borderColor: colors.border
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  textColumn: {
    gap: 0
  },
  iconWrap: {
    marginLeft: spacing.sm
  },
  label: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  }
});
