export interface CurrencyRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  month: number; // 1-12
  year: number;
  timestamp: string;
}
