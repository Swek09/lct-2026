import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AchievementsModal } from "../components/AchievementsModal";
import { BottomTabBar } from "../components/BottomTabBar";
import { DailyBonusModal } from "../components/DailyBonusModal";
import { DailyQuestModal } from "../components/DailyQuestModal";
import { DuoButton } from "../components/DuoButton";
import { NightTransitionModal } from "../components/NightTransitionModal";
import { PetAvatar } from "../components/PetAvatar";
import { TopNavBar } from "../components/TopNavBar";
import { goals } from "../content/goals";
import { tasks, taskUnits } from "../content/tasks";
import { canClaimDailyBonus, canDoDailyQuest } from "../domain/daily";
import { canFinishPeriod, currentPeriod } from "../domain/period";
import { useStore } from "../store/store";
import { colors, fonts, radius, spacing } from "../theme";
import { playClickSound, playCoinSound } from "../utils/sound";

export default function Home() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const finishPeriod = useStore((s) => s.finishPeriod);
  const startNextPeriod = useStore((s) => s.startNextPeriod);
  const lastFeedback = useStore((s) => s.lastFeedback);

  const [activeUnitId, setActiveUnitId] = useState(1);
  const [chestClaimed, setChestClaimed] = useState<Record<number, boolean>>({});
  const [petSpeech, setPetSpeech] = useState<string | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showDailyQuest, setShowDailyQuest] = useState(false);
  const [showNightModal, setShowNightModal] = useState(false);

  useEffect(() => {
    if (profile && canClaimDailyBonus(profile)) {
      const timer = setTimeout(() => setShowDailyBonus(true), 600);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  if (!profile) return null;

  const handlePetTap = () => {
    playClickSound();
    const phrases = [
      `Муррр! Я так люблю играть с тобой! 💖`,
      `Ням-ням, не забудь покормить меня в лавке! 🥣`,
      `Пойдём на карту? Там дают монетки за победу! ⭐`,
      `Ура! Мы скоро накопим на нашу мечту! 🐷`,
      `Почеши мне животик! 🥰`,
      `Ты самый лучший и заботливый хозяин! 🐾`,
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    setPetSpeech(phrase);
    setTimeout(() => setPetSpeech(null), 3000);
  };

  const period = currentPeriod(profile);
  const completedTaskIds = new Set(profile.completedTasks.map((t) => t.taskId));

  const claimChest = (unitId: number) => {
    if (chestClaimed[unitId]) return;
    playCoinSound();
    setChestClaimed((prev) => ({ ...prev, [unitId]: true }));
    useStore.setState((state) => {
      if (!state.profile) return state;
      return {
        ...state,
        profile: {
          ...state.profile,
          balance: state.profile.balance + 25,
        },
        lastFeedback: ["Ты открыл сундук мудрости и получил 25 монет! 🎁🪙"],
      };
    });
  };

  const handleFinishPeriod = () => {
    playClickSound();
    const check = canFinishPeriod(profile);
    if (!check.ok) {
      alert(check.reason ?? "Сначала подтверди план и накорми питомца перед сном!");
      return;
    }
    setShowNightModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNavBar />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Unit Selector Header (Duolingo Unit Banner) */}
        <View style={styles.unitHeader}>
          <View style={styles.unitSelectorRow}>
            {taskUnits.map((u) => (
              <Pressable
                key={u.id}
                style={[
                  styles.unitTab,
                  activeUnitId === u.id && styles.unitTabActive,
                ]}
                onPress={() => setActiveUnitId(u.id)}
              >
                <Text style={styles.unitTabBadge}>{u.badge}</Text>
                <Text
                  style={[
                    styles.unitTabText,
                    activeUnitId === u.id && styles.unitTabTextActive,
                  ]}
                >
                  Мир {u.id}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Active Unit Info Card */}
          {(() => {
            const currentUnit = taskUnits.find((u) => u.id === activeUnitId) ?? taskUnits[0];
            const unitTasks = tasks.filter((t) => t.unitId === currentUnit.id);
            const doneInUnit = unitTasks.filter((t) => completedTaskIds.has(t.id)).length;
            const progressPct = unitTasks.length > 0 ? (doneInUnit / unitTasks.length) * 100 : 0;

            return (
              <View style={styles.unitBannerCard}>
                <View style={styles.unitBannerTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.unitBannerTitle}>{currentUnit.title}</Text>
                    <Text style={styles.unitBannerDesc}>{currentUnit.description}</Text>
                    <View style={styles.petStatusRow}>
                      <View style={styles.petStatusBadge}>
                        <Text style={styles.petStatusText}>🥣 {profile.pet.state.satiety}% сытость</Text>
                      </View>
                      <View style={[styles.petStatusBadge, styles.petStatusBadgeMood]}>
                        <Text style={styles.petStatusText}>😊 {profile.pet.state.mood}% радость</Text>
                      </View>
                    </View>
                  </View>
                  <Pressable style={styles.unitPetPreview} onPress={handlePetTap}>
                    <Image
                      source={require("../../assets/images/background_cat.png")}
                      style={styles.unitPetImage}
                      resizeMode="contain"
                    />
                  </Pressable>
                </View>

                {/* Pet Speech Bubble on Tap */}
                {petSpeech && (
                  <View style={styles.petBubbleBox}>
                    <Text style={styles.petBubbleText}>{petSpeech}</Text>
                  </View>
                )}

                {/* Unit Progress Bar */}
                <View style={styles.unitProgressWrap}>
                  <View style={styles.unitProgressBar}>
                    <View style={[styles.unitProgressFill, { width: `${progressPct}%` }]} />
                  </View>
                  <Text style={styles.unitProgressText}>
                    {doneInUnit} / {unitTasks.length} пройдено
                  </Text>
                </View>
              </View>
            );
          })()}
        </View>

        {/* Goal & Medals Quick Widgets */}
        <View style={styles.quickWidgetsRow}>
          {(() => {
            const allGoals = [...(profile.customGoals ?? []), ...goals];
            const activeGoalId = profile.selectedGoalId ?? allGoals[0]?.id;
            const activeGoal = allGoals.find((g) => g.id === activeGoalId) ?? allGoals[0];
            const savedInGoal = profile.savingsByGoal[activeGoal.id] ?? 0;
            return (
              <Pressable
                style={styles.goalWidgetCard}
                onPress={() => {
                  playClickSound();
                  router.push("/savings");
                }}
              >
                <View style={styles.goalWidgetLeft}>
                  <Text style={{ fontSize: 24 }}>{activeGoal.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalWidgetTitle} numberOfLines={1}>
                      Цель: {activeGoal.name}
                    </Text>
                    <Text style={styles.goalWidgetSubtitle}>
                      {savedInGoal} / {activeGoal.cost} 🪙
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })()}

          {/* Medals Quick Widget */}
          <Pressable
            style={styles.medalWidgetCard}
            onPress={() => {
              playClickSound();
              setShowAchievements(true);
            }}
          >
            <Text style={{ fontSize: 24 }}>🏅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.medalWidgetTitle}>Награды</Text>
              <Text style={styles.medalWidgetSubtitle}>
                {profile.unlockedAchievementIds?.length ?? 0} из 8 наград
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Daily Gamification Hub (Подарок дня + Загадка Мудрой Совы) */}
        <View style={styles.dailyHubRow}>
          {/* Daily Gift Button */}
          <Pressable
            style={[
              styles.dailyHubBtn,
              canClaimDailyBonus(profile) && styles.dailyHubBtnActive,
            ]}
            onPress={() => {
              playClickSound();
              setShowDailyBonus(true);
            }}
          >
            <Text style={{ fontSize: 22 }}>🎁</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.dailyHubTitle}>Подарок дня</Text>
              <Text style={styles.dailyHubSubtitle}>
                {canClaimDailyBonus(profile) ? "Забрать награду! ✨" : "Получено сегодня ✓"}
              </Text>
            </View>
            {canClaimDailyBonus(profile) && (
              <View style={styles.dailyBadgePill}>
                <Text style={styles.dailyBadgeText}>ЖДЁТ!</Text>
              </View>
            )}
          </Pressable>

          {/* Daily Quest Button */}
          <Pressable
            style={[
              styles.dailyHubBtn,
              canDoDailyQuest(profile) && styles.dailyQuestBtnActive,
            ]}
            onPress={() => {
              playClickSound();
              setShowDailyQuest(true);
            }}
          >
            <Text style={{ fontSize: 22 }}>🦉</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.dailyHubTitle}>Загадка Совы</Text>
              <Text style={styles.dailyHubSubtitle}>
                {canDoDailyQuest(profile) ? "+15 🪙 за ответ" : "Пройдено сегодня ✓"}
              </Text>
            </View>
            {canDoDailyQuest(profile) && (
              <View style={styles.questBadgePill}>
                <Text style={styles.dailyBadgeText}>+15 🪙</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Adventure Path (Duolingo Learning Path) */}
        <View style={styles.pathContainer}>

          {(() => {
            const currentUnit = taskUnits.find((u) => u.id === activeUnitId) ?? taskUnits[0];
            const unitTasks = tasks.filter((t) => t.unitId === currentUnit.id);

            return (
              <View style={styles.nodesWrapper}>
                {unitTasks.map((task, idx) => {
                  const isDone = completedTaskIds.has(task.id);
                  const isUnlocked = idx === 0 || completedTaskIds.has(unitTasks[idx - 1].id) || profile.demoMode;

                  // Winding offset for authentic Duolingo curve
                  const offsets = [0, 38, -38, 20, -20];
                  const xOffset = offsets[idx % offsets.length];

                  return (
                    <View
                      key={task.id}
                      style={[styles.nodeRow, { transform: [{ translateX: xOffset }] }]}
                    >
                      <Pressable
                        disabled={!isUnlocked}
                        style={({ pressed }) => [
                          styles.nodeCircle,
                          isDone && styles.nodeDone,
                          !isDone && isUnlocked && styles.nodeCurrent,
                          !isUnlocked && styles.nodeLocked,
                          pressed && styles.nodePressed,
                        ]}
                        onPress={() => {
                          playClickSound();
                          router.push(`/task/${task.id}` as never);
                        }}
                      >
                        <Text style={styles.nodeIcon}>
                          {isDone ? "⭐" : isUnlocked ? (task.icon ?? "🪙") : "🔒"}
                        </Text>
                        {isUnlocked && !isDone && (
                          <View style={styles.startBadge}>
                            <Text style={styles.startBadgeText}>ИГРАТЬ</Text>
                          </View>
                        )}
                      </Pressable>

                      {/* Task title label below node */}
                      <View style={styles.nodeLabelBox}>
                        <Text style={styles.nodeLabelText} numberOfLines={1}>
                          {task.title}
                        </Text>
                        <Text style={styles.nodeRewardText}>+{task.reward} 🪙</Text>
                      </View>

                      {/* Connector line between nodes */}
                      {idx < unitTasks.length - 1 && <View style={styles.pathLine} />}
                    </View>
                  );
                })}

                {/* Unit End Chest */}
                <View style={styles.chestNodeRow}>
                  <Pressable
                    style={[
                      styles.chestCircle,
                      chestClaimed[currentUnit.id] && styles.chestClaimed,
                    ]}
                    onPress={() => claimChest(currentUnit.id)}
                  >
                    <Text style={{ fontSize: 32 }}>
                      {chestClaimed[currentUnit.id] ? "✨" : "🎁"}
                    </Text>
                  </Pressable>
                  <Text style={styles.chestLabel}>
                    {chestClaimed[currentUnit.id]
                      ? "Сундук открыт!"
                      : "Сундук с сокровищами (+25 🪙)"}
                  </Text>
                </View>
              </View>
            );
          })()}

          {/* Coach Advice by the Road */}
          <View style={styles.coachOwlSection}>
            <View style={styles.coachOwlBadge}>
              <Text style={styles.coachOwlEmoji}>🦉</Text>
            </View>
            <View style={styles.coachBubble}>
              <Text style={styles.coachText}>
                {profile.pet.name} ждёт приключений! Проходи весёлые уроки, зарабатывай монетки и вкусно корми друга! ✨
              </Text>
            </View>
          </View>
        </View>

        {/* Feedback Alert if present */}
        {lastFeedback.length > 0 && (
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>💡 Совет Мудрой Совы:</Text>
            {lastFeedback.map((f, i) => (
              <Text key={i} style={styles.feedbackItem}>
                {f}
              </Text>
            ))}
          </View>
        )}

        {/* Period Actions Banner */}
        {period && !period.completed && (
          <View style={styles.periodCard}>
            <View style={styles.periodHeaderRow}>
              <View>
                <Text style={styles.periodNumber}>
                  День {profile.currentPeriodIndex + 1} с {profile.pet.name} ☀️
                </Text>
                <Text style={styles.periodSubtitle}>
                  Твои карманные деньги: {period.income} монет 🪙
                </Text>
              </View>
              <Text style={{ fontSize: 24 }}>☀️</Text>
            </View>

            <DuoButton
              title="Закончить день и лечь спать 🌙"
              variant="primary"
              size="md"
              onPress={handleFinishPeriod}
            />
          </View>
        )}
      </ScrollView>

      <AchievementsModal
        visible={showAchievements}
        onClose={() => setShowAchievements(false)}
        unlockedAchievementIds={profile.unlockedAchievementIds}
      />

      <DailyBonusModal
        visible={showDailyBonus}
        onClose={() => setShowDailyBonus(false)}
      />

      <DailyQuestModal
        visible={showDailyQuest}
        onClose={() => setShowDailyQuest(false)}
      />

      <NightTransitionModal
        visible={showNightModal}
        onWakeUp={() => {
          const res = finishPeriod();
          if (res.ok) {
            startNextPeriod();
          }
          setShowNightModal(false);
        }}
        onCancel={() => setShowNightModal(false)}
      />

      <BottomTabBar currentTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 24,
  },

  /* Unit Selector */
  unitHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  unitSelectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  unitTab: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    backgroundColor: "#F7F4EB",
    borderWidth: 1.5,
    borderColor: colors.border,
    flex: 1,
    marginHorizontal: 2,
  },
  unitTabActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  unitTabBadge: {
    fontSize: 16,
  },
  unitTabText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    marginTop: 2,
  },
  unitTabTextActive: {
    color: colors.primaryDark,
  },

  /* Unit Banner Card */
  unitBannerCard: {
    backgroundColor: "#FAF8F3",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
  },
  unitBannerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  unitBannerTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  unitBannerDesc: {
    fontSize: fonts.caption,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  unitPetPreview: {
    marginLeft: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  unitPetImage: {
    width: 76,
    height: 57,
  },
  unitPetName: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primaryDark,
    marginTop: 2,
  },
  petStatusRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  petStatusBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  petStatusBadgeMood: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  petStatusText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text,
  },
  unitProgressWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  unitProgressBar: {
    flex: 1,
    height: 10,
    backgroundColor: "#E6E0D2",
    borderRadius: 5,
    overflow: "hidden",
  },
  unitProgressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  unitProgressText: {
    fontSize: fonts.caption,
    fontWeight: "700",
    color: colors.textMuted,
  },

  /* Learning Path Nodes */
  pathContainer: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  nodesWrapper: {
    alignItems: "center",
    width: "100%",
  },
  nodeRow: {
    alignItems: "center",
    marginVertical: 12,
    position: "relative",
  },
  nodeCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 5,
  },
  nodeDone: {
    backgroundColor: "#F59E0B",
    borderBottomColor: "#D97706",
    borderColor: "#FBBF24",
    borderWidth: 1,
  },
  nodeCurrent: {
    backgroundColor: colors.primary,
    borderBottomColor: "#416F45",
    borderColor: "#78AB7C",
    borderWidth: 2,
  },
  nodeLocked: {
    backgroundColor: "#E2DDD0",
    borderBottomColor: "#C7C0B0",
    borderColor: "#ECE8DD",
    borderWidth: 1,
  },
  nodePressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 3,
  },
  nodeIcon: {
    fontSize: 28,
  },
  startBadge: {
    position: "absolute",
    top: -12,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  startBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  nodeLabelBox: {
    alignItems: "center",
    marginTop: 6,
    maxWidth: 160,
  },
  nodeLabelText: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  nodeRewardText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
    marginTop: 1,
  },
  pathLine: {
    width: 4,
    height: 24,
    backgroundColor: "#E2DDD0",
    borderRadius: 2,
    marginTop: 6,
  },

  /* Chest */
  chestNodeRow: {
    alignItems: "center",
    marginVertical: 16,
  },
  chestCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#F59E0B",
    borderBottomWidth: 5,
    borderBottomColor: "#D97706",
    alignItems: "center",
    justifyContent: "center",
  },
  chestClaimed: {
    backgroundColor: "#E6F4EA",
    borderColor: colors.primary,
    borderBottomColor: colors.primaryDark,
  },
  chestLabel: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
    marginTop: 6,
  },

  /* Coach Owl Section */
  coachOwlSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  coachOwlBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F7F1",
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  coachOwlEmoji: {
    fontSize: 26,
  },
  coachBubble: {
    flex: 1,
    backgroundColor: colors.speechBubble,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.speechBubbleBorder,
    padding: spacing.sm,
  },
  coachText: {
    fontSize: fonts.small,
    color: colors.text,
    lineHeight: 18,
    fontWeight: "600",
  },

  /* Feedback */
  feedbackCard: {
    backgroundColor: "#EFF8F1",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  feedbackTitle: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.primaryDark,
    marginBottom: 4,
  },
  feedbackItem: {
    fontSize: fonts.small,
    color: colors.text,
    lineHeight: 18,
  },

  /* Period Footer Card */
  periodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  periodHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  periodNumber: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  periodSubtitle: {
    fontSize: fonts.small,
    color: colors.textMuted,
  },
  quickWidgetsRow: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  goalWidgetCard: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  goalWidgetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  goalWidgetTitle: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
  },
  goalWidgetSubtitle: {
    fontSize: fonts.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  medalWidgetCard: {
    flex: 0.9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "#FCD34D",
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  medalWidgetTitle: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: "#92400E",
  },
  medalWidgetSubtitle: {
    fontSize: fonts.caption,
    color: "#B45309",
    marginTop: 1,
  },
  petBubbleBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    marginTop: spacing.sm,
  },
  petBubbleText: {
    fontSize: fonts.caption,
    fontWeight: "700",
    color: "#166534",
    lineHeight: 18,
  },
  /* Daily Hub Styles */
  dailyHubRow: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: spacing.md,
    marginTop: 8,
  },
  dailyHubBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    position: "relative",
  },
  dailyHubBtnActive: {
    backgroundColor: "#FFFBEB",
    borderColor: "#F59E0B",
    borderWidth: 2,
  },
  dailyQuestBtnActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#10B981",
    borderWidth: 2,
  },
  dailyHubTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
  },
  dailyHubSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  dailyBadgePill: {
    position: "absolute",
    top: -6,
    right: 8,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  questBadgePill: {
    position: "absolute",
    top: -6,
    right: 8,
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  dailyBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
});