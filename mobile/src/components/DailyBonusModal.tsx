import React, { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { DAILY_REWARDS } from "../domain/daily";
import { useStore } from "../store/store";
import { colors, fonts, radius } from "../theme";
import { playClickSound, playFanfareSound } from "../utils/sound";

interface DailyBonusModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DailyBonusModal({ visible, onClose }: DailyBonusModalProps) {
  const profile = useStore((s) => s.profile);
  const claimDailyBonus = useStore((s) => s.claimDailyBonus);
  const [claimedReward, setClaimedReward] = useState<{ amount: number; day: number } | null>(null);

  if (!profile) return null;

  const currentStreak = profile.dailyStreak ?? 0;
  const currentDayIndex = (currentStreak % 7) + 1; // 1..7

  const handleClaim = () => {
    playFanfareSound();
    const res = claimDailyBonus();
    setClaimedReward(res);
  };

  const handleClose = () => {
    playClickSound();
    setClaimedReward(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.cardBgWrapper} pointerEvents="none">
            <Image
              source={require("../../assets/images/daily_background.png")}
              style={styles.cardBgImage}
              resizeMode="cover"
            />
          </View>

          {/* 7-Day Track Grid */}
          <View style={styles.grid}>
            {DAILY_REWARDS.map((item) => {
              const isPast = item.day < currentDayIndex;
              const isToday = item.day === currentDayIndex;
              const isClaimedNow = claimedReward && item.day === claimedReward.day;

              return (
                <View
                  key={item.day}
                  style={[
                    styles.dayBox,
                    isToday && styles.dayBoxToday,
                    isPast && styles.dayBoxPast,
                    item.day === 7 && styles.dayBoxGrand,
                  ]}
                >
                  <Text style={styles.dayLabel}>День {item.day}</Text>
                  <Text style={styles.dayIcon}>{item.icon}</Text>
                  <Text style={styles.dayCoins}>+{item.coins} 🪙</Text>

                  {isPast && (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                  {isToday && !claimedReward && (
                    <View style={styles.todayPill}>
                      <Text style={styles.todayPillText}>СЕГОДНЯ</Text>
                    </View>
                  )}
                  {isClaimedNow && (
                    <View style={styles.claimedPill}>
                      <Text style={styles.claimedPillText}>ВЗЯТО!</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Claim Action or Close */}
          <View style={styles.footer}>
            {!claimedReward ? (
              <Pressable style={styles.claimButton} onPress={handleClaim}>
                <Text style={styles.claimButtonText}>
                  Забрать +{DAILY_REWARDS.find((r) => r.day === currentDayIndex)?.coins ?? 10} монет! 🌟
                </Text>
              </Pressable>
            ) : (
              <Pressable style={styles.continueButton} onPress={handleClose}>
                <Text style={styles.continueButtonText}>Ура! Спасибо, Финни! 🥰</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    overflow: "hidden",
    position: "relative",
  },
  cardBgWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  cardBgImage: {
    width: "100%",
    height: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginVertical: 10,
    width: "100%",
  },
  dayBox: {
    width: "22%",
    backgroundColor: "#FAF8F3",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "#E5E0D3",
    paddingVertical: 10,
    alignItems: "center",
    position: "relative",
  },
  dayBoxToday: {
    backgroundColor: "#FFFBEB",
    borderColor: "#F59E0B",
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dayBoxPast: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    opacity: 0.7,
  },
  dayBoxGrand: {
    width: "46%",
    backgroundColor: "#FEF3C7",
    borderColor: "#D97706",
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
  },
  dayIcon: {
    fontSize: 22,
    marginVertical: 3,
  },
  dayCoins: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
  },
  checkBadge: {
    position: "absolute",
    top: 3,
    right: 3,
    backgroundColor: "#10B981",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
  todayPill: {
    position: "absolute",
    top: -6,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  todayPillText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
  claimedPill: {
    position: "absolute",
    top: -6,
    backgroundColor: "#10B981",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  claimedPillText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
  footer: {
    width: "100%",
    marginTop: 16,
  },
  claimButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryDark,
  },
  claimButtonText: {
    color: "#FFFFFF",
    fontSize: fonts.body,
    fontWeight: "900",
  },
  continueButton: {
    backgroundColor: "#10B981",
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 4,
    borderBottomColor: "#059669",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: fonts.body,
    fontWeight: "900",
  },
});
