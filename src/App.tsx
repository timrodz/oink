import { UserSettingsFormFeature } from "@/features/user-settings-form/user-settings-form-feature";
import { useUserSettings } from "@/hooks/use-user-settings";
import { BalanceSheetPage } from "@/pages/BalanceSheetPage";
import { HomePage } from "@/pages/HomePage";
import { PrivacyProvider } from "@/providers/privacy-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { useCallback } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

// Placeholder components
const Settings = () => (
  <div className="p-8">
    <h1>Settings</h1>
  </div>
);

function App() {
  const { data: settings, isLoading, refetch } = useUserSettings();

  const handleUpdateSettings = useCallback(() => {
    refetch();
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <PrivacyProvider>
        {isLoading ? (
          <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-muted-foreground animate-pulse">
              Loading...
            </div>
          </div>
        ) : !settings ? (
          <UserSettingsFormFeature onComplete={handleUpdateSettings} />
        ) : (
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/balance-sheets/:year"
                element={<BalanceSheetPage />}
              />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        )}
      </PrivacyProvider>
    </ThemeProvider>
  );
}

export default App;
