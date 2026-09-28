import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { ConfettiEffect } from "./ConfettiEffect";
import { PetAvatar } from "./PetAvatar";
import { useStore } from "../store/store";
import { colors, fonts, radius } from "../theme";
import { playCoinSound, playFanfareSound } from "../utils/sound";

interface NightTransitionModalProps {
  visible: boolean;
  onWakeUp: () => void;
  onCancel: () => void;
}

export function NightTransitionModal({
  visible,
  onWakeUp,
  onCancel,
}: NightTransitionModalProps) {
  const profile = useStore((s) => s.profile);
  const [phase, setPhase] = useState<"night" | "morning">("night");

  if (!profile) return null;

  const currentPeriod = profile.periods[profile.currentPeriodIndex];
  const dayNumber = profile.currentPeriodIndex + 1;
  const savingsAdded = currentPeriod?.savingsAdded ?? 0;
  const expensesCount = currentPeriod?.expenses?.length ?? 0;
  const planConfirmed = currentPeriod?.planConfirmed ?? false;

  const handleNextPhase = () => {
    playFanfareSound();
    playCoinSound();
    setPhase("morning");
  };

  const handleFinalWakeUp = () => {
    playCoinSound();
    setPhase("night");
    onWakeUp();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={[styles.overlay, phase === "night" ? styles.overlayNight : styles.overlayMorning]}>
        {phase === "morning" && <ConfettiEffect />}

        <View style={[styles.dialogCard, phase === "night" ? styles.cardNight : styles.cardMorning]}>
          {phase === "night" ? (
            /* NIGHT PHASE */
            <>
              <View style={styles.celestialWrap}>
                <Text style={styles.celestialIcon}>🌙</Text>
                <Text style={styles.starsIcon}>✨ ⭐ ✨</Text>
              </View>

              <Text style={styles.nightTitle}>Спокойной ночи, {profile.pet.name}!</Text>
              <Text style={styles.nightSubtitle}>
                День {dayNumber} подошёл к концу. Твой питомец сыт и сладко спит.
              </Text>

              {/* Sleeping pet visual */}
              <View style={styles.petWrap}>
                <PetAvatar pet={profile.pet} size={110} />
                <View style={styles.sleepBubble}>
                  <Text style={styles.sleepText}>💤 Сладких снов...</Text>
                </View>
              </View>

              {/* Day Recap */}
              <View style={styles.recapBox}>
                <Text style={styles.recapHeader}>Итоги прошедшего дня:</Text>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>✉️ Бюджет по 3 конвертам:</Text>
                  <Text style={styles.recapVal}>{planConfirmed ? "Выполнен ✓" : "Не утверждён"}</Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>🐷 Отложено в копилку:</Text>
                  <Text style={styles.recapVal}>+{savingsAdded} 🪙</Text>
                </View>
                <View style={styles.recapRow}>
                  <Text style={styles.recapLabel}>🥣 Полезных покупок:</Text>
                  <Text style={styles.recapVal}>{expensesCount} шт.</Text>
                </View>
              </View>

              <View style={styles.btnRow}>
                <Pressable style={styles.cancelBtn} onPress={onCancel}>
                  <Text style={styles.cancelBtnText}>Ещё поиграть</Text>
                </Pressable>
                <Pressable style={styles.sleepBtn} onPress={handleNextPhase}>
                  <Text style={styles.sleepBtnText}>Баю-бай ➔ Рассвет 🌅</Text>
                </Pressable>
              </View>
            </>
          ) : (
            /* MORNING PHASE */
            <>
              <View style={styles.celestialWrap}>
                <Text style={styles.celestialIcon}>☀️</Text>
                <Text style={styles.starsIcon}>🌈 ☀️ 🐦</Text>
              </View>

              <Text style={styles.morningTitle}>Доброе утро, новый день!</Text>
              <Text style={styles.morningSubtitle}>
                Солнышко взошло! Тебе начислены новые карманные деньги:
              </Text>

              {/* Morning Payout Showcase */}
              <View style={styles.payoutBadge}>
                <Text style={styles.payoutEmoji}>🪙</Text>
                <Text style={styles.payoutAmount}>+100 МОНЕТ</Text>
                <Text style={styles.payoutDesc}>Карманные деньги на День {dayNumber + 1}</Text>
              </View>

              <View style={styles.petWrap}>
                <PetAvatar pet={profile.pet} size={110} />
                <View style={styles.wakeBubble}>
                  <Text style={styles.wakeText}>Ура! Я полон сил и готов играть! 🐾</Text>
                </View>
              </View>

              <Pressable style={styles.wakeUpBtn} onPress={handleFinalWakeUp}>
                <Text style={styles.wakeUpBtnText}>Начать День {dayNumber + 1}! 🚀</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  overlayNight: {
    backgroundColor: "rgba(15, 23, 42, 0.88)",
  },
  overlayMorning: {
    backgroundColor: "rgba(254, 243, 199, 0.88)",
  },
  dialogCard: {
    width: "100%",
    maxWidth: 480,
    borderRadius: radius.lg,
    padding: 22,
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  cardNight: {
    backgroundColor: "#1E293B",
    borderColor: "#334155",
  },
  cardMorning: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FCD34D",
  },
  celestialWrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  celestialIcon: {
    fontSize: 54,
  },
  starsIcon: {
    fontSize: 16,
    color: "#FDE68A",
    marginTop: 2,
  },
  nightTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#F1F5F9",
    textAlign: "center",
  },
  nightSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
  },
  morningTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1E293B",
    textAlign: "center",
  },
  morningSubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },
  petWrap: {
    marginVertical: 14,
    alignItems: "center",
  },
  sleepBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  sleepText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "700",
  },
  wakeBubble: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  wakeText: {
    color: "#065F46",
    fontSize: 12,
    fontWeight: "700",
  },
  recapBox: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 10,
    gap: 6,
  },
  recapHeader: {
    color: "#93C5FD",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  recapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recapLabel: {
    fontSize: 12,
    color: "#CBD5E1",
  },
  recapVal: {
    fontSize: 12,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  payoutBadge: {
    backgroundColor: "#FFFBEB",
    borderWidth: 2,
    borderColor: "#F59E0B",
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginVertical: 10,
    width: "100%",
  },
  payoutEmoji: {
    fontSize: 32,
  },
  payoutAmount: {
    fontSize: 24,
    fontWeight: "900",
    color: "#B45309",
    letterSpacing: 1,
  },
  payoutDesc: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "700",
    marginTop: 2,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "700",
  },
  sleepBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: "center",
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryDark,
  },
  sleepBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  wakeUpBtn: {
    backgroundColor: colors.primary,
    width: "100%",
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
    marginTop: 10,
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryDark,
  },
  wakeUpBtnText: {
    color: "#FFFFFF",
    fontSize: fonts.body,
    fontWeight: "900",
  },
});
