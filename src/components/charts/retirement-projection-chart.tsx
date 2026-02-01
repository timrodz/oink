import { getRetirementProjectionChartOptions } from "@/lib/charts/retirement-projection";
import { cn } from "@/lib/utils";
import { usePrivacy } from "@/providers/privacy-provider";
import { ChartData } from "chart.js";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

interface RetirementProjectionChartProps {
  isLoading: boolean;
  chartData: ChartData<"line"> | null;
  homeCurrency: string;
  className?: string;
}

export function RetirementProjectionChart({
  isLoading,
  chartData,
  homeCurrency,
  className,
}: RetirementProjectionChartProps) {
  const { isPrivacyMode } = usePrivacy();
  const chartOptions = useMemo(
    () => getRetirementProjectionChartOptions(homeCurrency, isPrivacyMode),
    [homeCurrency, isPrivacyMode],
  );

  return (
    <div className={cn("h-75 w-full", className)}>
      {isLoading ? (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Loading projection chart...
        </div>
      ) : chartData ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          No projection data available
        </div>
      )}
    </div>
  );
}
