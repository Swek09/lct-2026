import type { GamePeriod } from "./types";

export const FORMATTER = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
});

export function formatCoins(amount: number): string {
  return `${FORMATTER.format(Math.round(amount))} 🪙`;
}

export function totalSaved(period: GamePeriod): number {
  return period.savingsAdded;
}

export function remainingForGoal(saved: number, cost: number): number {
  return Math.max(0, cost - saved);
}

export function progressPercent(saved: number, cost: number): number {
  if (cost <= 0) return 100;
  return Math.min(100, Math.round((saved / cost) * 100));
}

export function estimateWeeksToGoal(
  remaining: number,
  weeklySavings: number,
): number | null {
  if (weeklySavings <= 0) return null;
  return Math.ceil(remaining / weeklySavings);
}