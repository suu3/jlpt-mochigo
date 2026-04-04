import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppIcon } from "../components/AppIcon";
import { AppText as Text } from "../components/AppText";
import { BunnyBadge } from "../components/BunnyBadge";
import { Card } from "../components/Card";
import { borderWidths, colors, radii, spacing } from "../constants/theme";
import { LEVELS_ASCENDING } from "../data/levelLoader";
import { resolveLanguage, t } from "../lib/i18n";
import { getLocalizedMeaning } from "../lib/quiz";
import { useAppStore } from "../store/useAppStore";

export function BookmarksScreen() {
  const { settings, bookmarkWordIds, customWords, toggleWordBookmark, wordsByLevel, totalStudyCount } = useAppStore();
  const resolvedLanguage = resolveLanguage(settings.language);
  const bunnyStage = totalStudyCount >= 100 ? 4 : totalStudyCount >= 60 ? 3 : totalStudyCount >= 25 ? 2 : 1;
  const [showMeanings, setShowMeanings] = useState(true);
  const allWords = useMemo(
    () => [
      ...LEVELS_ASCENDING.flatMap((level) => wordsByLevel[level] ?? []),
      ...customWords
    ],
    [customWords, wordsByLevel]
  );

  const bookmarkedWords = useMemo(
    () =>
      allWords.filter((word) =>
        bookmarkWordIds.includes(word.id)
      ),
    [allWords, bookmarkWordIds]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t(settings.language, "bookmarksEyebrow")}</Text>
        <Text style={styles.title}>{t(settings.language, "bookmarksTitle")}</Text>
        <Text style={styles.helper}>{t(settings.language, "bookmarksHelper")}</Text>
      </View>

      <View style={styles.toolbar}>
        <Pressable
          onPress={() => setShowMeanings((current) => !current)}
          style={({ pressed }) => [styles.visibilityButton, pressed && styles.pressed]}
        >
          <AppIcon
            name={showMeanings ? "eye" : "eyeOff"}
            size={16}
            color={colors.text}
          />
          <Text style={styles.visibilityButtonText}>
            {showMeanings ? t(settings.language, "hideMeanings") : t(settings.language, "showMeanings")}
          </Text>
        </Pressable>
      </View>

      {bookmarkedWords.length === 0 ? (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyBunnyWrap}>
            <BunnyBadge mood="soft" stage={bunnyStage} />
          </View>
          <Text style={styles.emptyText}>{t(settings.language, "emptyBookmarks")}</Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {bookmarkedWords.map((word, index) => (
            <Card key={word.id} style={styles.wordCard}>
              <View style={styles.wordHeader}>
                <View style={styles.wordMetaRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.levelText}>{word.jlptLevel}</Text>
                </View>

                <Pressable
                  onPress={async () => {
                    await toggleWordBookmark(word.id);
                  }}
                  style={({ pressed }) => [
                    styles.bookmarkIconButton,
                    styles.bookmarkIconButtonActive,
                    pressed && styles.pressed
                  ]}
                >
                  <AppIcon name="bookmarkActive" size={18} color={colors.text} />
                </Pressable>
              </View>

              <Text style={styles.kanji}>{word.kanji || word.kana}</Text>
              {word.kanji ? <Text style={styles.kana}>{word.kana}</Text> : null}
              <View style={styles.meaningBlock}>
                <Text style={styles.meaningLabel}>
                  {t(settings.language, "meaningLabel")}
                </Text>
                <Text style={[styles.meaning, !showMeanings && styles.meaningHidden]}>
                  {showMeanings ? getLocalizedMeaning(word, settings.language) : t(settings.language, "meaningHidden")}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
    flex: 1
  },
  header: {
    gap: spacing.xs
  },
  toolbar: {
    alignItems: "flex-end"
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase"
  },
  title: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: "900"
  },
  helper: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    lineHeight: 22
  },
  emptyCard: {
    backgroundColor: colors.surfaceLow
  },
  visibilityButton: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  visibilityButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800"
  },
  emptyText: {
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: "center"
  },
  emptyBunnyWrap: {
    alignItems: "center",
    marginBottom: spacing.md,
    opacity: 0.8
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  wordCard: {
    gap: spacing.sm,
    backgroundColor: colors.surface
  },
  wordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm
  },
  wordMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceHigh,
    borderWidth: borderWidths.base,
    borderColor: colors.border
  },
  badgeText: {
    color: colors.text,
    fontWeight: "900"
  },
  levelText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  bookmarkIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
    justifyContent: "center"
  },
  bookmarkIconButtonActive: {
    borderColor: colors.border,
    backgroundColor: colors.primarySoft
  },
  kanji: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900"
  },
  kana: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700"
  },
  meaningBlock: {
    marginTop: spacing.xs,
    gap: 4
  },
  meaningLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
    textTransform: "uppercase"
  },
  meaning: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24
  },
  meaningHidden: {
    letterSpacing: 1.6
  },
  pressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }]
  }
});
