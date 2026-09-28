import type { ExpenseType, Impact, TaskTheme } from "../domain/types";

export interface ShopItem {
  id: string;
  name: string;
  type: ExpenseType;
  price: number;
  impact: Impact;
  hint: string;
  icon?: string;
  category?: string;
}


export interface TaskOption {
  key: string;
  text: string;
}

export type TaskType = "quiz" | "sort" | "change";

export interface SortItem {
  id: string;
  label: string;
  icon?: string;
  correctCategory: "mandatory" | "optional";
}

export interface ChangeTaskData {
  price: number;
  paid: number;
  availableCoins: number[];
  targetChange: number;
}

export interface Task {
  id: string;
  theme: TaskTheme;
  title: string;
  scenario: string;
  type?: TaskType;
  options: TaskOption[];
  correctKey: string;
  feedbackOk: string;
  feedbackFail: string;
  reward: number;
  unitId?: number;
  unitTitle?: string;
  icon?: string;
  competencyCode?: string;
  competencyName?: string;
  moscowContext?: string;
  sortItems?: SortItem[];
  changeData?: ChangeTaskData;
}


export type { Goal } from "../domain/types";


export interface Term {
  word: string;
  explanation: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "budget" | "savings" | "learning" | "pet";
}