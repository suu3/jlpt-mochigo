import React from "react"
import { Alert, Pressable, StyleSheet, View } from "react-native"
import { AppIcon } from "../components/AppIcon"
import { AppText as Text } from "../components/AppText"
import { Card } from "../components/Card"
import { PrimaryButton } from "../components/PrimaryButton"
import { SettingsPanel } from "../components/SettingsPanel"
import { borderWidths, colors, radii, spacing } from "../constants/theme"
import { t } from "../lib/i18n"
import { useAppStore } from "../store/useAppStore"

export function SettingsScreen() {
  const {
    settings,
    setLevel,
    setLanguage,
    setTtsEnabled,
    setSpeechRate,
    setSpeechPitch,
    setHomeDensity,
    resetStudyData
  } = useAppStore()
  const [isResetting, setIsResetting] = React.useState(false)
  const [isSourcesExpanded, setIsSourcesExpanded] = React.useState(false)

  const handleResetStudyData = React.useCallback(() => {
    Alert.alert(
      t(settings.language, "resetStudyDataConfirmTitle"),
      t(settings.language, "resetStudyDataConfirmBody"),
      [
        {
          text: t(settings.language, "resetStudyDataCancel"),
          style: "cancel"
        },
        {
          text: t(settings.language, "resetStudyDataConfirm"),
          style: "destructive",
          onPress: async () => {
            setIsResetting(true)
            try {
              await resetStudyData()
            } finally {
              setIsResetting(false)
            }
          }
        }
      ]
    )
  }, [resetStudyData, settings.language])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{t(settings.language, "settingsEyebrow")}</Text>
        <Text style={styles.title}>{t(settings.language, "settingsTitle")}</Text>
        <Text style={styles.helper}>{t(settings.language, "settingsHelper")}</Text>
      </View>

      <SettingsPanel
        language={settings.language}
        level={settings.level}
        ttsEnabled={settings.ttsEnabled}
        speechRate={settings.speechRate}
        speechPitch={settings.speechPitch}
        homeDensity={settings.homeDensity}
        showAdvanced
        onSelectLevel={async (level) => {
          await setLevel(level)
        }}
        onSelectLanguage={async (language) => {
          await setLanguage(language)
        }}
        onSelectTtsEnabled={async (enabled) => {
          await setTtsEnabled(enabled)
        }}
        onSelectSpeechRate={async (rate) => {
          await setSpeechRate(rate)
        }}
        onSelectSpeechPitch={async (pitch) => {
          await setSpeechPitch(pitch)
        }}
        onSelectHomeDensity={async (density) => {
          await setHomeDensity(density)
        }}
      />

      <Card style={styles.sourcesCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: isSourcesExpanded }}
          onPress={() => setIsSourcesExpanded((current) => !current)}
          style={({ pressed }) => [
            styles.sourcesTrigger,
            pressed && styles.pressed
          ]}
        >
          <View style={styles.sourcesHeading}>
            <Text style={styles.sourcesTitle}>{t(settings.language, "dataSourcesTitle")}</Text>
            <Text style={styles.sourcesHelper}>{t(settings.language, "dataSourcesHelper")}</Text>
          </View>
          <View style={[styles.chevronWrap, isSourcesExpanded && styles.chevronWrapExpanded]}>
            <AppIcon name="chevronRight" />
          </View>
        </Pressable>

        {isSourcesExpanded ? (
          <View style={styles.sourcesContent}>
            <Text style={styles.sourceItem}>{t(settings.language, "dataSourceJmdict")}</Text>
            <Text style={styles.sourceItem}>{t(settings.language, "dataSourceJlptWordList")}</Text>
            <Text style={styles.disclaimer}>{t(settings.language, "dataSourceDisclaimer")}</Text>
          </View>
        ) : null}
      </Card>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>{t(settings.language, "resetStudyDataTitle")}</Text>
        <Text style={styles.dangerHelper}>{t(settings.language, "resetStudyDataHelper")}</Text>
        <PrimaryButton
          label={t(settings.language, "resetStudyDataButton")}
          onPress={handleResetStudyData}
          variant="ghost"
          disabled={isResetting}
          style={styles.dangerButton}
        />
      </View>
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
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 22
  },
  sourcesCard: {
    gap: spacing.sm
  },
  sourcesTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  sourcesHeading: {
    flex: 1,
    gap: spacing.xs
  },
  sourcesTitle: {
    color: colors.primaryDeep,
    fontSize: 18,
    fontWeight: "900"
  },
  sourcesHelper: {
    color: colors.textMuted,
    lineHeight: 22
  },
  sourcesContent: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: borderWidths.base,
    borderTopColor: colors.border
  },
  sourceItem: {
    color: colors.text,
    lineHeight: 22
  },
  disclaimer: {
    color: colors.textMuted,
    lineHeight: 22
  },
  chevronWrap: {
    transform: [{ rotate: "90deg" }]
  },
  chevronWrapExpanded: {
    transform: [{ rotate: "-90deg" }]
  },
  pressed: {
    opacity: 0.8
  },
  dangerZone: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: borderWidths.base,
    borderColor: colors.error,
    backgroundColor: colors.errorSoft
  },
  dangerTitle: {
    color: colors.primaryDeep,
    fontSize: 18,
    fontWeight: "900"
  },
  dangerHelper: {
    color: colors.textMuted,
    lineHeight: 22
  },
  dangerButton: {
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
    shadowOpacity: 0
  }
})
