import type {
  BudgetPlan,
  Expense,
  GamePeriod,
  GrowthStage,
  Impact,
  Pet,
  PetState,
} from "./types";
import { planWasOnTrack } from "./economy";

export const growthStageOrder: GrowthStage[] = ["egg", "baby", "teen", "adult"];

export const initialPetState: PetState = { mood: 70, satiety: 70 };

export const clamp = (v: number, min = 0, max = 100): number =>
  Math.max(min, Math.min(max, v));

export const STAGE_THRESHOLDS: Record<GrowthStage, number> = {
  egg: 0,
  baby: 0,
  teen: 2,
  adult: 4,
};

/**
 * ТЗ 2.5.10: подсчёт успешных периодов из совокупности решений:
 * обязательные расходы закрыты, траты не вышли за план, накопления пополнялись.
 */
export function countSuccessfulPeriods(profile: PeriodsSource): number {
  return Object.values(profile.periods).filter(
    (p) => p.completed && planWasOnTrack(p),
  ).length;
}

interface PeriodsSource {
  periods: Record<number, GamePeriod>;
}


export function applyImpact(state: PetState, impact: Impact): PetState {
  return {
    mood: clamp(state.mood + impact.mood),
    satiety: clamp(state.satiety + impact.satiety),
  };
}

export function createPet(
  configId: string,
  name: string,
  customization: Pet["customization"],
): Pet {
  return {
    configId,
    name,
    customization,
    state: { ...initialPetState },
    growthStage: "baby",
    stageProgress: 0,
  };
}

/**
 * ТЗ 2.5.10: развитие питомца зависит от совокупности решений за несколько
 * игровых периодов. Считаем «очки роста»: период считается успешным, если
 * обязательные расходы закрыты, фактические траты соответствуют плану и
 * накопления пополнялись регулярно. Успешных периодов нужно 2 на стадию.
 */
export const SUCCESSFUL_PERIODS_PER_STAGE = 2;

export function computeGrowthStage(successfulPeriods: number): {
  stage: GrowthStage;
  progress: number;
} {
  let stage: GrowthStage = "egg";
  let nextIdx = 0;
  for (let i = 0; i < growthStageOrder.length; i++) {
    const current = growthStageOrder[i];
    const threshold = STAGE_THRESHOLDS[current];
    if (successfulPeriods >= threshold) {
      stage = current;
      nextIdx = i;
    }
  }
  const nextThreshold =
    nextIdx + 1 < growthStageOrder.length
      ? STAGE_THRESHOLDS[growthStageOrder[nextIdx + 1]]
      : null;
  const currentThreshold = STAGE_THRESHOLDS[stage];
  const progress =
    nextThreshold == null
      ? 100
      : clamp(
          Math.round(((successfulPeriods - currentThreshold) / (nextThreshold - currentThreshold)) * 100),
        );
  return { stage, progress };
}

export function explainStageChange(prev: GrowthStage, next: GrowthStage): string {
  if (prev === next) return "";
  if (next === "baby") return "Ура, Финни вылупился из яйца! Твоя забота творит чудеса! 🐣";
  if (next === "teen") return "Ого! Финни подрос и стал весёлым озорным подростком! 🐤✨";
  if (next === "adult") return "Невероятно! Финни вырос в большого и мудрого друга! 🐥👑";
  return "Финни подрос! 🎉";
}

export function defaultExpenseImpact(type: "mandatory" | "optional"): Impact {
  return type === "mandatory"
    ? { mood: 0, satiety: 20 }
    : { mood: 15, satiety: 0 };
}

export function periodNeedsCare(period: GamePeriod): boolean {
  return period.expenses.filter((e) => e.type === "mandatory").length > 0;
}

export function summarizeExpenseImpact(expenses: Expense[]): Impact {
  return expenses.reduce<Impact>(
    (acc, e) => ({
      mood: acc.mood + e.impact.mood,
      satiety: acc.satiety + e.impact.satiety,
    }),
    { mood: 0, satiety: 0 },
  );
}

export function withoutMandatoryImpact(period: GamePeriod): PetState {
  const sum = summarizeExpenseImpact(period.expenses);
  return {
    mood: clamp(initialPetState.mood + sum.mood),
    satiety: clamp(initialPetState.satiety + sum.satiety),
  };
}

export function buildFeedback(
  period: GamePeriod,
  plan: BudgetPlan | null,
  income: number,
): string[] {
  const lines: string[] = [];
  if (plan) {
    const mandatoryOk = period.expenses
      .filter((e) => e.type === "mandatory")
      .reduce((s, e) => s + e.amount, 0);
    if (mandatoryOk >= plan.mandatory) {
      lines.push("🥣 Обед и забота: питомец сытно поел и довольно мурлычет!");
    } else {
      lines.push("🥣 Кажется, питомец недополучил вкусняшек — не забывай кормить его!");
    }
    if (period.savingsAdded >= plan.savings) {
      lines.push("🐷 В копилку отправлено всё по плану. Мечта стала ещё ближе!");
    } else {
      lines.push("🐷 В копилку попало меньше монеток, чем хотелось. Завтра попробуем ещё!");
    }
  }
  if (period.income > income) {
    lines.push("🪙 За твои старания карманные деньги на новый день выросли!");
  }
  return lines;
}