import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { DuoButton } from "./DuoButton";
import { colors, radius, spacing } from "../theme";
import { playClickSound } from "../utils/sound";

interface BedtimeCheckModalProps {
  visible: boolean;
  reason: string;
  action?: "budget" | "shop";
  onClose: () => void;
  onNavigate: (route: "/budget" | "/shop") => void;
}

export function BedtimeCheckModal({
  visible,
  reason,
  action,
  onClose,
  onNavigate,
}: BedtimeCheckModalProps) {
  if (!visible) return null;

  const handleAction = () => {
    playClickSound();
    onClose();
    if (action === "budget") {
      onNavigate("/budget");
    } else if (action === "shop") {
      onNavigate("/shop");
    }
  };

  const handleDismiss = () => {
    playClickSound();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleDismiss} />
        <View style={styles.dialogCard}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>
              {action === "shop" ? "🥣" : "✉️"}
            </Text>
          </View>

          <Text style={styles.title}>Подожди немножко! 🐾</Text>
          <Text style={styles.reasonText}>{reason}</Text>

          <View style={styles.buttonCol}>
            {action === "budget" && (
              <DuoButton
                title="Разложить по 3 конвертам ✉️"
                variant="primary"
                size="md"
                onPress={handleAction}
              />
            )}
            {action === "shop" && (
              <DuoButton
                title="В Лавку за вкусным обедом 🛒"
                variant="primary"
                size="md"
                onPress={handleAction}
              />
            )}
            <DuoButton
              title="Понятно, сейчас сделаю!"
              variant="secondary"
              size="md"
              onPress={handleDismiss}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(22, 28, 45, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  dialogCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: "#FDE68A",
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  buttonCol: {
    width: "100%",
    gap: spacing.sm,
  },
});
