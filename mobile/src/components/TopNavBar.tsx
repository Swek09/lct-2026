import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useStore } from "../store/store";
import { colors, radius } from "../theme";

import { playClickSound } from "../utils/sound";

interface TopNavBarProps {
  showAdult?: boolean;
}

export function TopNavBar({ showAdult = true }: TopNavBarProps) {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const toggleDemoMode = useStore((s) => s.toggleDemoMode);

  const soundEnabled = useStore((s) => s.soundEnabled);
  const toggleSound = useStore((s) => s.toggleSound);

  if (!profile) return null;

  const completedCount = Object.values(profile.periods).filter((p) => p.completed).length;
  const streakDays = Math.max(1, completedCount + 1);
  const healthAvg = Math.round((profile.pet.state.mood + profile.pet.state.satiety) / 2);

  const handleSoundToggle = () => {
    playClickSound();
    toggleSound();
  };

  const handleDemoToggle = () => {
    playClickSound();
    toggleDemoMode();
  };

  const handleAdultPress = () => {
    playClickSound();
    router.push("/adult");
  };

  const formatCoins = (amt: number) => {
    if (amt >= 100000) return `${Math.floor(amt / 1000)}k`;
    if (amt >= 10000) return `${(amt / 1000).toFixed(1)}k`;
    return String(amt);
  };

  return (
    <View style={styles.container}>
      {/* Streak */}
      <View style={styles.badge}>
        <Text style={styles.icon}>🔥</Text>
        <Text style={styles.badgeText}>{streakDays}</Text>
      </View>

      {/* Coins */}
      <View style={[styles.badge, styles.coinBadge]}>
        <Text style={styles.icon}>🪙</Text>
        <Text style={[styles.badgeText, styles.coinText]}>{formatCoins(profile.balance)}</Text>
      </View>

      {/* Health / Mood */}
      <View style={[styles.badge, styles.healthBadge]}>
        <Text style={styles.icon}>💖</Text>
        <Text style={[styles.badgeText, styles.healthText]}>{healthAvg}%</Text>
      </View>

      {/* Sound Toggle (ТЗ 3.6: звуки можно отключить) */}
      <Pressable
        style={[styles.badge, soundEnabled ? styles.soundActive : styles.soundMuted]}
        onPress={handleSoundToggle}
        accessibilityLabel={soundEnabled ? "Выключить звук" : "Включить звук"}
        accessibilityRole="button"
      >
        <Text style={styles.icon}>{soundEnabled ? "🔊" : "🔇"}</Text>
      </Pressable>

      {/* Demo Mode Toggle */}
      <Pressable
        style={[styles.badge, profile.demoMode ? styles.demoActive : styles.demoInactive]}
        onPress={handleDemoToggle}
      >
        <Text style={styles.icon}>🧪</Text>
        <Text style={styles.demoText}>{profile.demoMode ? "ДЕМО" : "Обычн"}</Text>
      </Pressable>

      {/* Settings / Adults */}
      {showAdult && (
        <Pressable style={styles.adultButton} onPress={handleAdultPress}>
          <Text style={styles.adultIcon}>⚙️</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.background,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    minHeight: 40,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 3,
  },
  coinBadge: {
    borderColor: "#F3C569",
    backgroundColor: "#FFFBEB",
  },
  healthBadge: {
    borderColor: "#F8B4B4",
    backgroundColor: "#FEF2F2",
  },
  demoActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  demoInactive: {
    opacity: 0.7,
  },
  soundActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  soundMuted: {
    borderColor: "#D1D5DB",
    backgroundColor: "#F3F4F6",
    opacity: 0.7,
  },
  icon: {
    fontSize: 13,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
  },
  coinText: {
    color: "#B45309",
  },
  healthText: {
    color: "#B91C1C",
  },
  demoText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  adultButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  adultIcon: {
    fontSize: 18,
  },
});
