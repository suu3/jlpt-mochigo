import React, { useState } from "react"
import { StyleSheet, View } from "react-native"
import { BunnyBadge } from "../components/BunnyBadge"
import { AppText as Text } from "../components/AppText"
import { PrimaryButton } from "../components/PrimaryButton"
import { SettingsPanel } from "../components/SettingsPanel"
import { colors, spacing } from "../constants/theme"
import { AppLanguage, t } from "../lib/i18n"
import { useAppStore } from "../store/useAppStore"
import { HomeDensitySetting, JLPTLevel } from "../types/app"

export function SetupScreen() {
  const { settings, completeOnboarding } = useAppStore()
  const [level, setLevel] = useState<JLPTLevel>(settings.level)
  const [language, setLanguage] = useState<AppLanguage>(settings.language)
  const [homeDensity, setHomeDensity] = useState<HomeDensitySetting>(settings.homeDensity)

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.header}>
          <View style={styles.bunnyPlate}>
            <BunnyBadge mood="happy" />
          </View>
          <Text style={styles.title}>{t(language, "setupTitle")}</Text>
          <Text style={styles.helper}>{t(language, "setupHelper")}</Text>
        </View>
      </View>

      <SettingsPanel
        language={language}
        level={level}
        homeDensity={homeDensity}
        showWordDensity
        onSelectLevel={setLevel}
        onSelectLanguage={setLanguage}
        onSelectHomeDensity={setHomeDensity}
      />

      <PrimaryButton
        label={t(language, "saveAndStart")}
        onPress={async () => {
          await completeOnboarding({ level, language, homeDensity })
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 36,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    borderWidth: 1.2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    elevation: 0
  },
  header: {
    gap: spacing.lg,
    alignItems: "flex-start"
  },
  bunnyPlate: {
    width: 124,
    height: 124,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: {
    color: colors.primaryDeep,
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 44
  },
  helper: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 25
  }
})
