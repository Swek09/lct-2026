import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { achievements } from "../content/achievements";
import { colors, fonts, radius } from "../theme";
import { playClickSound } from "../utils/sound";

interface AchievementsModalProps {
  visible: boolean;
  onClose: () => void;
  unlockedAchievementIds?: string[];
}

export function AchievementsModal({
  visible,
  onClose,
  unlockedAchievementIds = [],
}: AchievementsModalProps) {
  const unlockedSet = new Set(unlockedAchievementIds);

  const handleClose = () => {
    playClickSound();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>🏅 Медали и достижения</Text>
              <Text style={styles.headerSubtitle}>
                Открыто {unlockedSet.size} из {achievements.length} наград
              </Text>
            </View>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Grid of Achievements */}
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.grid}>
              {achievements.map((item) => {
                const isUnlocked = unlockedSet.has(item.id);
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.card,
                      isUnlocked ? styles.cardUnlocked : styles.cardLocked,
                    ]}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        isUnlocked ? styles.iconWrapUnlocked : styles.iconWrapLocked,
                      ]}
                    >
                      <Text style={styles.icon}>{isUnlocked ? item.icon : "🔒"}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={styles.titleRow}>
                        <Text
                          style={[
                            styles.title,
                            !isUnlocked && styles.titleLocked,
                          ]}
                        >
                          {item.title}
                        </Text>
                        {isUnlocked && (
                          <View style={styles.unlockedPill}>
                            <Text style={styles.unlockedPillText}>ПОЛУЧЕНО</Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.desc,
                          !isUnlocked && styles.descLocked,
                        ]}
                      >
                        {item.description}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Bottom Button */}
          <View style={styles.bottomBar}>
            <Pressable style={styles.actionBtn} onPress={handleClose}>
              <Text style={styles.actionBtnText}>Вперёд к новым медалям! ⭐</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "85%",
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fonts.subtitle,
    fontWeight: "900",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  listContent: {
    padding: 14,
  },
  grid: {
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: 12,
  },
  cardUnlocked: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FCD34D",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLocked: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
    opacity: 0.85,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapUnlocked: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderColor: "#FDE68A",
  },
  iconWrapLocked: {
    backgroundColor: "#E5E7EB",
  },
  icon: {
    fontSize: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
    flex: 1,
  },
  titleLocked: {
    color: "#6B7280",
  },
  unlockedPill: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  unlockedPillText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#059669",
    letterSpacing: 0.5,
  },
  desc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 3,
  },
  descLocked: {
    color: "#9CA3AF",
  },
  bottomBar: {
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: fonts.body,
    fontWeight: "800",
  },
});
