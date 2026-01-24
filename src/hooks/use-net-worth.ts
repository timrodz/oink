import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const NET_WORTH_KEYS = {
  all: ["netWorth"] as const,
  history: () => [...NET_WORTH_KEYS.all, "history"] as const,
  latest: () => [...NET_WORTH_KEYS.all, "latest"] as const,
};

export function useNetWorthHistory() {
  return useQuery({
    queryKey: NET_WORTH_KEYS.history(),
    queryFn: () => api.getNetWorthHistory(),
  });
}

export function useLatestNetWorth() {
  return useQuery({
    queryKey: NET_WORTH_KEYS.latest(),
    queryFn: () => api.getLatestNetWorth(),
  });
}
