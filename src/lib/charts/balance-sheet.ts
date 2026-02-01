import type { MonthlyTotal } from "@/lib/types/balance-sheets";
import { MONTHS } from "@/lib/constants/time";

export type BalanceSheetChartPoint = {
  label: string;
  netWorth: number;
};

export function getBalanceSheetChartData(
  monthlyTotals: MonthlyTotal[],
): BalanceSheetChartPoint[] {
  return monthlyTotals.map((total, index) => ({
    label: MONTHS[index] ?? "",
    netWorth: total.netWorth,
  }));
}
