import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing } from "../theme";
import { useStore } from "../store/store";

export default function Index() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);

  useEffect(() => {
    if (profile) {
      if (!profile.onboarded) {
        router.replace("/pet-creation");
      } else {
        router.replace("/home");
      }
    } else {
      router.replace("/onboarding");
    }
  }, [profile, router]);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.title}>Питомец Финни 🐾</Text>
      <Text style={styles.subtitle}>Твой финансовый друг</Text>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  logoWrap: {
    width: 140,
    height: 140,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#E2E8F0",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: spacing.md,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: fonts.title,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fonts.body,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  spinner: {
    marginTop: spacing.sm,
  },
});