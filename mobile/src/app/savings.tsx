import { useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { BottomTabBar } from "../components/BottomTabBar";
import { DuoButton } from "../components/DuoButton";
import { TopNavBar } from "../components/TopNavBar";
import { goals } from "../content/goals";
import { progressPercent } from "../domain/formulas";
import type { Goal } from "../domain/types";
import { useStore } from "../store/store";
import { colors, fonts, radius, spacing } from "../theme";

const EMOJI_OPTIONS = [
  "🎮", "🛹", "🛴", "🚲", "🎧", "🧸", "🎨", "🎸",
  "⚽", "📚", "🚀", "🐱", "🐶", "📱", "🏰", "🎁", "🧁", "✨",
];

const COST_CHIPS = [30, 50, 80, 120, 200, 300, 500];

export default function Savings() {
  const profile = useStore((s) => s.profile);
  const selectGoal = useStore((s) => s.selectGoal);
  const addCustomGoal = useStore((s) => s.addCustomGoal);
  const deleteCustomGoal = useStore((s) => s.deleteCustomGoal);
  const addSavings = useStore((s) => s.addSavings);
  const withdrawSavings = useStore((s) => s.withdrawSavings);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmountText, setWithdrawAmountText] = useState("10");
  const [deleteConfirmGoal, setDeleteConfirmGoal] = useState<Goal | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Custom goal modal state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalName, setGoalName] = useState("");
  const [goalCost, setGoalCost] = useState("100");
  const [goalIcon, setGoalIcon] = useState("🎮");

  if (!profile) return null;

  // Selected goal resolution
  const customGoals = profile.customGoals ?? [];
  const allGoals = [...customGoals, ...goals];
  const selectedGoalId = profile.selectedGoalId ?? (customGoals[0]?.id ?? goals[0].id);
  const currentGoal = allGoals.find((g) => g.id === selectedGoalId) ?? allGoals[0];
  const savedAmount = profile.savingsByGoal[currentGoal.id] ?? 0;
  const remaining = Math.max(0, currentGoal.cost - savedAmount);
  const percent = progressPercent(savedAmount, currentGoal.cost);

  // Time estimate: assume avg deposit 15 coins per period (protect against division by 0)
  const avgDepositPerPeriod = 15;
  const periodsLeft = avgDepositPerPeriod > 0 ? Math.ceil(remaining / avgDepositPerPeriod) : null;

  // Withdrawal calculations
  const parsedWithdraw = Math.max(
    1,
    Math.min(savedAmount || 1, parseInt(withdrawAmountText, 10) || 1)
  );
  const remainingInPiggy = Math.max(0, savedAmount - parsedWithdraw);
  const daysDelayed = avgDepositPerPeriod > 0 ? Math.ceil(parsedWithdraw / avgDepositPerPeriod) : null;
  const daysBefore = avgDepositPerPeriod > 0 ? Math.max(1, Math.ceil(remaining / avgDepositPerPeriod)) : null;
  const daysAfter = avgDepositPerPeriod > 0 ? Math.max(1, Math.ceil((currentGoal.cost - remainingInPiggy) / avgDepositPerPeriod)) : null;

  const openWithdrawModal = () => {
    const init = Math.min(savedAmount, 10);
    setWithdrawAmountText(String(init > 0 ? init : savedAmount));
    setShowWithdrawModal(true);
  };

  const openCreateModal = (existing?: Goal) => {
    if (existing) {
      setEditingGoal(existing);
      setGoalName(existing.name);
      setGoalCost(String(existing.cost));
      setGoalIcon(existing.icon);
    } else {
      setEditingGoal(null);
      setGoalName("");
      setGoalCost("100");
      setGoalIcon("🎮");
    }
    setShowGoalModal(true);
  };

  const handleSaveGoal = () => {
    const trimmed = goalName.trim();
    if (!trimmed) {
      setSuccessToast("Введи название своей мечты! ✨");
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }
    const cost = Math.max(10, parseInt(goalCost, 10) || 50);
    const newGoal: Goal = {
      id: editingGoal ? editingGoal.id : `custom_${Date.now()}`,
      name: trimmed,
      cost,
      icon: goalIcon || "🎯",
      description: "Моя заветная цель, на которую я коплю монетки!",
      category: "Моя мечта",
      isCustom: true,
    };
    addCustomGoal(newGoal);
    setShowGoalModal(false);
    setSuccessToast(
      editingGoal
        ? `Мечта «${newGoal.name}» обновлена! 🌟`
        : `Ура! Создана твоя цель: «${newGoal.name}»! 🐷✨`
    );
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmGoal) return;
    deleteCustomGoal(deleteConfirmGoal.id);
    setSuccessToast(`Цель «${deleteConfirmGoal.name}» удалена.`);
    setTimeout(() => setSuccessToast(null), 3000);
    setDeleteConfirmGoal(null);
  };

  const handleDeposit = (amount: number) => {
    if (remaining <= 0) {
      setSuccessToast(`🎉 На мечту «${currentGoal.name}» уже накоплена вся сумма! Больше положить нельзя.`);
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }
    const depositAmount = Math.min(amount, remaining);
    if (profile.balance < depositAmount) {
      setSuccessToast(`В кошельке не хватает монеток! Нужно ${depositAmount} 🪙.`);
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }
    if (!profile.selectedGoalId) {
      selectGoal(currentGoal.id);
    }
    addSavings(depositAmount);
    if (depositAmount === remaining) {
      setSuccessToast(
        `🎉 Ура! Положено ${depositAmount} 🪙 — мечта «${currentGoal.name}» полностью накоплена! 🥳`
      );
    } else {
      setSuccessToast(`Бульк! +${depositAmount} 🪙 брошено в копилку-хрюшку! 🐷✨`);
    }
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleConfirmWithdraw = () => {
    if (savedAmount <= 0) return;
    const res = withdrawSavings(parsedWithdraw);
    if (res.ok) {
      setSuccessToast(`Взято ${parsedWithdraw} 🪙 из копилки. Мечта отложится на ~${daysDelayed} дн.`);
    } else {
      setSuccessToast(res.reason ?? "Не удалось достать монетки.");
    }
    setTimeout(() => setSuccessToast(null), 3000);
    setShowWithdrawModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNavBar />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Копилка на мечту 🐷</Text>
          <Text style={styles.subtitle}>
            Бросай сюда монетки почаще, и твоя большая мечта скоро исполнится!
          </Text>
        </View>

        {/* Success / Info Toast */}
        {successToast && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{successToast}</Text>
          </View>
        )}

        {/* Current Goal Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.goalHeaderRow}>
            <View style={styles.goalIconCircle}>
              <Text style={{ fontSize: 34 }}>{currentGoal.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={styles.goalCategoryTag}>
                  {currentGoal.isCustom ? "🌟 Моя личная мечта" : (currentGoal.category ?? "Цель")}
                </Text>
                {currentGoal.isCustom && (
                  <Pressable
                    style={styles.editHeroGoalBtn}
                    onPress={() => openCreateModal(currentGoal)}
                  >
                    <Text style={styles.editHeroGoalBtnText}>✏️ Изменить</Text>
                  </Pressable>
                )}
              </View>
              <Text style={styles.goalTitle}>{currentGoal.name}</Text>
              <Text style={styles.goalDesc}>{currentGoal.description}</Text>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressBox}>
            <View style={styles.progressLabels}>
              <Text style={styles.savedLabel}>
                Накоплено: <Text style={styles.savedNumber}>{savedAmount}</Text> / {currentGoal.cost} 🪙
              </Text>
              <Text style={styles.percentText}>{percent}%</Text>
            </View>

            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${percent}%` }]} />
            </View>

            {/* Time Estimate (ТЗ 2.5.7) */}
            <View style={styles.estimateRow}>
              <Text style={styles.estimateIcon}>⏱️</Text>
              <Text style={styles.estimateText}>
                {remaining === 0
                  ? "🎉 Ура! На мечту накоплено! Можно покупать!"
                  : `Если откладывать по ~${avgDepositPerPeriod} 🪙 в день, накопишь за ~${periodsLeft} дн.`}
              </Text>
            </View>
          </View>

          {/* Deposit Buttons */}
          {remaining === 0 ? (
            <View style={styles.goalCompletedBox}>
              <Text style={styles.goalCompletedTitle}>🎉 Вся сумма собрана!</Text>
              <Text style={styles.goalCompletedDesc}>
                Ты накопил {savedAmount} из {currentGoal.cost} 🪙! Больше откладывать не нужно — покупка обеспечена! 🌟
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.depositHeader}>
                Бросить монетки в копилку (осталось {remaining} 🪙):
              </Text>
              <View style={styles.depositButtonsRow}>
                {remaining >= 5 && (
                  <DuoButton
                    title="+5 🪙"
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1 }}
                    onPress={() => handleDeposit(5)}
                  />
                )}
                {remaining >= 10 && (
                  <DuoButton
                    title="+10 🪙"
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1 }}
                    onPress={() => handleDeposit(10)}
                  />
                )}
                {remaining >= 25 && (
                  <DuoButton
                    title="+25 🪙"
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    style={{ flex: 1 }}
                    onPress={() => handleDeposit(25)}
                  />
                )}
                <DuoButton
                  title={
                    remaining < 5
                      ? `+${remaining} 🪙 (всё)`
                      : `Докопить (+${remaining} 🪙)`
                  }
                  variant={remaining < 5 ? "primary" : "secondary"}
                  size="sm"
                  fullWidth={false}
                  style={{ flex: remaining < 5 ? 1 : 1.3 }}
                  onPress={() => handleDeposit(remaining)}
                />
              </View>
            </>
          )}

          {/* Withdraw Link Button */}
          {savedAmount > 0 && (
            <Pressable
              style={styles.withdrawLink}
              onPress={openWithdrawModal}
            >
              <Text style={styles.withdrawLinkText}>
                ⚠️ Достать монетки из копилки
              </Text>
            </Pressable>
          )}
        </View>

        {/* Create Custom Goal Banner */}
        <View style={styles.customGoalBanner}>
          <View style={styles.customGoalBannerIcon}>
            <Text style={{ fontSize: 32 }}>✨</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.customGoalBannerTitle}>Придумай свою мечту!</Text>
            <Text style={styles.customGoalBannerDesc}>
              Сам выбери цель, значок и сколько монеток хочешь накопить.
            </Text>
          </View>
          <DuoButton
            title="+ Своя мечта"
            variant="accent"
            size="sm"
            fullWidth={false}
            onPress={() => openCreateModal()}
          />
        </View>

        {/* Custom Goals List */}
        {customGoals.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Твои личные цели 🌟</Text>
            <View style={styles.goalsList}>
              {customGoals.map((g) => {
                const isCurrent = g.id === selectedGoalId;
                const goalSaved = profile.savingsByGoal[g.id] ?? 0;

                return (
                  <Pressable
                    key={g.id}
                    style={[
                      styles.goalItemCard,
                      isCurrent && styles.goalItemCardSelected,
                    ]}
                    onPress={() => selectGoal(g.id)}
                  >
                    <Text style={styles.goalItemIcon}>{g.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={styles.goalItemName}>{g.name}</Text>
                        <View style={styles.customTagBadge}>
                          <Text style={styles.customTagBadgeText}>Своя</Text>
                        </View>
                      </View>
                      <Text style={styles.goalItemCost}>
                        Накоплено: {goalSaved} / {g.cost} 🪙
                      </Text>
                    </View>

                    {isCurrent ? (
                      <View style={styles.activeGoalBadge}>
                        <Text style={styles.activeGoalBadgeText}>Выбрано ✓</Text>
                      </View>
                    ) : (
                      <Text style={styles.selectGoalText}>Выбрать →</Text>
                    )}

                    <Pressable
                      style={styles.actionIconBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        openCreateModal(g);
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>✏️</Text>
                    </Pressable>

                    <Pressable
                      style={styles.actionIconBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmGoal(g);
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>🗑️</Text>
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Catalog Goals Section */}
        <Text style={[styles.sectionTitle, { marginTop: customGoals.length > 0 ? spacing.lg : 0 }]}>
          Идеи из каталога 💡
        </Text>
        <View style={styles.goalsList}>
          {goals.map((g) => {
            const isCurrent = g.id === selectedGoalId;
            const goalSaved = profile.savingsByGoal[g.id] ?? 0;

            return (
              <Pressable
                key={g.id}
                style={[
                  styles.goalItemCard,
                  isCurrent && styles.goalItemCardSelected,
                ]}
                onPress={() => selectGoal(g.id)}
              >
                <Text style={styles.goalItemIcon}>{g.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalItemName}>{g.name}</Text>
                  <Text style={styles.goalItemCost}>
                    Накоплено: {goalSaved} / {g.cost} 🪙
                  </Text>
                </View>

                {isCurrent ? (
                  <View style={styles.activeGoalBadge}>
                    <Text style={styles.activeGoalBadgeText}>Выбрано ✓</Text>
                  </View>
                ) : (
                  <Text style={styles.selectGoalText}>Выбрать →</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Confirmation of Withdrawal Modal (ТЗ 2.5.7) */}
      <Modal
        visible={showWithdrawModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 44, marginBottom: 4 }}>🥺</Text>
            <Text style={styles.modalTitle}>Сколько монеток достать?</Text>
            <Text style={styles.modalDesc}>
              В копилке сейчас: <Text style={{ fontWeight: "800", color: "#B45309" }}>{savedAmount} 🪙</Text>
            </Text>

            {/* Stepper & input */}
            <View style={styles.withdrawInputRow}>
              <Pressable
                style={[styles.stepperBtn, parsedWithdraw <= 1 && styles.stepperBtnDisabled]}
                onPress={() => setWithdrawAmountText(String(Math.max(1, parsedWithdraw - 5)))}
                disabled={parsedWithdraw <= 1}
              >
                <Text style={styles.stepperBtnText}>-5</Text>
              </Pressable>

              <Pressable
                style={[styles.stepperBtn, parsedWithdraw <= 1 && styles.stepperBtnDisabled]}
                onPress={() => setWithdrawAmountText(String(Math.max(1, parsedWithdraw - 1)))}
                disabled={parsedWithdraw <= 1}
              >
                <Text style={styles.stepperBtnText}>-1</Text>
              </Pressable>

              <View style={styles.withdrawNumberBox}>
                <TextInput
                  style={styles.withdrawTextInput}
                  keyboardType="number-pad"
                  value={withdrawAmountText}
                  onChangeText={(t) => {
                    const clean = t.replace(/\D/g, "");
                    if (!clean) {
                      setWithdrawAmountText("");
                      return;
                    }
                    const val = Math.min(savedAmount, parseInt(clean, 10));
                    setWithdrawAmountText(String(val));
                  }}
                  maxLength={5}
                />
                <Text style={styles.withdrawCoinSuffix}>🪙</Text>
              </View>

              <Pressable
                style={[styles.stepperBtn, parsedWithdraw >= savedAmount && styles.stepperBtnDisabled]}
                onPress={() => setWithdrawAmountText(String(Math.min(savedAmount, parsedWithdraw + 1)))}
                disabled={parsedWithdraw >= savedAmount}
              >
                <Text style={styles.stepperBtnText}>+1</Text>
              </Pressable>

              <Pressable
                style={[styles.stepperBtn, parsedWithdraw >= savedAmount && styles.stepperBtnDisabled]}
                onPress={() => setWithdrawAmountText(String(Math.min(savedAmount, parsedWithdraw + 5)))}
                disabled={parsedWithdraw >= savedAmount}
              >
                <Text style={styles.stepperBtnText}>+5</Text>
              </Pressable>
            </View>

            {/* Quick Chips */}
            <View style={styles.withdrawChipsRow}>
              {savedAmount >= 10 && (
                <Pressable
                  style={[styles.withdrawChip, parsedWithdraw === 10 && styles.withdrawChipActive]}
                  onPress={() => setWithdrawAmountText("10")}
                >
                  <Text style={[styles.withdrawChipText, parsedWithdraw === 10 && styles.withdrawChipTextActive]}>
                    10 🪙
                  </Text>
                </Pressable>
              )}
              {savedAmount >= 25 && (
                <Pressable
                  style={[styles.withdrawChip, parsedWithdraw === 25 && styles.withdrawChipActive]}
                  onPress={() => setWithdrawAmountText("25")}
                >
                  <Text style={[styles.withdrawChipText, parsedWithdraw === 25 && styles.withdrawChipTextActive]}>
                    25 🪙
                  </Text>
                </Pressable>
              )}
              {savedAmount >= 50 && (
                <Pressable
                  style={[styles.withdrawChip, parsedWithdraw === 50 && styles.withdrawChipActive]}
                  onPress={() => setWithdrawAmountText("50")}
                >
                  <Text style={[styles.withdrawChipText, parsedWithdraw === 50 && styles.withdrawChipTextActive]}>
                    50 🪙
                  </Text>
                </Pressable>
              )}
              <Pressable
                style={[styles.withdrawChip, parsedWithdraw === savedAmount && styles.withdrawChipActive]}
                onPress={() => setWithdrawAmountText(String(savedAmount))}
              >
                <Text style={[styles.withdrawChipText, parsedWithdraw === savedAmount && styles.withdrawChipTextActive]}>
                  Всё ({savedAmount} 🪙)
                </Text>
              </Pressable>
            </View>

            <View style={styles.warningConsequenceBox}>
              <Text style={styles.consequenceTitle}>⚠️ Внимание! Изменение цели:</Text>
              <View style={styles.consequenceRow}>
                <Text style={styles.consequenceLabel}>В копилке:</Text>
                <Text style={styles.consequenceVal}>
                  Было {savedAmount} 🪙 → станет{" "}
                  <Text style={{ fontWeight: "900", color: "#DC2626" }}>{remainingInPiggy} 🪙</Text>
                </Text>
              </View>
              {daysBefore !== null && daysAfter !== null && (
                <View style={styles.consequenceRow}>
                  <Text style={styles.consequenceLabel}>Срок цели:</Text>
                  <Text style={styles.consequenceVal}>
                    Было ~{daysBefore} дн. → станет ~{daysAfter} дн.
                    <Text style={{ color: "#B45309", fontWeight: "700" }}> (+{daysDelayed} дн.)</Text>
                  </Text>
                </View>
              )}
              <Text style={styles.consequenceQuestion}>
                Точно достать {parsedWithdraw} монет из копилки?
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <DuoButton
                title="Оставить на мечту! 🐷"
                variant="primary"
                size="md"
                onPress={() => setShowWithdrawModal(false)}
                style={{ flex: 1.2 }}
              />
              <DuoButton
                title={`Да, достать ${parsedWithdraw} 🪙`}
                variant="secondary"
                size="md"
                onPress={handleConfirmWithdraw}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Create / Edit Custom Goal Modal */}
      <Modal
        visible={showGoalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createModalCard}>
            <View style={styles.createModalHeader}>
              <Text style={styles.createModalTitle}>
                {editingGoal ? "Изменить мечту ✏️" : "Придумай свою мечту! 🎯"}
              </Text>
              <Pressable
                style={styles.closeBtn}
                onPress={() => setShowGoalModal(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ width: "100%", maxHeight: 420 }}>
              <Text style={styles.fieldLabel}>На что ты мечтаешь накопить?</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Например: Ролики, LEGO, Наушники..."
                placeholderTextColor={colors.textMuted}
                value={goalName}
                onChangeText={setGoalName}
                maxLength={26}
              />

              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Выбери значок мечты:</Text>
              <View style={styles.emojiGrid}>
                {EMOJI_OPTIONS.map((emoji) => {
                  const isSelected = goalIcon === emoji;
                  return (
                    <Pressable
                      key={emoji}
                      style={[
                        styles.emojiCircleBtn,
                        isSelected && styles.emojiCircleBtnSelected,
                      ]}
                      onPress={() => setGoalIcon(emoji)}
                    >
                      <Text style={{ fontSize: 24 }}>{emoji}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Сколько нужно монеток (цена):</Text>
              <View style={styles.costInputRow}>
                <TextInput
                  style={[styles.textInput, styles.costInput]}
                  keyboardType="number-pad"
                  value={goalCost}
                  onChangeText={(t) => setGoalCost(t.replace(/\D/g, ""))}
                  maxLength={5}
                />
                <Text style={styles.costCoinSuffix}>🪙</Text>
              </View>

              <View style={styles.costChipsRow}>
                {COST_CHIPS.map((chip) => (
                  <Pressable
                    key={chip}
                    style={[
                      styles.costChip,
                      goalCost === String(chip) && styles.costChipSelected,
                    ]}
                    onPress={() => setGoalCost(String(chip))}
                  >
                    <Text
                      style={[
                        styles.costChipText,
                        goalCost === String(chip) && styles.costChipTextSelected,
                      ]}
                    >
                      {chip} 🪙
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.createModalButtons}>
              <DuoButton
                title={editingGoal ? "Сохранить изменения ✨" : "Начать копить на мечту! 🌟"}
                variant="primary"
                size="md"
                onPress={handleSaveGoal}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation of Goal Deletion Modal */}
      <Modal
        visible={!!deleteConfirmGoal}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmGoal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 44, marginBottom: 8 }}>🗑️</Text>
            <Text style={styles.modalTitle}>Удалить мечту?</Text>
            <Text style={styles.modalDesc}>
              Ты точно хочешь убрать цель{" "}
              <Text style={{ fontWeight: "800" }}>«{deleteConfirmGoal?.name}»</Text>?
            </Text>

            {deleteConfirmGoal && (profile.savingsByGoal[deleteConfirmGoal.id] ?? 0) > 0 && (
              <View style={styles.warningConsequenceBox}>
                <Text style={styles.consequenceText}>
                  🐷 В копилке этой цели лежит {profile.savingsByGoal[deleteConfirmGoal.id]} 🪙.
                  Монетки никуда не пропадут!
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <DuoButton
                title="Оставить мечту! 🌟"
                variant="primary"
                size="md"
                onPress={() => setDeleteConfirmGoal(null)}
                style={{ flex: 1.3 }}
              />
              <DuoButton
                title="Да, удалить"
                variant="secondary"
                size="md"
                onPress={handleConfirmDelete}
                style={{ flex: 0.9 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <BottomTabBar currentTab="savings" />
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
  toast: {
    backgroundColor: "#EFF8F1",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  toastText: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.primaryDark,
    textAlign: "center",
  },

  /* Hero Goal Card */
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 5,
    borderBottomColor: "#DCD5C6",
    gap: 12,
    marginBottom: spacing.lg,
  },
  goalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  goalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFBEB",
    borderWidth: 2,
    borderColor: "#F3C569",
    alignItems: "center",
    justifyContent: "center",
  },
  goalCategoryTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B45309",
    textTransform: "uppercase",
  },
  goalTitle: {
    fontSize: fonts.subtitle,
    fontWeight: "800",
    color: colors.text,
  },
  goalDesc: {
    fontSize: fonts.caption,
    color: colors.textMuted,
    marginTop: 2,
  },

  /* Progress */
  progressBox: {
    backgroundColor: "#FAF8F3",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  savedLabel: {
    fontSize: fonts.small,
    color: colors.textMuted,
  },
  savedNumber: {
    fontWeight: "800",
    color: colors.text,
  },
  percentText: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  barTrack: {
    height: 12,
    backgroundColor: "#E5DFD1",
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  estimateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  estimateIcon: {
    fontSize: 16,
  },
  estimateText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    lineHeight: 16,
  },

  /* Deposit */
  depositHeader: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
    marginTop: 4,
  },
  depositButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  withdrawLink: {
    alignItems: "center",
    paddingVertical: 6,
    marginTop: 4,
  },
  withdrawLinkText: {
    fontSize: fonts.caption,
    fontWeight: "700",
    color: "#B45309",
  },

  /* Goal Completed Box */
  goalCompletedBox: {
    backgroundColor: "#DCFCE7",
    borderColor: "#22C55E",
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: 6,
  },
  goalCompletedTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: "#15803D",
  },
  goalCompletedDesc: {
    fontSize: fonts.small,
    color: "#166534",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },

  /* Withdraw Modal Inputs & Chips */
  withdrawInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginVertical: 12,
  },
  stepperBtn: {
    backgroundColor: "#F3F4F6",
    borderRadius: radius.md,
    paddingHorizontal: 12,
    minHeight: 48,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperBtnText: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  withdrawNumberBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    height: 48,
  },
  withdrawTextInput: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    minWidth: 44,
  },
  withdrawCoinSuffix: {
    fontSize: 18,
    marginLeft: 4,
  },
  withdrawChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  withdrawChip: {
    paddingHorizontal: 12,
    minHeight: 40,
    justifyContent: "center",
    borderRadius: radius.pill,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: colors.border,
  },
  withdrawChipActive: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  withdrawChipText: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.textMuted,
  },
  withdrawChipTextActive: {
    color: "#78350F",
    fontWeight: "800",
  },

  /* Goals List */
  sectionTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  goalsList: {
    gap: 10,
  },
  goalItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderBottomWidth: 3,
    borderBottomColor: "#DDD7C8",
    gap: 12,
  },
  goalItemCardSelected: {
    borderColor: colors.primary,
    borderBottomColor: colors.primaryDark,
    backgroundColor: colors.cardSelected,
  },
  goalItemIcon: {
    fontSize: 28,
  },
  goalItemName: {
    fontSize: fonts.body,
    fontWeight: "700",
    color: colors.text,
  },
  goalItemCost: {
    fontSize: fonts.caption,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 2,
  },
  activeGoalBadge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeGoalBadgeText: {
    fontSize: fonts.caption,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  selectGoalText: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.primaryDark,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: fonts.title,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  modalDesc: {
    fontSize: fonts.body,
    color: colors.text,
    textAlign: "center",
    marginVertical: 8,
    lineHeight: 20,
  },
  warningConsequenceBox: {
    backgroundColor: "#FFFBEB",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: "#FCD34D",
    marginVertical: spacing.md,
    width: "100%",
  },
  consequenceText: {
    fontSize: fonts.small,
    fontWeight: "600",
    color: "#B45309",
    textAlign: "center",
    lineHeight: 18,
  },
  consequenceTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#B45309",
    marginBottom: 6,
    textAlign: "center",
  },
  consequenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 2,
  },
  consequenceLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "700",
  },
  consequenceVal: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "700",
  },
  consequenceQuestion: {
    fontSize: 12,
    fontWeight: "900",
    color: "#92400E",
    marginTop: 8,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },

  /* Edit button on Hero Card */
  editHeroGoalBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#F3E8FF",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#D8B4FE",
  },
  editHeroGoalBtnText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7E22CE",
  },

  /* Custom Goal Banner */
  customGoalBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: "#F59E0B",
    borderBottomWidth: 4,
    borderBottomColor: "#D97706",
    gap: 12,
    marginBottom: spacing.lg,
  },
  customGoalBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  customGoalBannerTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: "#78350F",
  },
  customGoalBannerDesc: {
    fontSize: fonts.caption,
    color: "#92400E",
    marginTop: 2,
    lineHeight: 16,
  },

  /* Custom goal badges and actions in list */
  customTagBadge: {
    backgroundColor: "#F3E8FF",
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  customTagBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#7E22CE",
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: radius.sm,
    backgroundColor: "#F3F4F6",
  },

  /* Create / Edit Modal */
  createModalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 420,
    borderWidth: 2,
    borderColor: colors.border,
  },
  createModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  createModalTitle: {
    fontSize: fonts.subtitle,
    fontWeight: "800",
    color: colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textMuted,
  },
  fieldLabel: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: "#FAF8F3",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: fonts.body,
    color: colors.text,
    fontWeight: "600",
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  emojiCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FAF8F3",
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiCircleBtnSelected: {
    borderColor: "#F59E0B",
    backgroundColor: "#FEF3C7",
    borderWidth: 2.5,
    transform: [{ scale: 1.1 }],
  },
  costInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  costInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  costCoinSuffix: {
    fontSize: 24,
  },
  costChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  costChip: {
    backgroundColor: "#FAF8F3",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  costChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  costChipText: {
    fontSize: fonts.caption,
    fontWeight: "700",
    color: colors.textMuted,
  },
  costChipTextSelected: {
    color: colors.primaryDark,
  },
  createModalButtons: {
    marginTop: spacing.md,
  },
});