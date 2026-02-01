import { NET_WORTH_BREAKDOWN_COLORS } from "@/lib/constants/charts";
import type { NetWorthDataPoint } from "@/lib/types/net-worth";

export type NetWorthBreakdownChartPoint = {
  name: "Assets" | "Liabilities";
  value: number;
  fill: string;
};

export function getNetWorthBreakdownChartData(
  latestPoint: NetWorthDataPoint | undefined,
): NetWorthBreakdownChartPoint[] | null {
  if (!latestPoint) return null;

  const assets = Math.abs(latestPoint.totalAssets);
  const liabilities = Math.abs(latestPoint.totalLiabilities);

  if (assets === 0 && liabilities === 0) return null;

  return [
    {
      name: "Assets",
      value: assets,
      fill: NET_WORTH_BREAKDOWN_COLORS.assets.bg,
    },
    {
      name: "Liabilities",
      value: liabilities,
      fill: NET_WORTH_BREAKDOWN_COLORS.liabilities.bg,
    },
  ];
}
