import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../theme";
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
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}