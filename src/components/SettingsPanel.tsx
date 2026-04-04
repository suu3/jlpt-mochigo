import React from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { AppIcon } from "./AppIcon"
import { Card } from "./Card"
import { AppText as Text } from "./AppText"
import { borderWidths, colors, radii, spacing } from "../constants/theme"
import { AppLanguage, t } from "../lib/i18n"
import { HomeDensitySetting, JLPTLevel, SpeechPitchSetting, SpeechRateSetting } from "../types/app"

const selectableLevels: JLPTLevel[] = ["N5", "N4", "N3", "N2", "N1"]
const selectableLanguages: AppLanguage[] = ["system", "ko", "en"]
const speechRateOptions: SpeechRateSetting[] = ["slow", "normal", "fast"]
const speechPitchOptions: SpeechPitchSetting[] = ["low", "normal", "high"]
const homeDensityOptions: HomeDensitySetting[] = ["rich", "balanced", "simple"]

function SelectionLabel({
  label,
  isActive,
  textStyle,
  activeTextStyle,
  activeIconColor
}: {
  label: string;
  isActive: boolean;
  textStyle: object;
  activeTextStyle: object;
  activeIconColor: string;
}) {
  return (
    <View style={styles.selectionLabelRow}>
      <Text style={[textStyle, isActive && activeTextStyle]}>{label}</Text>
      {isActive ? (
        <AppIcon
          name="check"
          size={14}
          color={activeIconColor}
          strokeWidth={2.4}
        />
      ) : null}
    </View>
  )
}

type Props = {
  language: AppLanguage;
  level: JLPTLevel;
  ttsEnabled?: boolean;
  speechRate?: SpeechRateSetting;
  speechPitch?: SpeechPitchSetting;
  homeDensity?: HomeDensitySetting;
  showAdvanced?: boolean;
  showWordDensity?: boolean;
  onSelectLevel: (level: JLPTLevel) => void;
  onSelectLanguage: (language: AppLanguage) => void;
  onSelectTtsEnabled?: (enabled: boolean) => void;
  onSelectSpeechRate?: (rate: SpeechRateSetting) => void;
  onSelectSpeechPitch?: (pitch: SpeechPitchSetting) => void;
  onSelectHomeDensity?: (density: HomeDensitySetting) => void;
}

export function SettingsPanel({
  language,
  level,
  ttsEnabled = true,
  speechRate = "normal",
  speechPitch = "normal",
  homeDensity = "balanced",
  showAdvanced = false,
  showWordDensity = false,
  onSelectLevel,
  onSelectLanguage,
  onSelectTtsEnabled,
  onSelectSpeechRate,
  onSelectSpeechPitch,
  onSelectHomeDensity
}: Props) {
  return (
    <View style={styles.container}>
      <Card style={styles.section}>
        <Text style={styles.eyebrow}>{t(language, "difficulty")}</Text>
        <View style={styles.levelRow}>
          {selectableLevels.map((candidateLevel) => {
            const isActive = level === candidateLevel

            return (
              <Pressable
                key={candidateLevel}
                onPress={() => onSelectLevel(candidateLevel)}
                style={({ pressed }) => [
                  styles.levelButton,
                  isActive && styles.levelButtonActive,
                  pressed && styles.pressed
                ]}
              >
                <SelectionLabel
                  label={candidateLevel}
                  isActive={isActive}
                  textStyle={styles.levelButtonText}
                  activeTextStyle={styles.levelButtonTextActive}
                  activeIconColor={colors.surface}
                />
              </Pressable>
            )
          })}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={styles.eyebrow}>{t(language, "languageSettings")}</Text>
        <Text style={styles.helper}>{t(language, "languageHelper")}</Text>
        <View style={styles.languageList}>
          {selectableLanguages.map((candidateLanguage) => {
            const isActive = language === candidateLanguage
            const label =
              candidateLanguage === "system"
                ? `${t(language, "languageSystem")} · ${t(language, "languageSystemValue")}`
                : candidateLanguage === "ko"
                  ? t(language, "languageKorean")
                  : t(language, "languageEnglish")

            return (
              <Pressable
                key={candidateLanguage}
                onPress={() => onSelectLanguage(candidateLanguage)}
                style={({ pressed }) => [
                  styles.languageButton,
                  isActive && styles.languageButtonActive,
                  pressed && styles.pressed
                ]}
              >
                <SelectionLabel
                  label={label}
                  isActive={isActive}
                  textStyle={styles.languageButtonText}
                  activeTextStyle={styles.languageButtonTextActive}
                  activeIconColor={colors.text}
                />
              </Pressable>
            )
          })}
        </View>
      </Card>

      {showAdvanced ? (
        <>
          <Card style={styles.section}>
            <Text style={styles.eyebrow}>{t(language, "ttsSettings")}</Text>
            <Text style={styles.helper}>{t(language, "ttsHelper")}</Text>

            <View style={styles.optionBlock}>
              <Text style={styles.optionLabel}>{t(language, "ttsSettings")}</Text>
              <View style={styles.chipRow}>
                {[true, false].map((enabled) => {
                  const isActive = ttsEnabled === enabled

                  return (
                    <Pressable
                      key={enabled ? "on" : "off"}
                      onPress={() => onSelectTtsEnabled?.(enabled)}
                      style={({ pressed }) => [
                        styles.optionChip,
                        isActive && styles.optionChipActive,
                        pressed && styles.pressed
                      ]}
                    >
                      <SelectionLabel
                        label={enabled ? t(language, "ttsOn") : t(language, "ttsOff")}
                        isActive={isActive}
                        textStyle={styles.optionChipText}
                        activeTextStyle={styles.optionChipTextActive}
                        activeIconColor={colors.text}
                      />
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View style={[styles.optionBlock, !ttsEnabled && styles.optionBlockDisabled]}>
              <Text style={styles.optionLabel}>{t(language, "speechRate")}</Text>
              <View style={styles.chipRow}>
                {speechRateOptions.map((option) => {
                  const isActive = speechRate === option
                  const labelKey =
                    option === "slow"
                      ? "speechRateSlow"
                      : option === "fast"
                        ? "speechRateFast"
                        : "speechRateNormal"

                  return (
                    <Pressable
                      key={option}
                      disabled={!ttsEnabled}
                      onPress={() => onSelectSpeechRate?.(option)}
                      style={({ pressed }) => [
                        styles.optionChip,
                        isActive && styles.optionChipActive,
                        !ttsEnabled && styles.optionChipDisabled,
                        pressed && ttsEnabled && styles.pressed
                      ]}
                    >
                      <SelectionLabel
                        label={t(language, labelKey)}
                        isActive={isActive}
                        textStyle={styles.optionChipText}
                        activeTextStyle={styles.optionChipTextActive}
                        activeIconColor={colors.text}
                      />
                    </Pressable>
                  )
                })}
              </View>
            </View>

            <View style={[styles.optionBlock, !ttsEnabled && styles.optionBlockDisabled]}>
              <Text style={styles.optionLabel}>{t(language, "speechPitch")}</Text>
              <View style={styles.chipRow}>
                {speechPitchOptions.map((option) => {
                  const isActive = speechPitch === option
                  const labelKey =
                    option === "low"
                      ? "speechPitchLow"
                      : option === "high"
                        ? "speechPitchHigh"
                        : "speechPitchNormal"

                  return (
                    <Pressable
                      key={option}
                      disabled={!ttsEnabled}
                      onPress={() => onSelectSpeechPitch?.(option)}
                      style={({ pressed }) => [
                        styles.optionChip,
                        isActive && styles.optionChipActive,
                        !ttsEnabled && styles.optionChipDisabled,
                        pressed && ttsEnabled && styles.pressed
                      ]}
                    >
                      <SelectionLabel
                        label={t(language, labelKey)}
                        isActive={isActive}
                        textStyle={styles.optionChipText}
                        activeTextStyle={styles.optionChipTextActive}
                        activeIconColor={colors.text}
                      />
                    </Pressable>
                  )
                })}
              </View>
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={styles.eyebrow}>{t(language, "homeDensity")}</Text>
            <Text style={styles.helper}>{t(language, "homeDensityHelper")}</Text>
            <View style={styles.chipRow}>
              {homeDensityOptions.map((option) => {
                const isActive = homeDensity === option
                const labelKey =
                  option === "rich"
                    ? "densityRich"
                    : option === "simple"
                      ? "densitySimple"
                      : "densityBalanced"

                return (
                  <Pressable
                    key={option}
                    onPress={() => onSelectHomeDensity?.(option)}
                    style={({ pressed }) => [
                      styles.optionChip,
                      styles.optionChipWide,
                      isActive && styles.optionChipActive,
                      pressed && styles.pressed
                    ]}
                  >
                    <SelectionLabel
                      label={t(language, labelKey)}
                      isActive={isActive}
                      textStyle={styles.optionChipText}
                      activeTextStyle={styles.optionChipTextActive}
                      activeIconColor={colors.text}
                    />
                  </Pressable>
                )
              })}
            </View>
          </Card>
        </>
      ) : null}

      {!showAdvanced && showWordDensity ? (
        <Card style={styles.section}>
          <Text style={styles.eyebrow}>{t(language, "homeDensity")}</Text>
          <Text style={styles.helper}>{t(language, "homeDensityHelper")}</Text>
          <View style={styles.chipRow}>
            {homeDensityOptions.map((option) => {
              const isActive = homeDensity === option
              const labelKey =
                option === "rich"
                  ? "densityRich"
                  : option === "simple"
                    ? "densitySimple"
                    : "densityBalanced"

              return (
                <Pressable
                  key={option}
                  onPress={() => onSelectHomeDensity?.(option)}
                  style={({ pressed }) => [
                    styles.optionChip,
                    styles.optionChipWide,
                    isActive && styles.optionChipActive,
                    pressed && styles.pressed
                  ]}
                >
                  <SelectionLabel
                    label={t(language, labelKey)}
                    isActive={isActive}
                    textStyle={styles.optionChipText}
                    activeTextStyle={styles.optionChipTextActive}
                    activeIconColor={colors.text}
                  />
                </Pressable>
              )
            })}
          </View>
        </Card>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg
  },
  section: {
    gap: spacing.md,
    backgroundColor: colors.backgroundRaised
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase"
  },
  helper: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22
  },
  levelRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap"
  },
  levelButton: {
    width: "31%",
    minHeight: 50,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  levelButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDeep
  },
  levelButtonText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800"
  },
  levelButtonTextActive: {
    color: colors.surface
  },
  languageList: {
    gap: spacing.sm
  },
  optionBlock: {
    gap: spacing.sm
  },
  optionBlockDisabled: {
    opacity: 0.55
  },
  optionLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800"
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  optionChip: {
    minHeight: 42,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  optionChipWide: {
    minWidth: 96
  },
  optionChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border
  },
  optionChipDisabled: {
    backgroundColor: colors.surfaceLow
  },
  optionChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700"
  },
  optionChipTextActive: {
    color: colors.text,
    fontWeight: "900"
  },
  selectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  languageButton: {
    minHeight: 50,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: borderWidths.base,
    borderColor: colors.borderSoft,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  languageButtonActive: {
    backgroundColor: colors.primaryWash,
    borderColor: colors.primarySoft
  },
  languageButtonText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700"
  },
  languageButtonTextActive: {
    color: colors.text,
    fontWeight: "900"
  },
  pressed: {
    transform: [{ translateY: 1 }]
  }
})
