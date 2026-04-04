import React from "react"
import { DimensionValue, Pressable, StyleSheet, View } from "react-native"
import { BunnyBadge } from "../components/BunnyBadge"
import { CelebrationBurst } from "../components/CelebrationBurst"
import { AppText as Text } from "../components/AppText"
import { Card } from "../components/Card"
import { GoalGardenHalo } from "../components/GoalGardenHalo"
import { MetricPill } from "../components/MetricPill"
import { borderWidths, colors, radii, spacing } from "../constants/theme"
import { t, tf } from "../lib/i18n"
import { useAppStore } from "../store/useAppStore"

const SESSION_QUESTION_COUNT = 5

function renderHighlightedCopy(
  template: string,
  values: Record<string, string | number>,
  textStyles: Partial<Record<string, object>>
) {
  return template.split(/(\{\w+\})/g).map((part, index) => {
    const match = part.match(/^\{(\w+)\}$/)

    if (!match) {
      return part
    }

    const token = match[1]
    return (
      <Text key={`${token}-${index}`} style={textStyles[token]}>
        {values[token]}
      </Text>
    )
  })
}

export function HomeScreen() {
  const { settings, dailyProgress, streak, history, wrongAnswers, startSession, openReview, totalStudyCount } = useAppStore()
  const copy = settings.language
  const remainingSessions = Math.max(dailyProgress.goal - dailyProgress.completedSessions, 0)
  const hasCompletedDailyGoal = remainingSessions === 0
  const progressRatio = Math.min(dailyProgress.completedSessions / Math.max(dailyProgress.goal, 1), 1)
  const progressWidth = `${Math.max(progressRatio * 100, 8)}%` as DimensionValue
  const bunnyStage = totalStudyCount >= 100 ? 4 : totalStudyCount >= 60 ? 3 : totalStudyCount >= 25 ? 2 : 1

  return (
    <View style={styles.container}>
      <Card style={[styles.hero, hasCompletedDailyGoal && styles.heroComplete]}>
        {hasCompletedDailyGoal ? (
          <View style={styles.completeHeroWrap}>
            <View style={styles.completeHeroCopy}>
              <View style={styles.completeHeroBadge}>
                <Text style={styles.completeHeroBadgeText}>{t(copy, "goalCompleteKicker")}</Text>
              </View>
              <Text style={styles.completeHeroTitle}>{t(copy, "homeGoalCompleteTitle")}</Text>
              <Text style={styles.completeHeroBody}>{t(copy, "homeGoalCompleteBody")}</Text>

              <View style={styles.completeHeroMetaRow}>
                <View style={[styles.completeMetaChip, styles.completeMetaChipGarden]}>
                  <Text style={styles.completeMetaLabel}>{t(copy, "dailyGoal")}</Text>
                  <Text style={styles.completeMetaValue}>{dailyProgress.completedSessions}/{dailyProgress.goal}</Text>
                </View>
                <View style={[styles.completeMetaChip, styles.completeMetaChipRose]}>
                  <Text style={styles.completeMetaLabel}>{t(copy, "studyLevelTitle")}</Text>
                  <Text style={styles.completeMetaValue}>{tf(copy, "studyLevelStage", { level: bunnyStage })}</Text>
                </View>
              </View>
            </View>

            <View style={styles.completeHeroStage}>
              <View style={styles.completeHeroStageBackdrop}>
                <GoalGardenHalo active />
                <View style={styles.completeHeroBunnyWrap}>
                  <CelebrationBurst active />
                  <BunnyBadge mood="happy" stage={bunnyStage} />
                </View>
              </View>
            </View>

            <View style={styles.completeHeroFooter}>
              <View style={styles.completeHeroStreakPill}>
                <Text style={styles.completeHeroStreakLabel}>{t(copy, "streak")}</Text>
                <Text style={styles.completeHeroStreakValue}>{tf(copy, "streakValue", { count: streak })}</Text>
              </View>
              <Text style={styles.completeHeroFooterText}>{t(copy, "dailyProgressCompleteHint")}</Text>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.heroInsights}>
              <View style={[styles.heroSpotlight, styles.heroSpotlightLevel]}>
                <Text style={[styles.heroSpotlightLabel, styles.heroSpotlightLabelBlue]}>{t(copy, "level")}</Text>
                <Text style={styles.heroSpotlightValue}>{settings.level}</Text>
                <Text style={styles.heroSpotlightCaption}>{t(copy, "focusGarden")}</Text>
              </View>

              <View style={[styles.heroSpotlight, styles.heroSpotlightGrowth]}>
                <View style={styles.heroGrowthRow}>
                  <View style={styles.heroGrowthText}>
                    <Text style={[styles.heroSpotlightLabel, styles.heroSpotlightLabelGarden]}>{t(copy, "studyLevelTitle")}</Text>
                    <Text style={styles.heroSpotlightValue}>{tf(copy, "studyLevelStage", { level: bunnyStage })}</Text>
                    <Text style={styles.heroSpotlightCaption}>
                      {renderHighlightedCopy(t(copy, "studyLevelProgress"), { count: totalStudyCount }, { count: styles.inlineGardenStrong })}
                    </Text>
                  </View>
                  <View style={styles.heroGrowthBadge}>
                    <BunnyBadge mood="calm" stage={bunnyStage} />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.heroTop}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{t(copy, "heroBadge")}</Text>
              </View>
              <Text style={styles.heroTitle}>{t(copy, "heroTitle")}</Text>
              <Text style={styles.heroSubtitle}>{t(copy, "tagline")}</Text>
            </View>

            <View style={styles.heroBody}>
              <View style={styles.heroProgressWrap}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>{t(copy, "dailyGoal")}</Text>
                  <Text style={styles.progressValue}>
                    <Text style={styles.progressValueCurrent}>{dailyProgress.completedSessions}</Text>
                    <Text style={styles.progressValueDivider}>/</Text>
                    <Text style={styles.progressValueTarget}>{dailyProgress.goal}</Text>
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: progressWidth }]} />
                </View>
                <Text style={styles.progressHint}>
                  {renderHighlightedCopy(t(copy, "dailyProgressHint"), { count: remainingSessions }, { count: styles.inlineAmberStrong })}
                </Text>
              </View>
            </View>
          </>
        )}
      </Card>

      <View style={styles.metrics}>
        <MetricPill label={t(copy, "streak")} value={tf(copy, "streakValue", { count: streak })} tone="garden" />
        <MetricPill label={t(copy, "sessions")} value={`${history.length}`} tone="rose" />
      </View>

      <View style={styles.actionGrid}>
        <Pressable style={({ pressed }) => [styles.actionCardPrimary, pressed && styles.actionPressed]} onPress={() => startSession("mixed")}>
          <Text style={styles.actionKicker}>{t(copy, "startKicker")}</Text>
          <Text style={styles.actionTitle}>{t(copy, "start")}</Text>
          <Text style={styles.actionBody}>
            {renderHighlightedCopy(
              t(copy, "startBody"),
              { level: settings.level, count: SESSION_QUESTION_COUNT },
              { level: styles.inlineTokenRose, count: styles.inlineTokenAmber }
            )}
          </Text>
          <View style={styles.actionFoot}>
            <Text style={styles.actionFootText}>{t(copy, "dailyGoal")}</Text>
            <Text style={styles.actionFootValue}>{dailyProgress.goal}</Text>
          </View>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.actionCardSecondary, pressed && styles.actionPressed]} onPress={openReview}>
          <Text style={styles.actionKicker}>{t(copy, "reviewKicker")}</Text>
          <Text style={styles.actionTitleDark}>{t(copy, "review")}</Text>
          <Text style={styles.actionBodyDark}>
            {renderHighlightedCopy(t(copy, "reviewBody"), { count: wrongAnswers.length }, { count: styles.inlineTokenRoseSoft })}
          </Text>
          <View style={styles.reviewPreview}>
            <Text style={styles.reviewPreviewText}>{wrongAnswers.length === 0 ? t(copy, "perfectRound") : `${wrongAnswers.length}`}</Text>
          </View>
        </Pressable>
      </View>

      <Card style={styles.footerCard}>
        <View style={styles.sessionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>{t(copy, "focusGarden")}</Text>
            <Text style={styles.footerTitle}>{t(copy, "knowledgeGrowth")}</Text>
          </View>
          <View style={styles.historyBadge}>
            <Text style={styles.historyText}>
              {history.length} {t(copy, "sessions")}
            </Text>
          </View>
        </View>
        <Text style={styles.helper}>{t(copy, "dashboardHelper")}</Text>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl
  },
  hero: {
    gap: spacing.xl,
    backgroundColor: colors.surface,
    paddingBottom: spacing.xxxl,
    overflow: "hidden"
  },
  heroComplete: {
    backgroundColor: colors.backgroundRaised,
    paddingBottom: spacing.xxl
  },
  completeHeroWrap: {
    gap: spacing.xl,
    alignItems: "stretch"
  },
  completeHeroCopy: {
    gap: spacing.md
  },
  completeHeroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: borderWidths.base,
    borderColor: colors.border
  },
  completeHeroBadgeText: {
    color: colors.garden,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase"
  },
  completeHeroTitle: {
    color: colors.primaryDeep,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "900"
  },
  completeHeroBody: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 312
  },
  completeHeroMetaRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  completeMetaChip: {
    flex: 1,
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: borderWidths.base,
    borderColor: colors.border
  },
  completeMetaChipGarden: {
    backgroundColor: colors.gardenSoft
  },
  completeMetaChipRose: {
    backgroundColor: colors.roseSoft
  },
  completeMetaLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  completeMetaValue: {
    color: colors.primaryDeep,
    fontSize: 22,
    fontWeight: "900"
  },
  completeHeroStage: {
    alignSelf: "center",
    width: "100%",
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  completeHeroStageBackdrop: {
    width: "100%",
    minHeight: 260,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  completeHeroStreakPill: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    alignItems: "flex-start",
    gap: 2
  },
  completeHeroStreakLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  completeHeroStreakValue: {
    color: colors.garden,
    fontSize: 18,
    fontWeight: "900"
  },
  completeHeroBunnyWrap: {
    position: "absolute",
    width: 154,
    height: 154,
    alignItems: "center",
    justifyContent: "center"
  },
  completeHeroFooter: {
    gap: spacing.sm,
    alignItems: "flex-start"
  },
  completeHeroFooterText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22
  },
  heroInsights: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.sm,
    zIndex: 1
  },
  heroSpotlight: {
    flex: 1,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: 6
  },
  heroSpotlightLevel: {
    backgroundColor: colors.accentSoft
  },
  heroSpotlightGrowth: {
    backgroundColor: colors.primaryWash
  },
  heroGrowthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  heroGrowthText: {
    flex: 1,
    gap: 6
  },
  heroGrowthBadge: {
    width: 78,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  heroSpotlightLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  heroSpotlightLabelBlue: {
    color: colors.primaryDeep
  },
  heroSpotlightLabelGarden: {
    color: colors.garden
  },
  heroSpotlightValue: {
    color: colors.primaryDeep,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900"
  },
  heroSpotlightCaption: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18
  },
  heroTop: {
    gap: spacing.md,
    zIndex: 1
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.6,
    color: colors.text,
    textTransform: "uppercase"
  },
  heroTitle: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900",
    color: colors.text
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.textMuted
  },
  heroBody: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.lg,
    zIndex: 1
  },
  heroProgressWrap: {
    flex: 1,
    gap: spacing.md
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  progressLabel: {
    color: colors.garden,
    fontSize: 14,
    fontWeight: "900"
  },
  progressValue: {
    fontSize: 30,
    fontWeight: "900"
  },
  progressValueCurrent: {
    color: colors.garden
  },
  progressValueDivider: {
    color: colors.textMuted
  },
  progressValueTarget: {
    color: colors.amberDeep
  },
  progressTrack: {
    height: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: colors.primary
  },
  progressFillComplete: {
    backgroundColor: colors.garden
  },
  progressHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20
  },
  inlineGardenStrong: {
    color: colors.garden,
    fontWeight: "900"
  },
  inlineRoseStrong: {
    color: colors.rose,
    fontWeight: "900"
  },
  inlineAmberStrong: {
    color: colors.amberDeep,
    fontWeight: "900"
  },
  inlineTokenRose: {
    color: colors.rose,
    fontWeight: "900"
  },
  inlineTokenAmber: {
    color: colors.amberDeep,
    fontWeight: "900"
  },
  inlineTokenRoseSoft: {
    color: colors.rose,
    fontWeight: "900"
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.md
  },
  sectionEyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: spacing.md
  },
  actionGrid: {
    gap: spacing.lg
  },
  actionCardPrimary: {
    backgroundColor: colors.primary,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xxxl,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    elevation: 0
  },
  actionCardSecondary: {
    backgroundColor: colors.accent,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    borderRadius: radii.xl,
    padding: spacing.xxxl,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    elevation: 0
  },
  actionPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 2, height: 2 }
  },
  actionKicker: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.primaryDeep
  },
  actionTitle: {
    color: colors.primaryDeep,
    fontSize: 34,
    fontWeight: "900"
  },
  actionTitleDark: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900"
  },
  actionBody: {
    color: colors.primaryDeep,
    fontSize: 15,
    lineHeight: 23
  },
  actionBodyDark: {
    color: colors.primaryDeep,
    fontSize: 15,
    lineHeight: 23
  },
  actionFoot: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  actionFootText: {
    color: colors.garden,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.2
  },
  actionFootValue: {
    color: colors.amberDeep,
    fontSize: 22,
    fontWeight: "900"
  },
  reviewPreview: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  reviewPreviewText: {
    color: colors.rose,
    fontSize: 13,
    fontWeight: "800"
  },
  footerCard: {
    backgroundColor: colors.surfaceLow,
    borderColor: colors.border
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  historyBadge: {
    backgroundColor: colors.surface,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  historyText: {
    color: colors.text,
    fontWeight: "800"
  },
  footerTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  helper: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
    marginTop: spacing.md
  }
})
