import {
  ALL_SUB_CATEGORIES,
  ASSET_SUB_CATEGORIES,
  LIABILITY_SUB_CATEGORIES,
} from "@/lib/constants/categories";
import type { AccountType } from "@/lib/types/accounts";
import type { SubCategoryOption } from "@/lib/types/categories";

export function getSubCategoriesByAccountType(
  accountType: AccountType,
): SubCategoryOption[] {
  return accountType === "Asset"
    ? ASSET_SUB_CATEGORIES
    : LIABILITY_SUB_CATEGORIES;
}

export function getSubCategoryLabel(key: string | null): string | null {
  if (!key) return null;
  const option = ALL_SUB_CATEGORIES.find((sc) => sc.key === key);
  return option?.label ?? null;
}
