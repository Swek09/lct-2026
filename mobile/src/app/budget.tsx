import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BottomTabBar } from "../components/BottomTabBar";
import { DuoButton } from "../components/DuoButton";
import { TopNavBar } from "../components/TopNavBar";
import { shopItems } from "../content/shop";
import { validatePlan } from "../domain/economy";
import { currentPeriod } from "../domain/period";
import { useStore } from "../store/store";
import { colors, fonts, radius, spacing } from "../theme";

export default function Budget() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const setPlan = useStore((s) => s.setPlan);

  const period = profile ? currentPeriod(profile) : null;
  const income = period?.income ?? 100;

  const [mandatory, setMandatory] = useState(
    period?.plan?.mandatory ?? Math.round(income * 0.5)
  );
  const [optional, setOptional] = useState(
    period?.plan?.optional ?? Math.round(income * 0.25)
  );
  const [savings, setSavings] = useState(
    period?.plan?.savings ?? Math.round(income * 0.25)
  );

  if (!profile || !period) return null;


  const currentTotal = mandatory + optional + savings;
  const remaining = income - currentTotal;
  const validation = validatePlan(income, { mandatory, optional, savings });

  const adjust = (setter: (v: number) => void, current: number, delta: number) => {
    const next = Math.max(0, current + delta);
    setter(next);
  };

  const handleConfirmPlan = () => {
    if (!validation.ok) return;
    setPlan({ mandatory, optional, savings });
  };

  // Compute facts from period expenses
  const actualMandatory = period.expenses
    .filter((e) => e.type === "mandatory")
    .reduce((sum, e) => sum + e.amount, 0);
  const actualOptional = period.expenses
    .filter((e) => e.type === "optional")
    .reduce((sum, e) => sum + e.amount, 0);
  const actualSavings = period.savingsAdded;

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNavBar />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Три волшебных конверта ✉️</Text>
          <Text style={styles.subtitle}>
            {period.planConfirmed
              ? "Смотри, куда уходят монетки и сходятся ли конверты!"
              : `Карманные деньги: ${income} монет 🪙. Разложи по 3 конвертам!`}
          </Text>
        </View>

        {/* ================= IF PLAN CONFIRMED: PLAN VS FACT ================= */}
        {period.planConfirmed && period.plan ? (
          <View style={styles.planVsFactSection}>
            <View style={styles.confirmedBanner}>
              <Text style={styles.confirmedIcon}>🎉</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.confirmedTitle}>Конверты разложены!</Text>
                <Text style={styles.confirmedSubtitle}>
                  Покупай вкусняшки в лавке и бросай монетки в копилку — здесь всё видно!
                </Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Куда ушли монетки 🔍</Text>

            {/* Mandatory Row */}
            <View style={styles.compareCard}>
              <View style={styles.compareTop}>
                <Text style={styles.compareName}>🥣 Обед и забота (Надо)</Text>
                <Text style={styles.compareNumbers}>
                  {actualMandatory} / {period.plan.mandatory} 🪙
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, (actualMandatory / (period.plan.mandatory || 1)) * 100)}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.compareHint}>
                {actualMandatory >= period.plan.mandatory
                  ? "✓ Питомец сыт и здоров, всё самое важное куплено!"
                  : `Осталось потратить из конверта: ${period.plan.mandatory - actualMandatory} монет`}
              </Text>
            </View>

            {/* Optional Row */}
            <View style={styles.compareCard}>
              <View style={styles.compareTop}>
                <Text style={styles.compareName}>🎮 Игры и радости (Хочу)</Text>
                <Text style={styles.compareNumbers}>
                  {actualOptional} / {period.plan.optional} 🪙
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, (actualOptional / (period.plan.optional || 1)) * 100)}%`,
                      backgroundColor: "#8B5CF6",
                    },
                  ]}
                />
              </View>
              <Text style={styles.compareHint}>
                {actualOptional > period.plan.optional
                  ? "⚠️ Ого, на развлечения ушло чуть больше, чем планировали!"
                  : `Ещё можно потратить на радости: ${period.plan.optional - actualOptional} монет`}
              </Text>
            </View>

            {/* Savings Row */}
            <View style={styles.compareCard}>
              <View style={styles.compareTop}>
                <Text style={styles.compareName}>🐷 В копилку на мечту</Text>
                <Text style={styles.compareNumbers}>
                  {actualSavings} / {period.plan.savings} 🪙
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(100, (actualSavings / (period.plan.savings || 1)) * 100)}%`,
                      backgroundColor: "#F59E0B",
                    },
                  ]}
                />
              </View>
              <Text style={styles.compareHint}>
                {actualSavings >= period.plan.savings
                  ? "✓ Ура! Мечта всё ближе — копилка полна по плану!"
                  : `Осталось положить в копилку: ${period.plan.savings - actualSavings} монет`}
              </Text>
            </View>

            {/* Expenses History */}
            <Text style={[styles.sectionHeader, { marginTop: spacing.md }]}>
              История покупок за день ({period.expenses.length})
            </Text>
            {period.expenses.length === 0 ? (
              <Text style={styles.emptyText}>
                Сегодня ты ещё ничего не покупал. Загляни в Лавку вкусняшек! 🛒
              </Text>
            ) : (
              period.expenses.map((exp) => {
                const item = shopItems.find((i) => i.id === exp.itemId);
                return (
                  <View key={exp.id} style={styles.historyRow}>
                    <Text style={styles.historyIcon}>
                      {item?.icon ?? (exp.type === "mandatory" ? "🥣" : "🎮")}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyTitle}>{item?.name ?? exp.itemId}</Text>
                      <Text style={styles.historyType}>
                        {exp.type === "mandatory" ? "🥣 Обед и забота (Надо)" : "🎮 Радости (Хочу)"}
                      </Text>
                    </View>
                    <Text style={styles.historyAmount}>-{exp.amount} 🪙</Text>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          /* ================= IF PLAN NOT CONFIRMED: INTERACTIVE ENVELOPES ================= */
          <View style={styles.envelopesSection}>
            {/* Balance Distribution Indicator */}
            <View
              style={[
                styles.balancePill,
                remaining < 0
                  ? styles.balancePillDanger
                  : remaining > 0
                  ? styles.balancePillReserve
                  : styles.balancePillNormal,
              ]}
            >
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.balancePillLabel}>
                  {remaining < 0
                    ? "Превышение бюджета:"
                    : remaining > 0
                    ? "💼 Резерв на непредвиденное:"
                    : "✨ Все монетки распределены:"}
                </Text>
                {remaining > 0 && (
                  <Text style={styles.balanceReserveHint}>
                    Нераспределённый остаток останется в кошельке как подушка безопасности!
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.balancePillValue,
                  remaining < 0 && { color: "#DC2626" },
                  remaining > 0 && { color: "#2563EB" },
                ]}
              >
                {remaining} 🪙
              </Text>
            </View>

            {/* Advisory 50/25/25 tip card */}
            <View style={styles.advisoryTipCard}>
              <Text style={styles.advisoryTipText}>
                💡 <Text style={{ fontWeight: "800" }}>Подсказка от Финни:</Text> Популярный ориентир — около 50% на «Надо», 25% на «Хочу» и 25% в «Копилку». Но это лишь пример — распределяй так, как считаешь нужным!
              </Text>
              <Pressable
                style={{ marginTop: 6, alignSelf: "flex-start" }}
                onPress={() => router.push("/onboarding")}
                accessibilityRole="button"
                accessibilityLabel="Открыть подсказку о 3 типах решений"
              >
                <Text style={{ fontSize: 11, fontWeight: "800", color: "#2563EB", textDecorationLine: "underline" }}>
                  📖 Вспомнить 3 типа решений (Надо / Хочу / Коплю) →
                </Text>
              </Pressable>
            </View>

            {/* Envelope 1: Mandatory */}
            <View style={[styles.envelopeCard, styles.envelopeMandatory]}>
              <View style={styles.envelopeTop}>
                <Text style={styles.envelopeEmoji}>🥣</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.envelopeTitle}>🥣 Обед и забота (Надо)</Text>
                  <Text style={styles.envelopeDesc}>Вкусная еда, чистая водичка, уход и витаминки</Text>
                </View>
                <Text style={styles.envelopeValue}>{mandatory} 🪙</Text>
              </View>

              <View style={styles.stepperRow}>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => adjust(setMandatory, mandatory, -5)}
                >
                  <Text style={styles.stepBtnText}>-5</Text>
                </Pressable>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => adjust(setMandatory, mandatory, +5)}
                >
                  <Text style={styles.stepBtnText}>+5</Text>
                </Pressable>
                <Pressable
                  style={[styles.stepBtn, styles.stepBtnLarge]}
                  onPress={() => adjust(setMandatory, mandatory, +10)}
                >
                  <Text style={styles.stepBtnText}>+10</Text>
                </Pressable>
              </View>
            </View>

            {/* Envelope 2: Optional */}
            <View style={[styles.envelopeCard, styles.envelopeOptional]}>
              <View style={styles.envelopeTop}>
                <Text style={styles.envelopeEmoji}>🎮</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.envelopeTitle}>🎮 Игры и радости (Хочу)</Text>
                  <Text style={styles.envelopeDesc}>Звонкие мячики, пушистые игрушки и наряды</Text>
                </View>
                <Text style={styles.envelopeValue}>{optional} 🪙</Text>
              </View>

              <View style={styles.stepperRow}>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => adjust(setOptional, optional, -5)}
                >
                  <Text style={styles.stepBtnText}>-5</Text>
                </Pressable>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => adjust(setOptional, optional, +5)}
                >
                  <Text style={styles.stepBtnText}>+5</Text>
                </Pressable>
                <Pressable
                  style={[styles.stepBtn, styles.stepBtnLarge]}
                  onPress={() => adjust(setOptional, optional, +10)}
                >
                  <Text style={styles.stepBtnText}>+10</Text>
                </Pressable>
              </View>
            </View>

            {/* Envelope 3: Savings */}
            <View style={[styles.envelopeCard, styles.envelopeSavings]}>
              <View style={styles.envelopeTop}>
                <Text style={styles.envelopeEmoji}>🐷</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.envelopeTitle}>🐷 Копилка на мечту</Text>
                  <Text style={styles.envelopeDesc}>Монетки на большую желанную покупку</Text>
                </View>
                <Text style={styles.envelopeValue}>{savings} 🪙</Text>
              </View>

              <View style={styles.stepperRow}>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => adjust(setSavings, savings, -5)}
                >
                  <Text style={styles.stepBtnText}>-5</Text>
                </Pressable>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => adjust(setSavings, savings, +5)}
                >
                  <Text style={styles.stepBtnText}>+5</Text>
                </Pressable>
                <Pressable
                  style={[styles.stepBtn, styles.stepBtnLarge]}
                  onPress={() => adjust(setSavings, savings, +10)}
                >
                  <Text style={styles.stepBtnText}>+10</Text>
                </Pressable>
              </View>
            </View>

            {/* Validation Message */}
            {!validation.ok && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ {validation.error ?? "Проверь сумму в конвертах"}
                </Text>
              </View>
            )}

            {/* Submit Button */}
            <DuoButton
              title="Готово! Сохранить конверты ✨"
              variant="primary"
              size="lg"
              disabled={!validation.ok}
              onPress={handleConfirmPlan}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}
      </ScrollView>

      <BottomTabBar currentTab="budget" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 24,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fonts.title,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: fonts.small,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },

  /* Envelopes */
  envelopesSection: {
    gap: 12,
  },
  balancePill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  balancePillNormal: {
    borderColor: colors.primary,
  },
  balancePillDanger: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  balancePillReserve: {
    borderColor: "#93C5FD",
    backgroundColor: "#EFF6FF",
  },
  balanceReserveHint: {
    fontSize: 11,
    color: "#2563EB",
    marginTop: 2,
    fontWeight: "600",
  },
  advisoryTipCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "#FDE68A",
    padding: 12,
  },
  advisoryTipText: {
    fontSize: 12,
    color: "#78350F",
    lineHeight: 17,
  },
  balancePillLabel: {
    fontSize: fonts.body,
    fontWeight: "700",
    color: colors.text,
  },
  balancePillValue: {
    fontSize: fonts.subtitle,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  envelopeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: "#DCD5C6",
    gap: 12,
  },
  envelopeMandatory: {
    borderColor: "#B8DFC0",
    backgroundColor: "#F7FCF8",
  },
  envelopeOptional: {
    borderColor: "#DDD6FE",
    backgroundColor: "#FAF5FF",
  },
  envelopeSavings: {
    borderColor: "#FDE68A",
    backgroundColor: "#FFFDF5",
  },
  envelopeTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  envelopeEmoji: {
    fontSize: 26,
  },
  envelopeTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  envelopeDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  envelopeValue: {
    fontSize: fonts.subtitle,
    fontWeight: "800",
    color: colors.text,
  },
  stepperRow: {
    flexDirection: "row",
    gap: 8,
  },
  stepBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    minHeight: 48,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 3,
    borderBottomColor: "#D5CFBF",
  },
  stepBtnLarge: {
    flex: 1.2,
  },
  stepBtnText: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
  },
  warningBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: "#EF4444",
  },
  warningText: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: "#DC2626",
    textAlign: "center",
  },

  /* Plan vs Fact */
  planVsFactSection: {
    gap: 12,
  },
  confirmedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF8F1",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    gap: 10,
  },
  confirmedIcon: {
    fontSize: 28,
  },
  confirmedTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  confirmedSubtitle: {
    fontSize: fonts.caption,
    color: colors.text,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
    marginTop: 4,
  },
  compareCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 8,
  },
  compareTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compareName: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.text,
  },
  compareNumbers: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
  },
  barTrack: {
    height: 10,
    backgroundColor: "#E8E2D5",
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
  },
  compareHint: {
    fontSize: fonts.caption,
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: fonts.small,
    color: colors.textMuted,
    fontStyle: "italic",
    paddingVertical: 8,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  historyIcon: {
    fontSize: 20,
  },
  historyTitle: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.text,
  },
  historyType: {
    fontSize: fonts.caption,
    color: colors.textMuted,
  },
  historyAmount: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: "#DC2626",
  },
});