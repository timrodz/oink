export type ProjectionStatus = "onTrack" | "shortfall";

export function getProjectionStatus(
  monthlyIncome: number,
  expectedMonthlyExpenses: number,
): ProjectionStatus {
  if (monthlyIncome >= expectedMonthlyExpenses) {
    return "onTrack";
  }

  return "shortfall";
}
