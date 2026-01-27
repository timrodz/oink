import { HomeIcon, ChartPieIcon, SproutIcon } from "lucide-react";
import type { NavigationItem } from "@/lib/types/navigation";

export const NAV_ITEMS: NavigationItem[] = [
  { to: "/", label: "home", end: true, icon: HomeIcon },
  { to: "/analytics", label: "Analytics", icon: ChartPieIcon },
  { to: "/retirement", label: "Retirement Planner", icon: SproutIcon },
];
