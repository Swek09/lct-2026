import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius, touchTarget } from "../theme";

interface DuoButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "accent" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: string;
  disabled?: boolean;
  style?: object;
  fullWidth?: boolean;
}

export function DuoButton({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  disabled = false,
  style,
  fullWidth = true,
}: DuoButtonProps) {
  const getTheme = () => {
    switch (variant) {
      case "primary":
        return {
          bg: colors.primary,
          border: "#447348",
          text: "#FFFFFF",
        };
      case "accent":
        return {
          bg: "#F59E0B",
          border: "#D97706",
          text: "#FFFFFF",
        };
      case "danger":
        return {
          bg: "#EF4444",
          border: "#DC2626",
          text: "#FFFFFF",
        };
      case "secondary":
        return {
          bg: "#FFFFFF",
          border: "#DCD5C6",
          text: colors.text,
          extraBorder: "#EAE5D9",
        };
      case "ghost":
        return {
          bg: "transparent",
          border: "transparent",
          text: colors.primaryDark,
        };
    }
  };

  const theme = getTheme();
  const isGhost = variant === "ghost";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.buttonBase,
        fullWidth && styles.fullWidth,
        size === "sm" && styles.sizeSm,
        size === "md" && styles.sizeMd,
        size === "lg" && styles.sizeLg,
        {
          backgroundColor: theme.bg,
          borderBottomColor: theme.border,
          borderBottomWidth: isGhost ? 0 : 4,
          borderWidth: variant === "secondary" ? 2 : 1,
          borderColor: variant === "secondary" ? theme.extraBorder : theme.bg,
        },
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text
          style={[
            styles.label,
            size === "sm" && styles.labelSm,
            size === "lg" && styles.labelLg,
            { color: theme.text },
          ]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touchTarget,
    paddingHorizontal: 16,
  },
  fullWidth: {
    width: "100%",
  },
  sizeSm: {
    minHeight: 38,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderBottomWidth: 3,
  },
  sizeMd: {
    minHeight: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    borderBottomWidth: 4,
  },
  sizeLg: {
    minHeight: 56,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radius.lg,
    borderBottomWidth: 5,
  },
  buttonPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: fonts.body,
    fontWeight: "800",
    textAlign: "center",
  },
  labelSm: {
    fontSize: fonts.small,
    fontWeight: "700",
  },
  labelLg: {
    fontSize: fonts.subtitle,
    fontWeight: "800",
  },
});
