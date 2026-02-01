import {
  CHART_GRID_LINE_COLOR,
  NET_WORTH_TREND_COLORS,
  RETIREMENT_PROJECTION_POINT_COLORS,
} from "@/lib/constants/charts";
import { formatCurrencyCompact } from "@/lib/currency-formatting";
import { getRetirementYearFromDateString } from "@/lib/dates";
import { toPrivateValue } from "@/lib/private-value";
import type { RetirementPlanProjection } from "@/lib/types/retirement";
import type {
  ChartData,
  ChartOptions,
  ChartType,
  ScriptableContext,
  TooltipItem,
} from "chart.js";

export interface RetirementProjectionChartDataOptions {
  projectedRetirementDate: string | null;
}

export function getRetirementProjectionChartData(
  projections: RetirementPlanProjection[] | undefined,
  options?: RetirementProjectionChartDataOptions,
): ChartData<"line"> | null {
  if (!projections || projections.length === 0) return null;

  const yearlyMap = new Map<number, number>();
  const retirementYear = options?.projectedRetirementDate
    ? getRetirementYearFromDateString(options.projectedRetirementDate)
    : null;

  for (const p of projections) {
    if (!yearlyMap.has(p.year) || p.month === 12) {
      yearlyMap.set(p.year, p.projectedNetWorth);
    }
  }

  const sortedYears = Array.from(yearlyMap.keys()).sort((a, b) => a - b);
  const labels = sortedYears.map((y) => String(y));
  const data = sortedYears.map((y) => yearlyMap.get(y) ?? 0);

  const pointBackgroundColors = sortedYears.map((y) =>
    retirementYear && y === retirementYear
      ? RETIREMENT_PROJECTION_POINT_COLORS.highlight
      : RETIREMENT_PROJECTION_POINT_COLORS.default,
  );
  const pointRadii = sortedYears.map((y) =>
    retirementYear && y === retirementYear ? 6 : 3,
  );

  return {
    labels,
    datasets: [
      {
        label: "Projected Net Worth",
        data,
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
        pointRadius: pointRadii,
        pointHoverRadius: 6,
        pointBackgroundColor: pointBackgroundColors,
      },
    ],
  };
}

export function getRetirementProjectionChartOptions(
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
