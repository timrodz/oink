import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const ONBOARDING_KEYS = {
  all: ["onboardingStatus"] as const,
};

export function useOnboarding() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ONBOARDING_KEYS.all,
    queryFn: () => api.getOnboardingStatus(),
  });

  const completeStep = useMutation({
    mutationFn: (stepKey: string) => api.completeOnboardingStep(stepKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.all });
    },
  });

  return {
    ...query,
    completeStep,
  };
}
