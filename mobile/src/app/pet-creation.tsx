import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Cat3DViewer } from "../components/Cat3DViewer";
import { Stepper } from "../components/Stepper";
import { petHats, petPalettes, petSpecies } from "../content/pets";
import { useStore } from "../store/store";
import { colors, fonts, radius, spacing } from "../theme";
import { playClickSound } from "../utils/sound";

export default function PetCreation() {
  const router = useRouter();
  const createProfile = useStore((s) => s.createProfile);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  // Step state: 1 (Customize) or 2 (Pet Ready)
  const [step, setStep] = useState<1 | 2>(1);

  // Customization state - single character: Cat
  const [petName, setPetName] = useState("Финни");
  const [selectedColorId, setSelectedColorId] = useState("gray");
  const [selectedHatId, setSelectedHatId] = useState("birthday");

  const currentSpecies = petSpecies[0] ?? {
    id: "cat",
    name: "Котик",
    skills: "Забота, Накопления",
    emoji: "🐱",
    color: "#5E9362",
  };

  const currentColor =
    petPalettes.find((p) => p.id === selectedColorId) ?? petPalettes[0];
  const currentHat =
    petHats.find((h) => h.id === selectedHatId) ?? petHats[0];

  const paletteIndex = Math.max(
    0,
    petPalettes.findIndex((p) => p.id === selectedColorId)
  );

  const handleFinish = () => {
    playClickSound();
    const finalName = petName.trim() || "Финни";
    createProfile({
      childName: finalName,
      petName: finalName,
      customization: {
        speciesIndex: 0,
        paletteIndex,
        accessoryIndex: 0,
        speciesId: "cat",
        colorId: selectedColorId,
        hatId: selectedHatId,
      },
      demoMode: false,
    });
    completeOnboarding();
    router.replace("/home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= STEP 1: СОЗДАЙ ПИТОМЦА ================= */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Создай питомца</Text>
              <Text style={styles.subtitle}>
                Придумай классное имя, выбери окрас и любимую шляпу!
              </Text>
            </View>

            <Stepper currentStep={1} totalSteps={2} />

            {/* Top Side-by-Side Section */}
            <View style={styles.topSideBySideRow}>
              {/* Left Column: Interactive 3D Cat Preview */}
              <View style={styles.leftPreviewCard}>
                <Cat3DViewer
                  height={176}
                  cameraDistance={4.2}
                  cameraY={0.9}
                  cameraLookAtY={0.5}
                  modelY={-0.3}
                  animation="Idle_Default"
                  interactive={true}
                  showRug={true}
                  colorId={selectedColorId}
                  hatId={selectedHatId}
                />
              </View>

              {/* Right Column: Name Card + Color Card */}
              <View style={styles.rightStackedCol}>
                {/* 1. Name Card */}
                <View style={styles.miniCard}>
                  <Text style={styles.miniCardTitle}>Имя питомца</Text>
                  <View style={styles.miniInputWrap}>
                    <TextInput
                      style={styles.miniTextInput}
                      value={petName}
                      onChangeText={setPetName}
                      placeholder="Финни"
                      placeholderTextColor={colors.textMuted}
                      maxLength={18}
                    />
                  </View>
                </View>

                {/* 2. Color / Coat Card */}
                <View style={styles.miniCard}>
                  <View style={styles.coatTitleRow}>
                    <Text style={styles.miniCardTitle}>Окрас:</Text>
                    <Text style={styles.coatCurrentName}>{currentColor.name}</Text>
                  </View>
                  <View style={styles.colorPaletteRow}>
                    {petPalettes.map((palette) => {
                      const isSelected = selectedColorId === palette.id;
                      return (
                        <Pressable
                          key={palette.id}
                          style={[
                            styles.paletteDotWrap,
                            isSelected && styles.paletteDotWrapSelected,
                          ]}
                          onPress={() => {
                            playClickSound();
                            setSelectedColorId(palette.id);
                          }}
                        >
                          <View
                            style={[
                              styles.paletteDot,
                              { backgroundColor: palette.color },
                            ]}
                          >
                            {isSelected && (
                              <View style={styles.paletteCheckBadge}>
                                <Text style={styles.paletteCheckText}>✓</Text>
                              </View>
                            )}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>

            {/* Hat Selection Section */}
            <View style={styles.optionGroupCard}>
              <View style={styles.hatHeaderRow}>
                <Text style={styles.groupLabel}>Головной убор</Text>
                <Text style={styles.hatSubLabel}>Модели 3D шляп</Text>
              </View>
              <View style={styles.hatGridRow}>
                {petHats.map((hat) => {
                  const isSelected = selectedHatId === hat.id;
                  return (
                    <Pressable
                      key={hat.id}
                      style={[
                        styles.hatCard,
                        isSelected
                          ? styles.hatCardSelected
                          : styles.hatCardUnselected,
                      ]}
                      onPress={() => {
                        playClickSound();
                        setSelectedHatId(hat.id);
                      }}
                    >
                      {isSelected && (
                        <View style={styles.groupCheckBadge}>
                          <Text style={styles.groupCheckText}>✓</Text>
                        </View>
                      )}
                      <Text style={styles.hatEmoji}>{hat.emoji}</Text>
                      <Text
                        style={[
                          styles.hatNameText,
                          isSelected && styles.hatNameTextSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {hat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Navigation Buttons: Back & Forward */}
            <View style={styles.dualNavRow}>
              <Pressable
                style={styles.secondaryPillButton}
                onPress={() => {
                  playClickSound();
                  router.back();
                }}
              >
                <Text style={styles.secondaryPillArrow}>←</Text>
                <Text style={styles.secondaryPillText}>Назад</Text>
              </Pressable>

              <Pressable
                style={styles.primaryNavPillButton}
                onPress={() => {
                  playClickSound();
                  setStep(2);
                }}
              >
                <Text style={styles.fullPillButtonText}>Далее</Text>
                <Text style={styles.arrowIcon}>→</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ================= STEP 2: ТВОЙ ПИТОМЕЦ ГОТОВ! ================= */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Твой питомец готов! 🎉</Text>
              <Text style={styles.subtitle}>
                Познакомься — твой верный пушистый друг уже ждёт тебя!
              </Text>
            </View>

            <Stepper currentStep={2} totalSteps={2} />

            {/* Ready Pet 3D Scene */}
            <View style={styles.heroSceneWrapper}>
              <Cat3DViewer
                height={230}
                cameraDistance={4.5}
                cameraY={1.0}
                cameraLookAtY={0.6}
                modelY={-0.35}
                animation="Happy_Success"
                interactive={true}
                showRug={true}
                colorId={selectedColorId}
                hatId={selectedHatId}
              />
            </View>

            {/* Pet Card Information */}
            <View style={styles.petSummaryCard}>
              <View style={styles.petSummaryRows}>
                <View style={styles.summaryLine}>
                  <Text style={styles.summaryIcon}>👤</Text>
                  <Text style={styles.summaryLabel}>Имя:</Text>
                  <Text style={styles.summaryVal}>{petName || "Финни"}</Text>
                </View>

                <View style={styles.summaryLine}>
                  <Text style={styles.summaryIcon}>🐱</Text>
                  <Text style={styles.summaryLabel}>Персонаж:</Text>
                  <Text style={styles.summaryVal}>{currentSpecies.name}</Text>
                </View>

                <View style={styles.summaryLine}>
                  <Text style={styles.summaryIcon}>🎨</Text>
                  <Text style={styles.summaryLabel}>Окрас:</Text>
                  <Text style={styles.summaryVal}>{currentColor.name}</Text>
                </View>

                <View style={styles.summaryLine}>
                  <Text style={styles.summaryIcon}>{currentHat.emoji}</Text>
                  <Text style={styles.summaryLabel}>Головной убор:</Text>
                  <Text style={styles.summaryVal}>{currentHat.name}</Text>
                </View>

                <View style={styles.summaryLine}>
                  <Text style={styles.summaryIcon}>⭐</Text>
                  <Text style={styles.summaryLabel}>Стартовый уровень:</Text>
                  <Text style={styles.summaryVal}>1 ⭐</Text>
                </View>

                <View style={styles.summaryLine}>
                  <Text style={styles.summaryIcon}>🎯</Text>
                  <Text style={styles.summaryLabel}>Навыки:</Text>
                  <Text style={styles.summaryVal}>{currentSpecies.skills}</Text>
                </View>
              </View>
            </View>

            {/* Start Adventure Button */}
            <Pressable style={styles.fullPillButton} onPress={handleFinish}>
              <Text style={styles.fullPillButtonText}>
                Начать приключение! 🐾
              </Text>
            </Pressable>

            {/* Edit link to return to Step 1 */}
            <Pressable
              style={styles.changeLink}
              onPress={() => {
                playClickSound();
                setStep(1);
              }}
            >
              <Text style={styles.changeLinkText}>Изменить</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  stepContainer: {
    gap: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 2,
  },
  title: {
    fontSize: fonts.title,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: fonts.small,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: spacing.md,
    lineHeight: 18,
  },

  /* Buttons */
  fullPillButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minHeight: 52,
    marginTop: spacing.sm,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  fullPillButtonText: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  arrowIcon: {
    fontSize: 18,
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "800",
  },
  dualNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  secondaryPillButton: {
    flex: 0.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  secondaryPillArrow: {
    fontSize: 18,
    color: colors.text,
    marginRight: 6,
    fontWeight: "700",
  },
  secondaryPillText: {
    fontSize: fonts.body,
    fontWeight: "700",
    color: colors.text,
  },
  primaryNavPillButton: {
    flex: 0.58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minHeight: 52,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },

  /* Top Section Side-by-Side */
  topSideBySideRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 4,
    height: 176,
  },
  leftPreviewCard: {
    flex: 1.1,
    backgroundColor: "#FAF7F2",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  rightStackedCol: {
    flex: 1,
    gap: 8,
    justifyContent: "space-between",
  },
  miniCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 8,
    justifyContent: "center",
  },
  miniCardTitle: {
    fontSize: fonts.caption,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: 4,
  },
  coatTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  coatCurrentName: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  miniInputWrap: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  miniTextInput: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.text,
    padding: 0,
  },
  colorPaletteRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 2,
  },
  paletteDotWrap: {
    padding: 2,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paletteDotWrapSelected: {
    borderColor: colors.primary,
  },
  paletteDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  paletteCheckBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  paletteCheckText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "900",
  },

  /* Hat Selection Options */
  optionGroupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 12,
    gap: 8,
    marginVertical: 4,
  },
  hatHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  groupLabel: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
  },
  hatSubLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
  hatGridRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  hatCard: {
    flex: 1,
    height: 72,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: 4,
  },
  hatCardUnselected: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  hatCardSelected: {
    backgroundColor: colors.cardSelected,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  hatEmoji: {
    fontSize: 26,
    marginBottom: 3,
  },
  hatNameText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
    textAlign: "center",
  },
  hatNameTextSelected: {
    color: colors.primaryDark,
    fontWeight: "800",
  },
  groupCheckBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  groupCheckText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  /* Step 2: Hero Scene & Stats */
  heroSceneWrapper: {
    width: "100%",
    height: 230,
    borderRadius: radius.xl,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.border,
    marginVertical: 4,
    backgroundColor: "#FAF7F2",
  },
  petSummaryCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  petSummaryRows: {
    flex: 1,
    gap: 6,
  },
  summaryLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  summaryIcon: {
    fontSize: 15,
  },
  summaryLabel: {
    fontSize: fonts.small,
    color: colors.textMuted,
    fontWeight: "600",
    width: 140,
  },
  summaryVal: {
    fontSize: fonts.small,
    color: colors.text,
    fontWeight: "700",
    flex: 1,
  },
  changeLink: {
    alignItems: "center",
    paddingVertical: spacing.xs,
    marginTop: 4,
  },
  changeLinkText: {
    fontSize: fonts.small,
    color: colors.primaryDark,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});