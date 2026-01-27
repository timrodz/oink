import { RetirementProjectionChart } from "@/components/charts/retirement-projection-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRetirementPlanProjections } from "@/hooks/use-retirement";
import { getRetirementProjectionChartData } from "@/lib/charts";
import type { RetirementPlan } from "@/lib/types/retirement";
import { useMemo } from "react";

interface NetWorthGrowthProjectionProps {
  chartPlanId: string | null;
  savedPlansLoading: boolean;
  homeCurrency: string;
  chartPlan: RetirementPlan | null;
}

export function NetWorthGrowthProjection({
  chartPlanId,
  savedPlansLoading,
  homeCurrency,
  chartPlan,
}: NetWorthGrowthProjectionProps) {
  const { data: chartProjectionDataPoints, isLoading: chartProjectionLoading } =
    useRetirementPlanProjections(chartPlanId, {
      enabled: Boolean(chartPlanId),
    });

  const chartData = useMemo(
    () =>
      getRetirementProjectionChartData(chartProjectionDataPoints, {
        projectedRetirementDate: chartPlan?.targetRetirementDate || null,
      }),
    [chartProjectionDataPoints, chartPlan?.targetRetirementDate],
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">Net worth growth projection</CardTitle>
        <CardDescription>
          {chartPlan
            ? `Projected growth for "${chartPlan.name}" scenario`
            : "Save a scenario to view your projected net worth growth over time."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!chartPlanId && !savedPlansLoading && (
          <div className="rounded-md border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
            Save a retirement scenario to see your projected net worth growth.
          </div>
        )}
        {chartPlanId && (
          <RetirementProjectionChart
            isLoading={chartProjectionLoading}
            chartData={chartData}
            homeCurrency={homeCurrency}
          />
        )}
        {chartPlan && chartPlan.targetRetirementDate && (
          <p className="mt-3 text-xs text-muted-foreground">
            The green marker indicates your projected retirement date (
            {new Intl.DateTimeFormat(undefined, {
              year: "numeric",
            }).format(new Date(chartPlan.targetRetirementDate))}
            ).
          </p>
        )}
      </CardContent>
    </Card>
  );
}
