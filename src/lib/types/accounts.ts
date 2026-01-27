export type AccountType = "Asset" | "Liability";

export interface Account {
  id: string;
  name: string;
  accountType: AccountType;
  subCategory: string | null;
  currency: string;
  sortOrder: number;
  isArchived: boolean;
  createdAt: string;
}
