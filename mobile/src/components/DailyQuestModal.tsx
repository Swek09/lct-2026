import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { ConfettiEffect } from "./ConfettiEffect";
import { getTodayQuest } from "../domain/daily";
import { useStore } from "../store/store";
import { colors, fonts, radius } from "../theme";
import { playClickSound, playErrorSound, playSuccessSound } from "../utils/sound";

interface DailyQuestModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DailyQuestModal({ visible, onClose }: DailyQuestModalProps) {
  const profile = useStore((s) => s.profile);
  const completeDailyQuest = useStore((s) => s.completeDailyQuest);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    reward: number;
    explanation: string;
  } | null>(null);

  if (!profile) return null;
  const quest = getTodayQuest(profile);

  const handleSelect = (key: string) => {
    if (result) return;
    playClickSound();
    setSelectedKey(key);
  };

  const handleConfirm = () => {
    if (!selectedKey) return;
    const res = completeDailyQuest(quest.id, selectedKey);
    setResult(res);
    if (res.success) {
      playSuccessSound();
    } else {
      playErrorSound();
    }
  };

  const handleClose = () => {
    playClickSound();
    setSelectedKey(null);
    setResult(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {result?.success && <ConfettiEffect />}

        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🦉</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Вопрос дня от Мудрой Совы</Text>
              <Text style={styles.headerSubtitle}>
                Каждый день новая финансовая ситуация • +{quest.reward} 🪙
              </Text>
            </View>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Scenario */}
          <View style={styles.body}>
            <Text style={styles.questTitle}>{quest.title}</Text>
            <Text style={styles.questQuestion}>{quest.question}</Text>

            {/* Options */}
            <View style={styles.optionsWrap}>
              {quest.options.map((opt) => {
                const isSelected = selectedKey === opt.key;
                const isCorrectOption = result && opt.key === quest.correctKey;
                const isWrongSelected = result && isSelected && !result.success;

                return (
                  <Pressable
                    key={opt.key}
                    disabled={!!result}
                    style={[
                      styles.optionBtn,
                      isSelected && styles.optionSelected,
                      isCorrectOption && styles.optionCorrect,
                      isWrongSelected && styles.optionWrong,
                    ]}
                    onPress={() => handleSelect(opt.key)}
                  >
                    <Text style={styles.optionKey}>{opt.key.toUpperCase()}</Text>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                        isCorrectOption && styles.optionTextCorrect,
                      ]}
                    >
                      {opt.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Explanation card after submit */}
            {result && (
              <View
                style={[
                  styles.resultBox,
                  result.success ? styles.resultBoxOk : styles.resultBoxFail,
                ]}
              >
                <Text style={styles.resultTitle}>
                  {result.success ? "🎉 Отлично сработано!" : "💡 Совет Мудрой Совы:"}
                </Text>
                <Text style={styles.resultText}>{result.explanation}</Text>
              </View>
            )}
          </View>

          {/* Action button */}
          <View style={styles.footer}>
            {!result ? (
              <Pressable
                disabled={!selectedKey}
                style={[styles.actionBtn, !selectedKey && styles.actionBtnDisabled]}
                onPress={handleConfirm}
              >
                <Text style={styles.actionBtnText}>Ответить и проверить ✨</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.actionBtn} onPress={handleClose}>
                <Text style={styles.actionBtnText}>
                  {result.success ? `Забрать +${result.reward} монет! 🪙` : "Понятно, запомню! 👍"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FAF8F3",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    gap: 12,
  },
  headerEmoji: {
    fontSize: 34,
  },
  headerTitle: {
    fontSize: fonts.body,
    fontWeight: "900",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: "700",
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
  body: {
    padding: 16,
  },
  questTitle: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  questQuestion: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 22,
    marginBottom: 14,
  },
  optionsWrap: {
    gap: 10,
  },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAF8F3",
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: "#D5CEBF",
    gap: 12,
  },
  optionSelected: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
    borderBottomColor: "#2563EB",
  },
  optionCorrect: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
    borderBottomColor: "#059669",
  },
  optionWrong: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
    borderBottomColor: "#DC2626",
  },
  optionKey: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    lineHeight: 28,
    fontSize: 13,
    fontWeight: "900",
    color: colors.text,
  },
  optionText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
  optionTextSelected: {
    color: "#1E40AF",
  },
  optionTextCorrect: {
    color: "#065F46",
    fontWeight: "800",
  },
  resultBox: {
    borderRadius: radius.md,
    padding: 12,
    marginTop: 14,
    borderWidth: 1.5,
  },
  resultBoxOk: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  resultBoxFail: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 4,
  },
  resultText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  footer: {
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
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryDark,
  },
  actionBtnDisabled: {
    backgroundColor: "#D1D5DB",
    borderBottomColor: "#9CA3AF",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: fonts.body,
    fontWeight: "900",
  },
});
