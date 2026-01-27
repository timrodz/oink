import type { AccountType } from "@/lib/types/accounts";

export type AssetSubCategory =
  | "cash"
  | "investments"
  | "retirement"
  | "real_estate"
  | "vehicles"
  | "other_asset";

export type LiabilitySubCategory =
  | "credit_cards"
  | "loans"
  | "mortgages"
  | "other_liability";

export type SubCategory = AssetSubCategory | LiabilitySubCategory;

export interface SubCategoryOption {
  key: SubCategory;
  label: string;
  accountType: AccountType;
}
