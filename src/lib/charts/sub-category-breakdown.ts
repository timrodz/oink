import {
  ASSET_SUB_CATEGORIES,
  LIABILITY_SUB_CATEGORIES,
} from "@/lib/constants/categories";
import { SUB_CATEGORY_COLORS } from "@/lib/constants/charts";
import { toPrivateValue } from "@/lib/private-value";
import type { Account } from "@/lib/types/accounts";
import type { Entry } from "@/lib/types/balance-sheets";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";

export interface SubCategoryBreakdownInput {
  accounts: Account[];
  entries: Entry[];
  accountType: "Asset" | "Liability";
}

export function getSubCategoryBreakdownChartData(
  input: SubCategoryBreakdownInput,
): ChartData<"doughnut"> | null {
  const { accounts, entries, accountType } = input;

  const filteredAccounts = accounts.filter(
    (a) => a.accountType === accountType && !a.isArchived,
  );

  if (filteredAccounts.length === 0) return null;

  const latestEntryByAccount = new Map<string, number>();
  for (const entry of entries) {
    const existing = latestEntryByAccount.get(entry.accountId);
    if (existing === undefined || entry.month > existing) {
      latestEntryByAccount.set(entry.accountId, entry.amount);
    }
  }

  const subCategoryTotals = new Map<string, number>();
  let uncategorizedTotal = 0;

  for (const account of filteredAccounts) {
    const balance = Math.abs(latestEntryByAccount.get(account.id) ?? 0);
    if (balance === 0) continue;

    if (account.subCategory) {
      const current = subCategoryTotals.get(account.subCategory) ?? 0;
      subCategoryTotals.set(account.subCategory, current + balance);
    } else {
      uncategorizedTotal += balance;
    }
  }

  const subCategoryOptions =
    accountType === "Asset" ? ASSET_SUB_CATEGORIES : LIABILITY_SUB_CATEGORIES;

  const labels: string[] = [];
  const data: number[] = [];
  const backgroundColors: string[] = [];
  const borderColors: string[] = [];

  for (const option of subCategoryOptions) {
    const total = subCategoryTotals.get(option.key);
    if (total && total > 0) {
      labels.push(option.label);
      data.push(total);
      const colors = SUB_CATEGORY_COLORS[option.key];
      backgroundColors.push(colors.bg);
      borderColors.push(colors.border);
    }
  }

  if (uncategorizedTotal > 0) {
    labels.push("Uncategorized");
    data.push(uncategorizedTotal);
    backgroundColors.push(SUB_CATEGORY_COLORS.uncategorized.bg);
    borderColors.push(SUB_CATEGORY_COLORS.uncategorized.border);
  }

  if (data.length === 0) return null;

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };
}

export function getSubCategoryBreakdownChartOptions(
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
