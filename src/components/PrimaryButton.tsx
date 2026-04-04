import React from "react"
import { Pressable, StyleSheet, ViewStyle } from "react-native"
import { AppText as Text } from "./AppText"
import { AppIcon } from "./AppIcon"
import { borderWidths, colors, radii, spacing } from "../constants/theme"

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ComponentProps<typeof AppIcon>["name"];
}

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  style,
  icon
}: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style
      ]}
    >
      {icon ? (
        <AppIcon
          name={icon}
          size={20}
          color={variant === "primary" ? colors.primaryDeep : colors.text}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          variant === "primary" ? styles.primaryLabel : styles.secondaryLabel
        ]}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 60,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
    elevation: 0
  },
  primary: {
    backgroundColor: colors.primarySoft
  },
  secondary: {
    backgroundColor: colors.accentSoft
  },
  ghost: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0
  },
  pressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 1, height: 1 }
  },
  disabled: {
    opacity: 0.45
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3
  },
  primaryLabel: {
    color: colors.primaryDeep
  },
  secondaryLabel: {
    color: colors.text
  }
})
