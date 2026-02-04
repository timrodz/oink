import { formatCurrency } from "@/lib/currency-formatting";
import { useEffect, useState } from "react";
import { Input } from "./input";

type CurrencyInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "type" | "inputMode"
> & {
  value?: number;
  onValueChange: (value: number) => void;
  homeCurrency?: string;
};

const isValidNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const parseCurrencyInput = (value: string) => {
  const normalized = value.replace(/[^0-9.-]/g, "");
  if (
    normalized === "" ||
    normalized === "-" ||
    normalized === "." ||
    normalized === "-."
  ) {
    return Number.NaN;
  }
  return Number(normalized);
};

export function CurrencyInput({
  value,
  onValueChange,
  homeCurrency,
  onBlur,
  onFocus,
  ...props
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isFocused) return;
    if (!isValidNumber(value)) {
      setInputValue("");
      return;
    }
    setInputValue(formatCurrency(value, homeCurrency));
  }, [value, homeCurrency, isFocused]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setInputValue(isValidNumber(value) ? String(value) : "");
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onValueChange(parseCurrencyInput(inputValue));
    onBlur?.(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    onValueChange(parseCurrencyInput(nextValue));
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={inputValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}
