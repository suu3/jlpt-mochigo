import React from "react"
import { StyleSheet, View } from "react-native"
import { AppIcon } from "../components/AppIcon"
import { AppText as Text } from "../components/AppText"
import { BunnyBadge } from "../components/BunnyBadge"
import { Card } from "../components/Card"
import { CelebrationBurst } from "../components/CelebrationBurst"
import { PrimaryButton } from "../components/PrimaryButton"
import { borderWidths, colors, radii, spacing } from "../constants/theme"
import { t, tf } from "../lib/i18n"
import { getLocalizedMeaning } from "../lib/quiz"
import { useAppStore } from "../store/useAppStore"
import { FoxTeacher } from "../components/FoxTeacher"
import { MetricPill } from "../components/MetricPill"

export function ResultScreen() {
  const { settings, streak, dailyProgress, lastSummary, currentSessionSource, startSession, goHome } = useAppStore()
  const copy = settings.language

  if (!lastSummary) {
    return null
  }

  const ratio = lastSummary.correctCount / lastSummary.totalCount
  const mood = ratio >= 0.8 ? "happy" : "soft"
  const firstWrongWord = lastSummary.wrongWords[0]
  const filledGarden = Array.from({ length: lastSummary.totalCount }, (_, index) => index < lastSummary.correctCount)
  const hasCompletedDailyGoal = dailyProgress.completedSessions >= dailyProgress.goal

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={[styles.bunnyHero, hasCompletedDailyGoal && styles.bunnyHeroCelebration]}>
          <CelebrationBurst active={hasCompletedDailyGoal} />
          {hasCompletedDailyGoal ? (
            <FoxTeacher type="good" size={160} />
          ) : (
            <BunnyBadge mood={mood} />
          )}
        </View>
        <Text style={styles.score}>{tf(copy, "resultScore", { correct: lastSummary.correctCount, total: lastSummary.totalCount })}</Text>
        <Text style={styles.kicker}>{t(copy, hasCompletedDailyGoal ? "goalCompleteKicker" : "resultKicker")}</Text>
        {hasCompletedDailyGoal ? <Text style={styles.goalPrompt}>{t(copy, "goalCompletePrompt")}</Text> : null}
      </View>

      <View style={styles.statsGrid}>
        <MetricPill label={t(copy, "accuracy")} value={`${Math.round(ratio * 100)}%`} tone="garden" icon="sprout" />
        <MetricPill label={t(copy, "streak")} value={tf(copy, "streakValue", { count: streak })} tone="amber" icon="carrot" />
      </View>

      <Card style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewEyebrow}>{t(copy, "needsReview")}</Text>
          <AppIcon name="chevronRight" size={18} color={colors.text} />
        </View>
        {firstWrongWord ? (
          <Text style={styles.reviewWord}>
            {firstWrongWord.kana} <Text style={styles.reviewMeaning}>({getLocalizedMeaning(firstWrongWord, settings.language)})</Text>
          </Text>
        ) : (
          <Text style={styles.reviewWord}>{t(copy, "perfectRound")}</Text>
        )}
      </Card>

      <View style={styles.gardenWrap}>
        <Text style={styles.gardenLabel}>{t(copy, "gardenGrowth")}</Text>
        <View style={styles.gardenRow}>
          {filledGarden.map((filled, index) => (
            <View key={`${filled ? "filled" : "empty"}-${index}`} style={[styles.gardenDot, filled ? styles.gardenDotFilled : styles.gardenDotEmpty]} />
          ))}
        </View>
      </View>

      <Card>
        <Text style={styles.sectionLabel}>{t(copy, "missedWords")}</Text>
        {lastSummary.wrongWords.length === 0 ? (
          <Text style={styles.preview}>{t(copy, "nothingToReview")}</Text>
        ) : (
          lastSummary.wrongWords.map((word) => (
            <View key={word.id} style={styles.wordRow}>
              <Text style={styles.word}>{word.kanji || word.kana}</Text>
              <Text style={styles.meaning}>{word.kana} · {getLocalizedMeaning(word, settings.language)}</Text>
            </View>
          ))
        )}
      </Card>

      <View style={styles.actions}>
        <PrimaryButton 
          label={t(copy, "playAgain")} 
          onPress={() => startSession("mixed", currentSessionSource)} 
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
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg
  },
  actions: {
    gap: spacing.sm
  },
  hero: {
    alignItems: "center"
  },
  bunnyHero: {
    width: 196,
    height: 196,
    marginBottom: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  bunnyHeroCelebration: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: borderWidths.base,
    borderColor: colors.border
  },
  score: {
    fontSize: 40,
    fontWeight: "900",
    color: colors.primary,
    textAlign: "center"
  },
  kicker: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  goalPrompt: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    color: colors.primaryDeep,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center"
  },
  statsGrid: {
    flexDirection: "row",
    gap: spacing.md
  },
  statCard: {
    flex: 1
  },
  statEyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: spacing.sm
  },
  statValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900"
  },
  reviewCard: {
    backgroundColor: colors.surface
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  reviewEyebrow: {
    color: colors.error,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase"
  },
  reviewWord: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900"
  },
  reviewMeaning: {
    color: colors.textMuted,
    fontWeight: "600"
  },
  gardenWrap: {
    alignItems: "center",
    gap: spacing.md
  },
  gardenLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase"
  },
  gardenRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  gardenDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: borderWidths.base,
    borderColor: colors.border
  },
  gardenDotFilled: {
    backgroundColor: colors.primarySoft
  },
  gardenDotEmpty: {
    backgroundColor: colors.surfaceHigh
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: spacing.md
  },
  preview: {
    color: colors.textMuted,
    lineHeight: 22
  },
  wordRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft
  },
  word: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  meaning: {
    color: colors.textMuted,
    marginTop: 4
  }
})
