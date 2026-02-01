import {
  ASSET_SUB_CATEGORIES,
  LIABILITY_SUB_CATEGORIES,
} from "@/lib/constants/categories";
import { SUB_CATEGORY_COLORS } from "@/lib/constants/charts";
import type { Account } from "@/lib/types/accounts";
import type { Entry } from "@/lib/types/balance-sheets";

export interface SubCategoryBreakdownInput {
  accounts: Account[];
  entries: Entry[];
  accountType: "Asset" | "Liability";
}

export type SubCategoryBreakdownChartPoint = {
  name: string;
  value: number;
  fill: string;
};

export function getSubCategoryBreakdownChartData(
  input: SubCategoryBreakdownInput,
): SubCategoryBreakdownChartPoint[] | null {
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

  const data: SubCategoryBreakdownChartPoint[] = [];

  for (const option of subCategoryOptions) {
    const total = subCategoryTotals.get(option.key);
    if (total && total > 0) {
      const colors = SUB_CATEGORY_COLORS[option.key];
      data.push({
        name: option.label,
        value: total,
        fill: colors.bg,
      });
    }
  }

  if (uncategorizedTotal > 0) {
    data.push({
      name: "Uncategorized",
      value: uncategorizedTotal,
      fill: SUB_CATEGORY_COLORS.uncategorized.bg,
    });
  }

  if (data.length === 0) return null;

  return data;
}
