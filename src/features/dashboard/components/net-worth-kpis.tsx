import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrivateValue } from "@/components/ui/private-value";
import { formatCurrency } from "@/lib/currency-formatting";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  TrendingUpIcon,
} from "lucide-react";

interface NetWorthKPIsProps {
  currentNetWorth: number;
  momGrowth: number;
  totalAssets: number;
  assetGrowth?: number;
  totalLiabilities: number;
  liabilityGrowth?: number;
  homeCurrency: string;
  periodLabel?: string;
}

function getTrendLabel(value: number) {
  if (value > 0) return "Trending up";
  if (value < 0) return "Trending down";
  return "No change";
}

export function NetWorthKPIs({
  currentNetWorth,
  momGrowth,
  totalAssets,
  assetGrowth,
  totalLiabilities,
  liabilityGrowth,
  homeCurrency,
  periodLabel = "from last month",
}: NetWorthKPIsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          <span className="inline-flex items-center gap-1 rounded-full border border-current/20 bg-muted/30 px-2 py-0.5 text-xs font-medium">
            {momGrowth > 0 ? (
              <ArrowUpRightIcon className="h-3 w-3" />
            ) : momGrowth < 0 ? (
              <ArrowDownRightIcon className="h-3 w-3" />
            ) : (
              <span className="text-[10px]">—</span>
            )}
            <PrivateValue value={`${Math.abs(momGrowth).toFixed(1)}%`} />
          </span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <PrivateValue
              value={formatCurrency(currentNetWorth, homeCurrency)}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUpIcon className="h-4 w-4" />
            <span>{getTrendLabel(momGrowth)} this month</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{periodLabel}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          {assetGrowth !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full border border-current/20 bg-muted/30 px-2 py-0.5 text-xs font-medium">
              {assetGrowth > 0 ? (
                <ArrowUpRightIcon className="h-3 w-3" />
              ) : assetGrowth < 0 ? (
                <ArrowDownRightIcon className="h-3 w-3" />
              ) : (
                <span className="text-[10px]">—</span>
              )}
              <PrivateValue value={`${Math.abs(assetGrowth).toFixed(1)}%`} />
            </span>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <PrivateValue value={formatCurrency(totalAssets, homeCurrency)} />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUpIcon className="h-4 w-4" />
            <span>{getTrendLabel(assetGrowth ?? 0)} this month</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{periodLabel}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Liabilities
          </CardTitle>
          {liabilityGrowth !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full border border-current/20 bg-muted/30 px-2 py-0.5 text-xs font-medium">
              {liabilityGrowth > 0 ? (
                <ArrowUpRightIcon className="h-3 w-3" />
              ) : liabilityGrowth < 0 ? (
                <ArrowDownRightIcon className="h-3 w-3" />
              ) : (
                <span className="text-[10px]">—</span>
              )}
              <PrivateValue
                value={`${Math.abs(liabilityGrowth).toFixed(1)}%`}
              />
            </span>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <PrivateValue
              value={formatCurrency(totalLiabilities, homeCurrency)}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUpIcon className="h-4 w-4" />
            <span>{getTrendLabel(liabilityGrowth ?? 0)} this month</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{periodLabel}</p>
        </CardContent>
      </Card>
    </div>
  );
}
