import type { SubCategory } from "@/lib/types/categories";

export const SUB_CATEGORY_COLORS: Record<
  SubCategory | "uncategorized",
  { bg: string; border: string }
> = {
  cash: { bg: "rgba(34, 197, 94, 0.6)", border: "rgb(34, 197, 94)" },
  investments: { bg: "rgba(59, 130, 246, 0.6)", border: "rgb(59, 130, 246)" },
  retirement: { bg: "rgba(14, 165, 233, 0.6)", border: "rgb(14, 165, 233)" },
  real_estate: { bg: "rgba(168, 85, 247, 0.6)", border: "rgb(168, 85, 247)" },
  vehicles: { bg: "rgba(245, 158, 11, 0.6)", border: "rgb(245, 158, 11)" },
  other_asset: { bg: "rgba(107, 114, 128, 0.6)", border: "rgb(107, 114, 128)" },
  credit_cards: { bg: "rgba(239, 68, 68, 0.6)", border: "rgb(239, 68, 68)" },
  loans: { bg: "rgba(251, 146, 60, 0.6)", border: "rgb(251, 146, 60)" },
  mortgages: { bg: "rgba(236, 72, 153, 0.6)", border: "rgb(236, 72, 153)" },
  other_liability: {
    bg: "rgba(156, 163, 175, 0.6)",
    border: "rgb(156, 163, 175)",
  },
  uncategorized: { bg: "rgba(75, 85, 99, 0.6)", border: "rgb(75, 85, 99)" },
};

export const MIN_NET_WORTH_POINTS_FOR_GROWTH = 2;

export const MONTHLY_GROWTH_COLORS = {
  positive: { bg: "rgba(34, 197, 94, 0.6)", border: "rgb(34, 197, 94)" },
  negative: { bg: "rgba(239, 68, 68, 0.6)", border: "rgb(239, 68, 68)" },
};

export const NET_WORTH_TREND_COLORS = {
  line: "rgb(59, 130, 246)",
  gradientStart: "rgba(59, 130, 246, 0.5)",
  gradientEnd: "rgba(59, 130, 246, 0.0)",
};

export const NET_WORTH_BREAKDOWN_COLORS = {
  assets: { bg: "rgba(34, 197, 94, 0.6)", border: "rgb(34, 197, 94)" },
  liabilities: { bg: "rgba(239, 68, 68, 0.6)", border: "rgb(239, 68, 68)" },
};

export const RETIREMENT_PROJECTION_POINT_COLORS = {
  highlight: "rgb(34, 197, 94)",
  default: "rgb(59, 130, 246)",
};

export const CHART_GRID_LINE_COLOR = "rgba(0, 0, 0, 0.05)";
