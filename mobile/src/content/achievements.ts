import type { Achievement } from "./types";

export const achievements: Achievement[] = [
  {
    id: "first_lesson",
    title: "Первый шаг к успеху",
    description: "Пройди свой самый первый финансовый урок на карте приключений.",
    icon: "🎓",
    category: "learning",
  },
  {
    id: "three_envelopes",
    title: "Хранитель трёх конвертов",
    description: "Разложи карманные деньги по конвертам и утверди план на день.",
    icon: "✉️",
    category: "budget",
  },
  {
    id: "first_feeding",
    title: "Сытый и счастливый",
    description: "Купи полезную еду для питомца в лавке вкусностей.",
    icon: "🥣",
    category: "pet",
  },
  {
    id: "piggy_bank",
    title: "Звонкая копилка",
    description: "Пополни копилку монетами и приблизь свою заветную мечту.",
    icon: "🐷",
    category: "savings",
  },
  {
    id: "moscow_expert",
    title: "Знаток Москвы",
    description: "Узнай, как карта «Тройка» и столичные правила помогают экономить.",
    icon: "🏛️",
    category: "learning",
  },
  {
    id: "smart_shopper",
    title: "Мудрый покупатель",
    description: "Откажись от ненужной покупки-хватайки в пользу важной цели.",
    icon: "🛒",
    category: "budget",
  },
  {
    id: "halfway_goal",
    title: "Мечта совсем близко!",
    description: "Накопи больше 50% от стоимости выбранной финансовой цели.",
    icon: "🎯",
    category: "savings",
  },
  {
    id: "grown_pet",
    title: "Большой друг",
    description: "Вырасти питомца Финни из малыша до сильного взрослого друга.",
    icon: "👑",
    category: "pet",
  },
];
