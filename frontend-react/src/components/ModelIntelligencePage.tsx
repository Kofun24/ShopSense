import React from "react";
import {
  Cpu,
  BarChart2,
  Sliders,
  TrendingUp,
  Gauge,
} from "lucide-react";
import { ModelInfoResponse } from "../types";
import {
  tunedModelComparison,
  permutationImportance,
} from "../data/modelInsights";
import { FRIENDLY_LABELS } from "../lib/constants";

interface ModelIntelligencePageProps {
  modelInfo: ModelInfoResponse | null;
  loading: boolean;
  error: string | null;
}

export const ModelIntelligencePage: React.FC<ModelIntelligencePageProps> = ({
  modelInfo,
  loading,
  error,
}) => {
  // Max for candidate model PR-AUC is ~0.8
  const maxPrAuc = 0.8;
  // Max for permutation importance is PageValues: ~0.56
  const maxImportance = 0.6;

  return (
    <div className="space-y-6 sm:space-y-7 animate-fade-in">
      {/* Title Header */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-7">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-soft text-primary border border-primary/20">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture & Experimentation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
            Model Intelligence & Research Insights
          </h2>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Live specifications of the deployed model pipeline combined with historical tuning experiments and permutation importance analyses.
          </p>
        </div>
      </div>

      {/* SECTION 1: Model Card (Live /model-info) */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border/80">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-text">
              Section 1 — Deployed Model Card
            </h3>
          </div>
          <span className="text-xs text-text-muted">Live from /model-info</span>
        </div>

        {loading && (
          <div className="py-8 text-center text-xs text-text-muted space-y-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Fetching deployed model card...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-danger-soft text-danger border border-danger/30 text-xs">
            {error}
          </div>
        )}

        {modelInfo && !loading && (
          <div className="space-y-6">
            {/* High level specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-subtle border border-border">
                <span className="text-xs text-text-muted">Classifier Algorithm</span>
                <div className="text-base font-bold text-text mt-0.5">
                  {modelInfo.model}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-subtle border border-border">
                <span className="text-xs text-text-muted">Decision Threshold</span>
                <div className="text-base font-bold text-primary mt-0.5">
                  {(modelInfo.threshold * 100).toFixed(1)}%
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-subtle border border-border">
                <span className="text-xs text-text-muted">Imputation Pipeline</span>
                <div className="text-base font-bold text-text mt-0.5">
                  Median + Mode
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-subtle border border-border">
                <span className="text-xs text-text-muted">Feature Scaling</span>
                <div className="text-base font-bold text-text mt-0.5">
                  StandardScaler
                </div>
              </div>
            </div>

            {/* Test Metrics Stat Grid */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5">
                Evaluation Metrics (Hold-out Test Set)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs">
                  <span className="text-xs text-text-muted">Accuracy</span>
                  <div className="text-lg font-bold text-text mt-0.5">
                    {(modelInfo.test_metrics.accuracy * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs">
                  <span className="text-xs text-text-muted">Precision</span>
                  <div className="text-lg font-bold text-text mt-0.5">
                    {(modelInfo.test_metrics.precision * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs">
                  <span className="text-xs text-text-muted">Recall</span>
                  <div className="text-lg font-bold text-text mt-0.5">
                    {(modelInfo.test_metrics.recall * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-border shadow-xs">
                  <span className="text-xs text-text-muted">F1 Score</span>
                  <div className="text-lg font-bold text-text mt-0.5">
                    {(modelInfo.test_metrics.f1 * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-primary-soft/40 border border-primary/20 shadow-xs">
                  <span className="text-xs text-primary font-medium">ROC-AUC</span>
                  <div className="text-lg font-bold text-primary mt-0.5">
                    {(modelInfo.test_metrics.roc_auc * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-primary-soft/40 border border-primary/20 shadow-xs">
                  <span className="text-xs text-primary font-medium">PR-AUC</span>
                  <div className="text-lg font-bold text-primary mt-0.5">
                    {(modelInfo.test_metrics.pr_auc * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Hyperparameters Pill List */}
            <div className="p-4 rounded-xl bg-subtle border border-border space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-text-muted" /> Hyperparameters
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(modelInfo.hyperparameters).map(([k, v]) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card border border-border text-xs font-mono text-text"
                  >
                    <span className="text-text-muted">{k}:</span>
                    <strong className="font-semibold text-text">{String(v ?? "None")}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Candidate Model Comparison */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border/80">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-text">
              Section 2 — Candidate Model Comparison
            </h3>
          </div>
          <span className="text-xs text-text-muted">Cross-Validated PR-AUC</span>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="space-y-3.5 pt-1">
          {tunedModelComparison.map((item) => {
            const isSelected = item.model === "RandomForest";
            const widthPct = `${(item.cvPrAuc / maxPrAuc) * 100}%`;

            return (
              <div key={item.model} className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span
                    className={`flex items-center gap-2 ${
                      isSelected
                        ? "text-[#2A66F7] dark:text-[#60A5FA] font-bold"
                        : "text-[#0F172A] dark:text-[#F8FAFC] font-semibold"
                    }`}
                  >
                    {item.model}
                    {isSelected && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2A66F7] dark:bg-blue-950/60 dark:text-[#60A5FA] border border-blue-200/60 font-bold">
                        Selected Champion
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-text-muted hidden sm:inline">
                      ROC: {(item.cvRocAuc * 100).toFixed(2)}% · F1: {(item.cvF1 * 100).toFixed(2)}%
                    </span>
                    <span
                      className={`font-bold ${
                        isSelected
                          ? "text-[#2A66F7] dark:text-[#60A5FA]"
                          : "text-[#1E293B] dark:text-[#E2E8F0]"
                      }`}
                    >
                      PR-AUC: {(item.cvPrAuc * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-200/60 dark:border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isSelected ? "bg-[#2A66F7] dark:bg-[#3B82F6]" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    style={{ width: widthPct }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Required Paragraph */}
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed bg-subtle/70 p-4 rounded-xl border border-border-subtle">
          Random Forest, HistGradientBoosting and XGBoost are statistically tied within ~0.002 PR-AUC. Random Forest was selected for its narrow lead plus simpler interpretability and faster training.
        </p>
      </div>

      {/* SECTION 3: Feature Importance */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border/80">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-text">
              Section 3 — Permutation Feature Importance
            </h3>
          </div>
          <span className="text-xs text-text-muted">Global Impact Score</span>
        </div>

        {/* Horizontal Bar Chart: PageValues dominant */}
        <div className="space-y-3.5 pt-1">
          {permutationImportance.map((item, idx) => {
            const isDominant = idx === 0; // PageValues
            const widthPct = `${Math.min(100, (item.importance / maxImportance) * 100)}%`;
            const friendlyName = FRIENDLY_LABELS[item.feature] || item.feature;

            return (
              <div key={item.feature} className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span
                    className={`font-medium ${
                      isDominant ? "text-primary font-bold" : "text-text"
                    }`}
                  >
                    {friendlyName} <span className="text-xs text-text-muted font-mono">({item.feature})</span>
                  </span>
                  <span className={`font-mono text-xs font-bold ${isDominant ? "text-primary" : "text-text"}`}>
                    {item.importance.toFixed(4)}
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isDominant ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    style={{ width: widthPct }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Required Short Note */}
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed bg-subtle/70 p-4 rounded-xl border border-border-subtle">
          PageValues dominates the model. The deployed system is best suited for scoring completed or late-stage sessions rather than very early browsing.
        </p>
      </div>
    </div>
  );
};
