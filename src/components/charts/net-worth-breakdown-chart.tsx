import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PrivateValue } from "@/components/ui/private-value";
import type { NetWorthBreakdownChartPoint } from "@/lib/charts/net-worth-breakdown";
import { formatCurrency } from "@/lib/currency-formatting";
import { cn } from "@/lib/utils";
import { Cell, Pie, PieChart } from "recharts";

interface NetWorthBreakdownChartProps {
  isLoading: boolean;
  chartData: NetWorthBreakdownChartPoint[] | null;
  homeCurrency: string;
  className?: string;
}

export function NetWorthBreakdownChart({
  isLoading,
  chartData,
  homeCurrency,
  className,
}: NetWorthBreakdownChartProps) {
  const chartConfig = {
    Assets: { label: "Assets" },
    Liabilities: { label: "Liabilities" },
  } as const;

  return (
    <div className={cn("h-75 w-full min-h-[300px]", className)}>
      {isLoading ? (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Loading trend...
        </div>
      ) : chartData ? (
        <ChartContainer config={chartConfig} className="h-full w-full">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelKey="name"
                  formatter={(value) => (
                    <PrivateValue
                      value={formatCurrency(Number(value), homeCurrency)}
                    />
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              strokeWidth={1}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${entry.name}-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              verticalAlign="bottom"
            />
          </PieChart>
        </ChartContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}
