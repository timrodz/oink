import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MONTHS } from "@/lib/constants/time";
import type { MonthlyTotal } from "@/lib/types/balance-sheets";
import { TotalsSection } from "./totals-section";

interface TotalsGridProps {
  monthlyTotals: MonthlyTotal[];
  homeCurrency: string;
}

export function TotalsGrid({ monthlyTotals, homeCurrency }: TotalsGridProps) {
  return (
    <div className="border rounded-md overflow-x-auto">
      <Table className="min-w-300">
        <TableHeader>
          <TableRow>
            <TableHead className="w-75 sticky left-0 z-10 bg-background border-r font-bold">
              Totals
            </TableHead>
            {MONTHS.map((month) => (
              <TableHead key={month} className="text-right min-w-25">
                {month}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TotalsSection
            monthlyTotals={monthlyTotals}
            homeCurrency={homeCurrency}
          />
        </TableBody>
      </Table>
    </div>
  );
}
