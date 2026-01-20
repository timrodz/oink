import { SectionAccounts } from "./components/section-accounts";
import { SectionBalanceSheets } from "./components/section-balance-sheets";
import { SectionNetWorth } from "./components/section-net-worth";

export function DashboardFeature() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <SectionNetWorth />
      <SectionBalanceSheets />
      <SectionAccounts />
    </div>
  );
}
