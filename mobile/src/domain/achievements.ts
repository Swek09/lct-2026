import { goals } from "../content/goals";
import { tasks } from "../content/tasks";
import type { Profile } from "./types";

export function computeAchievements(profile: Profile): string[] {
  const list = new Set(profile.unlockedAchievementIds ?? []);
  if (profile.completedTasks.length > 0) list.add("first_lesson");
  if (Object.values(profile.periods).some((p) => p.planConfirmed)) list.add("three_envelopes");
  if (Object.values(profile.periods).some((p) => p.expenses.some((e) => e.type === "mandatory"))) {
    list.add("first_feeding");
  }
  if (Object.values(profile.savingsByGoal).some((v) => v > 0)) {
    list.add("piggy_bank");
  }
  if (
    profile.completedTasks.some((t) => {
      const tk = tasks.find((item) => item.id === t.taskId);
      return !!tk?.moscowContext;
    })
  ) {
    list.add("moscow_expert");
  }
  if (
    profile.completedTasks.some(
      (t) => t.taskId === "needs_vs_wants" || t.taskId === "discounts_trap"
    )
  ) {
    list.add("smart_shopper");
  }
  if (profile.selectedGoalId) {
    const allGoals = [...(profile.customGoals ?? []), ...goals];
    const saved = profile.savingsByGoal[profile.selectedGoalId] ?? 0;
    const target = allGoals.find((g) => g.id === profile.selectedGoalId)?.cost ?? 999;
    if (saved >= target * 0.5) list.add("halfway_goal");
  }
  if (profile.pet.growthStage === "adult") {
    list.add("grown_pet");
  }
  return Array.from(list);
}
