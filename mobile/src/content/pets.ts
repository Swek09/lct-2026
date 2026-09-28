import type { GrowthStage } from "../domain/types";

export interface PetSpecies {
  id: string;
  name: string;
  skills: string;
  emoji: string;
  color: string;
  image?: any;
}

export interface PetPalette {
  id: string;
  color: string;
  name: string;
}

export interface PetEye {
  id: string;
  name: string;
  color: string;
  emoji: string;
  image?: any;
}

export interface PetOutfit {
  id: string;
  name: string;
  emoji: string;
  image?: any;
}

export interface PetAccessory {
  id: string;
  name: string;
  symbol: string;
  emoji: string;
  image?: any;
}

// Clean assets - NO AI slop!
export const finniAssets = {
  owlStep1: null,
  owlStep2: null,
  owlStep3: null,
  previewRug: null,
  heroRoom: null,
};

export const petSpecies: PetSpecies[] = [
  {
    id: "cat",
    name: "Котик",
    skills: "Забота, Накопления",
    emoji: "🐱",
    color: "#5E9362",
  },
  {
    id: "dog",
    name: "Щенок",
    skills: "Дружба, Забота",
    emoji: "🐶",
    color: "#F38F69",
  },
  {
    id: "rabbit",
    name: "Кролик",
    skills: "Энергия, Внимание",
    emoji: "🐰",
    color: "#E8C5A0",
  },
  {
    id: "dragon",
    name: "Дракончик",
    skills: "Мудрость, Интуиция",
    emoji: "🐲",
    color: "#88B1CE",
  },
];

export const petPalettes: PetPalette[] = [
  { id: "green", name: "Шалфей", color: "#6DA374" },
  { id: "coral", name: "Персик", color: "#F38F69" },
  { id: "sand", name: "Песочный", color: "#E8C5A0" },
  { id: "blue", name: "Небесный", color: "#88B1CE" },
];

export const petEyes: PetEye[] = [
  {
    id: "green",
    name: "Изумрудные",
    color: "#4CAF50",
    emoji: "🟢",
  },
  {
    id: "brown",
    name: "Карие",
    color: "#8D6E63",
    emoji: "🟤",
  },
  {
    id: "blue",
    name: "Голубые",
    color: "#42A5F5",
    emoji: "🔵",
  },
];

export const petOutfits: PetOutfit[] = [
  {
    id: "hoodie",
    name: "Худи с листиками",
    emoji: "🧥",
  },
  {
    id: "jacket",
    name: "Тёплая куртка",
    emoji: "🦺",
  },
  {
    id: "cape",
    name: "Лесной плащ",
    emoji: "🦸",
  },
];

export const petAccessories: PetAccessory[] = [
  {
    id: "scarf",
    name: "Шарфик",
    symbol: "🧣",
    emoji: "🧣",
  },
  {
    id: "bowtie",
    name: "Бабочка",
    symbol: "🎀",
    emoji: "🎀",
  },
  {
    id: "glasses",
    name: "Очки",
    symbol: "👓",
    emoji: "👓",
  },
];

export { growthStageOrder, initialPetState } from "../domain/pet";

export const growthStageLabels: Record<GrowthStage, string> = {
  egg: "Малыш",
  baby: "Малыш",
  teen: "Подросток",
  adult: "Взрослый",
};

export function countPetCombinations(): number {
  return petSpecies.length * petPalettes.length * petEyes.length * petOutfits.length * petAccessories.length;
}