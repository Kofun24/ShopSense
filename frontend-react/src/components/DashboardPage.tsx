import React from "react";
import {
  MousePointerClick,
  FileSpreadsheet,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  PieChart as PieIcon,
  BarChart2,
} from "lucide-react";
import { HealthResponse } from "../types";
import {
  trainingClassDistribution,
  tunedModelComparison,
} from "../data/modelInsights";

interface DashboardPageProps {
  health: HealthResponse | null;
  healthLoading: boolean;
  healthError: string | null;
  onNavigate: (tab: "predict" | "batch" | "intelligence" | "performance") => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  health,
  healthLoading,
  healthError,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Branding & Metadata Row */}
      <div className="space-y-1.5 pt-1 pb-1">
        <img
          src="/fulllogo.svg"
          alt="ShopSense"
          className="w-[210px] max-w-full h-auto object-contain block"
        />
        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          Machine learning session scoring to predict purchase likelihood
        </p>

        {/* Clean Model Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-lg shadow-2xs">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            <span>
              Model:{" "}
              <strong className="text-text font-medium">
                {healthLoading
                  ? "Checking..."
                  : healthError
                  ? "Unavailable"
                  : health?.model || "Random Forest"}
              </strong>
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-lg shadow-2xs">
            <Database className="w-3.5 h-3.5 text-text-muted" />
            <span>12,330 Training Sessions</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-lg shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-success" />
            <span>Decision Threshold: 38.1%</span>
          </span>
        </div>
      </div>

      {/* Two Large Call-to-Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Predict Single Session Card */}
        <div
          onClick={() => onNavigate("predict")}
          className="group cursor-pointer bg-card rounded-2xl border border-border hover:border-primary/60 shadow-card hover:shadow-card-hover p-6 sm:p-7 transition-all flex flex-col justify-between relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#2A66F7] dark:text-[#60A5FA] border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <MousePointerClick className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors flex items-center gap-2">
                <span>Predict a Single Session</span>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary mt-1.5 leading-relaxed">
                Configure browsing duration, page counts, bounce rates, and context to evaluate a single customer session in real time with ranked factor breakdown.
              </p>
            </div>
          </div>
          <div className="pt-6 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <span>Open Session Predictor</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Predict Batch CSV Card */}
        <div
          onClick={() => onNavigate("batch")}
          className="group cursor-pointer bg-card rounded-2xl border border-border hover:border-emerald-500/60 shadow-card hover:shadow-card-hover p-6 sm:p-7 transition-all flex flex-col justify-between relative overflow-hidden"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#059669] dark:text-[#34D399] border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text group-hover:text-[#059669] dark:group-hover:text-[#34D399] transition-colors flex items-center gap-2">
                <span>Predict a Batch (CSV)</span>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-[#059669] dark:group-hover:text-[#34D399] group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary mt-1.5 leading-relaxed">
                Upload a CSV spreadsheet with up to 5,000 online shopping sessions for instantaneous vectorized inference, low-confidence flagging, and CSV export.
              </p>
            </div>
          </div>
          <div className="pt-6 flex items-center gap-1.5 text-xs font-semibold text-[#059669] dark:text-[#34D399]">
            <span>Upload Batch CSV</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Class Balance Pie + Compact Model Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Class Balance Donut Chart (5 cols) - Digital Navy & Vibrant Coral */}
        <div className="lg:col-span-5 bg-card rounded-2xl border border-border shadow-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-text">
                Training Data Class Balance
              </h3>
            </div>
            <span className="text-[11px] text-text-muted">12,330 records</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            {/* SVG Donut / Pie: Non-Purchase (Digital Navy) vs Purchase (Vibrant Coral) */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                {/* Non-purchase circle (84.5% - Pure Digital Navy) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="currentColor"
                  className="text-[#1E3A8A] dark:text-[#3B82F6]"
                  strokeWidth="6"
                />
                {/* Purchase arc (15.5% - Vibrant Coral #FF5A1F) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="#FF5A1F"
                  strokeWidth="6"
                  strokeDasharray={`${trainingClassDistribution.purchasePct} ${trainingClassDistribution.nonPurchasePct}`}
                  strokeDashoffset="0"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                <span className="text-xs font-bold text-text">84.5% / 15.5%</span>
                <span className="text-[10px] text-text-muted font-medium">Imbalance</span>
              </div>
            </div>

            {/* High-Contrast Legend */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#1E3A8A] dark:bg-[#3B82F6] shrink-0 shadow-2xs" />
                <span className="text-text-secondary">
                  Non-Purchase: <strong className="text-text font-bold">10,422 (84.5%)</strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#FF5A1F] shrink-0 shadow-2xs" />
                <span className="text-text-secondary">
                  Purchase: <strong className="text-[#FF5A1F] font-bold">1,908 (15.5%)</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Prompt Required Explanatory Caption */}
          <p className="text-xs text-text-muted leading-relaxed bg-subtle/80 p-3.5 rounded-xl border border-border">
            This severe class imbalance (84.5% non-purchase vs 15.5% purchase) is why PR-AUC, F1 score, and recall are used as primary evaluation metrics instead of raw accuracy.
          </p>
        </div>

        {/* Compact Candidate Model Comparison Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-card rounded-2xl border border-border shadow-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-text">
                Candidate Model Comparison (5-Fold CV PR-AUC)
              </h3>
            </div>
            <button
              onClick={() => onNavigate("intelligence")}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Full Details →
            </button>
          </div>

          {/* Compact Horizontal Bar Chart with True Royal Blue & Clean Blue-Gray */}
          <div className="space-y-2.5 py-1">
            {tunedModelComparison.map((item) => {
              const isSelected = item.model === "RandomForest";
              // Normalize relative to 0.8 max
              const pctWidth = `${(item.cvPrAuc / 0.8) * 100}%`;

              return (
                <div key={item.model} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold ${
                        isSelected
                          ? "text-[#2A66F7] dark:text-[#60A5FA] font-bold"
                          : "text-[#0F172A] dark:text-[#F8FAFC]"
                      }`}
                    >
                      {item.model} {isSelected && "★ (Selected)"}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isSelected
                          ? "text-[#2A66F7] dark:text-[#60A5FA]"
                          : "text-[#1E293B] dark:text-[#E2E8F0]"
                      }`}
                    >
                      {(item.cvPrAuc * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200/60 dark:border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected
                          ? "bg-[#2A66F7] dark:bg-[#3B82F6]"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      style={{ width: pctWidth }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-text-muted flex items-center justify-between pt-2 border-t border-border">
            <span>Evaluated across 5-fold stratified cross validation.</span>
            <span className="font-semibold text-text">Metric: PR-AUC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
