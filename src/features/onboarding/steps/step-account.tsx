import { AccountFormFeature } from "@/features/accounts/account-form-feature";

interface StepAccountProps {
  onComplete: () => void;
  homeCurrency: string;
}

export function StepAccount({ onComplete, homeCurrency }: StepAccountProps) {
  return (
    <AccountFormFeature
      onComplete={onComplete}
      defaultCurrency={homeCurrency}
    />
  );
}
