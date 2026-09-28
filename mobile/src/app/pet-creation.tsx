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
import {
  petAccessories,
  petEyes,
  petOutfits,
  petPalettes,
  petSpecies,
} from "../content/pets";
import { useStore } from "../store/store";
import { colors, fonts, radius, spacing } from "../theme";
import { playClickSound } from "../utils/sound";

export default function PetCreation() {
  const router = useRouter();
  const createProfile = useStore((s) => s.createProfile);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  // Step state: 1, 2, or 3
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Customization state
  const [selectedSpeciesId, setSelectedSpeciesId] = useState("cat");
  const [petName, setPetName] = useState("Финни");
  const [selectedColorId, setSelectedColorId] = useState("green");
  const [selectedEyeId, setSelectedEyeId] = useState("green");
  const [selectedOutfitId, setSelectedOutfitId] = useState("hoodie");
  const [selectedAccessoryId, setSelectedAccessoryId] = useState("bowtie");

  const currentSpecies =
    petSpecies.find((s) => s.id === selectedSpeciesId) ?? petSpecies[0];

  const speciesIndex = Math.max(
    0,
    petSpecies.findIndex((s) => s.id === selectedSpeciesId)
  );
  const paletteIndex = Math.max(
    0,
    petPalettes.findIndex((p) => p.id === selectedColorId)
  );
  const accessoryIndex = Math.max(
    0,
    petAccessories.findIndex((a) => a.id === selectedAccessoryId)
  );

  const handleFinish = () => {
    playClickSound();
    const finalName = petName.trim() || "Финни";
    createProfile({
      childName: finalName,
      petName: finalName,
      customization: {
        speciesIndex,
        paletteIndex,
        accessoryIndex,
        speciesId: selectedSpeciesId,
        colorId: selectedColorId,
        eyeId: selectedEyeId,
        outfitId: selectedOutfitId,
        accessoryId: selectedAccessoryId,
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
        {/* ================= START 1: ВЫБЕРИ ПИТОМЦА ================= */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Выбери питомца</Text>
              <Text style={styles.subtitle}>
                С кем ты отправишься в увлекательное путешествие?
              </Text>
            </View>

            <Stepper currentStep={1} />

            {/* 2x2 Grid matching Start 1 */}
            <View style={styles.gridContainer}>
              {petSpecies.map((species) => {
                const isSelected = selectedSpeciesId === species.id;
                return (
                  <Pressable
                    key={species.id}
                    style={[
                      styles.petGridCard,
                      isSelected
                        ? styles.petGridCardSelected
                        : styles.petGridCardUnselected,
                    ]}
                    onPress={() => {
                      playClickSound();
                      setSelectedSpeciesId(species.id);
                    }}
                  >
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkBadgeText}>✓</Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.speciesEmojiCircle,
                        { backgroundColor: `${species.color}20` },
                      ]}
                    >
                      <Text style={styles.speciesEmojiText}>{species.emoji}</Text>
                    </View>
                    <Text
                      style={[
                        styles.petGridName,
                        isSelected && styles.petGridNameSelected,
                      ]}
                    >
                      {species.name}
                    </Text>
                    <Text style={styles.petGridSkills}>{species.skills}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Bottom Button matching Start 1 */}
            <Pressable
              style={styles.fullPillButton}
              onPress={() => {
                playClickSound();
                setStep(2);
              }}
            >
              <Text style={styles.fullPillButtonText}>Далее</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </Pressable>
          </View>
        )}

        {/* ================= START 2: СОЗДАЙ ПИТОМЦА ================= */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Создай питомца</Text>
              <Text style={styles.subtitle}>
                Придумай классное имя и подбери наряд по вкусу!
              </Text>
            </View>

            <Stepper currentStep={2} />

            {/* Top Side-by-Side Section matching Start 2 wireframe */}
            <View style={styles.topSideBySideRow}>
              {/* Left Column: Interactive 3D Pet Preview */}
              <View style={styles.leftPreviewCard}>
                <Cat3DViewer
                  height={170}
                  cameraDistance={4.2}
                  cameraY={0.9}
                  cameraLookAtY={0.5}
                  modelY={-0.3}
                  animation="Idle_Default"
                  interactive={true}
                  showRug={true}
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

                {/* 2. Color Card */}
                <View style={styles.miniCard}>
                  <Text style={styles.miniCardTitle}>Цвет</Text>
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

            {/* Lower Options: 3 Group Containers */}
            {/* Group 1: Eyes */}
            <View style={styles.optionGroupCard}>
              <Text style={styles.groupLabel}>Глазки</Text>
              <View style={styles.groupRow}>
                {petEyes.map((eye) => {
                  const isSelected = selectedEyeId === eye.id;
                  return (
                    <Pressable
                      key={eye.id}
                      style={[
                        styles.groupOptionPill,
                        isSelected
                          ? styles.groupOptionSelected
                          : styles.groupOptionUnselected,
                      ]}
                      onPress={() => {
                        playClickSound();
                        setSelectedEyeId(eye.id);
                      }}
                    >
                      {isSelected && (
                        <View style={styles.groupCheckBadge}>
                          <Text style={styles.groupCheckText}>✓</Text>
                        </View>
                      )}
                      <View style={[styles.eyeDot, { backgroundColor: eye.color }]} />
                      <Text
                        style={[
                          styles.groupOptionText,
                          isSelected && styles.groupOptionTextSelected,
                        ]}
                      >
                        {eye.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Group 2: Clothes */}
            <View style={styles.optionGroupCard}>
              <Text style={styles.groupLabel}>Одежда</Text>
              <View style={styles.groupRow}>
                {petOutfits.map((outfit) => {
                  const isSelected = selectedOutfitId === outfit.id;
                  return (
                    <Pressable
                      key={outfit.id}
                      style={[
                        styles.groupOptionItem,
                        isSelected
                          ? styles.groupOptionSelected
                          : styles.groupOptionUnselected,
                      ]}
                      onPress={() => {
                        playClickSound();
                        setSelectedOutfitId(outfit.id);
                      }}
                    >
                      {isSelected && (
                        <View style={styles.groupCheckBadge}>
                          <Text style={styles.groupCheckText}>✓</Text>
                        </View>
                      )}
                      <Text style={styles.groupOptionEmoji}>{outfit.emoji}</Text>
                      <Text
                        style={[
                          styles.groupOptionText,
                          isSelected && styles.groupOptionTextSelected,
                        ]}
                      >
                        {outfit.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Group 3: Accessories */}
            <View style={styles.optionGroupCard}>
              <Text style={styles.groupLabel}>Аксессуар</Text>
              <View style={styles.groupRow}>
                {petAccessories.map((acc) => {
                  const isSelected = selectedAccessoryId === acc.id;
                  return (
                    <Pressable
                      key={acc.id}
                      style={[
                        styles.groupOptionItem,
                        isSelected
                          ? styles.groupOptionSelected
                          : styles.groupOptionUnselected,
                      ]}
                      onPress={() => {
                        playClickSound();
                        setSelectedAccessoryId(acc.id);
                      }}
                    >
                      {isSelected && (
                        <View style={styles.groupCheckBadge}>
                          <Text style={styles.groupCheckText}>✓</Text>
                        </View>
                      )}
                      <Text style={styles.groupOptionEmoji}>{acc.symbol}</Text>
                      <Text
                        style={[
                          styles.groupOptionText,
                          isSelected && styles.groupOptionTextSelected,
                        ]}
                      >
                        {acc.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Navigation Buttons matching Start 2 */}
            <View style={styles.dualNavRow}>
              <Pressable
                style={styles.secondaryPillButton}
                onPress={() => {
                  playClickSound();
                  setStep(1);
                }}
              >
                <Text style={styles.secondaryPillArrow}>←</Text>
                <Text style={styles.secondaryPillText}>Назад</Text>
              </Pressable>

              <Pressable
                style={styles.primaryNavPillButton}
                onPress={() => {
                  playClickSound();
                  setStep(3);
                }}
              >
                <Text style={styles.fullPillButtonText}>Далее</Text>
                <Text style={styles.arrowIcon}>→</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ================= START 3: ТВОЙ ПИТОМЕЦ ГОТОВ! ================= */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Твой питомец готов! 🎉</Text>
              <Text style={styles.subtitle}>
                Познакомься — твой верный друг уже ждёт тебя!
              </Text>
            </View>

            <Stepper currentStep={3} />

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
                  <Text style={styles.summaryLabel}>Тип:</Text>
                  <Text style={styles.summaryVal}>{currentSpecies.name}</Text>
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

            {/* Start Adventure Button matching Start 3 */}
            <Pressable
              style={styles.fullPillButton}
              onPress={handleFinish}
            >
              <Text style={styles.fullPillButtonText}>Начать приключение! 🐾</Text>
            </Pressable>

            {/* Edit link */}
            <Pressable
              style={styles.changeLink}
              onPress={() => {
                playClickSound();
                setStep(2);
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

  /* Start 1: Grid */
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  petGridCard: {
    width: "48%",
    aspectRatio: 0.95,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  petGridCardUnselected: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  petGridCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.cardSelected,
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  checkBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  speciesEmojiCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  speciesEmojiText: {
    fontSize: 34,
  },
  petGridName: {
    fontSize: fonts.body,
    fontWeight: "700",
    color: colors.text,
  },
  petGridNameSelected: {
    color: colors.primaryDark,
    fontWeight: "800",
  },
  petGridSkills: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 2,
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
    flex: 0.42,
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
    flex: 0.55,
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

  /* Start 2 Layout */
  topSideBySideRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 4,
    height: 172,
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
  miniInputWrap: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  miniTextInput: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.text,
    padding: 0,
  },
  colorPaletteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  paletteDotWrap: {
    padding: 2,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  paletteDotWrapSelected: {
    borderColor: colors.primary,
  },
  paletteDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
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

  /* Options Groups */
  optionGroupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 10,
    gap: 6,
  },
  groupLabel: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.text,
    marginLeft: 2,
  },
  groupRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  groupOptionPill: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    position: "relative",
  },
  eyeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  groupOptionItem: {
    flex: 1,
    height: 60,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  groupOptionEmoji: {
    fontSize: 22,
  },
  groupOptionText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
    marginTop: 2,
  },
  groupOptionTextSelected: {
    color: colors.primaryDark,
    fontWeight: "800",
  },
  groupOptionUnselected: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  groupOptionSelected: {
    backgroundColor: colors.cardSelected,
    borderWidth: 2,
    borderColor: colors.primary,
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

  /* Start 3: Hero Scene & Stats */
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
    fontSize: 14,
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