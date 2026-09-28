import { useState } from "react";
import {
  Modal,
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
import type { ShopItem } from "../content/types";
import { useStore } from "../store/store";
import { colors, fonts, radius, spacing } from "../theme";

export default function Shop() {
  const profile = useStore((s) => s.profile);
  const buyItem = useStore((s) => s.buyItem);

  const [categoryFilter, setCategoryFilter] = useState<"all" | "mandatory" | "optional">("all");
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!profile) return null;

  const filteredItems = shopItems.filter((i) => {
    if (categoryFilter === "all") return true;
    return i.type === categoryFilter;
  });

  const handleConfirmPurchase = () => {
    if (!selectedItem) return;
    const res = buyItem(selectedItem.id);
    if (!res.ok) {
      setErrorModal(
        res.reason ?? `Ой, в кошельке маловато монеток! Сыграй в весёлый урок или выбери что-то подешевле.`
      );
    } else {
      setSuccessNotice(`Ура! ${selectedItem.name} куплен для ${profile.pet.name}! 🎉`);
      setTimeout(() => setSuccessNotice(null), 3500);
    }
    setSelectedItem(null);
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
          <Text style={styles.title}>Лавка вкусностей и радостей 🛒</Text>
          <Text style={styles.subtitle}>
            Покупай вкусную еду и весёлые игрушки для {profile.pet.name}!
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          <Pressable
            style={[
              styles.filterTab,
              categoryFilter === "all" && styles.filterTabActive,
            ]}
            onPress={() => setCategoryFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                categoryFilter === "all" && styles.filterTextActive,
              ]}
            >
              Всё ({shopItems.length})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterTab,
              categoryFilter === "mandatory" && styles.filterTabActive,
            ]}
            onPress={() => setCategoryFilter("mandatory")}
          >
            <Text
              style={[
                styles.filterText,
                categoryFilter === "mandatory" && styles.filterTextActive,
              ]}
            >
              🥣 Надо (Обед)
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterTab,
              categoryFilter === "optional" && styles.filterTabActive,
            ]}
            onPress={() => setCategoryFilter("optional")}
          >
            <Text
              style={[
                styles.filterText,
                categoryFilter === "optional" && styles.filterTextActive,
              ]}
            >
              🎮 Хочу (Игры)
            </Text>
          </Pressable>
        </View>

        {/* Success Toast */}
        {successNotice && (
          <View style={styles.successToast}>
            <Text style={styles.successToastText}>{successNotice}</Text>
          </View>
        )}

        {/* Grid of Items */}
        <View style={styles.itemsGrid}>
          {filteredItems.map((item) => {
            const isAffordable = profile.balance >= item.price;
            const isMandatory = item.type === "mandatory";

            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  isMandatory ? styles.itemCardMandatory : styles.itemCardOptional,
                ]}
              >
                <View style={styles.itemBadgeRow}>
                  <View
                    style={[
                      styles.typeBadge,
                      isMandatory ? styles.typeBadgeMandatory : styles.typeBadgeOptional,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        isMandatory
                          ? styles.typeBadgeTextMandatory
                          : styles.typeBadgeTextOptional,
                      ]}
                    >
                      {isMandatory ? "🥣 Надо" : "🎮 Хочу"}
                    </Text>
                  </View>

                  <View style={styles.pricePill}>
                    <Text style={styles.priceText}>{item.price} 🪙</Text>
                  </View>
                </View>

                {/* Icon & Name */}
                <Text style={styles.itemIcon}>{item.icon ?? "🎁"}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemHint}>{item.hint}</Text>

                {/* Impact Pills */}
                <View style={styles.impactRow}>
                  {item.impact.satiety > 0 && (
                    <View style={styles.impactPill}>
                      <Text style={styles.impactPillText}>
                        +{item.impact.satiety} сытость 🥣
                      </Text>
                    </View>
                  )}
                  {item.impact.mood > 0 && (
                    <View style={[styles.impactPill, styles.impactPillMood]}>
                      <Text style={[styles.impactPillText, styles.impactPillMoodText]}>
                        +{item.impact.mood} радость 💖
                      </Text>
                    </View>
                  )}
                </View>

                {/* Buy Button */}
                <DuoButton
                  title={isAffordable ? "Купить ✨" : "Мало монет 🪙"}
                  variant={isAffordable ? (isMandatory ? "primary" : "accent") : "secondary"}
                  size="sm"
                  onPress={() => {
                    if (!isAffordable) {
                      const remaining = item.price - profile.balance;
                      setErrorModal(
                        `Тебе не хватает ещё ${remaining} 🪙 для покупки «${item.name}».`
                      );
                      return;
                    }
                    setSelectedItem(item);
                  }}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>{selectedItem?.icon ?? "🎁"}</Text>
            <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
            <Text style={styles.modalPrice}>Цена: {selectedItem?.price} монеток 🪙</Text>

            <View style={styles.modalImpactBox}>
              <Text style={styles.modalImpactTitle}>Как обрадуется {profile.pet.name}:</Text>
              {selectedItem?.impact.satiety ? (
                <Text style={styles.modalImpactText}>
                  🥣 Сытость вырастет на +{selectedItem.impact.satiety}
                </Text>
              ) : null}
              {selectedItem?.impact.mood ? (
                <Text style={styles.modalImpactText}>
                  💖 Настроение поднимется на +{selectedItem.impact.mood}
                </Text>
              ) : null}
              <Text style={styles.modalBalanceHint}>
                В кошельке останется: {profile.balance - (selectedItem?.price ?? 0)} 🪙
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <DuoButton
                title="Подумать"
                variant="secondary"
                size="md"
                onPress={() => setSelectedItem(null)}
                style={{ flex: 1 }}
              />
              <DuoButton
                title="Беру! 🎁"
                variant="primary"
                size="md"
                onPress={handleConfirmPurchase}
                style={{ flex: 1.2 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Insufficient Funds / Safe Error Modal (ТЗ 2.5.6) */}
      <Modal
        visible={!!errorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>💡</Text>
            <Text style={styles.modalTitle}>Ой, в кошельке маловато монеток!</Text>
            <Text style={styles.errorModalDesc}>{errorModal}</Text>

            <View style={styles.adviceBox}>
              <Text style={styles.adviceTitle}>Что советует Мудрая Сова:</Text>
              <Text style={styles.adviceItem}>1. Сыграй в весёлый урок на карте (+15-30 🪙)</Text>
              <Text style={styles.adviceItem}>2. Дождись завтрашних карманных денег ☀️</Text>
              <Text style={styles.adviceItem}>3. Или выбери что-то подешевле прямо сейчас!</Text>
            </View>

            <DuoButton
              title="Понятно, побежал учиться! 🚀"
              variant="primary"
              size="md"
              onPress={() => setErrorModal(null)}
            />
          </View>
        </View>
      </Modal>

      <BottomTabBar currentTab="shop" />
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
  },

  /* Filters */
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: spacing.md,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.textMuted,
  },
  filterTextActive: {
    color: colors.primaryDark,
  },

  /* Success Toast */
  successToast: {
    backgroundColor: "#EFF8F1",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  successToastText: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.primaryDark,
    textAlign: "center",
  },

  /* Items Grid */
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  itemCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: "#DCD5C6",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 220,
    gap: 4,
  },
  itemCardMandatory: {
    borderColor: "#CCE8D2",
  },
  itemCardOptional: {
    borderColor: "#E3D5FD",
  },
  itemBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeMandatory: {
    backgroundColor: "#E6F4EA",
  },
  typeBadgeOptional: {
    backgroundColor: "#F3E8FF",
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  typeBadgeTextMandatory: {
    color: colors.primaryDark,
  },
  typeBadgeTextOptional: {
    color: "#7E22CE",
  },
  pricePill: {
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "#F3C569",
  },
  priceText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#B45309",
  },
  itemIcon: {
    fontSize: 40,
    marginVertical: 4,
  },
  itemName: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  itemHint: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 4,
  },
  impactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    justifyContent: "center",
    marginBottom: 8,
  },
  impactPill: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  impactPillText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#1B5E20",
  },
  impactPillMood: {
    backgroundColor: "#FFF3E0",
  },
  impactPillMoodText: {
    color: "#E65100",
  },

  /* Modals */
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
  modalIcon: {
    fontSize: 52,
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: fonts.title,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  modalPrice: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: "#B45309",
    marginTop: 2,
  },
  modalImpactBox: {
    backgroundColor: "#FAF8F3",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    width: "100%",
    marginVertical: spacing.md,
    gap: 4,
  },
  modalImpactTitle: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  modalImpactText: {
    fontSize: fonts.small,
    color: colors.text,
  },
  modalBalanceHint: {
    fontSize: fonts.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  errorModalDesc: {
    fontSize: fonts.body,
    color: colors.text,
    textAlign: "center",
    lineHeight: 20,
    marginVertical: 6,
  },
  adviceBox: {
    backgroundColor: "#FFFBEB",
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: "#FCD34D",
    padding: spacing.md,
    width: "100%",
    marginVertical: spacing.md,
    gap: 4,
  },
  adviceTitle: {
    fontSize: fonts.small,
    fontWeight: "800",
    color: "#B45309",
    marginBottom: 2,
  },
  adviceItem: {
    fontSize: fonts.caption,
    color: "#78350F",
    lineHeight: 16,
  },
});