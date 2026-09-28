import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function Tasks() {
  const router = useRouter();

  useEffect(() => {
    // Tasks are integrated into the main Duolingo Adventure Path on the home screen
    router.replace("/home");
  }, [router]);

  return <View style={{ flex: 1 }} />;
}