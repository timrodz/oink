export type OnboardingStepKey =
  | "CONFIGURE_SETTINGS"
  | "CREATE_FIRST_ACCOUNT"
  | "CREATE_FIRST_BALANCE_SHEET";

export interface OnboardingStep {
  stepKey: OnboardingStepKey;
  isCompleted: boolean;
  updatedAt: string;
}
