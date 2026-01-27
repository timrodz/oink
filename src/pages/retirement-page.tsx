import { Header } from "@/components/header";
import { MainNav } from "@/components/main-nav";
import { RetirementPlannerFeature } from "@/features/retirement-planner/retirement-planner-feature";

export function RetirementPage() {
  return (
    <main>
      <Header title="Retirement Planner" />
      <MainNav />
      <section>
        <RetirementPlannerFeature />
      </section>
    </main>
  );
}
