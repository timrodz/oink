export interface BalanceSheet {
  id: string;
  year: number;
  createdAt: string;
}

export interface Entry {
  id: string;
  balanceSheetId: string;
  accountId: string;
  month: number;
  amount: number;
  updatedAt: string;
}

export interface MonthlyTotal {
  month: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  hasMissingRates: boolean;
}
