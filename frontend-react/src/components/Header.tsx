import React from "react";
import {
  RefreshCw,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
} from "lucide-react";
import { HealthResponse } from "../types";

export type TabId =
  | "dashboard"
  | "predict"
  | "batch"
  | "intelligence"
  | "performance";

interface HeaderProps {
  activeTab: TabId;
  health: HealthResponse | null;
  healthLoading: boolean;
  healthError: string | null;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onRefreshHealth: () => void;
  onOpenMobileMenu: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const TAB_TITLES: Record<TabId, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Overview & model status",
  },
  predict: {
    title: "Session Predictor",
    subtitle: "Score individual shopper browsing sessions",
  },
  batch: {
    title: "Batch Prediction",
    subtitle: "Vectorized evaluation for CSV shopping datasets",
  },
  intelligence: {
    title: "Model Intelligence",
    subtitle: "Candidate comparisons & feature importance",
  },
  performance: {
    title: "Model Performance",
    subtitle: "Hold-out test metrics & confusion matrix",
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  health,
  healthLoading,
  healthError,
  theme,
  onToggleTheme,
  onRefreshHealth,
  onOpenMobileMenu,
  isCollapsed,
  onToggleCollapse,
}) => {
  const currentView = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;

  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button, Desktop Collapse Toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text hover:bg-subtle transition-colors focus:outline-none"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Toggle Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-xl text-text-muted hover:text-text hover:bg-subtle transition-colors focus:outline-none"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Current Page Title & Subtitle */}
          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-text tracking-tight truncate">
              {currentView.title}
            </h1>
            <p className="text-xs text-text-muted hidden sm:block truncate -mt-0.5">
              {currentView.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Theme Toggle & Live Model Status Pill */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-text-muted hover:text-text bg-subtle/70 hover:bg-subtle border border-border transition-colors focus:outline-none"
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Live System Status Pill */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors shadow-xs ${
              healthLoading
                ? "bg-subtle text-text-muted border-border"
                : healthError
                ? "bg-[#FEF2F2] text-[#DC2626] dark:bg-red-950/50 dark:text-[#F87171] border-[#EF4444]/30"
                : "bg-[#E6F4EA] text-[#137333] dark:bg-emerald-950/50 dark:text-[#34D399] border-[#137333]/25 dark:border-emerald-700/40"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {healthLoading ? (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
              ) : healthError ? (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC2626]"></span>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#137333] dark:bg-[#34D399] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#137333] dark:bg-[#34D399]"></span>
                </>
              )}
            </span>

            <span className="hidden sm:inline">
              {healthLoading
                ? "Checking server..."
                : healthError
                ? "Backend unavailable"
                : `Model ready (${health?.model || "RandomForest"})`}
            </span>

            <span className="sm:hidden">
              {healthLoading
                ? "Connecting..."
                : healthError
                ? "Offline"
                : "Ready"}
            </span>

            {healthError && (
              <button
                type="button"
                onClick={onRefreshHealth}
                title="Retry connecting to server"
                className="ml-1 text-danger hover:text-danger/80 focus:outline-none"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
