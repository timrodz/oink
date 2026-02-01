import {
  CHART_GRID_LINE_COLOR,
  MIN_NET_WORTH_POINTS_FOR_GROWTH,
  MONTHLY_GROWTH_COLORS,
} from "@/lib/constants/charts";
import { formatCurrencyCompact } from "@/lib/currency-formatting";
import { toPrivateValue } from "@/lib/private-value";
import type { NetWorthDataPoint } from "@/lib/types/net-worth";
import type { ChartData, ChartOptions, ChartType, TooltipItem } from "chart.js";

export function getMonthlyGrowthChartData(
  history: NetWorthDataPoint[] | undefined,
): ChartData<"bar"> | null {
  if (!history || history.length < MIN_NET_WORTH_POINTS_FOR_GROWTH) {
    return null;
  }

  const trimmedHistory = [...history];
  const lastPoint = trimmedHistory[trimmedHistory.length - 1];
  const lastPointIsEmpty =
    lastPoint &&
    (lastPoint.totalAssets == null || lastPoint.totalAssets === 0) &&
    (lastPoint.totalLiabilities == null || lastPoint.totalLiabilities === 0) &&
    (lastPoint.netWorth == null || lastPoint.netWorth === 0);

  if (lastPointIsEmpty) {
    trimmedHistory.pop();
  }

  if (trimmedHistory.length < MIN_NET_WORTH_POINTS_FOR_GROWTH) {
    return null;
  }

  // Calculate monthly changes
  const labels: string[] = [];
  const data: number[] = [];
  const backgroundColors: string[] = [];
  const borderColors: string[] = [];

  for (let i = 1; i < trimmedHistory.length; i++) {
    const current = trimmedHistory[i];
    const previous = trimmedHistory[i - 1];
    const change = current.netWorth - previous.netWorth;

    const date = new Date(current.year, current.month - 1);
    labels.push(
      date.toLocaleString("default", { month: "short", year: "2-digit" }),
    );
    data.push(change);

    if (change >= 0) {
      backgroundColors.push(MONTHLY_GROWTH_COLORS.positive.bg);
      borderColors.push(MONTHLY_GROWTH_COLORS.positive.border);
    } else {
      backgroundColors.push(MONTHLY_GROWTH_COLORS.negative.bg);
      borderColors.push(MONTHLY_GROWTH_COLORS.negative.border);
    }
  }

  return {
    labels,
    datasets: [
      {
        label: "Monthly Growth",
        data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };
}

export function getMonthlyGrowthChartOptions(
  homeCurrency: string,
  isPrivacyMode: boolean = false,
): ChartOptions<"bar"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context: TooltipItem<ChartType>) => {
            let label = context.dataset.label || "";
            if (label) label += ": ";
            if (context.parsed.y !== null) {
              label += toPrivateValue(
                formatCurrencyCompact(context.parsed.y, homeCurrency),
                isPrivacyMode,
              );
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: CHART_GRID_LINE_COLOR },
        ticks: {
          callback: (value: string | number) =>
            toPrivateValue(
              formatCurrencyCompact(+value, homeCurrency),
              isPrivacyMode,
            ),
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };
}
