import { NetWorthDataPoint } from "@/lib/api";
import {
  getMonthlyGrowthChartData,
  getNetWorthChartOptions,
} from "@/lib/charts/net-worth-utils";
import { cn } from "@/lib/utils";
import { usePrivacy } from "@/providers/privacy-provider";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface MonthlyGrowthChartProps {
  filteredHistory: NetWorthDataPoint[] | undefined;
  homeCurrency: string;
  className?: string;
}

export function MonthlyGrowthChart({
  filteredHistory,
  homeCurrency,
  className,
}: MonthlyGrowthChartProps) {
  const { isPrivacyMode } = usePrivacy();
  const chartData = useMemo(
    () => getMonthlyGrowthChartData(filteredHistory),
    [filteredHistory],
  );

  const chartOptions = useMemo(
    () => getNetWorthChartOptions(homeCurrency, isPrivacyMode),
    [homeCurrency, isPrivacyMode],
  );

  if (!chartData) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Not enough data for growth chart
      </div>
    );
  }

  return (
    <div className={cn("h-[300px] w-full", className)}>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
