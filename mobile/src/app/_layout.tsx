import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const styleId = "finni-global-scrollbar-fix";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          /* Remove all default desktop scrollbars and prevent white stripe */
          * {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          *::-webkit-scrollbar {
            display: none !important;
            width: 0px !important;
            height: 0px !important;
          }
          html, body, #root {
            overflow-x: hidden !important;
            scrollbar-width: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="pet-creation" />
        <Stack.Screen name="home" />
        <Stack.Screen name="budget" />
        <Stack.Screen name="shop" />
        <Stack.Screen name="savings" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="task/[id]" />
        <Stack.Screen name="progress" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="adult" />
      </Stack>
    </>
  );
}