import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "../theme";

interface DiplomaModalProps {
  visible: boolean;
  onClose: () => void;
  childName?: string;
  petName?: string;
  completedTasksCount: number;
  savingsTotal: number;
  achievementsCount: number;
}

export function DiplomaModal({
  visible,
  onClose,
  childName = "Юный финансист",
  petName = "Финни",
  completedTasksCount,
  savingsTotal,
  achievementsCount,
}: DiplomaModalProps) {
  const currentDate = new Date().toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header with close button */}
          <View style={styles.topBar}>
            <Text style={styles.topBarTitle}>Сертификат достижений</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Diploma Certificate Paper */}
            <View style={styles.diplomaSheet}>
              {/* Ornate Inner Border */}
              <View style={styles.innerBorder}>
                {/* Emblem */}
                <View style={styles.emblemWrap}>
                  <Text style={styles.emblemIcon}>🏛️</Text>
                  <Text style={styles.orgText}>ДЕПАРТАМЕНТ ФИНАНСОВ ГОРОДА МОСКВЫ</Text>
                  <Text style={styles.subOrgText}>Программа финансовой грамотности для детей</Text>
                </View>

                {/* Main Heading */}
                <View style={styles.titleWrap}>
                  <Text style={styles.diplomaTitle}>ДИПЛОМ</Text>
                  <Text style={styles.diplomaSubtitle}>ЮНОГО ФИНАНСИСТА МОСКВЫ</Text>
                </View>

                {/* Recipient */}
                <View style={styles.recipientWrap}>
                  <Text style={styles.awardedTo}>Настоящим подтверждается, что</Text>
                  <Text style={styles.recipientName}>{childName}</Text>
                  <Text style={styles.petCompanion}>вместе со своим питомцем по имени «{petName}»</Text>
                </View>

                {/* Achievements description */}
                <Text style={styles.diplomaBody}>
                  успешно освоил(а) основы управления личными финансами, принципы планирования
                  бюджета по правилу «Трёх конвертов» и безопасного использования платежей в
                  городской среде Москвы.
                </Text>

                {/* Competencies Badges */}
                <View style={styles.competenciesBox}>
                  <Text style={styles.competenciesHeading}>Освоенные компетенции (ФК-1 — ФК-5):</Text>
                  <View style={styles.competencyItem}>
                    <Text style={styles.compCheck}>✓</Text>
                    <Text style={styles.compLabel}>ФК-1: Карманные деньги и планирование доходов</Text>
                  </View>
                  <View style={styles.competencyItem}>
                    <Text style={styles.compCheck}>✓</Text>
                    <Text style={styles.compLabel}>ФК-2: Различение «Надо» и «Хочу», покупка по списку</Text>
                  </View>
                  <View style={styles.competencyItem}>
                    <Text style={styles.compCheck}>✓</Text>
                    <Text style={styles.compLabel}>ФК-3: Копилка и достижение финансовой цели</Text>
                  </View>
                  <View style={styles.competencyItem}>
                    <Text style={styles.compCheck}>✓</Text>
                    <Text style={styles.compLabel}>ФК-4: Безопасность (карта «Тройка», проверка чека)</Text>
                  </View>
                </View>

                {/* Key stats row */}
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statVal}>{completedTasksCount}</Text>
                    <Text style={styles.statLbl}>Заданий</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statVal}>{savingsTotal} ₽</Text>
                    <Text style={styles.statLbl}>Накоплено</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statVal}>{achievementsCount}</Text>
                    <Text style={styles.statLbl}>Медалей</Text>
                  </View>
                </View>

                {/* Seal and Signature */}
                <View style={styles.footerRow}>
                  <View style={styles.dateWrap}>
                    <Text style={styles.footerLabel}>Дата выдачи:</Text>
                    <Text style={styles.footerVal}>{currentDate}</Text>
                  </View>

                  <View style={styles.sealWrap}>
                    <Text style={styles.sealIcon}>🎖️</Text>
                    <Text style={styles.sealText}>Официальная печать программы</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <Pressable style={styles.printButton} onPress={onClose}>
              <Text style={styles.printButtonText}>✨ Сохранить и гордиться!</Text>
            </Pressable>
          </ScrollView>
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
    maxWidth: 520,
    maxHeight: "90%",
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.border,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    backgroundColor: "#FFFFFF",
  },
  topBarTitle: {
    fontSize: fonts.subtitle,
    fontWeight: "800",
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  scrollContent: {
    padding: 16,
  },
  diplomaSheet: {
    backgroundColor: "#FFFDF9",
    borderRadius: radius.lg,
    padding: 8,
    borderWidth: 3,
    borderColor: "#D4AF37", // Gold
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  innerBorder: {
    borderWidth: 1.5,
    borderColor: "#E5C882",
    borderRadius: radius.md,
    padding: 16,
    alignItems: "center",
  },
  emblemWrap: {
    alignItems: "center",
    marginBottom: 12,
  },
  emblemIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  orgText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#854D0E",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subOrgText: {
    fontSize: 10,
    color: "#A16207",
    textAlign: "center",
    marginTop: 2,
  },
  titleWrap: {
    alignItems: "center",
    marginVertical: 10,
  },
  diplomaTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#92400E",
    letterSpacing: 2,
  },
  diplomaSubtitle: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryDark,
    letterSpacing: 1,
    marginTop: 2,
  },
  recipientWrap: {
    alignItems: "center",
    marginVertical: 8,
  },
  awardedTo: {
    fontSize: 12,
    color: colors.textMuted,
  },
  recipientName: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    marginVertical: 4,
    textDecorationLine: "underline",
    textDecorationColor: "#D4AF37",
  },
  petCompanion: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: "600",
  },
  diplomaBody: {
    fontSize: 12,
    color: colors.text,
    textAlign: "center",
    lineHeight: 18,
    marginVertical: 10,
  },
  competenciesBox: {
    width: "100%",
    backgroundColor: "#F8FAF5",
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#E2EBD8",
    marginVertical: 8,
  },
  competenciesHeading: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primaryDark,
    marginBottom: 6,
  },
  competencyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 2,
  },
  compCheck: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "800",
  },
  compLabel: {
    fontSize: 11,
    color: colors.text,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E0D3",
  },
  statBox: {
    alignItems: "center",
  },
  statVal: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  statLbl: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  dateWrap: {
    alignItems: "flex-start",
  },
  footerLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  footerVal: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.text,
  },
  sealWrap: {
    alignItems: "center",
  },
  sealIcon: {
    fontSize: 28,
  },
  sealText: {
    fontSize: 8,
    color: "#854D0E",
    fontWeight: "700",
  },
  printButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  printButtonText: {
    color: "#FFFFFF",
    fontSize: fonts.body,
    fontWeight: "800",
  },
});
