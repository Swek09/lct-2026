import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  BudgetPlan,
  Goal,
  GrowthStage,
  PetCustomization,
  Profile,
  TaskResult,
} from "../domain/types";
import { START_BUDGET, planWasOnTrack, spendIfAffordable } from "../domain/economy";
import {
  applyImpact,
  clamp,
  computeGrowthStage,
  createPet,
  defaultExpenseImpact,
  explainStageChange,
  withoutMandatoryImpact,
} from "../domain/pet";
import { canFinishPeriod, createPeriod, shiftToNextPeriod } from "../domain/period";
import { goals, shopItems, tasks } from "../content";
import { computeAchievements } from "../domain/achievements";
import {
  DAILY_REWARDS,
  DAILY_QUESTS,
  getTodayDateString,
} from "../domain/daily";
import { playMunchSound, playPurrSound } from "../utils/sound";

let idCounter = 0;
function uid(): string {
  return `${Date.now().toString(36)}-${(idCounter++).toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

interface StoreState {
  profile: Profile | null;
  lastFeedback: string[];
  soundEnabled: boolean;
  animationsEnabled: boolean;
  toggleSound: () => void;
  toggleAnimations: () => void;
  createProfile: (opts: {
    childName: string;
    petName: string;
    customization: PetCustomization;
    demoMode?: boolean;
  }) => void;
  completeOnboarding: () => void;
  setPlan: (plan: BudgetPlan) => void;
  buyItem: (itemId: string) => { ok: boolean; reason?: string };
  selectGoal: (goalId: string) => void;
  addCustomGoal: (goal: Goal) => void;
  deleteCustomGoal: (goalId: string) => void;
  addSavings: (amount: number) => void;
  withdrawSavings: (amount: number) => { ok: boolean; reason?: string };
  completeTask: (taskId: string, success: boolean) => void;
  finishPeriod: () => { ok: boolean; reason?: string };
  startNextPeriod: () => void;
  claimDailyBonus: () => { amount: number; day: number; specialReward?: string };
  petPetInteractive: () => { moodBoost: number; message: string };
  feedSnackInteractive: (snackType: "apple" | "meal") => { ok: boolean; message: string };
  completeDailyQuest: (questId: string, answerKey: string) => { success: boolean; reward: number; explanation: string };
  toggleDemoMode: () => void;
  resetProfile: () => void;
  deleteProfile: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      profile: null,
      lastFeedback: [],
      soundEnabled: true,
      animationsEnabled: true,

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleAnimations: () => set((state) => ({ animationsEnabled: !state.animationsEnabled })),

      createProfile: ({ childName, petName, customization, demoMode = false }) => {
        const pet = createPet("finni", petName, customization);
        const firstIncome = START_BUDGET;
        const profile: Profile = {
          id: uid(),
          childName,
          pet,
          currentPeriodIndex: 0,
          balance: firstIncome,
          savingsByGoal: {},
          selectedGoalId: null,
          completedTasks: [],
          isTestProfile: false,
          demoMode,
          createdAt: Date.now(),
          onboarded: false,
          periods: { 0: createPeriod(0, firstIncome) },
        };
        set({ profile, lastFeedback: ["Добро пожаловать! Знакомься с Финни."] });
      },

      completeOnboarding: () => {
        const { profile } = get();
        if (!profile) return;
        set({ profile: { ...profile, onboarded: true } });
      },

      setPlan: (plan) => {
        const { profile } = get();
        if (!profile) return;
        const period = profile.periods[profile.currentPeriodIndex];
        if (!period) return;
        period.plan = { ...plan };
        period.planConfirmed = true;
        const newProf = { ...profile };
        newProf.unlockedAchievementIds = computeAchievements(newProf);
        set({
          profile: newProf,
          lastFeedback: ["План подтверждён. Придерживайся его в течение периода!"],
        });
      },

      buyItem: (itemId) => {
        const { profile } = get();
        if (!profile) return { ok: false, reason: "Профиль не создан." };
        const period = profile.periods[profile.currentPeriodIndex];
        if (!period) return { ok: false, reason: "Нет активного периода." };
        const item = shopItems.find((i) => i.id === itemId);
        if (!item) return { ok: false, reason: "Товар не найден." };

        const impact = item.impact ?? defaultExpenseImpact(item.type);
        const result = spendIfAffordable(profile.balance, item.price);
        if (!result.ok) {
          const remaining = item.price - profile.balance;
          return {
            ok: false,
            reason: `Тебе не хватает ещё ${remaining} 🪙. Сыграй в весёлый урок или выбери что-то подешевле!`,
          };
        }
        const newPet = {
          ...profile.pet,
          state: applyImpact(profile.pet.state, impact),
        };
        period.expenses.push({
          id: uid(),
          itemId,
          type: item.type,
          amount: item.price,
          timestamp: Date.now(),
          impact,
        });
        const owned = new Set(profile.ownedItemIds ?? []);
        owned.add(itemId);
        const updatedProf: Profile = {
          ...profile,
          balance: result.newBalance,
          pet: newPet,
          ownedItemIds: Array.from(owned),
        };
        updatedProf.unlockedAchievementIds = computeAchievements(updatedProf);
        set({
          profile: updatedProf,
          lastFeedback: [`Ура! ${item.name} куплен за ${item.price} 🪙! 🎉`],
        });
        return { ok: true };
      },

      selectGoal: (goalId) => {
        const { profile } = get();
        if (!profile) return;
        const updatedProf = { ...profile, selectedGoalId: goalId };
        updatedProf.unlockedAchievementIds = computeAchievements(updatedProf);
        set({ profile: updatedProf });
      },

      addCustomGoal: (goal) => {
        const { profile } = get();
        if (!profile) return;
        const existing = profile.customGoals ?? [];
        const customGoals = [goal, ...existing.filter((g) => g.id !== goal.id)];
        const updatedProf: Profile = {
          ...profile,
          customGoals,
          selectedGoalId: goal.id,
        };
        updatedProf.unlockedAchievementIds = computeAchievements(updatedProf);
        set({
          profile: updatedProf,
          lastFeedback: [`Новая цель «${goal.name}» создана! 🎯`],
        });
      },

      deleteCustomGoal: (goalId) => {
        const { profile } = get();
        if (!profile) return;
        const customGoals = (profile.customGoals ?? []).filter((g) => g.id !== goalId);
        const updatedProf: Profile = {
          ...profile,
          customGoals,
          selectedGoalId:
            profile.selectedGoalId === goalId
              ? (customGoals[0]?.id ?? goals[0].id)
              : profile.selectedGoalId,
        };
        updatedProf.unlockedAchievementIds = computeAchievements(updatedProf);
        set({ profile: updatedProf });
      },

      addSavings: (amount) => {
        const { profile } = get();
        if (!profile) return;
        const period = profile.periods[profile.currentPeriodIndex];
        if (!period) return;

        const allGoals = [...(profile.customGoals ?? []), ...goals];
        const goalId = profile.selectedGoalId ?? (profile.customGoals?.[0]?.id ?? goals[0].id);
        const currentGoal = allGoals.find((g) => g.id === goalId) ?? allGoals[0];
        const current = profile.savingsByGoal[currentGoal.id] ?? 0;
        const remainingNeeded = Math.max(0, currentGoal.cost - current);

        if (remainingNeeded <= 0) {
          set({ lastFeedback: [`На мечту «${currentGoal.name}» уже накоплена вся сумма! 🎉`] });
          return;
        }

        const actualAmount = Math.min(amount, remainingNeeded);
        const result = spendIfAffordable(profile.balance, actualAmount);
        if (!result.ok) {
          set({ lastFeedback: [`Не хватает средств, чтобы отложить ${actualAmount}.`] });
          return;
        }

        const savingsByGoal = { ...profile.savingsByGoal };
        savingsByGoal[currentGoal.id] = current + actualAmount;
        period.savingsAdded += actualAmount;
        const updatedProf: Profile = {
          ...profile,
          selectedGoalId: currentGoal.id,
          balance: result.newBalance,
          savingsByGoal,
        };
        updatedProf.unlockedAchievementIds = computeAchievements(updatedProf);
        set({
          profile: updatedProf,
          lastFeedback: [`В накопления добавлено ${actualAmount} монет.`],
        });
      },

      withdrawSavings: (amount) => {
        const { profile } = get();
        if (!profile) return { ok: false, reason: "Профиль не создан." };
        const goalId = profile.selectedGoalId;
        const current = goalId ? profile.savingsByGoal[goalId] ?? 0 : 0;
        if (current < amount) {
          return { ok: false, reason: "Недостаточно накоплений для снятия." };
        }
        const savingsByGoal = { ...profile.savingsByGoal };
        if (goalId) savingsByGoal[goalId] = current - amount;
        set({
          profile: { ...profile, balance: profile.balance + amount, savingsByGoal },
          lastFeedback: [`С накоплений снято ${amount} монет.`],
        });
        return { ok: true };
      },

      completeTask: (taskId, success) => {
        const { profile } = get();
        if (!profile) return;
        const task = tasks.find((t) => t.id === taskId);
        const reward = success ? task?.reward ?? 10 : 0;
        const result: TaskResult = { taskId, success, reward, timestamp: Date.now() };
        const already = profile.completedTasks.some((t) => t.taskId === taskId);
        const completedTasks = already
          ? profile.completedTasks
          : [...profile.completedTasks, result];
        const updatedProf: Profile = {
          ...profile,
          balance: profile.balance + reward,
          completedTasks,
        };
        updatedProf.unlockedAchievementIds = computeAchievements(updatedProf);
        set({
          profile: updatedProf,
          lastFeedback: [
            success ? `Задание выполнено! Начислено ${reward} монет.` : "Попробуй ещё раз!",
          ],
        });
      },

      finishPeriod: () => {
        const { profile } = get();
        if (!profile) return { ok: false, reason: "Профиль не создан." };
        const check = canFinishPeriod(profile);
        if (!check.ok) return { ok: false, reason: check.reason };

        const period = profile.periods[profile.currentPeriodIndex];
        period.completed = true;
        period.completedAt = Date.now();

        const onTrack = planWasOnTrack(period);
        let state = withoutMandatoryImpact(period);
        if (onTrack) {
          state = applyImpact(state, { mood: 8, satiety: 8 });
        } else {
          state = applyImpact(state, { mood: -6, satiety: -6 });
        }
        const completedCount = Object.values(profile.periods).filter((p) => p.completed).length;
        const { stage, progress } = computeGrowthStage(completedCount);
        const prevStage = profile.pet.growthStage as GrowthStage;
        const newPet = {
          ...profile.pet,
          state,
          growthStage: stage,
          stageProgress: progress,
        };

        const feedback: string[] = [];
        if (onTrack) {
          feedback.push("Отличная работа! План и факт совпали — Финни доволен.");
        } else {
          feedback.push("Факт разошёлся с планом. Попробуй точнее планировать в следующий раз.");
        }
        const stageMsg = explainStageChange(prevStage, stage);
        if (stageMsg) feedback.push(stageMsg);

        const { nextIncome } = shiftToNextPeriod(profile);
        feedback.push(`Новый период начался. Доход: ${nextIncome} монет.`);
        const updatedProf: Profile = {
          ...profile,
          pet: newPet,
        };
        updatedProf.unlockedAchievementIds = computeAchievements(updatedProf);
        set({ profile: updatedProf, lastFeedback: feedback });
        return { ok: true };
      },

      startNextPeriod: () => {
        const { profile } = get();
        if (!profile) return;
        const period = profile.periods[profile.currentPeriodIndex];
        if (!period.completed) return;
        const { nextIncome } = shiftToNextPeriod(profile);
        set({
          profile: { ...profile },
          lastFeedback: [`Новый период: доход ${nextIncome} монет.`],
        });
      },

      claimDailyBonus: () => {
        const { profile } = get();
        if (!profile) return { amount: 0, day: 1 };
        const streak = (profile.dailyStreak ?? 0) + 1;
        const day = ((streak - 1) % 7) + 1;
        const reward = DAILY_REWARDS.find((r) => r.day === day) ?? DAILY_REWARDS[0];
        const todayStr = getTodayDateString();

        const updatedProf: Profile = {
          ...profile,
          balance: profile.balance + reward.coins,
          dailyStreak: streak,
          lastDailyBonusDate: todayStr,
        };
        updatedProf.unlockedAchievementIds = computeAchievements(updatedProf);
        set({
          profile: updatedProf,
          lastFeedback: [`Ты забрал ежедневный подарок дня ${day}: +${reward.coins} 🪙! 🎁`],
        });
        return { amount: reward.coins, day, specialReward: reward.specialReward };
      },

      petPetInteractive: () => {
        const { profile } = get();
        if (!profile) return { moodBoost: 0, message: "" };
        playPurrSound();
        const newMood = clamp(profile.pet.state.mood + 3);
        const phrases = [
          "Муррр! Как же приятно! 🥰",
          "Финни виляет хвостиком от счастья! 🐾",
          "Ты самый добрый и заботливый хозяин! 💖",
          "Ура! Настроение на высоте! ✨",
        ];
        const message = phrases[Math.floor(Math.random() * phrases.length)];
        const updatedProf: Profile = {
          ...profile,
          pet: {
            ...profile.pet,
            state: {
              ...profile.pet.state,
              mood: newMood,
            },
          },
        };
        set({ profile: updatedProf });
        return { moodBoost: 3, message };
      },

      feedSnackInteractive: (snackType) => {
        const { profile } = get();
        if (!profile) return { ok: false, message: "Профиль не найден" };
        playMunchSound();
        const newSatiety = clamp(profile.pet.state.satiety + (snackType === "apple" ? 10 : 20));
        const newMood = clamp(profile.pet.state.mood + 5);
        const message = snackType === "apple"
          ? "Хрум-хрум! Свежее сочное яблочко добавило сытости! 🍎"
          : "Ням-ням! Питомец сыт и очень доволен! 🥣";

        const updatedProf: Profile = {
          ...profile,
          pet: {
            ...profile.pet,
            state: {
              mood: newMood,
              satiety: newSatiety,
            },
          },
        };
        set({
          profile: updatedProf,
          lastFeedback: [message],
        });
        return { ok: true, message };
      },

      completeDailyQuest: (questId, answerKey) => {
        const { profile } = get();
        if (!profile) return { success: false, reward: 0, explanation: "" };
        const quest = DAILY_QUESTS.find((q) => q.id === questId);
        if (!quest) return { success: false, reward: 0, explanation: "" };

        if (answerKey === quest.correctKey) {
          const todayStr = getTodayDateString();
          const updatedProf: Profile = {
            ...profile,
            balance: profile.balance + quest.reward,
            dailyQuestCompletedDate: todayStr,
          };
          updatedProf.unlockedAchievementIds = computeAchievements(updatedProf);
          set({
            profile: updatedProf,
            lastFeedback: [`Загадка дня решена! Получено +${quest.reward} 🪙! 🎉`],
          });
          return { success: true, reward: quest.reward, explanation: quest.explanation };
        } else {
          return { success: false, reward: 0, explanation: quest.explanation };
        }
      },

      resetProfile: () => {
        const { profile } = get();
        if (!profile) return;
        const pet = createPet("finni", profile.pet.name, profile.pet.customization);
        const firstIncome = START_BUDGET;
        set({
          profile: {
            ...profile,
            pet,
            balance: firstIncome,
            savingsByGoal: {},
            selectedGoalId: null,
            completedTasks: [],
            currentPeriodIndex: 0,
            periods: { 0: createPeriod(0, firstIncome) },
            isTestProfile: true,
          },
          lastFeedback: ["Тестовый профиль сброшен к исходному состоянию."],
        });
      },

      toggleDemoMode: () => {
        const { profile } = get();
        if (!profile) return;
        set({
          profile: { ...profile, demoMode: !profile.demoMode },
          lastFeedback: [
            `Демо-режим ${profile.demoMode ? "выключен" : "включён"}.`,
          ],
        });
      },

      deleteProfile: () => {
        set({ profile: null, lastFeedback: [] });
      },
    }),
    {
      name: "finni-profile",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function selectGoalById(goalId: string | null) {
  return goals.find((g) => g.id === goalId) ?? null;
}