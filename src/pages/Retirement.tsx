import { Header } from "@/components/header";
import { MainNav } from "@/components/main-nav";
import { RetirementFormFeature } from "@/features/retirement/retirement-form-feature";

export function RetirementPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      <Header title="Retirement Planner" />
      <MainNav />
      <main className="flex-1 overflow-auto p-6 w-full">
        <div className="container mx-auto max-w-4xl space-y-6">
          <RetirementFormFeature />
        </div>
      </main>
    </div>
  );
}
