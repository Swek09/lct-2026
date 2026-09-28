import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "../theme";
import { DuoButton } from "./DuoButton";

interface LessonBottomSheetProps {
  isCorrect: boolean;
  title?: string;
  explanation: string;
  reward?: number;
  onContinue: () => void;
  continueText?: string;
}

export function LessonBottomSheet({
  isCorrect,
  title,
  explanation,
  reward,
  onContinue,
  continueText = "Продолжить",
}: LessonBottomSheetProps) {
  const defaultTitle = isCorrect ? "Превосходно! 🎉" : "Давай разберёмся 💡";

  return (
    <View style={[styles.container, isCorrect ? styles.correctBg : styles.incorrectBg]}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, isCorrect ? styles.correctTitle : styles.incorrectTitle]}>
            {title || defaultTitle}
          </Text>
          {isCorrect && reward ? (
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardText}>+{reward} 🪙</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.explanation}>{explanation}</Text>

        <View style={styles.buttonWrapper}>
          <DuoButton
            title={continueText}
            variant={isCorrect ? "primary" : "secondary"}
            size="lg"
            onPress={onContinue}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    borderTopWidth: 2,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  correctBg: {
    backgroundColor: "#EFF8F1",
    borderTopColor: colors.primary,
  },
  incorrectBg: {
    backgroundColor: "#FFF7ED",
    borderTopColor: "#F59E0B",
  },
  content: {
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: fonts.subtitle,
    fontWeight: "800",
  },
  correctTitle: {
    color: colors.primaryDark,
  },
  incorrectTitle: {
    color: "#B45309",
  },
  rewardBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: "#F59E0B",
  },
  rewardText: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: "#B45309",
  },
  explanation: {
    fontSize: fonts.body,
    color: colors.text,
    lineHeight: 22,
    fontWeight: "500",
  },
  buttonWrapper: {
    marginTop: 6,
  },
});
