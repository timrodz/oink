import { NET_WORTH_BREAKDOWN_COLORS } from "@/lib/constants/charts";
import { toPrivateValue } from "@/lib/private-value";
import type { NetWorthDataPoint } from "@/lib/types/net-worth";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";

export function getNetWorthBreakdownChartData(
  latestPoint: NetWorthDataPoint | undefined,
): ChartData<"doughnut"> | null {
  if (!latestPoint) return null;

  const assets = Math.abs(latestPoint.totalAssets);
  const liabilities = Math.abs(latestPoint.totalLiabilities);

  if (assets === 0 && liabilities === 0) return null;

  return {
    labels: ["Assets", "Liabilities"],
    datasets: [
      {
        data: [assets, liabilities],
        backgroundColor: [
          NET_WORTH_BREAKDOWN_COLORS.assets.bg,
          NET_WORTH_BREAKDOWN_COLORS.liabilities.bg,
        ],
        borderColor: [
          NET_WORTH_BREAKDOWN_COLORS.assets.border,
          NET_WORTH_BREAKDOWN_COLORS.liabilities.border,
        ],
        borderWidth: 1,
      },
    ],
  };
}

export function getNetworthBreakdownChartOptions(
  isPrivacyMode: boolean,
): ChartOptions<"doughnut"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"doughnut">) => {
            let label = context.label || "";
            if (label) label += ": ";
            label += toPrivateValue(context.formattedValue, isPrivacyMode);
            return label;
          },
        },
      },
    },
  };
}
