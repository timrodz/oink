import { AccountsListFeature } from "@/features/accounts-list/accounts-list-feature";
import { useUserSettingsContext } from "@/providers/user-settings-provider";

export function SectionAccounts() {
  const { settings } = useUserSettingsContext();

  return (
    <section>
      <AccountsListFeature homeCurrency={settings.homeCurrency} />
    </section>
  );
}
