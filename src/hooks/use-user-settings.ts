import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const USER_SETTINGS_KEYS = {
  all: ["userSettings"] as const,
};

export function useUserSettings() {
  return useQuery({
    queryKey: USER_SETTINGS_KEYS.all,
    queryFn: () => api.getUserSettings(),
  });
}
