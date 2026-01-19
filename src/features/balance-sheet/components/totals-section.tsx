import { TableCell, TableRow } from "@/components/ui/table";
import { formatDecimal2Digits } from "@/lib/currency-formatting";
import { MonthlyTotal } from "@/lib/types";
import { getGrowth } from "../lib/calculations";

interface TotalsSectionProps {
  monthlyTotals: MonthlyTotal[];
  homeCurrency: string;
}

export function TotalsSection({
  monthlyTotals,
  homeCurrency,
}: TotalsSectionProps) {
  const Warning = () => (
    <span
      className="ml-1 cursor-help select-none"
      title="Missing exchange rates for one or more accounts"
    >
      ⚠️
    </span>
  );

  return (
    <>
      <TableRow className="h-4 border-b-2 border-t-2"></TableRow>

      <TableRow className="font-bold bg-muted/20">
        <TableCell className="sticky left-0 bg-background border-r">
          TOTAL ASSETS ({homeCurrency})
        </TableCell>
        {monthlyTotals.map((t) => (
          <TableCell key={t.month} className="text-right px-4 text-sm">
            {formatDecimal2Digits(t.totalAssets)}
            {t.hasMissingRates && <Warning />}
          </TableCell>
        ))}
      </TableRow>

      <TableRow className="font-bold bg-muted/20">
        <TableCell className="sticky left-0 bg-background border-r">
          TOTAL LIABILITIES ({homeCurrency})
        </TableCell>
        {monthlyTotals.map((t) => (
          <TableCell key={t.month} className="text-right px-4 text-sm">
            {formatDecimal2Digits(t.totalLiabilities)}
            {t.hasMissingRates && <Warning />}
          </TableCell>
        ))}
      </TableRow>

      <TableRow className="font-bold border-t-2 border-black/10 dark:border-white/10 text-base">
        <TableCell className="sticky left-0 bg-background border-r">
          NET WORTH ({homeCurrency})
        </TableCell>
        {monthlyTotals.map((t) => (
          <TableCell key={t.month} className="text-right px-4">
            {formatDecimal2Digits(t.netWorth)}
            {t.hasMissingRates && <Warning />}
          </TableCell>
        ))}
      </TableRow>

      <TableRow className="text-muted-foreground italic text-xs">
        <TableCell className="sticky left-0 bg-background border-r">
          Growth ({homeCurrency})
        </TableCell>
        {monthlyTotals.map((t, i) => (
          <TableCell key={t.month} className="text-right px-4">
            {getGrowth(i, monthlyTotals)}
          </TableCell>
        ))}
      </TableRow>
    </>
  );
}
