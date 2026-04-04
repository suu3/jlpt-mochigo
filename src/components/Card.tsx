import React, { PropsWithChildren } from "react"
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import { borderWidths, colors, radii, spacing } from "../constants/theme"

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>

export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
    elevation: 0
  }
})
