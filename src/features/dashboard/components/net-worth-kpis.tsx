import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency-formatting";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";

interface NetWorthKPIsProps {
  currentNetWorth: number;
  momGrowth: number;
  totalAssets: number;
  totalLiabilities: number;
  homeCurrency: string;
  periodLabel?: string;
}

export function NetWorthKPIs({
  currentNetWorth,
  momGrowth,
  totalAssets,
  totalLiabilities,
  homeCurrency,
  periodLabel = "from last month",
}: NetWorthKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(currentNetWorth, homeCurrency)}
          </div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {momGrowth !== 0 && (
              <span
                className={
                  momGrowth >= 0
                    ? "text-green-600 flex items-center"
                    : "text-red-600 flex items-center"
                }
              >
                {momGrowth >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(momGrowth).toFixed(1)}%
              </span>
            )}
            <span className="ml-1">{periodLabel}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalAssets, homeCurrency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            across all accounts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Liabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalLiabilities, homeCurrency)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            outstanding debts
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
