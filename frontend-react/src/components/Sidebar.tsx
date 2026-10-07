import React from "react";
import {
  LayoutDashboard,
  MousePointerClick,
  FileSpreadsheet,
  Cpu,
  BarChart3,
  ChevronLeft,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { TabId } from "./Header";

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "predict", label: "Predict", icon: MousePointerClick },
    { id: "batch", label: "Batch Prediction", icon: FileSpreadsheet },
    { id: "intelligence", label: "Model Intelligence", icon: Cpu },
    { id: "performance", label: "Model Performance", icon: BarChart3 },
  ];

  const handleNavClick = (tabId: TabId) => {
    onSelectTab(tabId);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-sidebar border-r border-border flex flex-col justify-between transition-all duration-300 ease-in-out shadow-xs ${
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
        aria-label="Sidebar navigation"
      >
        {/* Top: Branding & Collapse Toggle */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-border">
            {/* Logo and Brand Name */}
            <div
              className={`flex items-center gap-3 overflow-hidden ${
                isCollapsed ? "lg:justify-center lg:w-full" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center p-1.5 shrink-0 shadow-2xs overflow-hidden">
                <img
                  src="/favicon.svg"
                  alt="ShopSense Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex flex-col min-w-0 animate-fade-in">
                  <span className="text-base font-bold text-text tracking-tight truncate">
                    ShopSense
                  </span>
                  <span className="text-[11px] text-text-muted font-medium truncate -mt-0.5">
                    Predictive Intelligence
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-subtle transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Toggle in Header (When Expanded) */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-subtle border border-transparent hover:border-border transition-colors"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Items List */}
          <nav className="p-3 space-y-1.5" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl transition-all relative group select-none ${
                    isCollapsed && !isMobileOpen
                      ? "justify-center p-3"
                      : "gap-3 px-3.5 py-2.5"
                  } ${
                    isActive
                      ? "bg-[#2A66F7] text-white font-bold shadow-sm shadow-blue-500/20"
                      : "text-text-secondary hover:text-text hover:bg-subtle font-semibold"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-text-muted group-hover:text-text"
                    }`}
                  />

                  {(!isCollapsed || isMobileOpen) && (
                    <span className="text-sm truncate">{item.label}</span>
                  )}

                  {/* Hover Tooltip for Collapsed State */}
                  {isCollapsed && !isMobileOpen && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Sidebar Footer & Collapse Expand Control */}
        <div className="p-3 border-t border-border">
          {/* Desktop Expand Button when Collapsed */}
          {isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex w-full items-center justify-center p-2.5 rounded-xl text-text-muted hover:text-text hover:bg-subtle transition-colors relative group"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-5 h-5" />
              <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-lg whitespace-nowrap shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Expand sidebar
              </div>
            </button>
          )}

          {/* Expanded Bottom Info */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-2 py-1 flex items-center justify-between text-xs text-text-muted">
              <span className="text-[11px] font-medium">v1.0 Production ML</span>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center gap-1 text-[11px] font-semibold hover:text-text transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Collapse</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
