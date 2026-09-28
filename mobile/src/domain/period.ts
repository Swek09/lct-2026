import type {
  BudgetPlan,
  GamePeriod,
  Profile,
} from "./types";
import { START_BUDGET, actualTotalSpent } from "./economy";

export function createPeriod(index: number, income: number): GamePeriod {
  return {
    id: `period-${index}`,
    index,
    income,
    plan: null,
    planConfirmed: false,
    expenses: [],
    savingsAdded: 0,
    completed: false,
    completedAt: null,
  };
}

export function currentPeriod(profile: Profile): GamePeriod | null {
  return profile.periods[profile.currentPeriodIndex] ?? null;
}

export function completedCount(profile: Profile): number {
  return Object.values(profile.periods).filter((p) => p.completed).length;
}

export function computeNextIncome(profile: Profile): number {
  const period = currentPeriod(profile);
  const base = START_BUDGET + profile.currentPeriodIndex * 5;
  if (!period || !period.completed) return base;
  const onTrack = actualTotalSpent(period) <= period.income;
  return base + (onTrack ? 10 : 0);
}

export function canFinishPeriod(profile: Profile): { ok: boolean; reason?: string } {
  const period = currentPeriod(profile);
  if (!period) return { ok: false, reason: "Нет активного периода." };
  if (profile.demoMode) return { ok: true };
  if (!period.planConfirmed) {
    return { ok: false, reason: "Сначала составь и подтверди план бюджета." };
  }
  const hasMandatory = period.expenses.some((e) => e.type === "mandatory");
  if (!hasMandatory) {
    return { ok: false, reason: "Соверши хотя бы одну обязательную покупку." };
  }
  return { ok: true };
}


export function shiftToNextPeriod(profile: Profile): { nextIncome: number } {
  const nextIncome = computeNextIncome(profile);
  const nextIndex = profile.currentPeriodIndex + 1;
  const next = createPeriod(nextIndex, nextIncome);
  profile.periods[nextIndex] = next;
  profile.currentPeriodIndex = nextIndex;
  profile.balance += nextIncome;
  return { nextIncome };
}

export function setPeriodPlan(
  profile: Profile,
  plan: BudgetPlan,
): void {
  const period = currentPeriod(profile);
  if (!period) return;
  period.plan = { ...plan };
  period.planConfirmed = true;
}