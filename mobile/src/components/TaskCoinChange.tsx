import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ChangeTaskData } from "../content/types";
import { colors, fonts, radius, spacing } from "../theme";
import { playClickSound, playCoinSound } from "../utils/sound";

interface Props {
  data: ChangeTaskData;
  evaluated: boolean;
  onSumChange: (sum: number) => void;
}

export function TaskCoinChange({ data, evaluated, onSumChange }: Props) {
  // Array of indices chosen by the user
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleToggleCoin = (index: number) => {
    if (evaluated) return;
    let next: number[];
    if (selectedIndices.includes(index)) {
      playClickSound();
      next = selectedIndices.filter((i) => i !== index);
    } else {
      playCoinSound();
      next = [...selectedIndices, index];
    }
    setSelectedIndices(next);
    const sum = next.reduce((acc, i) => acc + data.availableCoins[i], 0);
    onSumChange(sum);
  };

  const collectedSum = selectedIndices.reduce(
    (acc, i) => acc + data.availableCoins[i],
    0
  );

  return (
    <View style={styles.container}>
      {/* Receipt Card */}
      <View style={styles.receiptCard}>
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Обед в буфете:</Text>
          <Text style={styles.receiptVal}>{data.price} 🪙</Text>
        </View>
        <View style={styles.receiptRow}>
          <Text style={styles.receiptLabel}>Отдано на кассу:</Text>
          <Text style={styles.receiptVal}>{data.paid} 🪙</Text>
        </View>
        <View style={[styles.receiptRow, styles.receiptTotalRow]}>
          <Text style={styles.receiptTotalLabel}>Сдача (50 − 35):</Text>
          <Text style={styles.receiptTotalVal}>{data.targetChange} 🪙</Text>
        </View>
      </View>

      {/* Hand Tray */}
      <View
        style={[
          styles.trayCard,
          collectedSum === data.targetChange
            ? styles.traySuccess
            : collectedSum > data.targetChange
            ? styles.trayDanger
            : null,
        ]}
      >
        <Text style={styles.trayTitle}>
          Ладошка со сдачей:{" "}
          <Text style={styles.traySum}>{collectedSum} 🪙</Text> / {data.targetChange} 🪙
        </Text>
        <Text style={styles.trayHint}>
          {collectedSum === data.targetChange
            ? "✓ Точная сумма собрана! Жми «Проверить»!"
            : collectedSum > data.targetChange
            ? "⚠️ Слишком много! Нажми на лишнюю монетку, чтобы вернуть"
            : "Нажимай на монетки в кассе ниже, чтобы набрать сдачу"}
        </Text>
      </View>

      {/* Cash Register Coins */}
      <Text style={styles.coinsHeader}>Касса с монетками (нажимай):</Text>
      <View style={styles.coinsRow}>
        {data.availableCoins.map((val, idx) => {
          const isSelected = selectedIndices.includes(idx);
          return (
            <Pressable
              key={idx}
              disabled={evaluated}
              style={[
                styles.coinBtn,
                isSelected && styles.coinBtnSelected,
              ]}
              onPress={() => handleToggleCoin(idx)}
            >
              <Text style={styles.coinIcon}>🪙</Text>
              <Text style={[styles.coinText, isSelected && styles.coinTextSelected]}>
                {val}
              </Text>
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>В руке</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 8,
  },
  receiptCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    gap: 6,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  receiptLabel: {
    fontSize: fonts.body,
    color: colors.textMuted,
  },
  receiptVal: {
    fontSize: fonts.body,
    fontWeight: "700",
    color: colors.text,
  },
  receiptTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
    marginTop: 2,
  },
  receiptTotalLabel: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  receiptTotalVal: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  trayCard: {
    backgroundColor: "#FAF8F3",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    gap: 4,
  },
  traySuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  trayDanger: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  trayTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  traySum: {
    color: colors.primaryDark,
    fontSize: fonts.subtitle,
  },
  trayHint: {
    fontSize: fonts.caption,
    color: colors.textMuted,
    textAlign: "center",
  },
  coinsHeader: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
    marginTop: 4,
  },
  coinsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  coinBtn: {
    backgroundColor: "#FFFBEB",
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: "#FDE68A",
    borderBottomWidth: 4,
    borderBottomColor: "#F59E0B",
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 64,
  },
  coinBtnSelected: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
    borderBottomColor: "#16A34A",
    transform: [{ translateY: 2 }],
  },
  coinIcon: {
    fontSize: 20,
  },
  coinText: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: "#B45309",
    marginTop: 2,
  },
  coinTextSelected: {
    color: "#166534",
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 4,
  },
  selectedBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
