import { Header } from "@/components/header";
import { MainNav } from "@/components/main-nav";
import { DashboardFeature } from "@/features/dashboard/dashboard-feature";

export function HomePage() {
  return (
    <main>
      <Header title="Home" />
      <MainNav />
      <section className="feature">
        <DashboardFeature />
      </section>
    </main>
  );
}
