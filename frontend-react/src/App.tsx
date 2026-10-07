import React, { useState, useEffect, useRef, useCallback } from "react";
import { Header, TabId } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./components/DashboardPage";
import { BatchPredictionPage } from "./components/BatchPredictionPage";
import { ModelIntelligencePage } from "./components/ModelIntelligencePage";
import { ModelPerformancePage } from "./components/ModelPerformancePage";
import { PresetSelector } from "./components/PresetSelector";
import { SessionForm } from "./components/SessionForm";
import { ResultsPanel } from "./components/ResultsPanel";
import { ErrorBanner } from "./components/ErrorBanner";
import {
  HealthResponse,
  ModelInfoResponse,
  PredictResponse,
  SessionData,
} from "./types";
import { PRESETS, ALL_NUMERIC_FIELDS } from "./lib/constants";
import { checkHealth, getModelInfo, predictIntent, ApiClientError } from "./lib/api";

export const App: React.FC = () => {
  // Navigation Tab State (defaults to "dashboard" landing page)
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const hash = window.location.hash.replace("#", "") as TabId;
    if (
      ["dashboard", "predict", "batch", "intelligence", "performance"].includes(
        hash
      )
    ) {
      return hash;
    }
    return "dashboard";
  });

  // Theme Management (Light / Dark with localStorage persistence and system fallback)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("shopsense-theme");
    if (saved === "light" || saved === "dark") return saved;
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("shopsense-theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Sidebar Expand / Collapse States
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const handleSelectTab = (tab: TabId) => {
    setActiveTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") as TabId;
      if (
        ["dashboard", "predict", "batch", "intelligence", "performance"].includes(
          hash
        )
      ) {
        setActiveTab(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Preset & Form State
  const [activePresetId, setActivePresetId] = useState<string>("casual");
  const [isModifiedFromPreset, setIsModifiedFromPreset] = useState<boolean>(false);
  const [session, setSession] = useState<SessionData>(PRESETS.casual.values);
  const [unknownMap, setUnknownMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(PRESETS.casual.values)) {
      if (v === null || v === undefined) {
        map[k] = true;
      }
    }
    return map;
  });

  // Health & Server State
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  // Model Info State
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const [modelInfoLoading, setModelInfoLoading] = useState<boolean>(false);
  const [modelInfoError, setModelInfoError] = useState<string | null>(null);

  // Single Prediction State
  const [predictLoading, setPredictLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PredictResponse | null>(
    null
  );
  const [predictionError, setPredictionError] = useState<ApiClientError | null>(
    null
  );

  // Live debounced preview estimate state
  const [liveEstimate, setLiveEstimate] = useState<{
    intent_level: string;
    loading: boolean;
  } | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial Health Check
  const fetchHealth = async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err: unknown) {
      const clientError = err as ApiClientError;
      setHealthError(clientError.message || "Failed to connect to backend");
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  // Fetch Model Info
  const fetchModelInfo = useCallback(async () => {
    if (modelInfo || modelInfoLoading) return;
    setModelInfoLoading(true);
    setModelInfoError(null);
    try {
      const info = await getModelInfo();
      setModelInfo(info);
    } catch (err: unknown) {
      const clientError = err as ApiClientError;
      setModelInfoError(
        clientError.detail || clientError.message || "Failed to load model specs"
      );
    } finally {
      setModelInfoLoading(false);
    }
  }, [modelInfo, modelInfoLoading]);

  useEffect(() => {
    fetchHealth();
    fetchModelInfo();
  }, [fetchModelInfo]);

  // When switching to intelligence tab, ensure model info is loaded
  useEffect(() => {
    if (activeTab === "intelligence" && !modelInfo && !modelInfoLoading) {
      fetchModelInfo();
    }
  }, [activeTab, modelInfo, modelInfoLoading, fetchModelInfo]);

  // Preset Selection Handler
  const handleSelectPreset = (presetId: string) => {
    setActivePresetId(presetId);
    setIsModifiedFromPreset(false);
    const preset = PRESETS[presetId];
    if (preset) {
      setSession({ ...preset.values });
      const newUnknownMap: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(preset.values)) {
        if (v === null || v === undefined) {
          newUnknownMap[k] = true;
        }
      }
      setUnknownMap(newUnknownMap);
      setPredictionError(null);
    }
  };

  // Reset to original preset values
  const handleResetToPreset = () => {
    handleSelectPreset(activePresetId);
  };

  // Build current payload
  const buildPayload = useCallback((): {
    payload: SessionData;
    providedCount: number;
  } => {
    const payload: SessionData = {};
    let count = 0;

    ALL_NUMERIC_FIELDS.forEach((cfg) => {
      if (!unknownMap[cfg.key] && session[cfg.key] !== null && session[cfg.key] !== undefined) {
        payload[cfg.key] = session[cfg.key] as any;
        count++;
      } else {
        payload[cfg.key] = null;
      }
    });

    if (!unknownMap["Month"] && session.Month !== null && session.Month !== undefined) {
      payload.Month = session.Month;
      count++;
    } else {
      payload.Month = null;
    }

    if (
      !unknownMap["VisitorType"] &&
      session.VisitorType !== null &&
      session.VisitorType !== undefined
    ) {
      payload.VisitorType = session.VisitorType;
      count++;
    } else {
      payload.VisitorType = null;
    }

    if (
      !unknownMap["Weekend"] &&
      session.Weekend !== null &&
      session.Weekend !== undefined
    ) {
      payload.Weekend = session.Weekend;
      count++;
    } else {
      payload.Weekend = null;
    }

    return { payload, providedCount: count };
  }, [session, unknownMap]);

  // Debounced live estimate trigger
  useEffect(() => {
    if (activeTab !== "predict") return;

    const { payload, providedCount } = buildPayload();

    if (providedCount < 5) {
      setLiveEstimate(null);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setLiveEstimate((prev) => (prev ? { ...prev, loading: true } : { intent_level: "Calculating...", loading: true }));

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await predictIntent(payload);
        setLiveEstimate({
          intent_level: res.intent_level,
          loading: false,
        });
      } catch {
        setLiveEstimate(null);
      }
    }, 600);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [session, unknownMap, activeTab, buildPayload]);

  // Field updates
  const handleUpdateField = (key: keyof SessionData, val: any) => {
    setIsModifiedFromPreset(true);
    setSession((prev) => ({ ...prev, [key]: val }));
    if (val !== null && val !== undefined && unknownMap[key]) {
      setUnknownMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Unknown toggles
  const handleToggleUnknown = (key: string, unknown: boolean) => {
    setIsModifiedFromPreset(true);
    setUnknownMap((prev) => ({ ...prev, [key]: unknown }));
    if (unknown) {
      setSession((prev) => ({ ...prev, [key]: null }));
    }
  };

  // Form Reset
  const handleReset = () => {
    handleSelectPreset("casual");
    setPredictionResult(null);
    setPredictionError(null);
    setLiveEstimate(null);
  };

  // Submit Prediction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredictLoading(true);
    setPredictionError(null);

    const { payload } = buildPayload();

    try {
      const res = await predictIntent(payload);
      setPredictionResult(res);
      setPredictionError(null);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    } catch (err: unknown) {
      const clientError = err as ApiClientError;
      setPredictionError(clientError);
    } finally {
      setPredictLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg text-text">
      {/* Collapsible Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area Adapts Horizontally to Sidebar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Simplified Header */}
        <Header
          activeTab={activeTab}
          health={health}
          healthLoading={healthLoading}
          healthError={healthError}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onRefreshHealth={fetchHealth}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Page Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <DashboardPage
              health={health}
              healthLoading={healthLoading}
              healthError={healthError}
              onNavigate={handleSelectTab}
            />
          )}

          {/* TAB 2: PREDICT (Single Session) */}
          {activeTab === "predict" && (
            <div className="space-y-6 animate-fade-in">
              {/* Preset Selector */}
              <PresetSelector
                activePresetId={activePresetId}
                onSelectPreset={handleSelectPreset}
              />

              {/* Global Error Banner */}
              {predictionError && (
                <ErrorBanner
                  error={predictionError}
                  onDismiss={() => setPredictionError(null)}
                />
              )}

              {/* Responsive layout: form & results side by side on wide screens */}
              <div
                className={`grid grid-cols-1 ${
                  predictionResult ? "xl:grid-cols-12" : ""
                } gap-6 items-start`}
              >
                <div className={predictionResult ? "xl:col-span-7" : "w-full"}>
                  <SessionForm
                    session={session}
                    unknownMap={unknownMap}
                    loading={predictLoading}
                    activePresetId={activePresetId}
                    isModifiedFromPreset={isModifiedFromPreset}
                    liveEstimate={liveEstimate}
                    onUpdateField={handleUpdateField}
                    onToggleUnknown={handleToggleUnknown}
                    onReset={handleReset}
                    onResetToPreset={handleResetToPreset}
                    onSubmit={handleSubmit}
                  />
                </div>

                {predictionResult && (
                  <div
                    ref={resultsRef}
                    className="xl:col-span-5 xl:sticky xl:top-24 space-y-4"
                  >
                    <ResultsPanel result={predictionResult} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BATCH PREDICTION */}
          {activeTab === "batch" && <BatchPredictionPage />}

          {/* TAB 4: MODEL INTELLIGENCE */}
          {activeTab === "intelligence" && (
            <ModelIntelligencePage
              modelInfo={modelInfo}
              loading={modelInfoLoading}
              error={modelInfoError}
            />
          )}

          {/* TAB 5: MODEL PERFORMANCE */}
          {activeTab === "performance" && <ModelPerformancePage />}
        </main>

        {/* Clean Professional Product Footer */}
        <footer className="border-t border-border bg-card/60 py-4 text-center text-xs text-text-muted mt-auto transition-colors">
          <div className="max-w-7xl mx-auto px-4">
            <p>
              © {new Date().getFullYear()} ShopSense · Machine learning session
              scoring to predict purchase likelihood
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
