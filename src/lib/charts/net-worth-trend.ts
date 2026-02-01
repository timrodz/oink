import {
  CHART_GRID_LINE_COLOR,
  NET_WORTH_TREND_COLORS,
} from "@/lib/constants/charts";
import { formatCurrencyCompact } from "@/lib/currency-formatting";
import { toPrivateValue } from "@/lib/private-value";
import type { NetWorthDataPoint } from "@/lib/types/net-worth";
import type {
  ChartData,
  ChartOptions,
  ChartType,
  ScriptableContext,
  TooltipItem,
} from "chart.js";

export function getNetWorthTrendChartData(
  filteredHistory: NetWorthDataPoint[] | undefined,
): ChartData<"line"> | null {
  if (!filteredHistory || filteredHistory.length === 0) return null;

  return {
    labels: filteredHistory.map((p) => {
      const date = new Date(p.year, p.month - 1);
      return date.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
    }),
    datasets: [
      {
        label: "Net Worth",
        data: filteredHistory.map((p) => p.netWorth),
        fill: true,
        backgroundColor: (context: ScriptableContext<"line">) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, NET_WORTH_TREND_COLORS.gradientStart);
          gradient.addColorStop(1, NET_WORTH_TREND_COLORS.gradientEnd);
          return gradient;
        },
        borderColor: NET_WORTH_TREND_COLORS.line,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
}

export function getNetWorthTrendChartOptions(
  homeCurrency: string,
  isPrivacyMode: boolean = false,
): ChartOptions<"line"> {
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
