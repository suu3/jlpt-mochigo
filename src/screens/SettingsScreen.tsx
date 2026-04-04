import React from "react";
import { Alert, Linking, Pressable, StyleSheet, View } from "react-native";
import { AppIcon } from "../components/AppIcon";
import { AppText as Text } from "../components/AppText";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { SettingsPanel } from "../components/SettingsPanel";
import { borderWidths, colors, radii, spacing } from "../constants/theme";
import { t } from "../lib/i18n";
import { useAppStore } from "../store/useAppStore";
import { DecoratedIcon } from "../components/DecoratedIcon";

export function SettingsScreen() {
  const {
    settings,
    setLevel,
    setLanguage,
    setTtsEnabled,
    setSpeechRate,
    setSpeechPitch,
    resetStudyData
  } = useAppStore();
  const [isResetting, setIsResetting] = React.useState(false);
  const [isSourcesExpanded, setIsSourcesExpanded] = React.useState(false);
  const dataSources = [
    {
      key: "jmdict",
      title: t(settings.language, "dataSourceJmdictTitle"),
      description: t(settings.language, "dataSourceJmdictDescription"),
      linkLabel: t(settings.language, "dataSourceJmdictLinkLabel"),
      url: "https://www.edrdg.org/jmdict/j_jmdict.html"
    },
    {
      key: "jlpt-word-list",
      title: t(settings.language, "dataSourceJlptWordListTitle"),
      description: t(settings.language, "dataSourceJlptWordListDescription"),
      linkLabel: t(settings.language, "dataSourceJlptWordListLinkLabel"),
      url: "https://github.com/elzup/jlpt-word-list"
    }
  ] as const;

  const handleRefreshWordData = React.useCallback(async () => {
    try {
      await useAppStore.getState().refreshWordData();
      Alert.alert(
        t(settings.language, "refreshWordDataTitle"),
        t(settings.language, "customWordAdded") // Using existing "Added" key for simple feedback
      );
    } catch (error) {
      console.error("Manual refresh failed", error);
    }
  }, [settings.language]);

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
            setIsResetting(true);
            try {
              await resetStudyData();
            } finally {
              setIsResetting(false);
            }
          }
        }
      ]
    );
  }, [resetStudyData, settings.language]);

  const handleOpenLink = React.useCallback(
    (url: string) => {
      Linking.openURL(url).catch(() => {
        Alert.alert(
          t(settings.language, "externalLinkErrorTitle"),
          t(settings.language, "externalLinkErrorBody")
        );
      });
    },
    [settings.language]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{t(settings.language, "settingsEyebrow")}</Text>
            <Text style={styles.title}>{t(settings.language, "settingsTitle")}</Text>
          </View>
          <DecoratedIcon name="setting" size={32} />
        </View>
        <Text style={styles.helper}>{t(settings.language, "settingsHelper")}</Text>
      </View>

      <SettingsPanel
        language={settings.language}
        level={settings.level}
        ttsEnabled={settings.ttsEnabled}
        speechRate={settings.speechRate}
        speechPitch={settings.speechPitch}
        showAdvanced
        onSelectLevel={async (level) => {
          await setLevel(level);
        }}
        onSelectLanguage={async (language) => {
          await setLanguage(language);
        }}
        onSelectTtsEnabled={async (enabled) => {
          await setTtsEnabled(enabled);
        }}
        onSelectSpeechRate={async (rate) => {
          await setSpeechRate(rate);
        }}
        onSelectSpeechPitch={async (pitch) => {
          await setSpeechPitch(pitch);
        }}

      />

      <Card style={styles.refreshCard}>
        <View style={styles.refreshContent}>
          <View style={styles.refreshText}>
            <Text style={styles.refreshTitle}>{t(settings.language, "refreshWordDataTitle")}</Text>
            <Text style={styles.refreshHelper}>{t(settings.language, "refreshWordDataHelper")}</Text>
          </View>
          <PrimaryButton
            label={t(settings.language, "refreshWordDataButton")}
            onPress={handleRefreshWordData}
            variant="ghost"
            style={styles.refreshButton}
          />
        </View>
      </Card>

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
            {dataSources.map((source) => (
              <View key={source.key} style={styles.sourceItem}>
                <Text style={styles.sourceTitle}>{source.title}</Text>
                <Text style={styles.sourceDescription}>{source.description}</Text>
                <Pressable
                  accessibilityRole="link"
                  onPress={() => handleOpenLink(source.url)}
                  style={({ pressed }) => [
                    styles.sourceLinkWrap,
                    pressed && styles.pressed
                  ]}
                >
                  <Text style={styles.sourceLink}>{source.linkLabel}</Text>
                </Pressable>
              </View>
            ))}
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
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg
  },
  header: {
    gap: spacing.xs
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerCopy: {
    flex: 1
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
    gap: spacing.xs
  },
  sourceTitle: {
    color: colors.text,
    fontWeight: "800",
    lineHeight: 22
  },
  sourceDescription: {
    color: colors.textMuted,
    lineHeight: 22
  },
  sourceLinkWrap: {
    alignSelf: "flex-start"
  },
  sourceLink: {
    color: colors.rose,
    lineHeight: 22,
    textDecorationLine: "underline"
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
  },
  refreshCard: {
    backgroundColor: colors.surface
  },
  refreshContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  refreshText: {
    flex: 1,
    gap: 4
  },
  refreshTitle: {
    color: colors.primaryDeep,
    fontSize: 18,
    fontWeight: "900"
  },
  refreshHelper: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  },
  refreshButton: {
    paddingHorizontal: spacing.md,
    height: 48
  }
});
