import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DuoButton } from "./DuoButton";
import { useStore } from "../store/store";
import { colors, fonts, radius, spacing } from "../theme";
import { playClickSound, playCoinSound, playSuccessSound } from "../utils/sound";

interface DebugModalProps {
  visible: boolean;
  onClose: () => void;
}

const SCENARIO_STEPS = [
  { step: "Шаг 1", title: "Знакомство (3 типа решений)", route: "/onboarding", icon: "🥣" },
  { step: "Шаг 2–3", title: "Создание питомца (Start 1–3)", route: "/pet-creation", icon: "🎨" },
  { step: "Шаг 4", title: "Главный экран (HUD, баланс 100 🪙)", route: "/home", icon: "🏠" },
  { step: "Шаг 5", title: "Три конверта (План бюджета)", route: "/budget", icon: "✉️" },
  { step: "Шаг 6", title: "Урок «Источники дохода» (+20 🪙)", route: "/task/income_sources", icon: "⭐" },
  { step: "Шаг 7", title: "Лавка (Обед, игрушка, овердрафт)", route: "/shop", icon: "🛒" },
  { step: "Шаг 8", title: "Копилка (Цель, срок, защита)", route: "/savings", icon: "🐷" },
  { step: "Шаг 9", title: "Сравнение Плана и Факта", route: "/budget", icon: "📊" },
  { step: "Шаг 10", title: "Смена периода и эволюция", route: "/progress", icon: "🌙" },
  { step: "Шаг 12", title: "Кабинет взрослых и диплом", route: "/adult", icon: "⚙️" },
];

export function DebugModal({ visible, onClose }: DebugModalProps) {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const toggleDemoMode = useStore((s) => s.toggleDemoMode);
  const resetProfile = useStore((s) => s.resetProfile);
  const finishPeriod = useStore((s) => s.finishPeriod);
  const grantCoins = useStore((s) => s.grantCoins);
  const healPet = useStore((s) => s.healPet);
  const setPetGrowthStage = useStore((s) => s.setPetGrowthStage);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!profile) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetProfile = () => {
    playClickSound();
    Alert.alert(
      "Сбросить тестовый профиль?",
      "Профиль вернется к исходному состоянию (100 монет, День 1, чистый бюджет и базовое здоровье питомца) для повторного прохождения.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Сбросить к началу ↺",
          style: "destructive",
          onPress: () => {
            resetProfile();
            showToast("Тестовый профиль сброшен к исходному состоянию! ↺");
            onClose();
            router.replace("/home");
          },
        },
      ]
    );
  };

  const handleAdvancePeriod = () => {
    playSuccessSound();
    const res = finishPeriod();
    if (res.ok) {
      showToast(`Период успешно завершен! Наступил День ${profile.currentPeriodIndex + 2} ☀️`);
    } else {
      showToast(res.reason ?? "Не удалось завершить период.");
    }
  };

  const handleAddCoins = (amt: number) => {
    playCoinSound();
    grantCoins(amt);
    showToast(`В кошелек начислено +${amt} 🪙!`);
  };

  const handleHeal = () => {
    playSuccessSound();
    healPet();
    showToast("Сытость и настроение питомца восстановлены до 100%! 💖");
  };

  const handleStageChange = (stage: "baby" | "teen" | "adult") => {
    playClickSound();
    setPetGrowthStage(stage);
    const names = { baby: "Малыш 🐣", teen: "Подросток 🐱", adult: "Взрослый 🦁" };
    showToast(`Стадия питомца изменена: ${names[stage]}`);
  };

  const handleNavigateStep = (route: string) => {
    playClickSound();
    onClose();
    router.push(route as any);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerIcon}>🧪</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Панель управления (ДЕМО)</Text>
                <Text style={styles.headerSubtitle}>
                  Быстрое прохождение игрового цикла без ожидания сроков
                </Text>
              </View>
            </View>
            <Pressable
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityLabel="Закрыть"
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Toast */}
          {toastMessage && (
            <View style={styles.toastWrap}>
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          )}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Main Demo Mode Toggle */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Демонстрационный режим</Text>
                  <Text style={styles.cardDesc}>
                    {profile.demoMode
                      ? "ВКЛЮЧЁН: все уроки и миры открыты сразу, периоды переключаются подряд без ожидания календаря"
                      : "ВЫКЛЮЧЕН: обычный режим с последовательным открытием"}
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.toggleBtn,
                    profile.demoMode ? styles.toggleBtnOn : styles.toggleBtnOff,
                  ]}
                  onPress={() => {
                    playClickSound();
                    toggleDemoMode();
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.toggleBtnText}>
                    {profile.demoMode ? "ВКЛ" : "ВЫКЛ"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.featuresBox}>
                <Text style={styles.featureItem}>
                  ✓ Воспроизведение игровых периодов подряд без календарных задержек
                </Text>
                <Text style={styles.featureItem}>
                  ✓ Все 15 обучающих заданий и миров доступны сразу
                </Text>
                <Text style={styles.featureItem}>
                  ✓ Ежедневный подарок и загадка Совы доступны без ожидания 24 часов
                </Text>
              </View>
            </View>

            {/* 2. Reset Test Profile */}
            <View style={[styles.card, styles.resetCard]}>
              <Text style={styles.resetCardTitle}>Сброс тестового профиля</Text>
              <Text style={styles.resetCardDesc}>
                Сбрасывает профиль к исходному состоянию (День 1, баланс 100 🪙, питомец Малыш, чистый бюджет и корзина) для повторного прохождения.
              </Text>
              <DuoButton
                title="↺ Сбросить тестовый профиль к началу"
                variant="secondary"
                size="md"
                onPress={handleResetProfile}
              />
            </View>

            {/* 3. Fast Game Loop & Sandbox Actions */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Быстрые действия (Игровой цикл)</Text>
              <Text style={styles.cardDesc}>
                Текущий день: День {profile.currentPeriodIndex + 1} • Баланс: {profile.balance} 🪙
              </Text>

              <View style={{ gap: 8, marginTop: 6 }}>
                <DuoButton
                  title={`🌙 Завершить день и перейти к Дню ${profile.currentPeriodIndex + 2}`}
                  variant="primary"
                  size="md"
                  onPress={handleAdvancePeriod}
                />

                <View style={styles.btnRow}>
                  <Pressable
                    style={[styles.smallBtn, styles.coinBtn]}
                    onPress={() => handleAddCoins(100)}
                  >
                    <Text style={styles.smallBtnText}>+100 🪙</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.smallBtn, styles.coinBtn]}
                    onPress={() => handleAddCoins(500)}
                  >
                    <Text style={styles.smallBtnText}>+500 🪙</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.smallBtn, styles.healBtn]}
                    onPress={handleHeal}
                  >
                    <Text style={styles.smallBtnText}>🥣+💖 100%</Text>
                  </Pressable>
                </View>
              </View>

              {/* Growth Stage Switcher */}
              <View style={styles.stageSection}>
                <Text style={styles.subTitle}>Стадия роста питомца:</Text>
                <View style={styles.stageRow}>
                  <Pressable
                    style={[
                      styles.stageBtn,
                      profile.pet.growthStage === "baby" && styles.stageBtnActive,
                    ]}
                    onPress={() => handleStageChange("baby")}
                  >
                    <Text style={styles.stageBtnEmoji}>🐣</Text>
                    <Text style={styles.stageBtnText}>Малыш</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.stageBtn,
                      profile.pet.growthStage === "teen" && styles.stageBtnActive,
                    ]}
                    onPress={() => handleStageChange("teen")}
                  >
                    <Text style={styles.stageBtnEmoji}>🐱</Text>
                    <Text style={styles.stageBtnText}>Подросток</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.stageBtn,
                      profile.pet.growthStage === "adult" && styles.stageBtnActive,
                    ]}
                    onPress={() => handleStageChange("adult")}
                  >
                    <Text style={styles.stageBtnEmoji}>🦁</Text>
                    <Text style={styles.stageBtnText}>Взрослый</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* 4. Mandatory Steps Scenario Navigation */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ключевые этапы игры</Text>
              <Text style={styles.cardDesc}>
                Быстрый переход по ключевым экранам:
              </Text>

              <View style={{ gap: 6, marginTop: 8 }}>
                {SCENARIO_STEPS.map((s) => (
                  <Pressable
                    key={s.step}
                    style={styles.stepRow}
                    onPress={() => handleNavigateStep(s.route)}
                  >
                    <Text style={styles.stepIcon}>{s.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.stepNum}>{s.step}</Text>
                      <Text style={styles.stepTitle}>{s.title}</Text>
                    </View>
                    <Text style={styles.stepArrow}>➔</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "90%",
    paddingTop: 16,
    paddingBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: "#EFECE6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textMuted,
  },
  toastWrap: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  scrollArea: {
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 36,
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  cardDesc: {
    fontSize: fonts.caption,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    minWidth: 64,
    alignItems: "center",
  },
  toggleBtnOn: {
    backgroundColor: colors.primary,
  },
  toggleBtnOff: {
    backgroundColor: "#D1D5DB",
  },
  toggleBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  featuresBox: {
    backgroundColor: "#F4F8F4",
    borderRadius: radius.md,
    padding: 10,
    marginTop: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: "#D2E8D5",
  },
  featureItem: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: "600",
  },
  resetCard: {
    borderColor: "#EAB308",
    backgroundColor: "#FEFCE8",
  },
  resetCardTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: "#854D0E",
  },
  resetCardDesc: {
    fontSize: fonts.caption,
    color: "#A16207",
    lineHeight: 16,
  },
  btnRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  smallBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  coinBtn: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FCD34D",
  },
  healBtn: {
    backgroundColor: "#FFF5F7",
    borderColor: "#FBCFE8",
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
  },
  stageSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 6,
  },
  subTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },
  stageRow: {
    flexDirection: "row",
    gap: 8,
  },
  stageBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#F7F5EE",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  stageBtnActive: {
    backgroundColor: "#EFF8F1",
    borderColor: colors.primary,
  },
  stageBtnEmoji: {
    fontSize: 18,
  },
  stageBtnText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FAF8F3",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepIcon: {
    fontSize: 18,
  },
  stepNum: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.primaryDark,
    textTransform: "uppercase",
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
  stepArrow: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "700",
  },
});
