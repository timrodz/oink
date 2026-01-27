import type { Theme } from "@/lib/types/theme";

export interface UserSettings {
  id: string;
  name: string;
  homeCurrency: string;
  theme: Theme;
  createdAt: string;
  updatedAt: string;
}
