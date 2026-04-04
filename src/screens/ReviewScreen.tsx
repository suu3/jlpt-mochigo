import React from "react"
import { Image, Pressable, StyleSheet, View } from "react-native"
import { AppText as Text } from "../components/AppText"
import { Card } from "../components/Card"
import { PrimaryButton } from "../components/PrimaryButton"
import { borderWidths, colors, radii, spacing } from "../constants/theme"
import { getStudyWords } from "../lib/quiz"
import { t, tf } from "../lib/i18n"
import { useAppStore } from "../store/useAppStore"

const reviewEmptyImage = require("../assets/review_empty.png")

export function ReviewScreen() {
  const { settings, wrongAnswers, customWords, wordsByLevel, startSession, goHome } = useAppStore()
  const copy = settings.language
  const words = getStudyWords(
    [
      ...(wordsByLevel[settings.level] ?? []),
      ...customWords
    ],
    settings.homeDensity
  )
  const reviewItems = [...wrongAnswers]
    .sort((left, right) => right.lastWrongAt.localeCompare(left.lastWrongAt))
    .flatMap((record) => {
      const word = words.find((entry) => entry.id === record.wordId)
      return word ? [{ ...record, word }] : []
    })
  const topItem = reviewItems[0]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t(copy, "knowledgeGrowth")}</Text>
        <Text style={styles.title}>{t(copy, "reviewTitle")}</Text>
        <Text style={styles.helper}>{t(copy, "sortedByRecent")}</Text>
      </View>

      <View style={styles.grid}>
        {reviewItems.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Image source={reviewEmptyImage} style={styles.emptyImage} resizeMode="contain" />
            <Text style={styles.empty}>{t(copy, "emptyReview")}</Text>
          </Card>
        ) : (
          reviewItems.map((item) => (
            <Pressable key={`${item.wordId}-${item.questionType}`} style={styles.reviewCard}>
              <View style={styles.row}>
                <View style={styles.wordWrap}>
                  <Text style={styles.word}>{item.word.kana}</Text>
                  <Text style={styles.meaning}>
                    {item.word.kanji} ({item.word.meaning})
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
                <Text style={styles.footerStatus}>
                  {item.questionType === "meaning" ? t(copy, "meaningLabel") : t(copy, "readingLabel")}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>

      {topItem ? (
        <Card style={styles.mascotCard}>
          <Text style={styles.mascotQuote}>
            {tf(copy, "focusNextWord", { word: topItem.word.kanji || topItem.word.kana })}
          </Text>
          <View style={styles.mascotBars}>
            <View style={styles.mascotBarActive} />
            <View style={styles.mascotBarIdle} />
            <View style={styles.mascotBarIdleShort} />
          </View>
        </Card>
      ) : null}

      <PrimaryButton
        label={t(copy, "startReview")}
        onPress={() => startSession("review")}
        disabled={reviewItems.length === 0}
      />
      <PrimaryButton
        label={t(copy, "goHome")}
        onPress={goHome}
        variant="secondary"
        style={styles.homeButton}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg
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
    alignItems: "center"
  },
  footerMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600"
  },
  footerStatus: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800"
  },
  mascotCard: {
    backgroundColor: colors.surfaceHigh
  },
  mascotQuote: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 28
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
  },
  homeButton: {
    marginTop: spacing.sm
  }
})
