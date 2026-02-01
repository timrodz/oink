import {
  ASSET_SUB_CATEGORIES,
  LIABILITY_SUB_CATEGORIES,
} from "@/lib/constants/categories";
import {
  CHART_GRID_LINE_COLOR,
  SUB_CATEGORY_COLORS,
} from "@/lib/constants/charts";
import { formatCurrencyCompact } from "@/lib/currency-formatting";
import { toPrivateValue } from "@/lib/private-value";
import type { Account } from "@/lib/types/accounts";
import type { BalanceSheet, Entry } from "@/lib/types/balance-sheets";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";

export interface SubCategoryTrendInput {
  accounts: Account[];
  entries: Entry[];
  balanceSheets: BalanceSheet[];
  accountType: "Asset" | "Liability";
}

export function getSubCategoryTrendChartData(
  input: SubCategoryTrendInput,
): ChartData<"bar"> | null {
  const { accounts, entries, balanceSheets, accountType } = input;

  const filteredAccounts = accounts.filter(
    (a) => a.accountType === accountType && !a.isArchived,
  );

  if (filteredAccounts.length === 0 || balanceSheets.length === 0) return null;

  const accountMap = new Map(filteredAccounts.map((a) => [a.id, a]));
  const balanceSheetYearMap = new Map(
    balanceSheets.map((bs) => [bs.id, bs.year]),
  );

  const sortedSheets = [...balanceSheets].sort((a, b) => a.year - b.year);

  const subCategoryOptions =
    accountType === "Asset" ? ASSET_SUB_CATEGORIES : LIABILITY_SUB_CATEGORIES;

  const periodTotals = new Map<string, Map<string, number>>();

  for (const sheet of sortedSheets) {
    const periodKey = String(sheet.year);
    if (!periodTotals.has(periodKey)) {
      periodTotals.set(periodKey, new Map());
    }
  }

  const latestEntryByAccountPeriod = new Map<
    string,
    { month: number; amount: number }
  >();

  for (const entry of entries) {
    const account = accountMap.get(entry.accountId);
    if (!account) continue;

    const year = balanceSheetYearMap.get(entry.balanceSheetId);
    if (year === undefined) continue;

    const periodKey = String(year);
    const entryKey = `${entry.accountId}-${periodKey}`;

    const existing = latestEntryByAccountPeriod.get(entryKey);
    if (!existing || entry.month > existing.month) {
      latestEntryByAccountPeriod.set(entryKey, {
        month: entry.month,
        amount: entry.amount,
      });
    }
  }

  let hasUncategorized = false;

  for (const [entryKey, { amount }] of latestEntryByAccountPeriod) {
    const [accountId, periodKey] = entryKey.split("-");
    const account = accountMap.get(accountId);
    if (!account || amount === 0) continue;

    const periodMap = periodTotals.get(periodKey);
    if (!periodMap) continue;

    const subCat = account.subCategory ?? "uncategorized";
    if (subCat === "uncategorized") hasUncategorized = true;

    const current = periodMap.get(subCat) ?? 0;
    periodMap.set(subCat, current + amount);
  }

  const labels = sortedSheets.map((s) => String(s.year));

  const datasets: ChartData<"bar">["datasets"] = [];

  for (const option of subCategoryOptions) {
    const data = labels.map((label) => {
      const periodMap = periodTotals.get(label);
      return periodMap?.get(option.key) ?? 0;
    });

    if (data.some((d) => d > 0)) {
      const colors = SUB_CATEGORY_COLORS[option.key];
      datasets.push({
        label: option.label,
        data,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 1,
      });
    }
  }

  if (hasUncategorized) {
    const data = labels.map((label) => {
      const periodMap = periodTotals.get(label);
      return periodMap?.get("uncategorized") ?? 0;
    });

    if (data.some((d) => d > 0)) {
      datasets.push({
        label: "Uncategorized",
        data,
        backgroundColor: SUB_CATEGORY_COLORS.uncategorized.bg,
        borderColor: SUB_CATEGORY_COLORS.uncategorized.border,
        borderWidth: 1,
      });
    }
  }

  if (datasets.length === 0) return null;

  return {
    labels,
    datasets,
  };
}

export function getSubCategoryTrendChartOptions(
  homeCurrency: string,
  isPrivacyMode: boolean = false,
): ChartOptions<"bar"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      tooltip: {
        mode: "index",
        callbacks: {
          label: (context: TooltipItem<"bar">) => {
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
      x: {
        stacked: true,
        grid: { display: false },
      },
      y: {
        stacked: true,
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
  };
}
