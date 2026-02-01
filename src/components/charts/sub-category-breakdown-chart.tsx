import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PrivateValue } from "@/components/ui/private-value";
import type { SubCategoryBreakdownChartPoint } from "@/lib/charts/sub-category-breakdown";
import { formatCurrency } from "@/lib/currency-formatting";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";

interface SubCategoryBreakdownChartProps {
  isLoading: boolean;
  chartData: SubCategoryBreakdownChartPoint[] | null;
  title: string;
  homeCurrency: string;
  className?: string;
}

export function SubCategoryBreakdownChart({
  isLoading,
  chartData,
  title,
  homeCurrency,
  className,
}: SubCategoryBreakdownChartProps) {
  const chartConfig = useMemo(() => {
    if (!chartData) return {};
    return Object.fromEntries(
      chartData.map((item) => [item.name, { label: item.name }]),
    );
  }, [chartData]);

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-medium text-muted-foreground text-center">
        {title}
      </h4>
      <div className="h-[280px] w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Loading...
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
    </div>
  );
}
