import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BottomTabBar } from "../components/BottomTabBar";
import { Cat3DViewer, CatAnimationName } from "../components/Cat3DViewer";
import { DuoButton } from "../components/DuoButton";
import { NightTransitionModal } from "../components/NightTransitionModal";
import { TopNavBar } from "../components/TopNavBar";
import { goals } from "../content/goals";
import { growthStageLabels } from "../content/pets";
import { progressPercent } from "../domain/formulas";
import { canFinishPeriod, currentPeriod } from "../domain/period";
import { useStore } from "../store/store";
import { colors, fonts, radius, spacing } from "../theme";
import { playClickSound } from "../utils/sound";

const ANIM_CHIPS: { name: CatAnimationName; label: string }[] = [
  { name: "Happy_Success", label: "🎉 Радость" },
  { name: "Happy_Idle", label: "😻 Мурчит" },
  { name: "Idle_Default", label: "🐾 Покой" },
  { name: "Sad_Idle", label: "😿 Грустит" },
  { name: "Sad", label: "😢 Плачет" },
  { name: "Sad_To_Normal", label: "✨ Утешить" },
];

export default function Progress() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const finishPeriod = useStore((s) => s.finishPeriod);
  const startNextPeriod = useStore((s) => s.startNextPeriod);
  const petPetInteractive = useStore((s) => s.petPetInteractive);
  const feedSnackInteractive = useStore((s) => s.feedSnackInteractive);

  const [showNightModal, setShowNightModal] = useState(false);
  const [petMessage, setPetMessage] = useState<string | null>(null);
  const [heartCount, setHeartCount] = useState<number[]>([]);
  const [current3DAnim, setCurrent3DAnim] = useState<CatAnimationName>("Idle_Default");
  const [showDiaryModal, setShowDiaryModal] = useState(false);

  if (!profile) return null;

  const period = currentPeriod(profile);
  const completedPeriodsCount = Object.values(profile.periods).filter((p) => p.completed).length;

  const allGoals = [...(profile.customGoals ?? []), ...goals];
  const selectedGoalId = profile.selectedGoalId ?? allGoals[0]?.id;
  const currentGoal = allGoals.find((g) => g.id === selectedGoalId) ?? allGoals[0];
  const goalSaved = profile.savingsByGoal[currentGoal.id] ?? 0;
  const goalPct = progressPercent(goalSaved, currentGoal.cost);

  const ownedItems = profile.ownedItemIds ?? [];

  const handlePetTouch = () => {
    const res = petPetInteractive();
    setPetMessage(res.message);
    setHeartCount((prev) => [...prev, Date.now()]);
    setCurrent3DAnim("Happy_Success");
    setTimeout(() => setPetMessage(null), 3500);
    setTimeout(() => {
      setHeartCount((prev) => prev.slice(1));
    }, 1500);
  };

  const handleFeedApple = () => {
    const res = feedSnackInteractive("apple");
    setPetMessage(res.message);
    setCurrent3DAnim(profile.pet.state.mood < 40 ? "Sad_To_Normal" : "Happy_Success");
    setTimeout(() => setPetMessage(null), 3500);
  };

  const handleBedtimePress = () => {
    playClickSound();
    const check = canFinishPeriod(profile);
    if (!check.ok) {
      alert(check.reason ?? "Сначала подтверди план и накорми питомца перед сном!");
      return;
    }
    setShowNightModal(true);
  };

  const prevPeriod =
    profile.currentPeriodIndex > 0
      ? profile.periods[profile.currentPeriodIndex - 1]
      : period?.completed
      ? period
      : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNavBar />

      {/* Full-Screen Edge-to-Edge 3D Pet Room Stage (Zero Page Scroll) */}
      <View style={styles.fullScreenStage}>
        {/* Cozy Architectural Room Ambience */}
        <View style={styles.roomWallZone} />
        <View style={styles.roomFloorZone} />

        {/* Central 3D Cat Character on Woven Rug */}
        <Cat3DViewer
          pet={profile.pet}
          animation={current3DAnim}
          width="100%"
          cameraDistance={7.2}
          cameraY={1.1}
          cameraLookAtY={0.6}
          modelY={-0.4}
          interactive={true}
          showRug={true}
          onPetTouch={handlePetTouch}
          style={StyleSheet.absoluteFill}
        />

        {/* Top HUD Overlay: Room Badge + Quick Vitals */}
        <View style={styles.topHudRow}>
          <View style={styles.roomBadgePill}>
            <Text style={styles.roomBadgeText}>🐾 {profile.pet.name}</Text>
          </View>

          {/* Quick Vitals Badges */}
          <View style={styles.quickVitalsRow}>
            <View style={styles.quickVitalPill}>
              <Text style={styles.quickVitalIcon}>🥣</Text>
              <Text style={styles.quickVitalValue}>{profile.pet.state.satiety}%</Text>
            </View>
            <View style={styles.quickVitalPill}>
              <Text style={styles.quickVitalIcon}>😊</Text>
              <Text style={styles.quickVitalValue}>{profile.pet.state.mood}%</Text>
            </View>
          </View>
        </View>

        {/* Floating Hearts from Petting */}
        {heartCount.length > 0 && (
          <View style={styles.floatingHeartsWrap} pointerEvents="none">
            <Text style={styles.floatingHeart}>💖</Text>
            <Text style={[styles.floatingHeart, { top: -20, right: 30 }]}>✨</Text>
            <Text style={[styles.floatingHeart, { top: 12, left: 24 }]}>🥰</Text>
          </View>
        )}

        {/* Pet Speech Bubble */}
        {petMessage && (
          <View style={styles.petSpeechBubble}>
            <Text style={styles.petSpeechText}>{petMessage}</Text>
          </View>
        )}

        {/* Owned Decor Items in Room */}
        {ownedItems.includes("toy_house") && (
          <View style={styles.decorToyHouse}>
            <Text style={{ fontSize: 32 }}>🏰</Text>
          </View>
        )}
        {ownedItems.includes("cape") && (
          <View style={styles.decorCape}>
            <Text style={{ fontSize: 22 }}>🦸</Text>
          </View>
        )}
        {ownedItems.includes("bed") && (
          <View style={styles.decorBed}>
            <Text style={{ fontSize: 34 }}>🛏️</Text>
          </View>
        )}
        {ownedItems.includes("plush") && (
          <View style={styles.decorPlush}>
            <Text style={{ fontSize: 26 }}>🧸</Text>
          </View>
        )}
        {ownedItems.includes("ball") && (
          <View style={styles.decorBall}>
            <Text style={{ fontSize: 26 }}>⚽</Text>
          </View>
        )}
        {ownedItems.includes("book") && (
          <View style={styles.decorBook}>
            <Text style={{ fontSize: 22 }}>📖</Text>
          </View>
        )}

        {/* Bottom Stage Overlay (Controls & Actions) */}
        <View style={styles.bottomStagePanel}>
          {/* Pet Name & Badge */}
          <Pressable
            style={styles.petFloatingBadge}
            onPress={handlePetTouch}
            accessibilityRole="button"
            accessibilityLabel="Погладить питомца"
          >
            <View style={styles.petNameRow}>
              <Text style={styles.petNameText}>{profile.pet.name}</Text>
              {ownedItems.includes("glasses") && <Text style={{ fontSize: 16 }}>🕶️</Text>}
              <View style={styles.stageTag}>
                <Text style={styles.stageTagText}>
                  {growthStageLabels[profile.pet.growthStage]} ⭐
                </Text>
              </View>
            </View>
            <Text style={styles.tapPrompt}>
              Крути модель 360° и гладь 💕
            </Text>
          </Pressable>

          {/* Floating Care Action Tray */}
          <View style={styles.actionTray}>
            <Pressable
              style={styles.actionBtn}
              onPress={handleFeedApple}
              accessibilityRole="button"
            >
              <Text style={styles.actionBtnIcon}>🍎</Text>
              <View>
                <Text style={styles.actionBtnTitle}>Яблочко</Text>
                <Text style={styles.actionBtnSub}>+10 сытости</Text>
              </View>
            </Pressable>

            <Pressable
              style={[styles.actionBtn, styles.actionBtnLove]}
              onPress={handlePetTouch}
              accessibilityRole="button"
            >
              <Text style={styles.actionBtnIcon}>💖</Text>
              <View>
                <Text style={styles.actionBtnTitle}>Погладить</Text>
                <Text style={styles.actionBtnSub}>+3 радости</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() => {
                playClickSound();
                router.push("/shop");
              }}
              accessibilityRole="button"
            >
              <Text style={styles.actionBtnIcon}>🛒</Text>
              <View>
                <Text style={styles.actionBtnTitle}>В лавку</Text>
                <Text style={styles.actionBtnSub}>Обед и уют</Text>
              </View>
            </Pressable>
          </View>

          {/* 3D Animation Showcase Pills (Wrapped 2 rows, ZERO horizontal scrollbar!) */}
          <View style={styles.animChipsWrap}>
            {ANIM_CHIPS.map((chip) => {
              const isActive = current3DAnim === chip.name;
              return (
                <Pressable
                  key={chip.name}
                  style={[styles.animChip, isActive && styles.animChipActive]}
                  onPress={() => {
                    playClickSound();
                    setCurrent3DAnim(chip.name);
                  }}
                >
                  <Text
                    style={[
                      styles.animChipText,
                      isActive && styles.animChipTextActive,
                    ]}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Open Diary & Goals Modal Button */}
          <Pressable
            style={styles.scrollDownBtn}
            onPress={() => {
              playClickSound();
              setShowDiaryModal(true);
            }}
          >
            <Text style={styles.scrollDownText}>📋 Дневник, копилка и цели ▾</Text>
          </Pressable>
        </View>
      </View>

      {/* Diary, Goals, Growth & Bedtime Bottom Sheet Modal */}
      <Modal
        visible={showDiaryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDiaryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowDiaryModal(false)}
          />
          <View style={styles.diarySheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>📋 Дневник и копилка {profile.pet.name}</Text>
              <Pressable
                style={styles.sheetCloseBtn}
                onPress={() => setShowDiaryModal(false)}
              >
                <Text style={styles.sheetCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Current Financial Goal Progress */}
              <Pressable
                style={styles.goalProgressCard}
                onPress={() => {
                  playClickSound();
                  setShowDiaryModal(false);
                  router.push("/savings");
                }}
              >
                <View style={styles.goalHeaderRow}>
                  <Text style={{ fontSize: 28 }}>{currentGoal.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalCardSub}>Копим на мечту 🎯</Text>
                    <Text style={styles.goalCardTitle}>{currentGoal.name}</Text>
                  </View>
                  <Text style={styles.goalCardAmount}>
                    {goalSaved} / {currentGoal.cost} 🪙
                  </Text>
                </View>
                <View style={styles.goalBarTrack}>
                  <View style={[styles.goalBarFill, { width: `${goalPct}%` }]} />
                </View>
                <Text style={styles.goalProgressHint}>
                  {goalPct >= 100
                    ? "🎉 Ура! Монеток хватает на мечту! Скорее загляни в копилку!"
                    : `Накоплено ${goalPct}% от цены`}
                </Text>
              </Pressable>

              {/* Previous Period Summary */}
              {prevPeriod && (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCardTitle}>
                    📋 Как прошёл День #{prevPeriod.index + 1}
                  </Text>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>
                        {prevPeriod.expenses.filter((e) => e.type === "mandatory").reduce((s, e) => s + e.amount, 0)} 🪙
                      </Text>
                      <Text style={styles.summaryLabel}>🥣 Обед и уход</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>
                        {prevPeriod.expenses.filter((e) => e.type === "optional").reduce((s, e) => s + e.amount, 0)} 🪙
                      </Text>
                      <Text style={styles.summaryLabel}>🎮 Игрушки</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>+{prevPeriod.savingsAdded} 🪙</Text>
                      <Text style={styles.summaryLabel}>🐷 В копилку</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Growth Evolution Tree (ТЗ 2.5.10) */}
              <View style={styles.growthCard}>
                <Text style={styles.growthCardTitle}>Как растёт твой питомец 🌱</Text>
                <Text style={styles.growthCardDesc}>
                  Питомец подрастает каждый новый день, если ты сытно кормишь его и откладываешь монетки!
                </Text>

                <View style={styles.stagesRow}>
                  <View
                    style={[
                      styles.stageItem,
                      (profile.pet.growthStage === "baby" ||
                        profile.pet.growthStage === "teen" ||
                        profile.pet.growthStage === "adult") &&
                        styles.stageItemActive,
                    ]}
                  >
                    <Text style={styles.stageItemEmoji}>🐣</Text>
                    <Text style={styles.stageItemName}>Малыш</Text>
                    <Text style={styles.stageItemRequirement}>Старт</Text>
                  </View>

                  <View style={styles.stageArrow}>
                    <Text style={{ color: colors.borderSelected, fontWeight: "800" }}>→</Text>
                  </View>

                  <View
                    style={[
                      styles.stageItem,
                      (profile.pet.growthStage === "teen" ||
                        profile.pet.growthStage === "adult") &&
                        styles.stageItemActive,
                    ]}
                  >
                    <Text style={styles.stageItemEmoji}>🐤</Text>
                    <Text style={styles.stageItemName}>Подросток</Text>
                    <Text style={styles.stageItemRequirement}>2+ дня</Text>
                  </View>

                  <View style={styles.stageArrow}>
                    <Text style={{ color: colors.borderSelected, fontWeight: "800" }}>→</Text>
                  </View>

                  <View
                    style={[
                      styles.stageItem,
                      profile.pet.growthStage === "adult" && styles.stageItemActive,
                    ]}
                  >
                    <Text style={styles.stageItemEmoji}>🐥</Text>
                    <Text style={styles.stageItemName}>Взрослый</Text>
                    <Text style={styles.stageItemRequirement}>4+ дня</Text>
                  </View>
                </View>
              </View>

              {/* Period Control (ТЗ Приложение А, шаг 10) */}
              <View style={styles.periodControlCard}>
                <View style={styles.periodHeaderRow}>
                  <View>
                    <Text style={styles.periodControlTitle}>
                      День {profile.currentPeriodIndex + 1} с {profile.pet.name} ☀️
                    </Text>
                    <Text style={styles.periodControlDesc}>
                      Прожито дней: {completedPeriodsCount} • Карманные деньги: {period?.income ?? 100} 🪙
                    </Text>
                  </View>
                  <Text style={{ fontSize: 28 }}>🌙</Text>
                </View>

                {period && !period.completed ? (
                  <DuoButton
                    title="Закончить день и лечь спать 🌙"
                    variant="primary"
                    size="md"
                    onPress={() => {
                      setShowDiaryModal(false);
                      handleBedtimePress();
                    }}
                  />
                ) : (
                  <DuoButton
                    title="Проснуться и начать новый день! ☀️"
                    variant="accent"
                    size="md"
                    onPress={() => {
                      playClickSound();
                      startNextPeriod();
                    }}
                  />
                )}
              </View>

              {/* Quick Links: Dictionary & Adult */}
              <View style={styles.linksRow}>
                <Pressable
                  style={styles.linkCard}
                  onPress={() => {
                    playClickSound();
                    setShowDiaryModal(false);
                    router.push("/terms");
                  }}
                >
                  <Text style={styles.linkIcon}>📖</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.linkTitle}>Словарик умника</Text>
                    <Text style={styles.linkDesc}>Простыми словами о денежках и покупках</Text>
                  </View>
                  <Text style={styles.linkArrow}>→</Text>
                </Pressable>

                <Pressable
                  style={[styles.linkCard, styles.adultLinkCard]}
                  onPress={() => {
                    playClickSound();
                    setShowDiaryModal(false);
                    router.push("/adult");
                  }}
                >
                  <Text style={styles.linkIcon}>👨‍👩‍👧</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.linkTitle}>Родительский уголок</Text>
                    <Text style={styles.linkDesc}>Для мам и пап: статистика и настройки</Text>
                  </View>
                  <Text style={styles.linkArrow}>→</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bedtime & Sunrise Modal */}
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

      <BottomTabBar currentTab="progress" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: "hidden" as any,
  },
  screen: {
    flex: 1,
    overflowX: "hidden" as any,
  },
  contentContainer: {
    paddingBottom: 40,
    overflowX: "hidden" as any,
  },

  /* Edge-to-Edge Full Screen 3D Pet Room Stage */
  fullScreenStage: {
    flex: 1,
    width: "100%",
    maxWidth: "100%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#FAF7F2",
  },
  roomWallZone: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "65%",
    backgroundColor: "#FAF7F2",
  },
  roomFloorZone: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "35%",
    backgroundColor: "#EAE4D8",
    borderTopWidth: 2,
    borderTopColor: "#DFD7C8",
  },

  /* Top HUD Overlay */
  topHudRow: {
    position: "absolute",
    top: 12,
    left: 14,
    right: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 30,
  },
  roomBadgePill: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  roomBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  quickVitalsRow: {
    flexDirection: "row",
    gap: 6,
  },
  quickVitalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickVitalIcon: {
    fontSize: 13,
  },
  quickVitalValue: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text,
  },

  /* Floating Pet Feedback */
  floatingHeartsWrap: {
    position: "absolute",
    zIndex: 35,
    top: 70,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  floatingHeart: {
    fontSize: 32,
  },
  petSpeechBubble: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderSelected,
    zIndex: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    maxWidth: "85%",
  },
  petSpeechText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryDark,
    textAlign: "center",
  },

  /* Bottom Stage HUD Panel */
  bottomStagePanel: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    alignItems: "center",
    gap: 8,
    zIndex: 30,
  },
  petFloatingBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.borderSelected,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  petNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  petNameText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  stageTag: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stageTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tapPrompt: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },

  /* Mini Care Action Tray */
  actionTray: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    justifyContent: "space-between",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: radius.md,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnLove: {
    backgroundColor: "#FFF5F7",
    borderColor: "#F3C5D0",
  },
  actionBtnIcon: {
    fontSize: 20,
  },
  actionBtnTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text,
  },
  actionBtnSub: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.textMuted,
  },

  /* 3D Animations Switcher Grid (Flex-wrap, NO horizontal scroll) */
  animChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    maxWidth: 390,
  },
  animChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  animChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  animChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text,
  },
  animChipTextActive: {
    color: "#FFFFFF",
  },

  /* Scroll Down Indicator Button */
  scrollDownBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 2,
  },
  scrollDownText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
  },

  /* Room Decor placements */
  decorToyHouse: {
    position: "absolute",
    top: 54,
    right: 14,
    zIndex: 5,
  },
  decorCape: {
    position: "absolute",
    top: 54,
    left: 16,
    zIndex: 5,
  },
  decorBed: {
    position: "absolute",
    bottom: 120,
    left: 14,
    zIndex: 5,
  },
  decorPlush: {
    position: "absolute",
    bottom: 122,
    left: 58,
    zIndex: 5,
  },
  decorBall: {
    position: "absolute",
    bottom: 124,
    right: 18,
    zIndex: 5,
  },
  decorBook: {
    position: "absolute",
    bottom: 122,
    right: 56,
    zIndex: 5,
  },

  /* Details Container below the Stage */
  detailsContainer: {
    padding: spacing.md,
    gap: 12,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },

  /* Stats Card */
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 8,
  },
  statsTitle: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FAF8F3",
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    fontSize: 22,
  },
  statValue: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
  },

  /* Goal Card (Пояснения п. 1) */
  goalProgressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 8,
  },
  goalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  goalCardSub: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  goalCardTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  goalCardAmount: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  goalBarTrack: {
    height: 8,
    backgroundColor: "#E6E0D2",
    borderRadius: 4,
    overflow: "hidden",
  },
  goalBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  goalProgressHint: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
  },

  /* Summary Card (Пояснения п. 1) */
  summaryCard: {
    backgroundColor: "#FAF8F3",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 8,
  },
  summaryCardTitle: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryValue: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },

  /* Growth Tree */
  growthCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 8,
  },
  growthCardTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  growthCardDesc: {
    fontSize: fonts.caption,
    color: colors.textMuted,
    lineHeight: 16,
  },
  stagesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  stageItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F7F4EB",
    borderRadius: radius.md,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  stageItemActive: {
    backgroundColor: "#EFF8F1",
    borderColor: colors.primary,
  },
  stageItemEmoji: {
    fontSize: 24,
  },
  stageItemName: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },
  stageItemRequirement: {
    fontSize: 9,
    color: colors.textMuted,
  },
  stageArrow: {
    paddingHorizontal: 4,
  },

  /* Period Control */
  periodControlCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 10,
  },
  periodHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  periodControlTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  periodControlDesc: {
    fontSize: fonts.caption,
    color: colors.textMuted,
  },

  /* Links */
  linksRow: {
    gap: 8,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 10,
  },
  adultLinkCard: {
    borderColor: "#E0D7C6",
    backgroundColor: "#FCFAF6",
  },
  linkIcon: {
    fontSize: 24,
  },
  linkTitle: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
  },
  linkDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  linkArrow: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryDark,
  },

  /* Diary Bottom Sheet Modal */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  diarySheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "85%",
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: "#EFECE6",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCloseText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textMuted,
  },
  sheetScroll: {
    paddingHorizontal: spacing.md,
  },
  sheetScrollContent: {
    paddingTop: 12,
    paddingBottom: 40,
    gap: 12,
  },
});