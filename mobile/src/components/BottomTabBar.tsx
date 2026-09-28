import { useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { petSpecies } from "../content/pets";
import { useStore } from "../store/store";
import { colors } from "../theme";
import { playClickSound } from "../utils/sound";

export type TabKey = "home" | "budget" | "progress" | "shop" | "savings";

interface BottomTabBarProps {
  currentTab: TabKey;
}

const tabs: { key: TabKey; label: string; icon: string; route: string }[] = [
  { key: "home", label: "Карта", icon: "🗺️", route: "/home" },
  { key: "budget", label: "Бюджет", icon: "📋", route: "/budget" },
  { key: "progress", label: "Питомец", icon: "🐾", route: "/progress" },
  { key: "shop", label: "Лавка", icon: "🛒", route: "/shop" },
  { key: "savings", label: "Копилка", icon: "🐷", route: "/savings" },
];

export function BottomTabBar({ currentTab }: BottomTabBarProps) {
  const router = useRouter();
  const profile = useStore((s) => s.profile);

  // Retrieve customized pet species image if available
  const species = profile?.pet
    ? petSpecies.find((s) => s.id === profile.pet.customization?.speciesId) ??
      petSpecies[profile.pet.customization?.speciesIndex ?? 0] ??
      petSpecies[0]
    : null;

  const isHungry = profile?.pet?.state && profile.pet.state.satiety < 50;
  const isSuperHappy =
    profile?.pet?.state && profile.pet.state.mood >= 80 && profile.pet.state.satiety >= 80;

  const handleTabPress = (route: string, isActive: boolean) => {
    playClickSound();
    if (!isActive) {
      router.replace(route as never);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = tab.key === currentTab;
          const isCenter = tab.key === "progress";

          if (isCenter) {
            return (
              <Pressable
                key={tab.key}
                style={styles.centerTabContainer}
                onPress={() => handleTabPress(tab.route, isActive)}
                accessibilityRole="button"
                accessibilityLabel="Вкладка питомца"
              >
                {({ pressed }) => (
                  <View style={[styles.centerAlign, pressed && styles.centerPressed]}>
                    <View
                      style={[
                        styles.centerButton,
                        isActive ? styles.centerButtonActive : styles.centerButtonInactive,
                      ]}
                    >
                      <Text style={styles.petCenterEmoji}>
                        {species?.emoji || "🐱"}
                      </Text>

                      {/* Small status indicator on center pet button */}
                      {isSuperHappy && (
                        <View style={styles.miniMoodBadge}>
                          <Text style={styles.miniMoodEmoji}>✨</Text>
                        </View>
                      )}
                      {isHungry && !isSuperHappy && (
                        <View style={styles.miniHungryBadge}>
                          <Text style={styles.miniMoodEmoji}>🥣</Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.centerLabel,
                        isActive ? styles.centerLabelActive : styles.centerLabelInactive,
                      ]}
                      numberOfLines={1}
                    >
                      {profile?.pet?.name ? profile.pet.name : tab.label}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          }

          return (
            <Pressable
              key={tab.key}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab.route, isActive)}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.tabItemInner,
                    isActive && styles.tabItemInnerActive,
                    pressed && styles.tabItemPressed,
                  ]}
                >
                  <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
                    {tab.icon}
                  </Text>
                  <Text
                    style={[
                      styles.tabLabel,
                      isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                    ]}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#FFFFFF",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
    paddingTop: 6,
    paddingBottom: Platform.OS === "ios" ? 18 : 10,
    paddingHorizontal: 6,
    justifyContent: "space-between",
    alignItems: "flex-end",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 12,
    minWidth: 54,
  },
  tabItemInnerActive: {
    backgroundColor: colors.primaryLight,
  },
  tabItemPressed: {
    transform: [{ scale: 0.95 }],
  },
  tabIcon: {
    fontSize: 21,
    marginBottom: 2,
  },
  tabIconActive: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  tabLabelActive: {
    color: colors.primaryDark,
    fontWeight: "800",
  },
  tabLabelInactive: {
    color: colors.textMuted,
  },

  /* Center Pet Tab Hero Styles */
  centerTabContainer: {
    flex: 1.1,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: -20,
    zIndex: 10,
  },
  centerAlign: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerPressed: {
    transform: [{ translateY: 2 }],
  },
  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderBottomWidth: 4.5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
    position: "relative",
  },
  centerButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderBottomColor: colors.primaryDark,
  },
  centerButtonInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.border,
    borderBottomColor: "#D5CEBF",
  },
  petCenterImage: {
    width: 38,
    height: 38,
  },
  petCenterEmoji: {
    fontSize: 26,
  },
  centerLabel: {
    fontSize: 11,
    marginTop: 3,
    maxWidth: 70,
    textAlign: "center",
  },
  centerLabelActive: {
    color: colors.primaryDark,
    fontWeight: "900",
  },
  centerLabelInactive: {
    color: colors.textMuted,
    fontWeight: "700",
  },
  miniMoodBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FFFBEB",
    borderRadius: 8,
    padding: 1.5,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  miniHungryBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    padding: 1.5,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  miniMoodEmoji: {
    fontSize: 10,
  },
});
