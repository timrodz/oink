import { MONTHS } from "@/lib/constants/time";
import {
  formatCurrency,
  formatCurrencyCompact,
} from "@/lib/currency-formatting";
import { toPrivateValue } from "@/lib/private-value";
import type { MonthlyTotal } from "@/lib/types/balance-sheets";
import type { ChartOptions } from "chart.js";

export function getBalanceSheetChartData(monthlyTotals: MonthlyTotal[]) {
  const labels = [...MONTHS];
  const netWorthData = monthlyTotals.map((t) => t.netWorth);

  return {
    labels,
    datasets: [
      {
        label: "Net Worth",
        data: netWorthData,
        fill: true,
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsla(var(--primary), 0.1)",
        tension: 0.4,
      },
    ],
  };
}

export function getBalanceSheetChartOptions(
  homeCurrency: string,
  isPrivacyMode: boolean = false,
): ChartOptions<"line"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += toPrivateValue(
                formatCurrency(context.parsed.y, homeCurrency),
                isPrivacyMode,
              );
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: "hsl(var(--muted))",
        },
        ticks: {
          callback: function (value) {
            return toPrivateValue(
              formatCurrencyCompact(+value, homeCurrency),
              isPrivacyMode,
            );
          },
        },
      },
    },
  };
}
