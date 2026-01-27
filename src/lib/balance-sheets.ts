import { MONTHS } from "@/lib/constants/time";
import { formatDecimal2Digits } from "@/lib/currency-formatting";
import type { Account } from "@/lib/types/accounts";
import type { Entry, MonthlyTotal } from "@/lib/types/balance-sheets";
import type { CurrencyRate } from "@/lib/types/currency-rates";

export const calculateMonthlyTotals = (
  accounts: Account[],
  entries: Entry[],
  rates: CurrencyRate[],
  balanceSheetYear: number,
  homeCurrency: string,
): MonthlyTotal[] => {
  const totals = MONTHS.map((_, i) => ({
    month: i + 1,
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
    hasMissingRates: false,
  }));

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  // Create a map for faster rate lookups: "fromCurrency-toCurrency-month"
  // We assume rates are filtered by year already, or we check year too.
  // Since the function takes balanceSheetYear, we can check year or just assume the passed rates are relevant.
  // Best to check year if the list includes all years.
  const rateMap = new Map<string, number>();
  rates.forEach((r) => {
    if (r.year === balanceSheetYear) {
      rateMap.set(`${r.fromCurrency}-${r.toCurrency}-${r.month}`, r.rate);
    }
  });

  entries.forEach((entry) => {
    const account = accountMap.get(entry.accountId);
    if (!account) return;

    const monthIndex = entry.month - 1;
    if (monthIndex >= 0 && monthIndex < MONTHS.length) {
      let amount = entry.amount;
      let isRateMissing = false;

      // Currency Conversion
      if (account.currency !== homeCurrency) {
        const key = `${account.currency}-${homeCurrency}-${entry.month}`;
        const rate = rateMap.get(key);

        if (rate !== undefined) {
          amount = amount * rate;
        } else {
          // Missing rate: Fallback to 1.0 (no-op) and flag it
          isRateMissing = true;
        }
      }

      // Add to totals
      if (account.accountType === "Asset") {
        totals[monthIndex].totalAssets += amount;
      } else {
        totals[monthIndex].totalLiabilities += amount;
      }

      if (isRateMissing) {
        totals[monthIndex].hasMissingRates = true;
      }
    }
  });

  totals.forEach((t) => {
    t.netWorth = t.totalAssets - t.totalLiabilities;
  });

  return totals;
};

export const getEntryValue = (
  account: Account,
  month: number,
  entries: Entry[],
) => {
  const entry = entries.find(
    (e) => e.accountId === account.id && e.month === month,
  );
  if (!entry) return "";

  return formatDecimal2Digits(entry.amount);
};

export const getEntryAmount = (
  account: Account,
  month: number,
  entries: Entry[],
) => {
  return entries.find((e) => e.accountId === account.id && e.month === month)
    ?.amount;
};

export const getGrowth = (
  monthIndex: number,
  monthlyTotals: MonthlyTotal[],
) => {
  if (monthIndex <= 0 || monthIndex >= monthlyTotals.length) {
    return "—";
  }
  const current = monthlyTotals[monthIndex].netWorth;
  const prev = monthlyTotals[monthIndex - 1].netWorth;
  const diff = current - prev;
  const symbol = diff > 0 ? "+" : "";
  const formattedDiff = `${symbol}${formatDecimal2Digits(diff)}`;

  if (prev === 0) {
    return formattedDiff;
  }

  const percent = (diff / Math.abs(prev)) * 100;
  const formattedPercent = `${percent > 0 ? "+" : ""}${percent.toFixed(1)}%`;

  return `${formattedDiff} (${formattedPercent})`;
};
