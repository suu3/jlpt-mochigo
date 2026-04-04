import React from "react";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { AppText as Text } from "./AppText";
import { AppIcon } from "./AppIcon";
import { borderWidths, breakpoints, colors, radii, spacing } from "../constants/theme";
import { t } from "../lib/i18n";
import { useAppStore } from "../store/useAppStore";

export function BottomNav() {
  const { width } = useWindowDimensions();
  const { settings, screen, goHome, openReview, openWords, openBookmarks, openSettings } = useAppStore();
  const copy = settings.language;
  const isCompact = width <= breakpoints.phoneCompact;

  return (
    <View style={[styles.wrap, isCompact && styles.wrapCompact]}>
      <View style={[styles.bar, isCompact && styles.barCompact]}>
        <Pressable
          onPress={goHome}
          style={({ pressed }) => [
            styles.item,
            isCompact && styles.itemCompact,
            screen === "home" && styles.itemActive,
            pressed && styles.itemPressed
          ]}
        >
          <AppIcon name="home" size={18} color={screen === "home" ? colors.text : colors.textMuted} />
          <Text style={[styles.label, isCompact && styles.labelCompact, screen === "home" && styles.labelActive]}>
            {t(copy, "goHome")}
          </Text>
        </Pressable>

        <Pressable
          onPress={openReview}
          style={({ pressed }) => [
            styles.item,
            isCompact && styles.itemCompact,
            screen === "review" && styles.itemActive,
            pressed && styles.itemPressed
          ]}
        >
          <AppIcon name="review" size={18} color={screen === "review" ? colors.text : colors.textMuted} />
          <Text style={[styles.label, isCompact && styles.labelCompact, screen === "review" && styles.labelActive]}>
            {t(copy, "review")}
          </Text>
        </Pressable>

        <Pressable
          onPress={openWords}
          style={({ pressed }) => [
            styles.item,
            isCompact && styles.itemCompact,
            screen === "words" && styles.itemActive,
            pressed && styles.itemPressed
          ]}
        >
          <AppIcon name="words" size={18} color={screen === "words" ? colors.text : colors.textMuted} />
          <Text style={[styles.label, isCompact && styles.labelCompact, screen === "words" && styles.labelActive]}>
            {t(copy, "wordsTab")}
          </Text>
        </Pressable>

        <Pressable
          onPress={openBookmarks}
          style={({ pressed }) => [
            styles.item,
            isCompact && styles.itemCompact,
            screen === "bookmarks" && styles.itemActive,
            pressed && styles.itemPressed
          ]}
        >
          <AppIcon name="bookmarks" size={18} color={screen === "bookmarks" ? colors.text : colors.textMuted} />
          <Text style={[styles.label, isCompact && styles.labelCompact, screen === "bookmarks" && styles.labelActive]}>
            {t(copy, "bookmarksTab")}
          </Text>
        </Pressable>

        <Pressable
          onPress={openSettings}
          style={({ pressed }) => [
            styles.item,
            isCompact && styles.itemCompact,
            screen === "settings" && styles.itemActive,
            pressed && styles.itemPressed
          ]}
        >
          <AppIcon name="settings" size={18} color={screen === "settings" ? colors.text : colors.textMuted} />
          <Text style={[styles.label, isCompact && styles.labelCompact, screen === "settings" && styles.labelActive]}>
            {t(copy, "settingsTitle")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm
  },
  wrapCompact: {
    paddingHorizontal: spacing.md
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
  barCompact: {
    gap: spacing.xs,
    paddingHorizontal: spacing.xs
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
  itemCompact: {
    minHeight: 54,
    paddingHorizontal: 4
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
    textTransform: "uppercase",
    textAlign: "center"
  },
  labelCompact: {
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 0.3
  },
  labelActive: {
    color: colors.text
  }
});
