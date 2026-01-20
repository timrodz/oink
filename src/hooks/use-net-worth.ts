import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const NET_WORTH_KEYS = {
  all: ["netWorth"] as const,
  history: () => [...NET_WORTH_KEYS.all, "history"] as const,
};

export function useNetWorthHistory() {
  return useQuery({
    queryKey: NET_WORTH_KEYS.history(),
    queryFn: () => api.getNetWorthHistory(),
  });
}
