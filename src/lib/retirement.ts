import {
  RETIREMENT_PLAN_PROJECTION_BUFFER_DOLLARS,
  SCENARIO_LIMIT,
} from "@/lib/constants/retirement";
import type {
  ProjectionStatus,
  ProjectionErrorKind,
  ScenarioProjectionSummary,
  RetirementFormInputs,
} from "@/lib/types/retirement";

export function getProjectionStatus(
  monthlyIncome: number,
  expectedMonthlyExpenses: number,
): ProjectionStatus {
  // Add a small buffer to let users know even if they're not super close, they can reach their target
  const monthlyIncomePlusBuffer =
    monthlyIncome + RETIREMENT_PLAN_PROJECTION_BUFFER_DOLLARS;
  if (monthlyIncomePlusBuffer >= expectedMonthlyExpenses) {
    return "onTrack";
  }

  return "shortfall";
}

export function getProjectionErrorKind(
  error: unknown,
): ProjectionErrorKind | null {
  if (!error) {
    return null;
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : String(error);

  if (message.toLowerCase().includes("not achievable")) {
    return "notAchievable";
  }

  return "unknown";
}

export function getEarliestScenarioIds(
  summaries: ScenarioProjectionSummary[],
): Set<string> {
  const validSummaries = summaries.filter((summary) =>
    Number.isFinite(summary.yearsToRetirement),
  );
  if (validSummaries.length === 0) {
    return new Set();
  }

  const earliestYears = Math.min(
    ...validSummaries.map((summary) => summary.yearsToRetirement),
  );

  return new Set(
    validSummaries
      .filter((summary) => summary.yearsToRetirement === earliestYears)
      .map((summary) => summary.id),
  );
}

export function getHighestIncomeScenarioIds(
  summaries: ScenarioProjectionSummary[],
): Set<string> {
  const validSummaries = summaries.filter((summary) =>
    Number.isFinite(summary.monthlyIncome4pct),
  );
  if (validSummaries.length === 0) {
    return new Set();
  }

  const highestIncome = Math.max(
    ...validSummaries.map((summary) => summary.monthlyIncome4pct),
  );

  return new Set(
    validSummaries
      .filter((summary) => summary.monthlyIncome4pct === highestIncome)
      .map((summary) => summary.id),
  );
}

export function isScenarioLimitReached(
  planCount: number,
  limit: number = SCENARIO_LIMIT,
): boolean {
  return planCount >= limit;
}

export function getScenarioLimitMessage(
  planCount: number,
  limit: number = SCENARIO_LIMIT,
): string | null {
  if (planCount < limit) {
    return null;
  }

  return `You can save up to ${limit} scenarios.`;
}

export function validateRetirementInputs(
  inputs: RetirementFormInputs,
): string[] {
  const errors: string[] = [];

  if (!inputs.planName.trim()) {
    errors.push("Plan name is required.");
  }

  const startingNetWorth = Number(inputs.startingNetWorth);
  if (!Number.isFinite(startingNetWorth) || startingNetWorth <= 0) {
    errors.push("Starting net worth must be a positive amount.");
  }

  const monthlyContribution = Number(inputs.monthlyContribution);
  if (!Number.isFinite(monthlyContribution) || monthlyContribution <= 0) {
    errors.push("Monthly contribution must be a positive amount.");
  }

  const expectedMonthlyExpenses = Number(inputs.expectedMonthlyExpenses);
  if (
    !Number.isFinite(expectedMonthlyExpenses) ||
    expectedMonthlyExpenses <= 0
  ) {
    errors.push("Expected monthly expenses must be a positive amount.");
  }

  const inflationRateInput = inputs.inflationRate.trim();
  if (inflationRateInput) {
    const inflationRate = Number(inflationRateInput);
    if (
      !Number.isFinite(inflationRate) ||
      inflationRate < 0 ||
      inflationRate > 15
    ) {
      errors.push("Inflation rate must be between 0% and 15%.");
    }
  }

  return errors;
}

export function formatNumberForInput(value: number): string {
  if (!Number.isFinite(value)) {
    return "";
  }

  return String(Math.round(value * 100) / 100);
}
