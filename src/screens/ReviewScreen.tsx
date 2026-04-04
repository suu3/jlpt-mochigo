import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText as Text } from "../components/AppText";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { borderWidths, colors, radii, spacing } from "../constants/theme";
import { getLocalizedMeaning } from "../lib/quiz";
import { t, tf } from "../lib/i18n";
import { useAppStore } from "../store/useAppStore";
import { FoxTeacher } from "../components/FoxTeacher";
import { WordEntry } from "../types/app";
import { AnimateEntrance } from "../components/AnimateEntrance";
import { animations } from "../constants/theme";
import { AppIcon } from "../components/AppIcon";

export function ReviewScreen() {
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const { settings, wrongAnswers, customWords, wordsByLevel, startSession, goHome, removeWrongAnswer } = useAppStore();
  const copy = settings.language;
  const allJlptWords = Object.values(wordsByLevel).flat().filter((w): w is WordEntry => !!w);
  const fullWordPool = [
    ...allJlptWords,
    ...customWords
  ];
  const reviewItems = [...wrongAnswers]
    .sort((left, right) => right.lastWrongAt.localeCompare(left.lastWrongAt))
    .flatMap((record) => {
      const word = fullWordPool.find((entry) => entry.id === record.wordId);
      return word ? [{ ...record, word }] : [];
    });
  const topItem = reviewItems[0];

  async function handleRemoveWrongAnswer(wordId: string, questionType: "meaning" | "reading") {
    const key = `${wordId}-${questionType}`;
    setRemovingKey(key);

    try {
      await removeWrongAnswer({ wordId, questionType });
    } finally {
      setRemovingKey((current) => (current === key ? null : current));
    }
  }

  return (
    <View style={styles.container}>
      <AnimateEntrance duration={animations.duration.base} type="fade">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{t(copy, "knowledgeGrowth")}</Text>
          <Text style={styles.title}>{t(copy, "reviewTitle")}</Text>
          <Text style={styles.helper}>{t(copy, "sortedByRecent")}</Text>
        </View>
      </AnimateEntrance>

      <View style={styles.grid}>
        {reviewItems.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyFoxWrap}>
              <FoxTeacher type="good" size={160} />
            </View>
            <Text style={styles.empty}>{t(copy, "emptyReview")}</Text>
          </Card>
        ) : (
          reviewItems.map((item, index) => (
            <AnimateEntrance
              key={`${item.wordId}-${item.questionType}`}
              delay={Math.min(index * 20, 120)}
              duration={animations.duration.base}
              type="fade"
            >
                <View style={styles.reviewCard}>
                  <View style={styles.row}>
                    <View style={styles.wordWrap}>
                      <Text style={styles.word}>{item.word.kana}</Text>
                      <Text style={styles.meaning}>
                        {item.word.kanji} ({getLocalizedMeaning(item.word, settings.language)})
                      </Text>
                    </View>
                    <View style={[styles.badge, item.wrongCount >= 5 ? styles.badgeCritical : styles.badgeNormal]}>
                      <Text style={styles.badgeText}>{tf(copy, "mistakesCount", { count: item.wrongCount })}</Text>
                    </View>
                  </View>
                  <View style={styles.cardFooter}>
                    <Text style={styles.footerMeta}>
                      {item.wrongCount >= 5 ? t(copy, "highPriorityFocus") : t(copy, "reviewNeeded")}
                    </Text>
                    <View style={styles.footerActions}>
                      <Text style={styles.footerStatus}>
                        {item.questionType === "meaning" ? t(copy, "meaningLabel") : t(copy, "readingLabel")}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        disabled={removingKey === `${item.wordId}-${item.questionType}`}
                        onPress={() => handleRemoveWrongAnswer(item.wordId, item.questionType)}
                        style={({ pressed }) => [
                          styles.completeButton,
                          pressed && styles.completeButtonPressed,
                          removingKey === `${item.wordId}-${item.questionType}` && styles.completeButtonDisabled
                        ]}
                      >
                        <AppIcon name="check" size={14} color={colors.primaryDeep} />
                        <Text style={styles.completeButtonLabel}>{t(copy, "markReviewDone")}</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
            </AnimateEntrance>
          ))
        )}
      </View>

      {topItem ? (
        <AnimateEntrance delay={120} duration={animations.duration.base} type="fade">
          <Card style={styles.mascotCard}>
            <View style={styles.mascotRow}>
              <View style={styles.mascotCopy}>
                <Text style={styles.mascotQuote}>
                  {tf(copy, "focusNextWord", { word: topItem.word.kanji || topItem.word.kana })}
                </Text>
                <View style={styles.mascotBars}>
                  <View style={styles.mascotBarActive} />
                  <View style={styles.mascotBarIdle} />
                  <View style={styles.mascotBarIdleShort} />
                </View>
              </View>
              <FoxTeacher type="teaching" size={80} style={styles.mascotImg} />
            </View>
          </Card>
        </AnimateEntrance>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton
          label={t(copy, "startReview")}
          onPress={() => startSession("review")}
          disabled={reviewItems.length === 0}
          decoration="retry"
        />
        <PrimaryButton
          label={t(copy, "goHome")}
          onPress={goHome}
          variant="secondary"
          decoration="home"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg
  },
  cardInteractive: {
    flex: 1
  },
  actions: {
    gap: spacing.sm
  },
  header: {
    gap: spacing.xs
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
    color: colors.textMuted
  },
  grid: {
    gap: spacing.md
  },
  emptyCard: {
    alignItems: "center",
    gap: spacing.md
  },
  emptyImage: {
    width: 160,
    height: 160
  },
  empty: {
    color: colors.textMuted,
    lineHeight: 22,
    textAlign: "center"
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    elevation: 4,
    gap: spacing.md
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  wordWrap: {
    flex: 1
  },
  word: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900"
  },
  meaning: {
    color: colors.primary,
    marginTop: 6,
    fontSize: 15,
    fontWeight: "600"
  },
  badge: {
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  badgeNormal: {
    backgroundColor: colors.accent
  },
  badgeCritical: {
    backgroundColor: colors.errorSoft
  },
  badgeText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm
  },
  footerMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600"
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  footerStatus: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800"
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  completeButtonPressed: {
    transform: [{ translateX: 1 }, { translateY: 1 }]
  },
  completeButtonDisabled: {
    opacity: 0.5
  },
  completeButtonLabel: {
    color: colors.primaryDeep,
    fontSize: 12,
    fontWeight: "800"
  },
  mascotCard: {
    backgroundColor: colors.surfaceHigh
  },
  mascotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  mascotCopy: {
    flex: 1
  },
  mascotQuote: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 28
  },
  mascotImg: {
    marginBottom: -spacing.md,
    marginRight: -spacing.sm
  },
  emptyFoxWrap: {
    marginBottom: -spacing.lg
  },
  mascotBars: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  mascotBarActive: {
    width: 48,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.primary
  },
  mascotBarIdle: {
    width: 32,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.borderSoft
  },
  mascotBarIdleShort: {
    width: 16,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.borderSoft
  }
});
