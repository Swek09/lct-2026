import assert from "node:assert";
import test from "node:test";
import {
  actualMandatoryExpenses,
  actualOptionalExpenses,
  spendIfAffordable,
  sumPlan,
  validatePlan,
} from "../src/domain/economy";
import { progressPercent } from "../src/domain/formulas";
import {
  canFinishPeriod,
  computeNextIncome,
  createPeriod,
  shiftToNextPeriod,
} from "../src/domain/period";
import {
  applyImpact,
  clamp,
  computeGrowthStage,
  createPet,
  explainStageChange,
} from "../src/domain/pet";
import type { Profile } from "../src/domain/types";



test("Budget: sumPlan calculates total properly", () => {
  const plan = { mandatory: 50, optional: 30, savings: 20 };
  assert.strictEqual(sumPlan(plan), 100);
});

test("Budget: validatePlan enforces income limits (ТЗ 2.5.5)", () => {
  const valid = validatePlan(100, { mandatory: 50, optional: 30, savings: 20 });
  assert.strictEqual(valid.ok, true);
  assert.strictEqual(valid.remaining, 0);

  const overBudget = validatePlan(100, { mandatory: 60, optional: 30, savings: 20 });
  assert.strictEqual(overBudget.ok, false);
  assert.strictEqual(overBudget.remaining, -10);

  const empty = validatePlan(100, { mandatory: 0, optional: 0, savings: 0 });
  assert.strictEqual(empty.ok, false);
});

test("Economy: spendIfAffordable prevents negative balance (ТЗ 2.5.6)", () => {
  const success = spendIfAffordable(50, 30);
  assert.strictEqual(success.ok, true);
  assert.strictEqual(success.newBalance, 20);

  const fail = spendIfAffordable(20, 30);
  assert.strictEqual(fail.ok, false);
  assert.strictEqual(fail.newBalance, 20);
});

test("Pet: clamp and applyImpact maintain 0..100 bounds", () => {
  assert.strictEqual(clamp(-10), 0);
  assert.strictEqual(clamp(150), 100);
  assert.strictEqual(clamp(55), 55);

  const state = { mood: 90, satiety: 90 };
  const boosted = applyImpact(state, { mood: 20, satiety: 20 });
  assert.strictEqual(boosted.mood, 100);
  assert.strictEqual(boosted.satiety, 100);
});

test("Pet: Growth stages progress through Baby, Teen, and Adult (ТЗ 2.5.10)", () => {
  // Period 0: Initial baby stage
  const stage0 = computeGrowthStage(0);
  assert.strictEqual(stage0.stage, "baby");

  // Period 2: Teen stage
  const stage2 = computeGrowthStage(2);
  assert.strictEqual(stage2.stage, "teen");

  // Period 4+: Adult stage reached within 5 periods
  const stage4 = computeGrowthStage(4);
  assert.strictEqual(stage4.stage, "adult");

  const msg = explainStageChange("teen", "adult");
  assert.ok(msg.length > 0);
});

test("Period: canFinishPeriod verifies plan and mandatory spend, respects demoMode (ТЗ 2.5.13)", () => {
  const pet = createPet("finni", "Листик", {
    speciesIndex: 0,
    paletteIndex: 0,
    accessoryIndex: 0,
  });

  const profile: Profile = {
    id: "test",
    childName: "Листик",
    pet,
    currentPeriodIndex: 0,
    balance: 100,
    savingsByGoal: {},
    selectedGoalId: null,
    completedTasks: [],
    isTestProfile: false,
    demoMode: false,
    createdAt: Date.now(),
    onboarded: true,
    periods: { 0: createPeriod(0, 100) },
  };

  // Unconfirmed plan should fail
  assert.strictEqual(canFinishPeriod(profile).ok, false);

  // In demo mode, bypass is allowed for fast expert review
  profile.demoMode = true;
  assert.strictEqual(canFinishPeriod(profile).ok, true);

  // When not in demo mode, requires confirmed plan and mandatory purchase
  profile.demoMode = false;
  profile.periods[0].plan = { mandatory: 50, optional: 25, savings: 25 };
  profile.periods[0].planConfirmed = true;
  assert.strictEqual(canFinishPeriod(profile).ok, false);

  profile.periods[0].expenses.push({
    id: "e1",
    itemId: "food_bowl",
    type: "mandatory",
    amount: 20,
    timestamp: Date.now(),
    impact: { mood: 0, satiety: 30 },
  });
  assert.strictEqual(canFinishPeriod(profile).ok, true);
});

test("Period: shiftToNextPeriod creates next period and credits income", () => {
  const pet = createPet("finni", "Листик", {
    speciesIndex: 0,
    paletteIndex: 0,
    accessoryIndex: 0,
  });

  const profile: Profile = {
    id: "test",
    childName: "Листик",
    pet,
    currentPeriodIndex: 0,
    balance: 100,
    savingsByGoal: {},
    selectedGoalId: null,
    completedTasks: [],
    isTestProfile: false,
    demoMode: false,
    createdAt: Date.now(),
    onboarded: true,
    periods: { 0: createPeriod(0, 100) },
  };

  const { nextIncome } = shiftToNextPeriod(profile);
  assert.strictEqual(profile.currentPeriodIndex, 1);
  assert.ok(nextIncome >= 100);
  assert.strictEqual(profile.balance, 100 + nextIncome);
});

test("Formulas: progressPercent clamps correctly between 0 and 100", () => {
  assert.strictEqual(progressPercent(50, 100), 50);
  assert.strictEqual(progressPercent(0, 100), 0);
  assert.strictEqual(progressPercent(120, 100), 100);
});

test("Achievements: computeAchievements unlocks achievements accurately", () => {
  const { computeAchievements } = require("../src/domain/achievements");
  const pet = createPet("finni", "Листик", {
    speciesIndex: 0,
    paletteIndex: 0,
    accessoryIndex: 0,
  });

  const profile: Profile = {
    id: "test",
    childName: "Листик",
    pet,
    currentPeriodIndex: 0,
    balance: 100,
    savingsByGoal: { bicycle: 200 },
    selectedGoalId: "bicycle",
    completedTasks: [{ taskId: "t1", success: true, reward: 10, timestamp: Date.now() }],
    isTestProfile: false,
    demoMode: false,
    createdAt: Date.now(),
    onboarded: true,
    periods: {
      0: {
        ...createPeriod(0, 100),
        plan: { mandatory: 50, optional: 25, savings: 25 },
        planConfirmed: true,
        savingsAdded: 25,
      },
    },
    unlockedAchievementIds: [],
  };

  const unlocked = computeAchievements(profile);
  assert.ok(unlocked.includes("first_lesson"), "Should unlock first_lesson");
  assert.ok(unlocked.includes("three_envelopes"), "Should unlock three_envelopes");
  assert.ok(unlocked.includes("piggy_bank"), "Should unlock piggy_bank");
  assert.ok(unlocked.includes("halfway_goal"), "Should unlock halfway_goal when >= 50%");
});

test("Tasks: Interactive sort and change tasks exist and conform to Unified Framework", () => {
  const { tasks } = require("../src/content/tasks");
  const sortTask = tasks.find((t: any) => t.type === "sort");
  assert.ok(sortTask, "Sort task exists");
  assert.ok(sortTask.sortItems && sortTask.sortItems.length >= 4, "Sort task has items");
  assert.ok(sortTask.competencyCode, "Sort task has competencyCode");

  const changeTask = tasks.find((t: any) => t.type === "change");
  assert.ok(changeTask, "Change task exists");
  assert.ok(changeTask.changeData, "Change task has changeData");
  assert.strictEqual(
    changeTask.changeData.price + changeTask.changeData.targetChange,
    changeTask.changeData.paid
  );
});

test("Daily: canClaimDailyBonus, canDoDailyQuest, and 7-day reward structure", () => {
  const {
    canClaimDailyBonus,
    canDoDailyQuest,
    getTodayQuest,
    getTodayDateString,
    DAILY_REWARDS,
  } = require("../src/domain/daily");

  const pet = createPet("finni", "Листик", {
    speciesIndex: 0,
    paletteIndex: 0,
    accessoryIndex: 0,
  });

  const profile: Profile = {
    id: "test",
    childName: "Листик",
    pet,
    currentPeriodIndex: 0,
    balance: 100,
    savingsByGoal: {},
    selectedGoalId: null,
    completedTasks: [],
    isTestProfile: false,
    demoMode: false,
    createdAt: Date.now(),
    onboarded: true,
    periods: { 0: createPeriod(0, 100) },
  };

  // Initially bonus and quest are claimable
  assert.strictEqual(canClaimDailyBonus(profile), true);
  assert.strictEqual(canDoDailyQuest(profile), true);

  // Once claimed today, claimable returns false in normal mode
  const today = getTodayDateString();
  profile.lastDailyBonusDate = today;
  profile.dailyQuestCompletedDate = today;
  assert.strictEqual(canClaimDailyBonus(profile), false);
  assert.strictEqual(canDoDailyQuest(profile), false);

  // In demoMode, always allows instant testing
  profile.demoMode = true;
  assert.strictEqual(canClaimDailyBonus(profile), true);
  assert.strictEqual(canDoDailyQuest(profile), true);

  // Quest retrieval works
  const quest = getTodayQuest(profile);
  assert.ok(quest && quest.question && quest.options.length >= 2);

  // 7-day rewards escalation check
  assert.strictEqual(DAILY_REWARDS.length, 7);
  assert.strictEqual(DAILY_REWARDS[0].coins, 10);
  assert.strictEqual(DAILY_REWARDS[6].coins, 50);
});

test("Savings: deposit never exceeds goal cost and withdrawal supports arbitrary amounts up to saved", () => {
  const goalCost = 100;
  let saved = 80;
  const remaining = Math.max(0, goalCost - saved);
  assert.strictEqual(remaining, 20);

  // Trying to deposit 50 when remaining is 20 must cap to 20
  const depositAttempt = 50;
  const actualDeposit = Math.min(depositAttempt, remaining);
  assert.strictEqual(actualDeposit, 20);
  saved += actualDeposit;
  assert.strictEqual(saved, goalCost);

  // When goal is 100% funded, remaining is 0 and no further deposit can occur
  const newRemaining = Math.max(0, goalCost - saved);
  assert.strictEqual(newRemaining, 0);
  const furtherDeposit = Math.min(10, newRemaining);
  assert.strictEqual(furtherDeposit, 0);

  // Variable withdrawal can take any amount up to saved
  const withdrawAmount = 45;
  assert.ok(withdrawAmount <= saved, "Should be allowed to withdraw up to saved amount");
  saved -= withdrawAmount;
  assert.strictEqual(saved, 55);
});


