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

export interface PetHat {
  id: string;
  name: string;
  modelFile: string;
  emoji: string;
  yOffset?: number;
  zOffset?: number;
  scale?: number;
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

export const petSpecies: PetSpecies[] = [
  {
    id: "cat",
    name: "Котик",
    skills: "Забота, Накопления",
    emoji: "🐱",
    color: "#5E9362",
  },
];

export const petPalettes: PetPalette[] = [
  { id: "gray", name: "Серый", color: "#545A68" },
  { id: "ginger", name: "Рыжий", color: "#E57338" },
  { id: "white", name: "Белый", color: "#D8DFE8" },
];

export const petHats: PetHat[] = [
  { id: "none", name: "Без шляпы", emoji: "❌", modelFile: "" },
  { id: "birthday", name: "Колпак", emoji: "🥳", modelFile: "BirthdayHat.glb", yOffset: -0.2297 },
  { id: "cowboy", name: "Ковбойская", emoji: "🤠", modelFile: "CowboyHat.glb", yOffset: -0.2297, zOffset: 0 },
  { id: "magic", name: "Волшебная", emoji: "🎩", modelFile: "MagicHat.glb", yOffset: -0.2297 },
];

export const petEyes: PetEye[] = [];
export const petOutfits: PetOutfit[] = [];
export const petAccessories: PetAccessory[] = [];

export { growthStageOrder, initialPetState } from "../domain/pet";

export const growthStageLabels: Record<GrowthStage, string> = {
  egg: "Малыш",
  baby: "Малыш",
  teen: "Подросток",
  adult: "Взрослый",
};

export function countPetCombinations(): number {
  return petSpecies.length * petPalettes.length * petHats.length;
}