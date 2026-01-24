import { Header } from "@/components/header";
import { MainNav } from "@/components/main-nav";
import { RetirementPlannerFeature } from "@/features/retirement-planner/retirement-planner-feature";

export function RetirementPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Header title="Retirement Planner" />
      <MainNav />
      <main className="flex-1 overflow-auto p-4 w-full">
        <RetirementPlannerFeature />
      </main>
    </div>
  );
}
