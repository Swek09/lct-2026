import { Image, StyleSheet, Text, View } from "react-native";
import {
  growthStageLabels,
  petAccessories,
  petPalettes,
  petSpecies,
} from "../content/pets";
import type { Pet } from "../domain/types";
import { radius } from "../theme";

export function PetAvatar({ pet, size = 140 }: { pet: Pet; size?: number }) {
  const species =
    petSpecies.find((s) => s.id === pet.customization.speciesId) ??
    petSpecies[pet.customization.speciesIndex] ??
    petSpecies[0];

  const palette =
    petPalettes.find((p) => p.id === pet.customization.colorId) ??
    petPalettes[pet.customization.paletteIndex] ??
    petPalettes[0];

  const accessory =
    petAccessories.find((a) => a.id === pet.customization.accessoryId) ??
    petAccessories[pet.customization.accessoryIndex] ??
    petAccessories[0];

  const isHungry = pet.state && pet.state.satiety < 50;
  const isSad = pet.state && pet.state.mood < 50;
  const isSuperHappy = pet.state && pet.state.mood >= 80 && pet.state.satiety >= 80;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: `${palette.color}20`,
          borderColor: palette.color,
        },
      ]}
    >
      {species?.id === "cat" || !species || species?.emoji === "🐱" ? (
        <Image
          source={require("../../assets/images/background_cat.png")}
          style={{ width: size * 0.82, height: size * 0.82 }}
          resizeMode="contain"
        />
      ) : (
        <Text style={{ fontSize: size * 0.52, textAlign: "center" }}>
          {species?.emoji || "🐱"}
        </Text>
      )}

      {accessory && accessory.symbol && accessory.symbol !== "⭐" && (
        <View style={styles.accessoryBadge}>
          <Text style={styles.accessoryText}>{accessory.symbol}</Text>
        </View>
      )}

      {/* Mood status indicators */}
      {isSuperHappy && (
        <View style={styles.moodSparkleBadge}>
          <Text style={styles.moodEmoji}>✨</Text>
        </View>
      )}
      {isHungry && !isSuperHappy && (
        <View style={styles.moodHungryBadge}>
          <Text style={styles.moodEmoji}>🥣</Text>
        </View>
      )}
      {isSad && !isSuperHappy && (
        <View style={styles.moodSadBadge}>
          <Text style={styles.moodEmoji}>💤</Text>
        </View>
      )}

      {size >= 80 && (
        <View style={styles.stageBadge}>
          <Text style={styles.stageText}>{growthStageLabels[pet.growthStage]}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    position: "relative",
  },
  accessoryBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: "#E5E0D3",
  },
  accessoryText: {
    fontSize: 16,
  },
  stageBadge: {
    position: "absolute",
    bottom: 4,
    backgroundColor: "rgba(42, 53, 42, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  stageText: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: 11,
  },
  moodSparkleBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  moodHungryBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  moodSadBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  moodEmoji: {
    fontSize: 14,
  },
});