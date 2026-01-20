import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { BalanceSheetChart } from "@/components/charts/balance-sheet-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MONTHS } from "@/lib/constants";
import {
  useAccounts,
  useCurrencyRates,
  useDeleteBalanceSheet,
  useEntries,
  useUpsertCurrencyRate,
  useUpsertEntry,
} from "@/lib/queries";
import { BalanceSheet } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AccountSection } from "./components/account-section";
import { ExchangeRatesGrid } from "./components/exchange-rates-grid";
import { TotalsSection } from "./components/totals-section";
import { calculateMonthlyTotals } from "./lib/calculations";

interface BalanceSheetFeatureProps {
  balanceSheet: BalanceSheet;
  homeCurrency: string;
}

const TOTAL_COLUMNS = 14;

export function BalanceSheetFeature({
  balanceSheet,
  homeCurrency,
}: BalanceSheetFeatureProps) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: accounts, loading: accountsLoading } = useAccounts(true);
  const {
    data: entries,
    loading: entriesLoading,
    refetch: refetchEntries,
    setData: setEntries,
  } = useEntries(balanceSheet.id);
  const { mutate: upsertEntry } = useUpsertEntry();
  const { mutate: deleteBalanceSheet } = useDeleteBalanceSheet();

  const {
    data: rates,
    loading: ratesLoading,
    refetch: refetchRates,
    setData: setRates,
  } = useCurrencyRates(balanceSheet.year);
  const { mutate: upsertRate } = useUpsertCurrencyRate();

  const accountsRef = useRef<HTMLDivElement>(null);
  const ratesRef = useRef<HTMLDivElement>(null);
  const totalsRef = useRef<HTMLDivElement>(null);

  const syncScroll = (activeRef: React.RefObject<HTMLDivElement | null>) => {
    if (!activeRef.current) return;
    const scrollLeft = activeRef.current.scrollLeft;

    [accountsRef, ratesRef, totalsRef].forEach((ref) => {
      if (ref !== activeRef && ref.current) {
        ref.current.scrollLeft = scrollLeft;
      }
    });
  };

  const handleEntryChange = async (
    accountId: string,
    month: number,
    amount: number,
  ) => {
    // Optimistic update
    const previousEntries = [...entries];
    setEntries((prev) => {
      const existingIndex = prev.findIndex(
        (e) => e.accountId === accountId && e.month === month,
      );
      if (existingIndex >= 0) {
        const newEntries = [...prev];
        newEntries[existingIndex] = { ...newEntries[existingIndex], amount };
        return newEntries;
      } else {
        // New entry (mock id/timestamps for visual purposes)
        return [
          ...prev,
          {
            id: "temp",
            balanceSheetId: balanceSheet.id,
            accountId,
            month,
            amount,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }
    });

    try {
      await upsertEntry(balanceSheet.id, accountId, month, amount);
      refetchEntries();
    } catch (e) {
      console.error("Failed to update entry:", e);
      setEntries(previousEntries);
    }
  };

  const handleRateChange = async (
    fromCurrency: string,
    month: number,
    rate: number,
  ) => {
    // Find existing rate to get ID
    const existingRate = rates.find(
      (r) =>
        r.fromCurrency === fromCurrency &&
        r.toCurrency === homeCurrency &&
        r.month === month &&
        r.year === balanceSheet.year,
    );

    // Optimistic update
    const previousRates = [...rates];
    setRates((prev) => {
      const idx = prev.findIndex(
        (r) =>
          r.fromCurrency === fromCurrency &&
          r.toCurrency === homeCurrency &&
          r.month === month &&
          r.year === balanceSheet.year,
      );

      const newRateObj = {
        id: existingRate?.id || "temp",
        fromCurrency,
        toCurrency: homeCurrency,
        rate,
        month,
        year: balanceSheet.year,
        timestamp: new Date().toISOString(),
      };

      if (idx >= 0) {
        const newRates = [...prev];
        newRates[idx] = newRateObj;
        return newRates;
      } else {
        return [...prev, newRateObj];
      }
    });

    try {
      await upsertRate(
        existingRate?.id || null,
        fromCurrency,
        homeCurrency,
        rate,
        month,
        balanceSheet.year,
      );
      refetchRates();
    } catch (e) {
      console.error("Failed to update rate:", e);
      setRates(previousRates);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBalanceSheet(balanceSheet.id);
      navigate("/");
    } catch (e) {
      console.error("Failed to delete balance sheet:", e);
      setIsDeleting(false);
    }
  };

  const { assets, liabilities } = useMemo(() => {
    const activeAccounts = accounts.filter((a) => !a.isArchived);
    const assetsList = activeAccounts.filter((a) => a.accountType === "Asset");
    const liabilitiesList = activeAccounts.filter(
      (a) => a.accountType === "Liability",
    );

    return {
      assets: assetsList,
      liabilities: liabilitiesList,
    };
  }, [accounts]);

  const monthlyTotals = useMemo(() => {
    return calculateMonthlyTotals(
      accounts,
      entries,
      rates,
      balanceSheet.year,
      homeCurrency,
    );
  }, [entries, accounts, rates, balanceSheet.year, homeCurrency]);

  const isLoading =
    accountsLoading || (entriesLoading && entries.length === 0) || ratesLoading;

  const foreignCurrencies = useMemo(() => {
    return Array.from(
      new Set(
        accounts.map((a) => a.currency).filter((c) => c !== homeCurrency),
      ),
    );
  }, [accounts, homeCurrency]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading grid...
      </div>
    );
  }

  const hideScrollbarClass =
    "scrollbar-hide [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

  return (
    <div className="space-y-8 pb-12">
      {/* CHART */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <BalanceSheetChart
            monthlyTotals={monthlyTotals}
            homeCurrency={homeCurrency}
          />
        </CardContent>
      </Card>

      {/* ACCOUNTS GRID */}
      <div
        ref={accountsRef}
        onScroll={() => syncScroll(accountsRef)}
        className={cn("border rounded-md overflow-x-auto", hideScrollbarClass)}
      >
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 z-10 bg-background border-r">
                Account
              </TableHead>
              <TableHead className="w-[100px] text-center">Currency</TableHead>
              {MONTHS.map((month) => (
                <TableHead key={month} className="text-right min-w-[100px]">
                  {month}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-muted/50 font-semibold hover:bg-muted/50">
              <TableCell
                colSpan={TOTAL_COLUMNS}
                className="sticky left-0 bg-muted/50 border-r"
              >
                ASSETS
              </TableCell>
            </TableRow>
            <AccountSection
              accounts={assets}
              entries={entries}
              onEntryChange={handleEntryChange}
            />
            {assets.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={TOTAL_COLUMNS}
                  className="text-center text-muted-foreground py-4"
                >
                  No asset accounts found.
                </TableCell>
              </TableRow>
            )}

            <TableRow className="bg-muted/50 font-semibold hover:bg-muted/50">
              <TableCell
                colSpan={TOTAL_COLUMNS}
                className="sticky left-0 bg-muted/50 border-r"
              >
                LIABILITIES
              </TableCell>
            </TableRow>
            <AccountSection
              accounts={liabilities}
              entries={entries}
              onEntryChange={handleEntryChange}
            />
            {liabilities.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={TOTAL_COLUMNS}
                  className="text-center text-muted-foreground py-4"
                >
                  No liability accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* EXCHANGE RATES GRID */}
      {foreignCurrencies.length > 0 && (
        <ExchangeRatesGrid
          currencies={foreignCurrencies}
          homeCurrency={homeCurrency}
          rates={rates}
          onRateChange={handleRateChange}
          containerRef={ratesRef}
          onScroll={() => syncScroll(ratesRef)}
        />
      )}

      {/* TOTALS GRID */}
      <div
        ref={totalsRef}
        onScroll={() => syncScroll(totalsRef)}
        className={cn("border rounded-md overflow-x-auto", hideScrollbarClass)}
      >
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

      {/* DANGER ZONE */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete this balance sheet</p>
              <p className="text-sm text-muted-foreground">
                Once deleted, all data for {balanceSheet.year} will be
                permanently removed. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete Balance Sheet"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the {balanceSheet.year} balance
                    sheet and all its entries. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
