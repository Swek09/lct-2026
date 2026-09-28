export type ExpenseType = "mandatory" | "optional";

export type TaskTheme = "budget" | "savings" | "payments";

export type GrowthStage = "egg" | "baby" | "teen" | "adult";

export interface PetState {
  mood: number;
  satiety: number;
}

export interface Impact {
  mood: number;
  satiety: number;
}

export interface PetCustomization {
  speciesIndex: number;
  paletteIndex: number;
  accessoryIndex: number;
  speciesId?: string;
  colorId?: string;
  eyeId?: string;
  outfitId?: string;
  accessoryId?: string;
}

export interface Pet {
  configId: string;
  name: string;
  customization: PetCustomization;
  state: PetState;
  growthStage: GrowthStage;
  stageProgress: number;
}

export interface BudgetPlan {
  mandatory: number;
  optional: number;
  savings: number;
}

export interface Expense {
  id: string;
  itemId: string;
  type: ExpenseType;
  amount: number;
  timestamp: number;
  impact: Impact;
}

export interface GamePeriod {
  id: string;
  index: number;
  income: number;
  plan: BudgetPlan | null;
  planConfirmed: boolean;
  expenses: Expense[];
  savingsAdded: number;
  completed: boolean;
  completedAt: number | null;
}

export interface TaskResult {
  taskId: string;
  success: boolean;
  reward: number;
  timestamp: number;
}

export interface Goal {
  id: string;
  name: string;
  cost: number;
  icon: string;
  description?: string;
  category?: string;
  isCustom?: boolean;
}

export interface Profile {
  id: string;
  childName: string;
  pet: Pet;
  currentPeriodIndex: number;
  balance: number;
  savingsByGoal: Record<string, number>;
  selectedGoalId: string | null;
  completedTasks: TaskResult[];
  isTestProfile: boolean;
  demoMode: boolean;
  createdAt: number;
  onboarded: boolean;
  periods: Record<number, GamePeriod>;
  unlockedAchievementIds?: string[];
  dailyStreak?: number;
  lastDailyBonusDate?: string;
  ownedItemIds?: string[];
  dailyQuestCompletedDate?: string;
  customGoals?: Goal[];
}