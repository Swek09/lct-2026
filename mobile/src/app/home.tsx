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
import { BedtimeCheckModal } from "../components/BedtimeCheckModal";
import { BottomTabBar } from "../components/BottomTabBar";
import { DailyBonusModal } from "../components/DailyBonusModal";
import { DailyQuestModal } from "../components/DailyQuestModal";
import { DuoButton } from "../components/DuoButton";
import { NightTransitionModal } from "../components/NightTransitionModal";
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
  const lastFeedback = useStore((s) => s.lastFeedback);

  const [activeUnitId, setActiveUnitId] = useState(1);
  const [chestClaimed, setChestClaimed] = useState<Record<number, boolean>>({});
  const [petSpeech, setPetSpeech] = useState<string | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showDailyQuest, setShowDailyQuest] = useState(false);
  const [showNightModal, setShowNightModal] = useState(false);
  const [bedtimeBlock, setBedtimeBlock] = useState<{
    reason: string;
    action?: "budget" | "shop";
  } | null>(null);
  const [homeToast, setHomeToast] = useState<string | null>(null);

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
    const uTasks = tasks.filter((t) => t.unitId === unitId);
    const isDone = uTasks.length > 0 && uTasks.every((t) => completedTaskIds.has(t.id));
    if (!isDone && !profile.demoMode) {
      const remaining = uTasks.filter((t) => !completedTaskIds.has(t.id)).length;
      playClickSound();
      setHomeToast(`Пройди ещё ${remaining} урок(а) в этом мире, чтобы открыть сундук сокровищ! 🎁⭐`);
      setTimeout(() => setHomeToast(null), 3500);
      return;
    }
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
    setHomeToast("Ура! Ты открыл сундук мудрости: +25 🪙 в кошелёк! 🎉");
    setTimeout(() => setHomeToast(null), 3500);
  };

  const handleFinishPeriod = () => {
    playClickSound();
    const check = canFinishPeriod(profile);
    if (!check.ok) {
      setBedtimeBlock({
        reason: check.reason ?? "Сначала подтверди план и накорми питомца перед сном!",
        action: check.missingAction,
      });
      return;
    }
    setShowNightModal(true);
  };

  /* Derived data for the active unit */
  const activeUnit = taskUnits.find((u) => u.id === activeUnitId) ?? taskUnits[0];
  const unitTasks = tasks.filter((t) => t.unitId === activeUnit.id);
  const doneInUnit = unitTasks.filter((t) => completedTaskIds.has(t.id)).length;
  const progressPct = unitTasks.length > 0 ? (doneInUnit / unitTasks.length) * 100 : 0;
  const nextTaskIndex = unitTasks.findIndex((t) => !completedTaskIds.has(t.id));

  /* Authentic Duolingo winding rhythm: right → center → left */
  const windOffsets = [0, 52, 52, 0, -52, -52];

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNavBar />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ============ 1. UNIT HEADER ============ */}
        <View style={styles.unitSection}>
          {/* Segmented world switcher */}
          <View style={styles.segmentWrap}>
            {taskUnits.map((u) => {
              const unitDone = tasks.filter(
                (t) => t.unitId === u.id && completedTaskIds.has(t.id),
              ).length;
              const unitTotal = tasks.filter((t) => t.unitId === u.id).length;
              const isActive = activeUnitId === u.id;
              const isComplete = unitTotal > 0 && unitDone === unitTotal;
              return (
                <Pressable
                  key={u.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Мир ${u.id}`}
                  style={({ pressed }) => [
                    styles.segment,
                    isActive && styles.segmentActive,
                    pressed && styles.segmentPressed,
                  ]}
                  onPress={() => {
                    playClickSound();
                    setActiveUnitId(u.id);
                  }}
                >
                  <Text style={styles.segmentBadge}>{isComplete ? "🏆" : u.badge}</Text>
                  <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                    {u.id}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Hero unit banner */}
          <View style={styles.unitBanner}>
            <View style={styles.unitBannerTopRow}>
              <View style={styles.unitBannerTextCol}>
                <View style={styles.unitChipRow}>
                  <View style={styles.unitChip}>
                    <Text style={styles.unitChipText}>Мир {activeUnit.id}</Text>
                  </View>
                  <View style={[styles.unitChip, styles.unitChipDay]}>
                    <Text style={[styles.unitChipText, styles.unitChipTextDay]}>
                      День {profile.currentPeriodIndex + 1} ☀️
                    </Text>
                  </View>
                </View>
                <Text style={styles.unitTitle}>{activeUnit.title.replace(/^Остров \d+: /, "")}</Text>
                <Text style={styles.unitDesc} numberOfLines={2}>
                  {activeUnit.description}
                </Text>
              </View>

              {/* Pet hero with speech bubble */}
              <View style={styles.petHeroWrap}>
                {petSpeech && (
                  <View style={styles.petBubble}>
                    <Text style={styles.petBubbleText}>{petSpeech}</Text>
                  </View>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Погладить питомца"
                  onPress={handlePetTap}
                  style={({ pressed }) => [
                    styles.petHeroCircle,
                    pressed && styles.petHeroPressed,
                  ]}
                >
                  <Image
                    source={require("../../assets/images/background_cat.png")}
                    style={styles.petHeroImage}
                    resizeMode="contain"
                  />
                  <View style={styles.petHeroStatus}>
                    <Text style={styles.petHeroStatusText}>
                      🥣{profile.pet.state.satiety} 😊{profile.pet.state.mood}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Unit progress */}
            <View style={styles.unitProgressRow}>
              <View style={styles.unitProgressBarTrack}>
                <View style={[styles.unitProgressFill, { width: `${progressPct}%` }]} />
                {progressPct > 12 && (
                  <Text style={[styles.unitProgressPct, { left: `${Math.min(progressPct - 6, 82)}%` }]}>
                    {Math.round(progressPct)}%
                  </Text>
                )}
              </View>
              <Text style={styles.unitProgressLabel}>
                {doneInUnit}/{unitTasks.length} уроков
              </Text>
            </View>
          </View>
        </View>

        {/* ============ 2. DAILY HUB ============ */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitle}>EVERY ДЕНЬ</Text>
          <View style={styles.dailyRow}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.dailyCard,
                styles.dailyCardGift,
                canClaimDailyBonus(profile) && styles.dailyCardGiftActive,
                pressed && styles.cardPressed,
              ]}
              onPress={() => {
                playClickSound();
                setShowDailyBonus(true);
              }}
            >
              <View style={styles.dailyIconTile}>
                <Text style={styles.dailyIconText}>🎁</Text>
                {canClaimDailyBonus(profile) && <View style={styles.dotBadge} />}
              </View>
              <View style={styles.dailyTextCol}>
                <Text style={styles.dailyTitle}>Подарок дня</Text>
                <Text
                  style={[
                    styles.dailySubtitle,
                    canClaimDailyBonus(profile) && styles.dailySubtitleHot,
                  ]}
                  numberOfLines={1}
                >
                  {canClaimDailyBonus(profile) ? "Забрать награду! ✨" : "Получено сегодня ✓"}
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.dailyCard,
                styles.dailyCardQuest,
                canDoDailyQuest(profile) && styles.dailyCardQuestActive,
                pressed && styles.cardPressed,
              ]}
              onPress={() => {
                playClickSound();
                setShowDailyQuest(true);
              }}
            >
              <View style={styles.dailyIconTile}>
                <Text style={styles.dailyIconText}>🦉</Text>
                {canDoDailyQuest(profile) && <View style={styles.dotBadgeGreen} />}
              </View>
              <View style={styles.dailyTextCol}>
                <Text style={styles.dailyTitle}>Загадка Совы</Text>
                <Text
                  style={[
                    styles.dailySubtitle,
                    canDoDailyQuest(profile) && styles.dailySubtitleHotGreen,
                  ]}
                  numberOfLines={1}
                >
                  {canDoDailyQuest(profile) ? "+15 🪙 за ответ" : "Пройдено сегодня ✓"}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* ============ 3. ADVENTURE PATH ============ */}
        <View style={styles.pathSection}>
          <Text style={styles.sectionTitle}>ПУТЬ ПРИКЛЮЧЕНИЙ</Text>

          <View style={styles.pathWrapper}>
            {/* Decorative dashed spine */}
            <View style={styles.pathSpine} pointerEvents="none" />

            {unitTasks.map((task, idx) => {
              const isDone = completedTaskIds.has(task.id);
              const prevUnitTasks = activeUnit.id > 1 ? tasks.filter((t) => t.unitId === activeUnit.id - 1) : [];
              const isPrevUnitDone = prevUnitTasks.length === 0 || prevUnitTasks.every((t) => completedTaskIds.has(t.id));
              const isUnlocked =
                profile.demoMode ||
                (isPrevUnitDone && (idx === 0 || completedTaskIds.has(unitTasks[idx - 1].id)));
              const isNext = isUnlocked && !isDone && idx === nextTaskIndex;

              const xOffset = windOffsets[idx % windOffsets.length];

              return (
                <View
                  key={task.id}
                  style={[styles.nodeRow, { transform: [{ translateX: xOffset }] }]}
                >
                  <View style={styles.nodeCol}>
                    {isNext && (
                      <View style={styles.startBubble}>
                        <Text style={styles.startBubbleText}>СТАРТ</Text>
                      </View>
                    )}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={task.title}
                      disabled={!isUnlocked}
                      style={({ pressed }) => [
                        styles.nodeCircle,
                        isDone && styles.nodeDone,
                        isNext && styles.nodeCurrent,
                        !isDone && !isUnlocked && styles.nodeLocked,
                        pressed && isUnlocked && styles.nodePressed,
                      ]}
                      onPress={() => {
                        playClickSound();
                        router.push(`/task/${task.id}` as never);
                      }}
                    >
                      <Text style={styles.nodeIcon}>
                        {isDone ? "⭐" : isUnlocked ? (task.icon ?? "🪙") : "🔒"}
                      </Text>
                    </Pressable>
                    <View style={styles.nodeLabelWrap}>
                      <Text style={styles.nodeTitle} numberOfLines={2}>
                        {task.title}
                      </Text>
                      <View style={styles.rewardPill}>
                        <Text style={styles.rewardPillText}>+{task.reward} 🪙</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Unit treasure chest */}
            {(() => {
              const isUnitCompleted = unitTasks.length > 0 && unitTasks.every((t) => completedTaskIds.has(t.id));
              const isClaimed = !!chestClaimed[activeUnit.id];
              return (
                <View style={styles.chestWrap}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Открыть сундук с сокровищами"
                    style={({ pressed }) => [
                      styles.chestCircle,
                      isClaimed && styles.chestClaimed,
                      !isClaimed && !isUnitCompleted && !profile.demoMode && styles.chestLocked,
                      pressed && styles.nodePressed,
                    ]}
                    onPress={() => claimChest(activeUnit.id)}
                  >
                    <Text style={styles.chestIcon}>
                      {isClaimed ? "✨" : isUnitCompleted || profile.demoMode ? "🎁" : "🔒"}
                    </Text>
                  </Pressable>
                  <Text style={styles.chestLabel}>
                    {isClaimed
                      ? "Сундук мудрости открыт! ✨"
                      : isUnitCompleted || profile.demoMode
                      ? "Забери награду за Мир! 🎁"
                      : `Пройди все уроки (${doneInUnit}/${unitTasks.length})`}
                  </Text>
                  {!isClaimed && (
                    <View
                      style={[
                        styles.chestRewardPill,
                        !isUnitCompleted && !profile.demoMode && styles.chestRewardPillLocked,
                      ]}
                    >
                      <Text style={styles.chestRewardText}>
                        {isUnitCompleted || profile.demoMode ? "+25 🪙 Открыть!" : "+25 🪙"}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })()}
          </View>

          {/* Coach owl tip */}
          <View style={styles.coachRow}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachAvatarEmoji}>🦉</Text>
            </View>
            <View style={styles.coachBubble}>
              <Text style={styles.coachText}>
                {profile.pet.name} ждёт приключений! Проходи весёлые уроки, зарабатывай монетки и
                вкусно корми друга! ✨
              </Text>
            </View>
          </View>
        </View>

        {/* ============ 4. GOAL & MEDALS ============ */}
        <View style={styles.sectionPad}>
          <Text style={styles.sectionTitle}>ТВОИ ДОСТИЖЕНИЯ</Text>
          <View style={styles.widgetsRow}>
            {(() => {
              const allGoals = [...(profile.customGoals ?? []), ...goals];
              const activeGoalId = profile.selectedGoalId ?? allGoals[0]?.id;
              const activeGoal = allGoals.find((g) => g.id === activeGoalId) ?? allGoals[0];
              const savedInGoal = profile.savingsByGoal[activeGoal.id] ?? 0;
              const goalPct = Math.min(100, (savedInGoal / activeGoal.cost) * 100);
              return (
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.widgetCard, pressed && styles.cardPressed]}
                  onPress={() => {
                    playClickSound();
                    router.push("/savings");
                  }}
                >
                  <View style={[styles.widgetIconTile, styles.widgetIconTileSage]}>
                    <Text style={styles.widgetIconText}>{activeGoal.icon}</Text>
                  </View>
                  <Text style={styles.widgetTitle} numberOfLines={1}>
                    {activeGoal.name}
                  </Text>
                  <Text style={styles.widgetSubtitle}>
                    {savedInGoal} / {activeGoal.cost} 🪙
                  </Text>
                  <View style={styles.widgetProgressTrack}>
                    <View
                      style={[styles.widgetProgressFill, { width: `${goalPct}%` }]}
                    />
                  </View>
                </Pressable>
              );
            })()}

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.widgetCard, pressed && styles.cardPressed]}
              onPress={() => {
                playClickSound();
                setShowAchievements(true);
              }}
            >
              <View style={[styles.widgetIconTile, styles.widgetIconTileAmber]}>
                <Text style={styles.widgetIconText}>🏅</Text>
              </View>
              <Text style={styles.widgetTitle}>Награды</Text>
              <Text style={styles.widgetSubtitle}>
                {profile.unlockedAchievementIds?.length ?? 0} из 8
              </Text>
              <View style={styles.widgetProgressTrack}>
                <View
                  style={[
                    styles.widgetProgressFill,
                    styles.widgetProgressFillAmber,
                    {
                      width: `${
                        ((profile.unlockedAchievementIds?.length ?? 0) / 8) * 100
                      }%`,
                    },
                  ]}
                />
              </View>
            </Pressable>
          </View>
        </View>

        {/* ============ 5. OWL FEEDBACK ============ */}
        {lastFeedback.length > 0 && (
          <View style={styles.feedbackCard}>
            <View style={styles.feedbackAccent} />
            <View style={styles.feedbackBody}>
              <Text style={styles.feedbackTitle}>💡 Совет Мудрой Совы</Text>
              {lastFeedback.map((f, i) => (
                <Text key={i} style={styles.feedbackItem}>
                  {f}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* ============ 5.5 HOW TO PLAY (ТЗ 2.5.1) ============ */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Как играть — открыть подсказку"
          style={({ pressed }) => [styles.howToPlayBtn, pressed && styles.cardPressed]}
          onPress={() => {
            playClickSound();
            router.push("/onboarding");
          }}
        >
          <Text style={styles.howToPlayIcon}>❓</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.howToPlayTitle}>Как играть?</Text>
            <Text style={styles.howToPlayDesc}>
              Напомни, куда девать монетки: «Надо», «Хочу» и копилка
            </Text>
          </View>
          <Text style={styles.howToPlayArrow}>→</Text>
        </Pressable>

        {/* ============ 6. PERIOD CARD ============ */}        {period && !period.completed && (
          <View style={styles.periodCard}>
            <View style={styles.periodTopRow}>
              <View style={styles.periodSunBadge}>
                <Text style={styles.periodSunText}>☀️</Text>
              </View>
              <View style={styles.periodTextCol}>
                <Text style={styles.periodTitle}>
                  День {profile.currentPeriodIndex + 1} с {profile.pet.name}
                </Text>
                <Text style={styles.periodSubtitle}>
                  Карманные деньги: {period.income} монет 🪙
                </Text>
              </View>
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
          finishPeriod();
          setShowNightModal(false);
        }}
        onCancel={() => setShowNightModal(false)}
      />

      <BedtimeCheckModal
        visible={!!bedtimeBlock}
        reason={bedtimeBlock?.reason ?? ""}
        action={bedtimeBlock?.action}
        onClose={() => setBedtimeBlock(null)}
        onNavigate={(route) => router.push(route)}
      />

      {homeToast && (
        <View style={styles.floatingToast} pointerEvents="none">
          <Text style={styles.floatingToastText}>{homeToast}</Text>
        </View>
      )}

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
    paddingBottom: 32,
  },

  /* ---------- Section scaffolding ---------- */
  sectionPad: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  cardPressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.92,
  },

  /* ---------- Unit section ---------- */
  unitSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  segmentWrap: {
    flexDirection: "row",
    backgroundColor: "#EFEAD9",
    borderRadius: 18,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingVertical: 8,
    borderRadius: 14,
  },
  segmentActive: {
    backgroundColor: colors.primary,
    shadowColor: "#3E6B43",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  segmentPressed: {
    opacity: 0.85,
  },
  segmentBadge: {
    fontSize: 15,
  },
  segmentText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted,
    marginTop: 1,
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },

  unitBanner: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: "#447348",
    borderBottomWidth: 5,
    shadowColor: "#3E6B43",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  unitBannerTopRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  unitBannerTextCol: {
    flex: 1,
  },
  unitChipRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  unitChip: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  unitChipDay: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  unitChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  unitChipTextDay: {
    color: "#FFF3D6",
  },
  unitTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 23,
  },
  unitDesc: {
    fontSize: fonts.caption,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
    lineHeight: 16,
  },
  petHeroWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 112,
  },
  petHeroCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  petHeroPressed: {
    transform: [{ scale: 0.95 }],
  },
  petHeroImage: {
    width: 88,
    height: 66,
  },
  petHeroStatus: {
    position: "absolute",
    bottom: -8,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: "#447348",
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  petHeroStatusText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#3E6B43",
  },
  petBubble: {
    position: "absolute",
    bottom: 112,
    left: -58,
    width: 168,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    zIndex: 10,
    shadowColor: "#3E6B43",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  petBubbleText: {
    fontSize: fonts.caption,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 16,
  },
  unitProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  unitProgressBarTrack: {
    flex: 1,
    height: 18,
    backgroundColor: "rgba(0,0,0,0.22)",
    borderRadius: 9,
    overflow: "hidden",
  },
  unitProgressFill: {
    height: "100%",
    backgroundColor: "#FFC800",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  unitProgressPct: {
    position: "absolute",
    top: 2.5,
    fontSize: 10,
    fontWeight: "900",
    color: "#7A5200",
  },
  unitProgressLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  /* ---------- Daily hub ---------- */
  dailyRow: {
    flexDirection: "row",
    gap: 10,
  },
  dailyCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 10,
  },
  dailyCardGift: {
    // neutral idle
  },
  dailyCardGiftActive: {
    borderColor: "#F59E0B",
    backgroundColor: "#FFFBEB",
  },
  dailyCardQuest: {
    // neutral idle
  },
  dailyCardQuestActive: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  dailyIconTile: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F6F3EA",
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  dailyIconText: {
    fontSize: 21,
  },
  dotBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#F59E0B",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  dotBadgeGreen: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  dailyTextCol: {
    flex: 1,
  },
  dailyTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
  },
  dailySubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 1,
  },
  dailySubtitleHot: {
    color: "#B45309",
    fontWeight: "800",
  },
  dailySubtitleHotGreen: {
    color: "#047857",
    fontWeight: "800",
  },

  /* ---------- Adventure path ---------- */
  pathSection: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  pathWrapper: {
    alignItems: "center",
    width: "100%",
    paddingVertical: spacing.md,
    position: "relative",
  },
  pathSpine: {
    position: "absolute",
    top: 40,
    bottom: 40,
    alignSelf: "center",
    width: 0,
    borderLeftWidth: 3,
    borderLeftColor: "#E3DDCB",
    borderStyle: "dashed",
    borderRadius: 2,
  },
  nodeRow: {
    marginVertical: 14,
  },
  nodeCol: {
    alignItems: "center",
  },
  startBubble: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: "#447348",
    shadowColor: "#3E6B43",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  startBubbleText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  nodeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderBottomWidth: 7,
  },
  nodeDone: {
    backgroundColor: "#FFC800",
    borderColor: "#E5A600",
    borderBottomColor: "#C98F00",
  },
  nodeCurrent: {
    backgroundColor: colors.primary,
    borderColor: "#78AB7C",
    borderBottomColor: "#3E6B43",
    shadowColor: "#3E6B43",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
  },
  nodeLocked: {
    backgroundColor: "#E6E2D6",
    borderColor: "#D5D0C1",
    borderBottomColor: "#C3BDAC",
  },
  nodePressed: {
    transform: [{ translateY: 3 }],
    borderBottomWidth: 4,
  },
  nodeIcon: {
    fontSize: 32,
  },
  nodeLabelWrap: {
    alignItems: "center",
    marginTop: 7,
    maxWidth: 150,
  },
  nodeTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    lineHeight: 15,
  },
  rewardPill: {
    marginTop: 4,
    backgroundColor: "#FFF7E0",
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: "#F2D98C",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rewardPillText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#A16207",
  },

  /* ---------- Chest ---------- */
  chestWrap: {
    alignItems: "center",
    marginTop: 10,
  },
  chestCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#FFC800",
    borderWidth: 2,
    borderColor: "#E5A600",
    borderBottomWidth: 8,
    borderBottomColor: "#C98F00",
    alignItems: "center",
    justifyContent: "center",
  },
  chestClaimed: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderBottomColor: colors.primaryDark,
  },
  chestLocked: {
    backgroundColor: "#E2E8F0",
    borderColor: "#CBD5E1",
    borderBottomColor: "#94A3B8",
  },
  chestIcon: {
    fontSize: 38,
  },
  chestLabel: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
    marginTop: 8,
  },
  chestRewardPill: {
    marginTop: 4,
    backgroundColor: "#FFF7E0",
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: "#F2D98C",
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  chestRewardPillLocked: {
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
  },
  chestRewardText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#A16207",
  },
  floatingToast: {
    position: "absolute",
    bottom: 84,
    left: 20,
    right: 20,
    backgroundColor: "rgba(15, 23, 42, 0.94)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  floatingToastText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  /* ---------- Coach owl ---------- */
  coachRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    alignSelf: "stretch",
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  coachAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  coachAvatarEmoji: {
    fontSize: 26,
  },
  coachBubble: {
    flex: 1,
    backgroundColor: colors.speechBubble,
    borderRadius: 4,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderWidth: 2,
    borderColor: colors.speechBubbleBorder,
    padding: spacing.sm + 2,
  },
  coachText: {
    fontSize: fonts.small,
    color: colors.text,
    lineHeight: 19,
    fontWeight: "600",
  },

  /* ---------- Goal & medals widgets ---------- */
  widgetsRow: {
    flexDirection: "row",
    gap: 10,
  },
  widgetCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 12,
    alignItems: "center",
  },
  widgetIconTile: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  widgetIconTileSage: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  widgetIconTileAmber: {
    backgroundColor: "#FFF7E0",
    borderColor: "#F2C14E",
  },
  widgetIconText: {
    fontSize: 26,
  },
  widgetTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  widgetSubtitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 8,
  },
  widgetProgressTrack: {
    width: "100%",
    height: 10,
    backgroundColor: "#EFEAD9",
    borderRadius: 5,
    overflow: "hidden",
  },
  widgetProgressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  widgetProgressFillAmber: {
    backgroundColor: "#F59E0B",
  },

  /* ---------- Owl feedback ---------- */
  feedbackCard: {
    flexDirection: "row",
    backgroundColor: "#F3F9F4",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    overflow: "hidden",
  },
  feedbackAccent: {
    width: 6,
    backgroundColor: colors.primary,
  },
  feedbackBody: {
    flex: 1,
    padding: spacing.md,
  },
  feedbackTitle: {
    fontSize: fonts.small,
    fontWeight: "900",
    color: colors.primaryDark,
    marginBottom: 5,
  },
  feedbackItem: {
    fontSize: fonts.small,
    color: colors.text,
    lineHeight: 19,
    fontWeight: "600",
  },

  /* ---------- How to play (ТЗ 2.5.1) ---------- */
  howToPlayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 12,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  howToPlayIcon: {
    fontSize: 22,
  },
  howToPlayTitle: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
  },
  howToPlayDesc: {
    fontSize: fonts.caption,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 1,
  },
  howToPlayArrow: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primaryDark,
  },

  /* ---------- Period card ---------- */
  periodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 5,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm + 2,
  },
  periodTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  periodSunBadge: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFF3D6",
    borderWidth: 2,
    borderColor: "#F2C14E",
    alignItems: "center",
    justifyContent: "center",
  },
  periodSunText: {
    fontSize: 24,
  },
  periodTextCol: {
    flex: 1,
  },
  periodTitle: {
    fontSize: fonts.body,
    fontWeight: "900",
    color: colors.text,
  },
  periodSubtitle: {
    fontSize: fonts.small,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 1,
  },
});
