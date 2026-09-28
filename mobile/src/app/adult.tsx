import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { DiplomaModal } from "../components/DiplomaModal";
import { DuoButton } from "../components/DuoButton";
import { growthStageLabels } from "../content/pets";
import { tasks, taskUnits } from "../content/tasks";
import { completedCount } from "../domain/period";
import { useStore } from "../store/store";
import { colors, fonts, radius, spacing, touchTarget } from "../theme";

const CHALLENGE_QUESTION = "8 × 7 = ?";
const CHALLENGE_ANSWER = 56;

const COMPETENCY_GROUPS = [
  {
    prefix: "ФК-1",
    title: "ФК-1: Карманные деньги и планирование",
    desc: "Источники дохода семьи, карманные деньги и распределение по конвертам",
  },
  {
    prefix: "ФК-2",
    title: "ФК-2: Осознанные траты («Надо» и «Хочу»)",
    desc: "Покупки по списку, здоровый выбор и отказ от импульсивных трат",
  },
  {
    prefix: "ФК-3",
    title: "ФК-3: Сбережения и большая мечта",
    desc: "Регулярное пополнение копилки, целеполагание и подушка безопасности",
  },
  {
    prefix: "ФК-4",
    title: "ФК-4: Безопасность и платежи в городе",
    desc: "Карта «Тройка», проверка чека и подсчёт сдачи на кассе",
  },
  {
    prefix: "ФК-5",
    title: "ФК-5: Финансовая среда Москвы",
    desc: "Столичная городская среда (ВДНХ, Зарядье) и бережливое потребление",
  },
];

export default function Adult() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const resetProfile = useStore((s) => s.resetProfile);
  const deleteProfile = useStore((s) => s.deleteProfile);
  const toggleDemoMode = useStore((s) => s.toggleDemoMode);
  const soundEnabled = useStore((s) => s.soundEnabled);
  const toggleSound = useStore((s) => s.toggleSound);
  const animationsEnabled = useStore((s) => s.animationsEnabled);
  const toggleAnimations = useStore((s) => s.toggleAnimations);

  const [inputAnswer, setInputAnswer] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [bonusToast, setBonusToast] = useState<string | null>(null);
  const [showDiploma, setShowDiploma] = useState(false);

  if (!profile) return null;

  const handleUnlock = () => {
    if (Number(inputAnswer.trim()) === CHALLENGE_ANSWER) {
      setUnlocked(true);
    } else {
      Alert.alert("Неверный ответ", "Пожалуйста, решите математический пример для подтверждения возраста.");
    }
  };

  const handleGrantAllowance = (amount: number) => {
    useStore.setState((state) => {
      if (!state.profile) return state;
      return {
        ...state,
        profile: {
          ...state.profile,
          balance: state.profile.balance + amount,
        },
        lastFeedback: [`Родитель начислил карманные деньги: +${amount} монет!`],
      };
    });
    setBonusToast(`Начислено ${amount} монет на баланс ребёнка! 🪙`);
    setTimeout(() => setBonusToast(null), 3500);
  };

  const confirmReset = () => {
    Alert.alert(
      "Сбросить тестовый профиль?",
      "Профиль будет возвращен к исходному состоянию (100 монет, 1-й период) для повторного прохождения сценария проверки.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Сбросить к началу",
          style: "destructive",
          onPress: () => {
            resetProfile();
            router.replace("/home");
          },
        },
      ]
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      "Удалить все данные?",
      "Локальный игровой профиль и история будут удалены с устройства без возможности восстановления.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить профиль",
          style: "destructive",
          onPress: () => {
            deleteProfile();
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  const completedTaskIds = new Set(profile.completedTasks.map((t) => t.taskId));
  const completedPeriods = completedCount(profile);
  const totalSavings = Object.values(profile.periods).reduce((sum, p) => sum + (p.savingsAdded || 0), 0);
  const achievementsCount = profile.unlockedAchievementIds?.length ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>‹ Назад</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Родительский уголок</Text>
        <View style={{ width: 60 }} />
      </View>

      {!unlocked ? (
        /* Math Barrier Screen */
        <View style={styles.gateContainer}>
          <Text style={styles.gateIcon}>🔒</Text>
          <Text style={styles.gateTitle}>Вход для взрослых</Text>
          <Text style={styles.gateDesc}>
            Решите простой арифметический пример, чтобы подтвердить возраст:
          </Text>

          <View style={styles.challengeBox}>
            <Text style={styles.challengeText}>{CHALLENGE_QUESTION}</Text>
          </View>

          <TextInput
            style={styles.gateInput}
            value={inputAnswer}
            onChangeText={setInputAnswer}
            placeholder="Введи ответ"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={4}
          />

          <DuoButton
            title="Войти в раздел"
            variant="primary"
            size="lg"
            disabled={inputAnswer.trim().length === 0}
            onPress={handleUnlock}
          />
        </View>
      ) : (
        /* Parent Dashboard */
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {bonusToast && (
            <View style={styles.toast}>
              <Text style={styles.toastText}>{bonusToast}</Text>
            </View>
          )}

          {/* Educational Purpose Card (ТЗ 2.5.12) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎯 Просветительские цели</Text>
            <Text style={styles.cardText}>
              Приложение формирует у ребёнка 7–11 лет практические навыки обращения с личными финансами: понимание разницы между обязательным («Надо») и желаемым («Хочу»), планирование бюджета на игровой день по 3 конвертам и дисциплину накоплений без страха ошибки.
            </Text>
          </View>

          {/* Child Progress Summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Прогресс ребёнка</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statNum}>{profile.completedTasks.length}</Text>
                <Text style={styles.statLbl}>Уроков пройдено</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statNum}>{completedPeriods}</Text>
                <Text style={styles.statLbl}>Дней прожито</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statNum}>
                  {growthStageLabels[profile.pet.growthStage]}
                </Text>
                <Text style={styles.statLbl}>Возраст питомца</Text>
              </View>
            </View>
          </View>

          {/* Moscow Junior Financier Diploma (Департамент финансов г. Москвы) */}
          <View style={[styles.card, styles.diplomaCard]}>
            <View style={styles.diplomaHeader}>
              <Text style={styles.diplomaHeaderIcon}>📜</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.diplomaCardTitle}>Диплом юного финансиста Москвы</Text>
                <Text style={styles.diplomaCardSub}>
                  Официальный сертификат Департамента финансов г. Москвы
                </Text>
              </View>
            </View>
            <Text style={styles.cardText}>
              Подтверждает успешное освоение финансовой грамотности, накопления и заботу о питомце. Можно просмотреть и сохранить!
            </Text>
            <DuoButton
              title="Открыть диплом 🎖️"
              variant="primary"
              size="md"
              onPress={() => setShowDiploma(true)}
            />
          </View>

          {/* Units Progress */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📚 Освоенные темы</Text>
            <View style={{ gap: 8, marginTop: 4 }}>
              {taskUnits.map((unit) => {
                const unitTasks = tasks.filter((t) => t.unitId === unit.id);
                const done = unitTasks.filter((t) => completedTaskIds.has(t.id)).length;
                const pct = (done / unitTasks.length) * 100;

                return (
                  <View key={unit.id} style={styles.unitRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.unitName}>{unit.title}</Text>
                      <Text style={styles.unitStats}>
                        {done} из {unitTasks.length} уроков
                      </Text>
                    </View>
                    <View style={styles.unitProgressWrap}>
                      <View style={styles.unitProgressBar}>
                        <View style={[styles.unitProgressFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={styles.unitPctText}>{Math.round(pct)}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Competency Framework (ФК-1 - ФК-5) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🏛️ Единая рамка компетенций (ФК-1 — ФК-5)</Text>
            <Text style={styles.cardText}>
              Соответствие стандарту финансовой грамотности Департамента финансов города Москвы:
            </Text>
            <View style={{ gap: 10, marginTop: 6 }}>
              {COMPETENCY_GROUPS.map((group) => {
                const groupTasks = tasks.filter((t) => t.competencyCode?.startsWith(group.prefix));
                const done = groupTasks.filter((t) => completedTaskIds.has(t.id)).length;
                const total = groupTasks.length || 1;
                const pct = Math.round((done / total) * 100);

                return (
                  <View key={group.prefix} style={styles.compGroupRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.compGroupTitle}>{group.title}</Text>
                      <Text style={styles.compGroupDesc}>{group.desc}</Text>
                      <Text style={styles.unitStats}>
                        {done} из {groupTasks.length} навыков освоено
                      </Text>
                    </View>
                    <View style={styles.unitProgressWrap}>
                      <View style={styles.unitProgressBar}>
                        <View style={[styles.unitProgressFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={styles.unitPctText}>{pct}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Safety & Compliance Card (ТЗ 2.5.11, 2.5.12) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🛡️ Безопасность и приватность</Text>
            <Text style={styles.cardText}>
              • 100% Офлайн: все данные хранятся исключительно на этом устройстве.{"\n"}
              • Без реальных денег: только учебные игровые монетки (🪙).{"\n"}
              • Без рекламы и подписок: безопасная среда для ребёнка.{"\n"}
              • Без сбора персональных данных: имя питомца и прогресс локальны.
            </Text>
          </View>

          {/* Parental Allowance / Bonus (ТЗ 2.5.12) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🪙 Подарить карманные деньги</Text>
            <Text style={styles.cardText}>
              Поощрите ребёнка за помощь по дому или успехи в учёбе:
            </Text>
            <View style={styles.allowanceRow}>
              <DuoButton
                title="+20 🪙"
                variant="accent"
                size="sm"
                fullWidth={false}
                style={{ flex: 1 }}
                onPress={() => handleGrantAllowance(20)}
              />
              <DuoButton
                title="+50 🪙"
                variant="accent"
                size="sm"
                fullWidth={false}
                style={{ flex: 1 }}
                onPress={() => handleGrantAllowance(50)}
              />
              <DuoButton
                title="+100 🪙"
                variant="accent"
                size="sm"
                fullWidth={false}
                style={{ flex: 1.2 }}
                onPress={() => handleGrantAllowance(100)}
              />
            </View>
          </View>

          {/* Accessibility & Sound Settings (ТЗ 3.6) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔊 Звуки и анимации (ТЗ 3.6)</Text>
            <Text style={styles.cardText}>
              По требованиям ТЗ звуки и анимации можно отключить; критически важная информация не передается только звуком.
            </Text>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Звуковые эффекты</Text>
                <Text style={styles.toggleDesc}>
                  Звон монет, щелчки и победные фанфары (Web Audio API)
                </Text>
              </View>
              <Pressable
                style={[
                  styles.toggleBtn,
                  soundEnabled ? styles.toggleBtnOn : styles.toggleBtnOff,
                ]}
                onPress={toggleSound}
              >
                <Text style={styles.toggleBtnText}>
                  {soundEnabled ? "ВКЛ" : "ВЫКЛ"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Анимации и конфетти</Text>
                <Text style={styles.toggleDesc}>
                  Праздничные всплески конфетти при победе в уроке
                </Text>
              </View>
              <Pressable
                style={[
                  styles.toggleBtn,
                  animationsEnabled ? styles.toggleBtnOn : styles.toggleBtnOff,
                ]}
                onPress={toggleAnimations}
              >
                <Text style={styles.toggleBtnText}>
                  {animationsEnabled ? "ВКЛ" : "ВЫКЛ"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Demo Mode & Test Profile Controls (ТЗ Приложение А, шаг 12) */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🧪 Режим проверки экспертами</Text>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Демонстрационный режим</Text>
                <Text style={styles.toggleDesc}>
                  Убирает ожидание таймеров и открывает все задания сразу
                </Text>
              </View>
              <Pressable
                style={[
                  styles.toggleBtn,
                  profile.demoMode ? styles.toggleBtnOn : styles.toggleBtnOff,
                ]}
                onPress={toggleDemoMode}
              >
                <Text style={styles.toggleBtnText}>
                  {profile.demoMode ? "ВКЛ" : "ВЫКЛ"}
                </Text>
              </Pressable>
            </View>

            <View style={{ gap: 10, marginTop: 12 }}>
              <DuoButton
                title="Сбросить тестовый профиль ↺"
                variant="secondary"
                size="md"
                onPress={confirmReset}
              />
              <DuoButton
                title="Удалить профиль с устройства 🗑️"
                variant="danger"
                size="md"
                onPress={confirmDelete}
              />
            </View>
          </View>
        </ScrollView>
      )}

      {/* Official Moscow Junior Financier Diploma Modal */}
      <DiplomaModal
        visible={showDiploma}
        onClose={() => setShowDiploma(false)}
        childName={profile.pet.name ? `Друг ${profile.pet.name}` : "Юный финансист Москвы"}
        petName={profile.pet.name}
        completedTasksCount={profile.completedTasks.length}
        savingsTotal={totalSavings}
        achievementsCount={achievementsCount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 60,
  },
  backBtnText: {
    fontSize: fonts.body,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  headerTitle: {
    fontSize: fonts.subtitle,
    fontWeight: "800",
    color: colors.text,
  },
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 32,
    gap: 12,
  },
  toast: {
    backgroundColor: "#EFF8F1",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  toastText: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.primaryDark,
    textAlign: "center",
  },

  /* Gate */
  gateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: 12,
  },
  gateIcon: {
    fontSize: 52,
    marginBottom: 4,
  },
  gateTitle: {
    fontSize: fonts.title,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  gateDesc: {
    fontSize: fonts.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  challengeBox: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    marginVertical: 4,
  },
  challengeText: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  gateInput: {
    width: "100%",
    height: touchTarget,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    fontSize: fonts.title,
    fontWeight: "800",
    textAlign: "center",
    color: colors.text,
    marginBottom: 8,
  },

  /* Dashboard Cards */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: "#DCD5C6",
    gap: 8,
  },
  cardTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: colors.text,
  },
  cardText: {
    fontSize: fonts.small,
    color: colors.textMuted,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  statCell: {
    flex: 1,
    backgroundColor: "#FAF8F3",
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNum: {
    fontSize: fonts.subtitle,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  statLbl: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: "center",
  },

  /* Unit list */
  unitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F2EDE4",
  },
  unitName: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.text,
  },
  unitStats: {
    fontSize: 11,
    color: colors.textMuted,
  },
  unitProgressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 100,
  },
  unitProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#E8E2D5",
    borderRadius: 4,
    overflow: "hidden",
  },
  unitProgressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  unitPctText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMuted,
    width: 32,
    textAlign: "right",
  },

  /* Allowance */
  allowanceRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },

  /* Toggle Row */
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.text,
  },
  toggleDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  toggleBtnOn: {
    backgroundColor: colors.primary,
  },
  toggleBtnOff: {
    backgroundColor: "#DCD5C6",
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  /* Diploma Card Styles */
  diplomaCard: {
    backgroundColor: "#FFFDF9",
    borderColor: "#E5C882",
    borderBottomColor: "#D4AF37",
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  diplomaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  diplomaHeaderIcon: {
    fontSize: 32,
  },
  diplomaCardTitle: {
    fontSize: fonts.body,
    fontWeight: "800",
    color: "#92400E",
  },
  diplomaCardSub: {
    fontSize: 11,
    fontWeight: "600",
    color: "#A16207",
    marginTop: 2,
  },
  /* Competency Group Styles */
  compGroupRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F2EDE4",
    gap: 8,
  },
  compGroupTitle: {
    fontSize: fonts.small,
    fontWeight: "700",
    color: colors.text,
  },
  compGroupDesc: {
    fontSize: 10,
    color: colors.textMuted,
    marginVertical: 2,
  },
});