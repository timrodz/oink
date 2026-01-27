import { Header } from "@/components/header";
import { MainNav } from "@/components/main-nav";
import { AnalyticsFeature } from "@/features/analytics/analytics-feature";

export function AnalyticsPage() {
  return (
    <main>
      <Header title="Analytics" />
      <MainNav />
      <section>
        <AnalyticsFeature />
      </section>
    </main>
  );
}
