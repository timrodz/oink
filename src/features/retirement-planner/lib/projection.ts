import { RETIREMENT_PLAN_PROJECTION_BUFFER_DOLLARS } from "@/lib/constants";

export type ProjectionStatus = "onTrack" | "shortfall";
export type ProjectionErrorKind = "notAchievable" | "unknown";

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
