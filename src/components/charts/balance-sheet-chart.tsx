import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import type { BalanceSheetChartPoint } from "@/lib/charts/balance-sheet";
import { formatCurrencyCompact } from "@/lib/currency-formatting";
import { toPrivateValue } from "@/lib/private-value";
import { cn } from "@/lib/utils";
import { usePrivacy } from "@/providers/privacy-provider";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface BalanceSheetChartProps {
  isLoading: boolean;
  chartData: BalanceSheetChartPoint[] | null;
  homeCurrency: string;
  className?: string;
}

export function BalanceSheetChart({
  isLoading,
  chartData,
  homeCurrency,
  className,
}: BalanceSheetChartProps) {
  const { isPrivacyMode } = usePrivacy();

  const chartConfig = {
    netWorth: {
      label: "Net Worth",
      color: "var(--color-chart-1)",
    },
  };

  return (
    <div className={cn("h-75 w-full min-h-[300px]", className)}>
      {isLoading ? (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Loading balance sheet...
        </div>
      ) : chartData ? (
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={chartData} margin={{ left: 8, right: 16, top: 8 }}>
            <defs>
              <linearGradient
                id="balanceSheetGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-chart-1)"
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-chart-1)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                toPrivateValue(
                  formatCurrencyCompact(Number(value), homeCurrency),
                  isPrivacyMode,
                )
              }
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const value = payload[0]?.value;
                const formattedValue =
                  typeof value === "number"
                    ? toPrivateValue(
                        formatCurrencyCompact(value, homeCurrency),
                        isPrivacyMode,
                      )
                    : value;
                return (
                  <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
                    <div className="font-medium">{label}</div>
                    <div className="text-foreground font-mono font-medium tabular-nums">
                      {formattedValue}
                    </div>
                  </div>
                );
              }}
            />
            <Area
              dataKey="netWorth"
              name="Net Worth"
              type="monotone"
              stroke="var(--color-chart-1)"
              fill="url(#balanceSheetGradient)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}
