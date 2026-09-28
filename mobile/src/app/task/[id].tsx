import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ConfettiEffect } from "../../components/ConfettiEffect";
import { DuoButton } from "../../components/DuoButton";
import { LessonBottomSheet } from "../../components/LessonBottomSheet";
import { TaskCoinChange } from "../../components/TaskCoinChange";
import { TaskInteractiveSort } from "../../components/TaskInteractiveSort";
import { tasks } from "../../content/tasks";
import { useStore } from "../../store/store";
import { colors, fonts, radius, spacing } from "../../theme";
import { playClickSound, playErrorSound, playSuccessSound } from "../../utils/sound";

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const task = tasks.find((t) => t.id === id);
  const completeTask = useStore((s) => s.completeTask);
  const profile = useStore((s) => s.profile);

  // Quiz state
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Sort state
  const [sortAssignments, setSortAssignments] = useState<Record<string, "mandatory" | "optional">>({});

  // Change state
  const [changeSum, setChangeSum] = useState<number>(0);

  const [evaluated, setEvaluated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  if (!task) return null;

  const isDoneBefore = profile?.completedTasks.some((c) => c.taskId === task.id);

  // Compute correctness based on task type
  let isCorrect = false;
  let canCheck = false;

  if (task.type === "sort") {
    const items = task.sortItems ?? [];
    const assignedCount = Object.keys(sortAssignments).length;
    canCheck = assignedCount === items.length && items.length > 0;
    isCorrect = items.every((item) => sortAssignments[item.id] === item.correctCategory);
  } else if (task.type === "change") {
    canCheck = changeSum > 0;
    isCorrect = changeSum === (task.changeData?.targetChange ?? 15);
  } else {
    canCheck = !!selectedKey;
    isCorrect = selectedKey === task.correctKey;
  }

  const handleCheck = () => {
    if (!canCheck || evaluated) return;
    setEvaluated(true);
    if (isCorrect) {
      playSuccessSound();
      setShowConfetti(true);
    } else {
      playErrorSound();
    }
    completeTask(task.id, isCorrect);
  };

  const handleContinue = () => {
    router.replace("/home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ConfettiEffect active={showConfetti} />

      {/* Duolingo Top Lesson Header */}
      <View style={styles.lessonHeader}>
        <Pressable
          style={styles.closeButton}
          onPress={() => {
            playClickSound();
            router.replace("/home");
          }}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>

        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: evaluated ? "100%" : "60%" }]} />
        </View>

        <View style={styles.rewardBadge}>
          <Text style={styles.rewardText}>+{task.reward} 🪙</Text>
        </View>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Mentor Prompt (Duolingo Character Dialog) */}
        <View style={styles.mentorRow}>
          <View style={styles.mentorAvatarCircle}>
            <Text style={styles.mentorAvatarEmoji}>🦉</Text>
          </View>
          <View style={styles.speechBubble}>
            <View style={styles.tail} />
            <Text style={styles.unitTag}>{task.unitTitle ?? "Урок по финансам"}</Text>
            <Text style={styles.scenarioText}>{task.scenario}</Text>
          </View>
        </View>

        {/* Competency & Moscow Badges */}
        <View style={styles.badgesRow}>
          {task.competencyCode && (
            <View style={styles.competencyBadge}>
              <Text style={styles.competencyText}>
                🏛️ {task.competencyCode}: {task.competencyName}
              </Text>
            </View>
          )}
          {task.moscowContext && (
            <View style={styles.moscowBadge}>
              <Text style={styles.moscowBadgeText}>📍 {task.moscowContext}</Text>
            </View>
          )}
        </View>

        {/* INTERACTIVE BODY BASED ON TASK TYPE */}
        {task.type === "sort" ? (
          <TaskInteractiveSort
            items={task.sortItems ?? []}
            evaluated={evaluated}
            onAssignmentsChange={setSortAssignments}
          />
        ) : task.type === "change" ? (
          <TaskCoinChange
            data={task.changeData!}
            evaluated={evaluated}
            onSumChange={setChangeSum}
          />
        ) : (
          /* Standard Quiz Options List */
          <View style={styles.optionsList}>
            {task.options.map((opt, idx) => {
              const isSelected = selectedKey === opt.key;
              const letter = String.fromCharCode(65 + idx); // A, B, C

              return (
                <Pressable
                  key={opt.key}
                  disabled={evaluated}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                    evaluated && isSelected && isCorrect && styles.optionCorrect,
                    evaluated && isSelected && !isCorrect && styles.optionIncorrect,
                  ]}
                  onPress={() => {
                    playClickSound();
                    setSelectedKey(opt.key);
                  }}
                >
                  <View
                    style={[
                      styles.letterBadge,
                      isSelected && styles.letterBadgeSelected,
                      evaluated && isSelected && isCorrect && styles.letterBadgeCorrect,
                      evaluated && isSelected && !isCorrect && styles.letterBadgeIncorrect,
                    ]}
                  >
                    <Text
                      style={[
                        styles.letterText,
                        isSelected && styles.letterTextSelected,
                      ]}
                    >
                      {letter}
                    </Text>
                  </View>

                  <Text style={styles.optionText}>{opt.text}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {isDoneBefore && (
          <Text style={styles.alreadyDoneNote}>
            ⭐ Ты уже проходил этот урок, но повторить всегда полезно!
          </Text>
        )}
      </ScrollView>

      {/* Bottom Action Area */}
      {!evaluated ? (
        <View style={styles.bottomBar}>
          <DuoButton
            title="Проверить! 🚀"
            variant="primary"
            size="lg"
            disabled={!canCheck}
            onPress={handleCheck}
          />
        </View>
      ) : (
        <LessonBottomSheet
          isCorrect={isCorrect}
          explanation={isCorrect ? task.feedbackOk : task.feedbackFail}
          reward={task.reward}
          onContinue={handleContinue}
          continueText="Дальше на карту! 🗺️"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textMuted,
  },
  progressBarTrack: {
    flex: 1,
    height: 12,
    backgroundColor: "#EBE5D8",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  rewardBadge: {
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#F3C569",
  },
  rewardText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#B45309",
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  mentorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
    gap: 8,
  },
  mentorAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F7F1",
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  mentorAvatarEmoji: {
    fontSize: 26,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: colors.speechBubble,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.speechBubbleBorder,
    padding: spacing.md,
    position: "relative",
  },
  tail: {
    position: "absolute",
    left: -7,
    top: 24,
    width: 12,
    height: 12,
    backgroundColor: colors.speechBubble,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.speechBubbleBorder,
    transform: [{ rotate: "45deg" }],
  },
  unitTag: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primaryDark,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  scenarioText: {
    fontSize: fonts.body,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 22,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: "#D8D2C3",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    borderBottomColor: "#427245",
    backgroundColor: colors.cardSelected,
  },
  optionCorrect: {
    borderColor: colors.primary,
    backgroundColor: "#EFF8F1",
  },
  optionIncorrect: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F4EFE4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DDD7C8",
  },
  letterBadgeSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  letterBadgeCorrect: {
    backgroundColor: colors.primary,
  },
  letterBadgeIncorrect: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  letterText: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
  },
  letterTextSelected: {
    color: "#FFFFFF",
  },
  optionText: {
    flex: 1,
    fontSize: fonts.body,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 20,
  },
  alreadyDoneNote: {
    fontSize: fonts.small,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing.md,
  },
  competencyBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  competencyText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  moscowBadge: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  moscowBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B91C1C",
  },
});