import * as Speech from "expo-speech";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppIcon } from "../components/AppIcon";
import { AppText as Text } from "../components/AppText";
import { BunnyBadge } from "../components/BunnyBadge";
import { Card } from "../components/Card";
import { borderWidths, colors, radii, spacing } from "../constants/theme";
import { t } from "../lib/i18n";
import { getSpeechOptions } from "../lib/speech";
import { useAppStore } from "../store/useAppStore";

export function QuizScreen() {
  const {
    settings,
    currentIndex,
    currentQuestions,
    answerCurrentQuestion,
    speakEnabled
  } = useAppStore();
  const question = currentQuestions[currentIndex];
  const copy = settings.language;
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const feedback = useMemo(() => {
    if (!selectedChoice) {
      return null;
    }
    return selectedChoice === question.answer ? "correct" : "wrong";
  }, [question.answer, selectedChoice]);

  if (!question) {
    return null;
  }

  const submitChoice = (choice: string) => {
    setSelectedChoice(choice);
    setTimeout(() => {
      answerCurrentQuestion(choice === question.answer);
      setSelectedChoice(null);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>{t(copy, "focusRound")}</Text>
        <Text style={styles.screenTitle}>
          {question.type === "meaning" ? t(copy, "meaningQuiz") : t(copy, "readingQuiz")}
        </Text>
        <View style={styles.progressRow}>
          <Text style={styles.progress}>
            {t(copy, "question")} {currentIndex + 1} {t(copy, "of")} {currentQuestions.length}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / Math.max(currentQuestions.length, 1)) * 100}%` as const }
              ]}
            />
          </View>
        </View>
      </View>

      <Card style={styles.promptCard}>
        <View style={styles.promptHeader}>
          <View style={styles.promptMeta}>
            <Text style={styles.promptLabel}>{settings.level}</Text>
            <Text style={styles.promptSubLabel}>
              {question.type === "meaning" ? t(copy, "chooseMeaning") : t(copy, "chooseReading")}
            </Text>
          </View>
          <BunnyBadge mood={feedback === "correct" ? "happy" : feedback === "wrong" ? "soft" : "calm"} />
        </View>

        <Text style={styles.prompt}>{question.prompt}</Text>
        <Text style={styles.promptHint}>
          {question.type === "meaning" ? t(copy, "meaningHint") : t(copy, "readingHint")}
        </Text>

        <Pressable
          onPress={() => {
            if (speakEnabled()) {
              Speech.speak(question.word.kana, getSpeechOptions(settings));
            }
          }}
          style={({ pressed }) => [styles.listenButton, pressed && styles.listenButtonPressed]}
        >
          <AppIcon name="volume" size={16} color={colors.primaryDeep} strokeWidth={2} />
          <Text style={styles.listenButtonText}>{t(copy, "listen")}</Text>
        </Pressable>
      </Card>

      <View style={styles.choices}>
        {question.choices.map((choice, index) => {
          const isSelected = selectedChoice === choice;
          const isAnswer = question.answer === choice;
          const showState = selectedChoice !== null;

          return (
            <Pressable
              key={choice}
              disabled={selectedChoice !== null}
              onPress={() => submitChoice(choice)}
              style={[
                styles.choice,
                showState && styles.choiceLocked,
                showState && isAnswer && styles.choiceAnswer,
                showState && isSelected && !isAnswer && styles.choiceWrong
              ]}
            >
              <View style={styles.choiceIndex}>
                <Text style={styles.choiceIndexText}>{index + 1}</Text>
              </View>
              <Text style={styles.choiceText}>{choice}</Text>
            </Pressable>
          );
        })}
      </View>

      {feedback ? (
        <View style={[styles.feedbackCard, feedback === "correct" ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackLabel}>
            {feedback === "correct" ? t(copy, "correct") : t(copy, "wrong")}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl
  },
  headerBlock: {
    gap: spacing.sm
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: colors.textMuted,
    textTransform: "uppercase"
  },
  screenTitle: {
    color: colors.primaryDeep,
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 40
  },
  progressRow: {
    gap: spacing.sm
  },
  progress: {
    color: colors.textMuted,
    fontSize: 15
  },
  progressTrack: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary
  },
  promptCard: {
    gap: spacing.lg,
    backgroundColor: colors.surfaceLow
  },
  promptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  promptMeta: {
    flex: 1
  },
  promptLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: spacing.xs
  },
  promptSubLabel: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  prompt: {
    fontSize: 46,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 52
  },
  promptHint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22
  },
  listenButton: {
    alignSelf: "flex-start",
    minWidth: 120,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
    elevation: 0
  },
  listenButtonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 1, height: 1 }
  },
  listenButtonText: {
    color: colors.primaryDeep,
    fontSize: 15,
    fontWeight: "800"
  },
  choices: {
    gap: spacing.md
  },
  choice: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 3, height: 3 },
    elevation: 0
  },
  choiceLocked: {
    opacity: 0.7
  },
  choiceIndex: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryWash,
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  choiceIndexText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  choiceAnswer: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.success
  },
  choiceWrong: {
    backgroundColor: colors.errorSoft,
    borderColor: colors.error
  },
  choiceText: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "700"
  },
  feedbackCard: {
    borderWidth: borderWidths.base,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: "center"
  },
  feedbackCorrect: {
    backgroundColor: colors.surfaceMuted
  },
  feedbackWrong: {
    backgroundColor: colors.errorSoft
  },
  feedbackLabel: {
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
    color: colors.text
  }
});
