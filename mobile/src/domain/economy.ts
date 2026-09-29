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

/**
 * ТЗ 2.5.10: оценка финансовой дисциплины за период из совокупности решений:
 * 1. Обязательные потребности питомца обеспечены (обед/уход куплен).
 * 2. Траты на желания не превысили лимит конверта «Хочу» (отказ от них только в плюс).
 * 3. Лимит обязательного конверта «Надо» не превышен.
 * 4. Запланированные накопления внесены в копилку (не менее 80% от плана).
 * 5. Суммарные расходы не превысили доступный доход периода.
 */
export function planWasOnTrack(period: GamePeriod): boolean {
  if (!period.plan || !period.planConfirmed) return false;
  const actualMandatory = actualMandatoryExpenses(period);
  const mandatoryOk = actualMandatory > 0;

  const actualOptional = actualOptionalExpenses(period);
  const optionalOk = actualOptional <= period.plan.optional;
  const mandatoryLimitOk = actualMandatory <= Math.max(period.plan.mandatory, 20);

  const targetSavings = period.plan.savings;
  const savingsOk = targetSavings === 0 || period.savingsAdded >= Math.floor(targetSavings * 0.8);

  const notOverIncome = actualTotalSpent(period) + period.savingsAdded <= period.income;

  return mandatoryOk && optionalOk && mandatoryLimitOk && savingsOk && notOverIncome;
}