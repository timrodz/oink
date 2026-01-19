const getLocale = (): string | undefined =>
  typeof navigator !== "undefined" ? navigator.language : undefined;

export function formatCurrency(
  value: number | bigint,
  homeCurrency?: string,
): string {
  return new Intl.NumberFormat(getLocale(), {
    style: "currency",
    currency: homeCurrency,
  }).format(value);
}

export function formatCurrencyCompact(
  value: number | bigint,
  homeCurrency?: string,
): string {
  return new Intl.NumberFormat(getLocale(), {
    notation: "compact",
    compactDisplay: "short",
    style: "currency",
    currency: homeCurrency,
  }).format(value);
}

export function formatDecimal2Digits(value: number | bigint): string {
  return new Intl.NumberFormat(getLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyRate(value: number | bigint | undefined): string {
  if (value === undefined || value === null) return "";
  return new Intl.NumberFormat(getLocale(), {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value);
}
