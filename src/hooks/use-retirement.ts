import { api } from "@/lib/api";
import { ReturnScenario } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export const RETIREMENT_KEYS = {
  all: ["retirement"] as const,
  projection: (inputs: {
    startingNetWorth: number;
    monthlyContribution: number;
    expectedMonthlyExpenses: number;
    returnScenario: ReturnScenario;
  }) =>
    [
      ...RETIREMENT_KEYS.all,
      "projection",
      inputs.startingNetWorth,
      inputs.monthlyContribution,
      inputs.expectedMonthlyExpenses,
      inputs.returnScenario,
    ] as const,
};

export function useRetirementProjection(
  inputs: {
    startingNetWorth: number;
    monthlyContribution: number;
    expectedMonthlyExpenses: number;
    returnScenario: ReturnScenario;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: RETIREMENT_KEYS.projection(inputs),
    queryFn: () =>
      api.calculateRetirementProjection(
        inputs.startingNetWorth,
        inputs.monthlyContribution,
        inputs.expectedMonthlyExpenses,
        inputs.returnScenario,
      ),
    enabled: options?.enabled,
  });
}
