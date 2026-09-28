import type { BudgetPlan, GamePeriod } from "./types";

export const START_BUDGET = 100;
export const MIN_PERIODS_FOR_STAGE = 1;

export function sumPlan(plan: BudgetPlan): number {
  return plan.mandatory + plan.optional + plan.savings;
}

export interface PlanValidation {
  ok: boolean;
  remaining: number;
  error?: string;
}

export function validatePlan(income: number, plan: BudgetPlan): PlanValidation {
  const total = sumPlan(plan);
  const remaining = income - total;
  if (remaining < 0) {
    return {
      ok: false,
      remaining,
      error: "Ой, в конвертах больше монеток, чем у тебя есть! Убавь немного.",
    };
  }
  if (total === 0) {
    return {
      ok: false,
      remaining,
      error: "Положи хоть сколько-нибудь монеток в конверты!",
    };
  }
  return { ok: true, remaining };
}

export function canAfford(balance: number, price: number): boolean {
  return balance >= price;
}

export function spendIfAffordable(
  balance: number,
  price: number,
): { newBalance: number; ok: boolean } {
  if (!canAfford(balance, price)) {
    return { newBalance: balance, ok: false };
  }
  return { newBalance: balance - price, ok: true };
}

export function actualMandatoryExpenses(period: GamePeriod): number {
  return period.expenses
    .filter((e) => e.type === "mandatory")
    .reduce((s, e) => s + e.amount, 0);
}

export function actualOptionalExpenses(period: GamePeriod): number {
  return period.expenses
    .filter((e) => e.type === "optional")
    .reduce((s, e) => s + e.amount, 0);
}

export function actualTotalSpent(period: GamePeriod): number {
  return period.expenses.reduce((s, e) => s + e.amount, 0);
}

export function planWasOnTrack(period: GamePeriod): boolean {
  if (!period.plan) return false;
  const mandatoryOk = actualMandatoryExpenses(period) >= period.plan.mandatory;
  const optionalOk = actualOptionalExpenses(period) <= period.plan.optional * 1.1;
  const savingsOk = period.savingsAdded >= period.plan.savings;
  return mandatoryOk && optionalOk && savingsOk;
}