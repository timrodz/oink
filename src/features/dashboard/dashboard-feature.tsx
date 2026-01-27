import { SectionAccounts } from "./components/section-accounts";
import { SectionBalanceSheets } from "./components/section-balance-sheets";
import { SectionNetWorth } from "./components/section-net-worth";
import { SectionSubCategories } from "./components/section-sub-categories";

export function DashboardFeature() {
  return (
    <div className="feature-container">
      <SectionNetWorth />
      <SectionSubCategories />
      <SectionBalanceSheets />
      <SectionAccounts />
    </div>
  );
}
