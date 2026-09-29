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
 * ТЗ 2.5.10: многофакторная оценка финансовой дисциплины за период из совокупности решений:
 * 1. Обязательные базовые потребности питомца обеспечены (сытный обед куплен: petFed === true).
 * 2. Лимит конверта «Надо» был изначально запланирован (>0) и фактически не превышен.
 * 3. Траты на радости не превысили лимит конверта «Хочу» (отказ от них только в плюс).
 * 4. Регулярность сбережений: взнос в копилку был запланирован (plan.savings > 0) и внесён (не менее 80% от плана).
 * 5. Суммарные расходы и сбережения не превысили доступный доход периода (нет дефицита).
 */
export function planWasOnTrack(period: GamePeriod): boolean {
  if (!period.plan || !period.planConfirmed) return false;

  // 1. Питомец накормлен (обязательный сытный обед «food_bowl» куплен именно в текущем периоде)
  const petFed = period.expenses.some(
    (e) => e.itemId === "food_bowl" && e.type === "mandatory",
  );

  // 2. Лимит конверта «Надо» запланирован (>0) и фактически не превышен
  const actualMandatory = actualMandatoryExpenses(period);
  const mandatoryLimitOk =
    period.plan.mandatory > 0 && actualMandatory <= period.plan.mandatory;
  const mandatoryOk = petFed && mandatoryLimitOk;

  // 3. Траты на радости не превысили лимит конверта «Хочу»
  const actualOptional = actualOptionalExpenses(period);
  const optionalOk = actualOptional <= period.plan.optional;

  // 4. Регулярность сбережений: взнос запланирован (>0) и пополнен минимум на 80%
  const targetSavings = period.plan.savings;
  const savingsOk =
    targetSavings > 0 && period.savingsAdded >= Math.floor(targetSavings * 0.8);

  // 5. Суммарные расходы и сбережения не превысили доход
  const notOverIncome =
    actualTotalSpent(period) + period.savingsAdded <= period.income;

  return mandatoryOk && optionalOk && savingsOk && notOverIncome;
}