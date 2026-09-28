import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SortItem } from "../content/types";
import { colors, fonts, radius, spacing } from "../theme";
import { playClickSound } from "../utils/sound";

interface Props {
  items: SortItem[];
  evaluated: boolean;
  onAssignmentsChange: (assignments: Record<string, "mandatory" | "optional">) => void;
}

export function TaskInteractiveSort({ items, evaluated, onAssignmentsChange }: Props) {
  const [assignments, setAssignments] = useState<Record<string, "mandatory" | "optional">>({});

  const handleAssign = (itemId: string, category: "mandatory" | "optional") => {
    if (evaluated) return;
    playClickSound();
    const next = { ...assignments, [itemId]: category };
    setAssignments(next);
    onAssignmentsChange(next);
  };

  const mandatoryItems = items.filter((i) => assignments[i.id] === "mandatory");
  const optionalItems = items.filter((i) => assignments[i.id] === "optional");
  const unassignedItems = items.filter((i) => !assignments[i.id]);

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        {unassignedItems.length > 0
          ? `Осталось разложить: ${unassignedItems.length} шт.`
          : "Все вещи разложены! Нажми «Проверить» 👇"}
      </Text>

      {/* Unassigned Pool */}
      {unassignedItems.length > 0 && (
        <View style={styles.poolCard}>
          <Text style={styles.poolTitle}>Куда отправим эту вещь?</Text>
          {unassignedItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemIcon}>{item.icon ?? "📦"}</Text>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>

              <View style={styles.actionBtns}>
                <Pressable
                  style={[styles.sortBtn, styles.btnMandatory]}
                  onPress={() => handleAssign(item.id, "mandatory")}
                >
                  <Text style={styles.btnText}>🥣 В «Надо»</Text>
                </Pressable>
                <Pressable
                  style={[styles.sortBtn, styles.btnOptional]}
                  onPress={() => handleAssign(item.id, "optional")}
                >
                  <Text style={styles.btnText}>🎮 В «Хочу»</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Two Baskets Side by Side */}
      <View style={styles.basketsRow}>
        {/* Basket 1: Mandatory */}
        <View style={[styles.basket, styles.basketMandatory]}>
          <View style={styles.basketHeader}>
            <Text style={styles.basketTitle}>🥣 Корзина «Надо»</Text>
            <Text style={styles.basketCount}>{mandatoryItems.length}</Text>
          </View>
          <View style={styles.basketContent}>
            {mandatoryItems.length === 0 ? (
              <Text style={styles.basketEmpty}>Пусто</Text>
            ) : (
              mandatoryItems.map((item) => {
                const isCorrect = item.correctCategory === "mandatory";
                return (
                  <Pressable
                    key={item.id}
                    disabled={evaluated}
                    onPress={() => handleAssign(item.id, "optional")}
                    style={[
                      styles.assignedBadge,
                      evaluated && (isCorrect ? styles.correctBadge : styles.wrongBadge),
                    ]}
                  >
                    <Text style={styles.assignedBadgeText}>
                      {item.icon} {item.label} {!evaluated && "✕"}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>

        {/* Basket 2: Optional */}
        <View style={[styles.basket, styles.basketOptional]}>
          <View style={styles.basketHeader}>
            <Text style={styles.basketTitle}>🎮 Корзина «Хочу»</Text>
            <Text style={styles.basketCount}>{optionalItems.length}</Text>
          </View>
          <View style={styles.basketContent}>
            {optionalItems.length === 0 ? (
              <Text style={styles.basketEmpty}>Пусто</Text>
            ) : (
              optionalItems.map((item) => {
                const isCorrect = item.correctCategory === "optional";
                return (
                  <Pressable
                    key={item.id}
                    disabled={evaluated}
                    onPress={() => handleAssign(item.id, "mandatory")}
                    style={[
                      styles.assignedBadge,
                      evaluated && (isCorrect ? styles.correctBadge : styles.wrongBadge),
                    ]}
                  >
                    <Text style={styles.assignedBadgeText}>
                      {item.icon} {item.label} {!evaluated && "✕"}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 8,
  },
  instruction: {
    fontSize: fonts.caption,
    fontWeight: "700",
    color: colors.primaryDark,
    textAlign: "center",
  },
  poolCard: {
    backgroundColor: "#FAF8F3",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 10,
  },
  poolTitle: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
  },
  itemRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemIcon: {
    fontSize: 20,
  },
  itemLabel: {
    fontSize: fonts.body,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
  },
  actionBtns: {
    flexDirection: "row",
    gap: 8,
  },
  sortBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  btnMandatory: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  btnOptional: {
    backgroundColor: "#EDE7F6",
    borderWidth: 1,
    borderColor: "#D1C4E9",
  },
  btnText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
  },
  basketsRow: {
    flexDirection: "row",
    gap: 10,
  },
  basket: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: 10,
    minHeight: 130,
  },
  basketMandatory: {
    backgroundColor: "#F7FCF8",
    borderColor: "#A5D6A7",
  },
  basketOptional: {
    backgroundColor: "#FAF5FF",
    borderColor: "#DDD6FE",
  },
  basketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    paddingBottom: 6,
    marginBottom: 6,
  },
  basketTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.text,
  },
  basketCount: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted,
  },
  basketContent: {
    gap: 6,
  },
  basketEmpty: {
    fontSize: fonts.caption,
    color: colors.textMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 12,
  },
  assignedBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  correctBadge: {
    borderColor: "#22C55E",
    backgroundColor: "#DCFCE7",
  },
  wrongBadge: {
    borderColor: "#EF4444",
    backgroundColor: "#FEE2E2",
  },
  assignedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },
});
