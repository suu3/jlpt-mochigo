import React from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { AppText as Text } from "./AppText"
import { AppIcon } from "./AppIcon"
import { borderWidths, colors, radii, spacing } from "../constants/theme"
import { t } from "../lib/i18n"
import { useAppStore } from "../store/useAppStore"

export function BottomNav() {
  const { settings, screen, goHome, openReview, openWords, openBookmarks, openSettings } = useAppStore()
  const copy = settings.language

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <Pressable
          onPress={goHome}
          style={({ pressed }) => [
            styles.item,
            screen === "home" && styles.itemActive,
            pressed && styles.itemPressed
          ]}
        >
          <AppIcon name="home" size={18} color={screen === "home" ? colors.text : colors.textMuted} />
          <Text style={[styles.label, screen === "home" && styles.labelActive]}>
            {t(copy, "goHome")}
          </Text>
        </Pressable>

        <Pressable
          onPress={openReview}
          style={({ pressed }) => [
            styles.item,
            screen === "review" && styles.itemActive,
            pressed && styles.itemPressed
          ]}
        >
          <AppIcon name="review" size={18} color={screen === "review" ? colors.text : colors.textMuted} />
          <Text style={[styles.label, screen === "review" && styles.labelActive]}>
            {t(copy, "review")}
          </Text>
        </Pressable>

        <Pressable
          onPress={openWords}
          style={({ pressed }) => [
            styles.item,
            screen === "words" && styles.itemActive,
            pressed && styles.itemPressed
          ]}
        >
          <AppIcon name="words" size={18} color={screen === "words" ? colors.text : colors.textMuted} />
          <Text style={[styles.label, screen === "words" && styles.labelActive]}>
            {t(copy, "wordsTab")}
          </Text>
        </Pressable>

        <Pressable
          onPress={openBookmarks}
          style={({ pressed }) => [
            styles.item,
            screen === "bookmarks" && styles.itemActive,
            pressed && styles.itemPressed
          ]}
        >
          <AppIcon name="bookmarks" size={18} color={screen === "bookmarks" ? colors.text : colors.textMuted} />
          <Text style={[styles.label, screen === "bookmarks" && styles.labelActive]}>
            {t(copy, "bookmarksTab")}
          </Text>
        </Pressable>

        <Pressable
          onPress={openSettings}
          style={({ pressed }) => [
            styles.item,
            screen === "settings" && styles.itemActive,
            pressed && styles.itemPressed
          ]}
        >
          <AppIcon name="settings" size={18} color={screen === "settings" ? colors.text : colors.textMuted} />
          <Text style={[styles.label, screen === "settings" && styles.labelActive]}>
            {t(copy, "settingsTitle")}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: -2 },
    elevation: 0
  },
  item: {
    flex: 1,
    minHeight: 58,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: spacing.sm
  },
  itemActive: {
    backgroundColor: colors.primarySoft,
    borderWidth: borderWidths.base,
    borderColor: colors.border
  },
  itemPressed: {
    transform: [{ translateY: 1 }]
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  labelActive: {
    color: colors.text
  }
})
