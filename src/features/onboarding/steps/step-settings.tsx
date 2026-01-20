import { UserSettingsFormFeature } from "@/features/user-settings-form/user-settings-form-feature";

interface StepSettingsProps {
  onComplete: () => void;
}

export function StepSettings({ onComplete }: StepSettingsProps) {
  return <UserSettingsFormFeature onComplete={onComplete} />;
}
