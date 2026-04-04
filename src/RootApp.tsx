import React, { useEffect } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AppText as Text } from "./components/AppText"
import { BottomNav } from "./components/BottomNav"
import { BookmarksScreen } from "./screens/BookmarksScreen"
import { HomeScreen } from "./screens/HomeScreen"
import { QuizScreen } from "./screens/QuizScreen"
import { ResultScreen } from "./screens/ResultScreen"
import { ReviewScreen } from "./screens/ReviewScreen"
import { SettingsScreen } from "./screens/SettingsScreen"
import { SetupScreen } from "./screens/SetupScreen"
import { WordsScreen } from "./screens/WordsScreen"
import { breakpoints, colors, spacing } from "./constants/theme"
import { t } from "./lib/i18n"
import { useAppStore } from "./store/useAppStore"

export function RootApp() {
  const { width } = useWindowDimensions()
  const { initialize, isReady, isWordDataLoading, screen, settings } = useAppStore()
  const isCompact = width <= breakpoints.phoneCompact

  useEffect(() => {
    const runInitialization = async () => {
      await initialize()
    }

    runInitialization().catch((error: unknown) => {
      console.error("Failed to initialize app", error)
    })
  }, [initialize])

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appShell}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.container, isCompact && styles.containerCompact]}
        >
          {!isReady || isWordDataLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>{t(settings.language, "loading")}</Text>
            </View>
          ) : null}

          {isReady && screen === "setup" ? <SetupScreen /> : null}
          {isReady && screen === "home" ? <HomeScreen /> : null}
          {isReady && screen === "quiz" ? <QuizScreen /> : null}
          {isReady && screen === "result" ? <ResultScreen /> : null}
          {isReady && screen === "review" ? <ReviewScreen /> : null}
          {isReady && screen === "words" ? <WordsScreen /> : null}
          {isReady && screen === "bookmarks" ? <BookmarksScreen /> : null}
          {isReady && screen === "settings" ? <SettingsScreen /> : null}
        </ScrollView>

        {isReady && screen !== "setup" ? <BottomNav /> : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  appShell: {
    flex: 1,
    position: "relative"
  },
  scrollView: {
    flex: 1
  },
  container: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    flexGrow: 1
  },
  containerCompact: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 120,
    gap: spacing.md
  },
  loadingText: {
    color: colors.textMuted
  }
})
