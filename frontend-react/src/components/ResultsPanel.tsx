import React from "react";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  Layers,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { PredictResponse } from "../types";
import { FRIENDLY_LABELS, INTENT_COLORS } from "../lib/constants";
import { ProbabilityGauge } from "./ProbabilityGauge";

interface ResultsPanelProps {
  result: PredictResponse;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result }) => {
  const {
    purchase_probability,
    will_purchase,
    decision_threshold,
    intent_level,
    recommended_action,
    fields_imputed = [],
    low_confidence,
    key_factors = [],
    model,
  } = result;

  const colorInfo = INTENT_COLORS[intent_level] || INTENT_COLORS["Undecided"];

  const formatFactorValue = (val: unknown): string => {
    if (val === null || val === undefined) return "Not provided";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (typeof val === "number") {
      return Number.isInteger(val) ? val.toString() : val.toFixed(3);
    }
    return String(val).replace("_", " ");
  };

  // Relative bar lengths for ranked key factors: 100%, 80%, 60%, 40%, 20%
  const rankWeights = ["100%", "80%", "60%", "40%", "20%"];

  return (
    <section
      aria-label="Prediction Results"
      className="bg-card rounded-2xl border border-border shadow-card p-5 sm:p-6 space-y-6 animate-fade-in"
    >
      {/* Prominent Safety Gate: Low-Confidence Warning (if applicable) */}
      {low_confidence && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] dark:bg-rose-950/40 border-2 border-[#DC2626] text-[#DC2626] dark:text-[#FB7185] shadow-xs flex items-start gap-3.5 animate-fade-in">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-[#DC2626] dark:text-[#FB7185] shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5 text-[#DC2626] dark:text-[#FB7185]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#DC2626] dark:text-[#FB7185] flex items-center gap-1.5">
              <span>Safety Gate: Reliability Warning</span>
            </h4>
            <p className="text-xs sm:text-sm text-text font-medium leading-relaxed">
              ⚠️ Low confidence — {fields_imputed.length} of 17 fields were estimated. We recommend treating this as a rough estimate, not a confident result.
            </p>
          </div>
        </div>
      )}

      {/* Top Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Prediction Output
          </span>
          <div className="flex flex-wrap items-center gap-2.5 mt-1">
            {/* Will Purchase Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold shadow-xs ${
                will_purchase
                  ? "bg-[#ECFDF5] text-[#047857] dark:bg-emerald-950/50 dark:text-[#34D399] border border-emerald-300 dark:border-emerald-700/60"
                  : "bg-[#FEF2F2] text-[#DC2626] dark:bg-rose-950/50 dark:text-[#FB7185] border border-rose-300 dark:border-rose-700/60"
              }`}
            >
              {will_purchase ? (
                <>
                  <CheckCircle className="w-4 h-4 text-[#047857] dark:text-[#34D399]" />
                  <span>Will Purchase ✅</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-[#DC2626] dark:text-[#FB7185]" />
                  <span>Will Not Purchase ❌</span>
                </>
              )}
            </span>

            {/* Intent Level Badge */}
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border shadow-xs"
              style={{
                backgroundColor: `${colorInfo.hex}18`,
                borderColor: `${colorInfo.hex}40`,
                color: colorInfo.hex,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{intent_level}</span>
            </span>
          </div>
        </div>

        {/* Small Decision Threshold Tag */}
        <div className="text-left sm:text-right">
          <span className="text-xs text-text-muted block">Decision Cutoff</span>
          <span className="text-sm font-bold text-text">
            {(decision_threshold * 100).toFixed(1)}% threshold
          </span>
        </div>
      </div>

      {/* Main Visuals: Gauge + Recommended Action */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Gauge (5 cols) */}
        <div
          className={`md:col-span-5 flex flex-col justify-center transition-opacity duration-300 ${
            low_confidence ? "opacity-85" : "opacity-100"
          }`}
        >
          <ProbabilityGauge
            probability={purchase_probability}
            threshold={decision_threshold}
            intentLevel={intent_level}
          />
        </div>

        {/* Action card & insight (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          {/* Recommended Action Card */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all h-full flex flex-col justify-center ${
              will_purchase
                ? "bg-emerald-50/80 border-emerald-300/70 dark:bg-emerald-950/40 dark:border-emerald-800/60"
                : "bg-rose-50/80 border-rose-300/70 dark:bg-rose-950/40 dark:border-rose-800/60"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  will_purchase
                    ? "bg-[#E6F4EA] text-[#047857] dark:bg-emerald-900/60 dark:text-[#34D399]"
                    : "bg-[#FEF2F2] text-[#DC2626] dark:bg-rose-900/60 dark:text-[#FB7185]"
                }`}
              >
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                  Recommended Action
                </h3>
                <p className="text-sm sm:text-base font-semibold text-text leading-relaxed">
                  {recommended_action}
                </p>
              </div>
            </div>
          </div>

          {/* Imputed Info note */}
          {!low_confidence && fields_imputed.length > 0 && (
            <div className="p-3 rounded-xl bg-subtle border border-border text-xs text-text-muted flex items-start gap-2">
              <Layers className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
              <div className="leading-snug">
                <span className="font-semibold text-text">
                  Estimated automatically (not provided):{" "}
                </span>
                {fields_imputed
                  .map((k) => FRIENDLY_LABELS[k] || k)
                  .join(", ")}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upgraded Ranked Key Factors Section */}
      {key_factors && key_factors.length > 0 && (
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-text flex items-center gap-1.5">
              Key Factors Behind Prediction
            </h3>
            <span className="text-[11px] text-text-muted font-medium">
              Ranked by relative global importance
            </span>
          </div>

          <div className="space-y-2">
            {key_factors.map((factor, idx) => {
              const friendlyName = FRIENDLY_LABELS[factor.field] || factor.field;
              const barWidth = rankWeights[idx] || "20%";
              const rank = idx + 1;

              return (
                <div
                  key={`${factor.field}-${idx}`}
                  className="p-3 rounded-xl bg-subtle border border-border shadow-xs text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#2A66F7] dark:text-[#60A5FA] border border-blue-200/50 dark:border-blue-800/50 font-bold flex items-center justify-center text-[11px] shrink-0">
                        {rank}
                      </span>
                      <span className="font-semibold text-text truncate" title={friendlyName}>
                        {friendlyName}
                      </span>
                      {!factor.provided && (
                        <span className="text-[10px] text-text-muted italic shrink-0">
                          (estimated)
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-text px-2 py-0.5 rounded bg-card border border-border shadow-2xs">
                        {formatFactorValue(factor.value)}
                      </span>
                    </div>
                  </div>

                  {/* Relative weight bar decreasing in length by rank */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#2A66F7] h-full rounded-full transition-all duration-500"
                      style={{ width: barWidth }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Line */}
      <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-muted">
        <span>
          Model: <strong className="font-bold text-text">{model}</strong> ·
          Decision threshold:{" "}
          <strong className="font-bold text-text">
            {(decision_threshold * 100).toFixed(1)}%
          </strong>
        </span>
        <span className="hidden sm:inline text-[11px] font-medium">
          Confidence score derived via Random Forest probability
        </span>
      </div>
    </section>
  );
};
