import React, { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText as Text } from "./components/AppText";
import { BottomNav } from "./components/BottomNav";
import { BookmarksScreen } from "./screens/BookmarksScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { QuizScreen } from "./screens/QuizScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { ReviewScreen } from "./screens/ReviewScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SetupScreen } from "./screens/SetupScreen";
import { WordsScreen } from "./screens/WordsScreen";
import { breakpoints, colors, spacing } from "./constants/theme";
import { t } from "./lib/i18n";
import { useAppStore } from "./store/useAppStore";

export function RootApp() {
  const { width } = useWindowDimensions();
  const { initialize, isReady, isWordDataLoading, screen, settings } = useAppStore();
  const isCompact = width <= breakpoints.phoneCompact;

  useEffect(() => {
    const runInitialization = async () => {
      await initialize();
    };

    runInitialization().catch((error: unknown) => {
      console.error("Failed to initialize app", error);
    });
  }, [initialize]);

  const shouldShowOverlay = !isReady || isWordDataLoading === true;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appShell}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.container, isCompact && styles.containerCompact]}
        >
          {isReady && (
            <>
              {screen === "setup" && <SetupScreen />}
              {screen === "home" && <HomeScreen />}
              {screen === "quiz" && <QuizScreen />}
              {screen === "result" && <ResultScreen />}
              {screen === "review" && <ReviewScreen />}
              {screen === "words" && <WordsScreen />}
              {screen === "bookmarks" && <BookmarksScreen />}
              {screen === "settings" && <SettingsScreen />}
            </>
          )}
        </ScrollView>

        {shouldShowOverlay ? (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingText}>{t(settings.language, "loading")}</Text>
            </View>
          </View>
        ) : null}

        {isReady && screen !== "setup" ? <BottomNav /> : null}
      </View>
    </SafeAreaView>
  );
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },
  loadingCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 24,
    alignItems: "center",
    gap: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  loadingText: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 16
  }
});
