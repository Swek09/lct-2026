import type { Profile } from "./types";

export interface DailyReward {
  day: number;
  coins: number;
  icon: string;
  title: string;
  specialReward?: string;
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, coins: 2, icon: "🪙", title: "День 1: Начало пути" },
  { day: 2, coins: 3, icon: "💰", title: "День 2: Верный друг" },
  { day: 3, coins: 3, icon: "🎁", title: "День 3: Приятный сюрприз" },
  { day: 4, coins: 4, icon: "⭐", title: "День 4: Мудрый кошелёк" },
  { day: 5, coins: 5, icon: "🍎", title: "День 5: Вкусный перекус" },
  { day: 6, coins: 5, icon: "🏆", title: "День 6: Знаток сбережений" },
  { day: 7, coins: 10, icon: "👑", title: "День 7: Золотой чемпион!", specialReward: "Корона Финни" },
];

export interface DailyQuest {
  id: string;
  title: string;
  question: string;
  options: { key: string; text: string }[];
  correctKey: string;
  explanation: string;
  reward: number;
}

export const DAILY_QUESTS: DailyQuest[] = [
  {
    id: "troika_bonus",
    title: "Поездка на метро",
    question: "Тебе нужно доехать до парка «Зарядье» на метро. Как оплатить проезд экономнее всего?",
    options: [
      { key: "a", text: "Покупать каждый раз отдельный бумажный билет за полную цену" },
      { key: "b", text: "Приложить московскую карту «Тройка» со скидкой и бесплатными пересадками" },
      { key: "c", text: "Попросить незнакомца перепрыгнуть турникет" },
    ],
    correctKey: "b",
    explanation: "Верно! Карта «Тройка» даёт самую выгодную городскую цену и бесплатные пересадки в Москве.",
    reward: 15,
  },
  {
    id: "change_check",
    title: "Сдача в школьном буфете",
    question: "Булочка стоит 30 монет, ты дал 50 монет. Продавец дал 10 монет сдачи. Что сделаешь?",
    options: [
      { key: "a", text: "Быстро убегу, ничего не считая" },
      { key: "b", text: "Вежливо скажу: «Извините, 50 минус 30 — это 20 монет. Вы не додали 10 монет»" },
      { key: "c", text: "Начну громко плакать на весь буфет" },
    ],
    correctKey: "b",
    explanation: "Блестяще! Всегда проверяй сдачу не отходя от кассы спокойно и вежливо.",
    reward: 15,
  },
  {
    id: "found_card",
    title: "Находка на детской площадке",
    question: "Гуляя во дворе, ты заметил на лавочке забытую чужую банковскую карту. Что правильно сделать?",
    options: [
      { key: "a", text: "Попробовать купить по ней сладости в магазине" },
      { key: "b", text: "Отдать родителям или отнести администратору парка / в банк" },
      { key: "c", text: "Спрятать в карман как сувенир" },
    ],
    correctKey: "b",
    explanation: "Мудро! Чужая карта — это чужие деньги. Использовать её незаконно, нужно передать взрослым.",
    reward: 15,
  },
  {
    id: "sale_trap",
    title: "Жёлтый ценник «СКИДКА 70%»",
    question: "В магазине лежит светящаяся пластиковая палочка с кричащей наклейкой «Скидка!». Она тебе не нужна. Купишь?",
    options: [
      { key: "a", text: "Да, раз скидка — надо брать, даже если это хлам!" },
      { key: "b", text: "Нет! Не куплю ерунду, а сберегу монетки на свою большую цель." },
    ],
    correctKey: "b",
    explanation: "Вот это характер! Скидка на ненужную вещь — это потеря денег, а не экономия!",
    reward: 15,
  },
  {
    id: "vdnh_water",
    title: "Жаркий день на ВДНХ",
    question: "Вы с Финни идёте гулять на весь день по ВДНХ. Как поступить с водой, чтобы не переплачивать?",
    options: [
      { key: "a", text: "Взять свою красивую бутылочку с водой из дома" },
      { key: "b", text: "Покупать каждые полчаса маленькие бутылочки в ларьках по тройной цене" },
    ],
    correctKey: "a",
    explanation: "Отлично! Взять воду из дома — это и бережливо для бюджета, и экологично для природы!",
    reward: 15,
  },
];

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function canClaimDailyBonus(profile: Profile): boolean {
  if (profile.demoMode) return true;
  const today = getTodayDateString();
  if (profile.lastDailyBonusDate !== today) return true;
  if (
    profile.lastDailyBonusPeriod !== undefined &&
    profile.currentPeriodIndex > profile.lastDailyBonusPeriod
  ) {
    return true;
  }
  return false;
}

export function getTodayQuest(profile: Profile): DailyQuest {
  const dayIndex = (profile.dailyStreak ?? 1) % DAILY_QUESTS.length;
  return DAILY_QUESTS[dayIndex] ?? DAILY_QUESTS[0];
}

export function canDoDailyQuest(profile: Profile): boolean {
  if (profile.demoMode) return true;
  const today = getTodayDateString();
  if (profile.dailyQuestCompletedDate !== today) return true;
  if (
    profile.dailyQuestCompletedPeriod !== undefined &&
    profile.currentPeriodIndex > profile.dailyQuestCompletedPeriod
  ) {
    return true;
  }
  return false;
}
