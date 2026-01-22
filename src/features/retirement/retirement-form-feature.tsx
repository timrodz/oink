import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLatestNetWorth } from "@/hooks/use-net-worth";
import { useUserSettings } from "@/hooks/use-user-settings";
import { ReturnScenario } from "@/lib/types";
import {
  formatNumberForInput,
  validateRetirementInputs,
} from "@/features/retirement/lib/validation";
import { RefreshCwIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function RetirementFormFeature() {
  const { data: settings } = useUserSettings();
  const {
    data: latestNetWorth,
    isLoading: latestNetWorthLoading,
    isError: latestNetWorthError,
  } = useLatestNetWorth();

  const [planName, setPlanName] = useState("");
  const [targetRetirementDate, setTargetRetirementDate] = useState("");
  const [startingNetWorth, setStartingNetWorth] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [expectedMonthlyExpenses, setExpectedMonthlyExpenses] = useState("");
  const [returnScenario, setReturnScenario] =
    useState<ReturnScenario>("moderate");
  const [hasEditedStartingNetWorth, setHasEditedStartingNetWorth] =
    useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const homeCurrency = settings?.homeCurrency ?? "USD";

  useEffect(() => {
    if (!hasEditedStartingNetWorth && latestNetWorth?.netWorth != null) {
      setStartingNetWorth(formatNumberForInput(latestNetWorth.netWorth));
    }
  }, [hasEditedStartingNetWorth, latestNetWorth]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const validationErrors = validateRetirementInputs({
      planName,
      startingNetWorth,
      monthlyContribution,
      expectedMonthlyExpenses,
    });

    setErrors(validationErrors);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">Build your retirement plan</CardTitle>
        <CardDescription>
          Enter your savings assumptions to preview how quickly you can reach
          your retirement goal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <p className="font-medium">Please fix the following:</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan name</Label>
              <Input
                id="plan-name"
                placeholder="e.g. Base Scenario"
                value={planName}
                onChange={(event) => setPlanName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-date">Target retirement date (optional)</Label>
              <Input
                id="target-date"
                type="date"
                value={targetRetirementDate}
                onChange={(event) => setTargetRetirementDate(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="starting-net-worth">
                Starting net worth ({homeCurrency})
              </Label>
              <div className="relative">
                <Input
                  id="starting-net-worth"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={startingNetWorth}
                  onChange={(event) => {
                    setStartingNetWorth(event.target.value);
                    setHasEditedStartingNetWorth(true);
                  }}
                  required
                />
                {latestNetWorthLoading && (
                  <RefreshCwIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
              {latestNetWorth && !hasEditedStartingNetWorth && (
                <p className="text-xs text-muted-foreground">
                  Pre-filled from your latest net worth snapshot.
                </p>
              )}
              {latestNetWorthError && (
                <p className="text-xs text-muted-foreground">
                  Unable to fetch the latest net worth right now.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-contribution">
                Monthly contribution ({homeCurrency})
              </Label>
              <Input
                id="monthly-contribution"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0"
                value={monthlyContribution}
                onChange={(event) => setMonthlyContribution(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-expenses">
                Expected monthly expenses ({homeCurrency})
              </Label>
              <Input
                id="monthly-expenses"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0"
                value={expectedMonthlyExpenses}
                onChange={(event) =>
                  setExpectedMonthlyExpenses(event.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Return scenario</Label>
              <Select
                value={returnScenario}
                onValueChange={(value: ReturnScenario) =>
                  setReturnScenario(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative (4%)</SelectItem>
                  <SelectItem value="moderate">Moderate (7%)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (10%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Generate projection
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
