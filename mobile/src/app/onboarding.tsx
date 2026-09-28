import { useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { colors, fonts, radius, spacing } from "../theme";
import { useStore } from "../store/store";

const introSteps = [
  {
    emoji: "🪙",
    title: "Карманные деньги",
    text: "Получай монетки каждое утро и за весёлые победы в уроках!",
  },
  {
    emoji: "🥣",
    title: "Надо или Хочу?",
    text: "Сначала сытно кормим друга обедом, а на сдачу покупаем игрушки!",
  },
  {
    emoji: "🐷",
    title: "Копилка на мечту",
    text: "Бросай монетки в копилку и забирай долгожданные крутые вещи!",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const isOnboarded = !!profile?.onboarded;
  const { width: windowWidth } = useWindowDimensions();
  const bottomBgHeight = Math.round(windowWidth * (724 / 2172));

  return (
    <View style={styles.container}>
      <View
        style={[styles.bottomBgWrapper, { height: bottomBgHeight }]}
        pointerEvents="none"
      >
        <Image
          source={require("../../assets/images/wellcome_bottom.png")}
          style={{ width: "100%", height: bottomBgHeight }}
          resizeMode="contain"
        />
      </View>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isOnboarded && (
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>‹ Назад в игру</Text>
          </Pressable>
        )}

        <View style={styles.heroSection}>
          <Image
            source={require("../../assets/images/wellcome_cat.png")}
            style={styles.heroCatImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>Питомец Финни 🐾</Text>
          <Text style={styles.subtitle}>
            Заботься о верном пушистом друге и учись легко управлять своими монетками!
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {introSteps.map((s) => (
            <View key={s.title} style={styles.card}>
              <View style={styles.emojiCircle}>
                <Text style={styles.emoji}>{s.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardText}>{s.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          🔒 Без скучных паролей и регистраций — игра живёт только на твоём телефоне.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            if (isOnboarded) {
              router.replace("/home");
            } else {
              router.push("/pet-creation");
            }
          }}
        >
          <Text style={styles.primaryButtonText}>
            {isOnboarded ? "Понятно, назад к питомцу! 🐾" : "Познакомиться с питомцем!"}
          </Text>
          <Text style={styles.arrowIcon}>→</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: "relative",
  },
  screen: { flex: 1, backgroundColor: "transparent" },
  bottomBgWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    zIndex: 0,
  },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 48 },
  heroCatImage: {
    width: 220,
    height: 165,
    marginBottom: spacing.xs,
  },
  heroSection: { alignItems: "center", marginVertical: spacing.sm },
  title: { fontSize: fonts.title, fontWeight: "800", color: colors.text, textAlign: "center" },
  subtitle: {
    fontSize: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    lineHeight: 22,
  },
  cardsContainer: { gap: spacing.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "#FFFFFF",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 24 },
  cardTitle: { fontSize: fonts.body, fontWeight: "700", color: colors.text },
  cardText: { fontSize: fonts.small, color: colors.textMuted, marginTop: 2 },
  note: { fontSize: fonts.caption, color: colors.textMuted, textAlign: "center", marginVertical: spacing.xs },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    minHeight: 52,
    marginTop: spacing.xs,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: fonts.body,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  arrowIcon: {
    fontSize: 18,
    color: "#FFFFFF",
    marginLeft: spacing.sm,
    fontWeight: "700",
  },
  backBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignSelf: "flex-start",
  },
  backBtnText: {
    fontSize: fonts.body,
    fontWeight: "700",
    color: colors.primaryDark,
  },
});