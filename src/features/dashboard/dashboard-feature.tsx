import { BalanceSheetCard } from "@/components/balance-sheet-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { YearSelector } from "@/components/year-selector";
import { AccountsListFeature } from "@/features/accounts-list/accounts-list-feature";
import { MonthlyGrowthChart } from "@/features/dashboard/components/monthly-growth-chart";
import { NetWorthBreakdownChart } from "@/features/dashboard/components/net-worth-breakdown-chart";
import { NetWorthKPIs } from "@/features/dashboard/components/net-worth-kpis";
import { NetWorthTrendChart } from "@/features/dashboard/components/net-worth-trend-chart";
import { UserSettingsFormFeature } from "@/features/user-settings-form/user-settings-form-feature";
import { useNetWorthHistory } from "@/hooks/use-net-worth";
import {
  calculateGrowth,
  getFilteredHistory,
  getNetWorthChartData,
} from "@/lib/charts/net-worth-utils";
import { useBalanceSheets, useCreateBalanceSheet } from "@/lib/queries";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Plus, RefreshCw, Settings as SettingsIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

import { useUserSettings } from "@/hooks/use-user-settings";

export function DashboardFeature() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createYearOpen, setCreateYearOpen] = useState(false);
  const navigate = useNavigate();

  // Data Fetching
  const { data: settings, refetch: refetchSettings } = useUserSettings();

  const {
    data: balanceSheets,
    loading: sheetsLoading,
    refetch: refetchSheets,
  } = useBalanceSheets();

  const {
    mutate: createSheet,
    loading: createLoading,
    error: createError,
  } = useCreateBalanceSheet();

  const { data: history, isLoading: historyLoading } = useNetWorthHistory();

  // State
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [timeRange, setTimeRange] = useState("ALL");

  if (!settings) return null; // Should be handled by parent or loading state

  // Logic: Net Worth Calc
  const homeCurrency = settings.homeCurrency;

  // Logic: Chart Data & KPIs
  const filteredHistory = useMemo(
    () => getFilteredHistory(history, timeRange),
    [history, timeRange],
  );

  const chartData = useMemo(
    () => getNetWorthChartData(filteredHistory),
    [filteredHistory],
  );

  // Time-aware KPI Logic
  const latestPoint =
    filteredHistory.length > 0
      ? filteredHistory[filteredHistory.length - 1]
      : undefined;
  const startPoint =
    filteredHistory.length > 0 ? filteredHistory[0] : undefined;

  const currentNetWorth = latestPoint?.netWorth || 0;
  const startNetWorth = startPoint?.netWorth || 0;

  const growth = calculateGrowth(currentNetWorth, startNetWorth);

  const totalAssets = latestPoint?.totalAssets || 0;
  const totalLiabilities = latestPoint?.totalLiabilities || 0;

  const handleCreateSheet = async () => {
    if (!selectedYear) return;
    try {
      await createSheet(selectedYear);
      await refetchSheets();
      setCreateYearOpen(false);
      setSelectedYear(undefined);
    } catch (e) {
      console.error(e);
    }
  };

  const existingYears = balanceSheets?.map((bs) => bs.year) ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="border-b pt-4">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">
              Hello, {settings.name}
            </span>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <SettingsIcon className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>
                    Update your personal preferences.
                  </DialogDescription>
                </DialogHeader>
                <UserSettingsFormFeature
                  onComplete={() => {
                    refetchSettings();
                    setSettingsOpen(false);
                  }}
                  initialValues={{
                    name: settings.name,
                    currency: settings.homeCurrency,
                    theme: settings.theme,
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* SECTION 1: Net Worth Overview */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Net Worth Overview</h2>
            <Tabs
              value={timeRange}
              onValueChange={setTimeRange}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="5Y">5Y</TabsTrigger>
                <TabsTrigger value="1Y">1Y</TabsTrigger>
                <TabsTrigger value="YTD">YTD</TabsTrigger>
                <TabsTrigger value="6M">6M</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* KPI Cards */}
          <NetWorthKPIs
            currentNetWorth={currentNetWorth}
            momGrowth={growth.percentage} // Reusing prop name but passing period growth
            totalAssets={totalAssets}
            totalLiabilities={totalLiabilities}
            homeCurrency={homeCurrency}
            periodLabel={timeRange === "ALL" ? "all time" : `in ${timeRange}`}
          />

          {/* Charts Area with Tabs */}
          <Tabs defaultValue="trend" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="trend">Trend</TabsTrigger>
                <TabsTrigger value="growth">Monthly Growth</TabsTrigger>
                <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              </TabsList>

              {/* Render Time Range Selector here, only for charts that need it?
                  Actually NetWorthTrendChart HAD the selector inside it.
                  We should lift it up or pass it down.
                  The filteredHistory depends on timeRange.
                  So the selector must controls `timeRange` state in DashboardFeature.
                  NetWorthTrendChart receives `timeRange` and `setTimeRange`.
                  But other charts also need `filteredHistory`.
              */}
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
              {/*  Time Range Selector - We can keep it inside NetWorthTrendChart for now,
                      OR move it out. If we move it out, it applies to ALL charts.
                      "Accurate to time range filters" implies it applies to all.
                      Let's move it OUT of NetWorthTrendChart and put it above the tabs?
                      Or inside the Tab content?
                      The NetWorthTrendChart component CURRENTLY renders the Tabs for time selection.
                      Let's extract that to a simpler component or render it here.
                  */}

              <TabsContent value="trend" className="mt-0">
                <NetWorthTrendChart
                  isLoading={historyLoading}
                  chartData={chartData}
                  homeCurrency={homeCurrency}
                />
              </TabsContent>
              <TabsContent value="growth" className="mt-0">
                <MonthlyGrowthChart
                  filteredHistory={filteredHistory}
                  homeCurrency={homeCurrency}
                />
              </TabsContent>
              <TabsContent value="breakdown" className="mt-0">
                <NetWorthBreakdownChart latestPoint={latestPoint} />
              </TabsContent>
            </div>
          </Tabs>
        </section>

        {/* SECTION 2: Balance Sheets */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Balance Sheets</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {sheetsLoading ? (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                Loading balance sheets...
              </div>
            ) : (
              <>
                {balanceSheets.map((sheet) => (
                  <BalanceSheetCard
                    key={sheet.id}
                    balanceSheet={sheet}
                    onClick={() => navigate(`/balance-sheets/${sheet.year}`)}
                  />
                ))}

                {/* Create New Card */}
                <Dialog
                  open={createYearOpen}
                  onOpenChange={(open) => {
                    setCreateYearOpen(open);
                    if (!open) setSelectedYear(undefined);
                  }}
                >
                  <DialogTrigger asChild>
                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[140px] cursor-pointer hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground">
                      <Plus className="h-8 w-8 mb-2" />
                      <span className="font-medium">New Balance Sheet</span>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Balance Sheet</DialogTitle>
                      <DialogDescription>
                        Select a year to begin tracking. Note: if the year is
                        missing, that means you already have a balance sheet for
                        it.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      {createError && (
                        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                          {createError}
                        </div>
                      )}

                      <div className="space-y-2">
                        <YearSelector
                          existingYears={existingYears}
                          value={selectedYear}
                          onChange={setSelectedYear}
                          disabled={createLoading}
                        />
                      </div>

                      <Button
                        onClick={handleCreateSheet}
                        className="w-full"
                        disabled={!selectedYear || createLoading}
                      >
                        {createLoading && (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {createLoading ? "Creating..." : "Create Balance Sheet"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </section>

        {/* SECTION 3: Accounts */}
        <section>
          <AccountsListFeature homeCurrency={settings.homeCurrency} />
        </section>
      </main>
    </div>
  );
}
