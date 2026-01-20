import { queryClient } from "@/lib/react-query";
import { PrivacyProvider } from "@/providers/privacy-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { THEME_STORAGE_KEY } from "./lib/constants";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey={THEME_STORAGE_KEY}>
        <PrivacyProvider>
          <App />
        </PrivacyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
