export type ReturnScenario = "conservative" | "moderate" | "aggressive";

export interface RetirementPlan {
  id: string;
  name: string;
  targetRetirementDate: string | null;
  startingNetWorth: number;
  monthlyContribution: number;
  expectedMonthlyExpenses: number;
  returnScenario: ReturnScenario;
  inflationRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface RetirementProjection {
  projectedRetirementDate: string | null;
  yearsToRetirement: number;
  finalNetWorth: number;
  monthlyIncome3pct: number;
  monthlyIncome4pct: number;
  inflationAdjustedExpenses: number;
}

export interface RetirementPlanProjection {
  id: string;
  planId: string;
  year: number;
  month: number;
  projectedNetWorth: number;
  createdAt: string;
}

export type ProjectionStatus = "onTrack" | "shortfall";
export type ProjectionErrorKind = "notAchievable" | "unknown";

export interface ScenarioProjectionSummary {
  id: string;
  yearsToRetirement: number;
  monthlyIncome3pct: number;
  monthlyIncome4pct: number;
}

export interface RetirementFormInputs {
  planName: string;
  startingNetWorth: string;
  monthlyContribution: string;
  expectedMonthlyExpenses: string;
  inflationRate: string;
}
