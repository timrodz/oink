import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MONTHS } from "@/lib/constants";
import { MonthlyTotal } from "@/lib/types";
import { TotalsSection } from "./totals-section";

interface TotalsGridProps {
  monthlyTotals: MonthlyTotal[];
  homeCurrency: string;
}

export function TotalsGrid({ monthlyTotals, homeCurrency }: TotalsGridProps) {
  return (
    <div className="border rounded-md overflow-x-auto">
      <Table className="min-w-[1200px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px] sticky left-0 z-10 bg-background border-r font-bold">
              Totals
            </TableHead>
            {MONTHS.map((month) => (
              <TableHead key={month} className="text-right min-w-[100px]">
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
