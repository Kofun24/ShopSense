import React from "react";
import {
  MousePointerClick,
  Activity,
  User,
  Send,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Undo2,
} from "lucide-react";
import { SessionData, Month, VisitorType } from "../types";
import {
  BROWSING_FIELDS,
  METRIC_FIELDS,
  ALL_NUMERIC_FIELDS,
  MONTHS,
  VISITOR_TYPES,
} from "../lib/constants";
import { NumericField } from "./NumericField";
import { VisitorContextFields } from "./VisitorContextFields";

interface SessionFormProps {
  session: SessionData;
  unknownMap: Record<string, boolean>;
  loading: boolean;
  activePresetId: string;
  isModifiedFromPreset: boolean;
  liveEstimate: { intent_level: string; loading: boolean } | null;
  onUpdateField: (key: keyof SessionData, val: any) => void;
  onToggleUnknown: (key: string, unknown: boolean) => void;
  onReset: () => void;
  onResetToPreset: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SessionForm: React.FC<SessionFormProps> = ({
  session,
  unknownMap,
  loading,
  activePresetId,
  isModifiedFromPreset,
  liveEstimate,
  onUpdateField,
  onToggleUnknown,
  onReset,
  onResetToPreset,
  onSubmit,
}) => {
  // Validate fields in real-time
  const errors: Record<string, string | null> = {};

  // 1. Mandatory 5 fields: PageValues, ExitRates, ProductRelated, Month, VisitorType
  // PageValues - Required, non-negative finite number (0 is valid)
  if (unknownMap["PageValues"]) {
    errors["PageValues"] = "PageValues is required and cannot be Unknown";
  } else if (session.PageValues === null || session.PageValues === undefined) {
    errors["PageValues"] = "PageValues is required";
  } else if (
    typeof session.PageValues !== "number" ||
    isNaN(session.PageValues) ||
    !isFinite(session.PageValues)
  ) {
    errors["PageValues"] = "Must be a valid finite number";
  } else if (session.PageValues < 0) {
    errors["PageValues"] = "Must be a non-negative number (≥ 0)";
  } else if (session.PageValues > 1000) {
    errors["PageValues"] = "Value cannot exceed 1000";
  }

  // ExitRates - Required, 0 to 1 inclusive (0 is valid)
  if (unknownMap["ExitRates"]) {
    errors["ExitRates"] = "ExitRates is required and cannot be Unknown";
  } else if (session.ExitRates === null || session.ExitRates === undefined) {
    errors["ExitRates"] = "ExitRates is required";
  } else if (
    typeof session.ExitRates !== "number" ||
    isNaN(session.ExitRates) ||
    !isFinite(session.ExitRates)
  ) {
    errors["ExitRates"] = "Must be a valid finite number";
  } else if (session.ExitRates < 0 || session.ExitRates > 1) {
    errors["ExitRates"] = "Must be between 0 and 1 (inclusive)";
  }

  // ProductRelated - Required, non-negative whole number (0 is valid)
  if (unknownMap["ProductRelated"]) {
    errors["ProductRelated"] = "ProductRelated is required and cannot be Unknown";
  } else if (
    session.ProductRelated === null ||
    session.ProductRelated === undefined
  ) {
    errors["ProductRelated"] = "ProductRelated is required";
  } else if (
    typeof session.ProductRelated !== "number" ||
    isNaN(session.ProductRelated) ||
    !isFinite(session.ProductRelated)
  ) {
    errors["ProductRelated"] = "Must be a valid whole number";
  } else if (!Number.isInteger(session.ProductRelated)) {
    errors["ProductRelated"] = "Must be a whole number (no decimals)";
  } else if (session.ProductRelated < 0) {
    errors["ProductRelated"] = "Must be a non-negative whole number (≥ 0)";
  } else if (session.ProductRelated > 5000) {
    errors["ProductRelated"] = "Value cannot exceed 5000";
  }

  // Month - Required, valid category
  if (unknownMap["Month"]) {
    errors["Month"] = "Month is required and cannot be Unknown";
  } else if (!session.Month) {
    errors["Month"] = "Month is required";
  } else if (!MONTHS.includes(session.Month)) {
    errors["Month"] = `Unsupported month: ${session.Month}`;
  }

  // VisitorType - Required, valid category
  if (unknownMap["VisitorType"]) {
    errors["VisitorType"] = "Visitor type is required and cannot be Unknown";
  } else if (!session.VisitorType) {
    errors["VisitorType"] = "Visitor type is required";
  } else if (!VISITOR_TYPES.includes(session.VisitorType)) {
    errors["VisitorType"] = `Unsupported visitor type: ${session.VisitorType}`;
  }

  // 2. Validate optional numeric fields (when provided and not Unknown)
  ALL_NUMERIC_FIELDS.forEach((cfg) => {
    // Skip if already validated as one of the 3 required numeric fields
    if (
      cfg.key === "PageValues" ||
      cfg.key === "ExitRates" ||
      cfg.key === "ProductRelated"
    ) {
      return;
    }

    const isUnknown = !!unknownMap[cfg.key];
    const val = session[cfg.key];

    if (!isUnknown && val !== null && val !== undefined) {
      if (typeof val !== "number" || isNaN(val) || !isFinite(val)) {
        errors[cfg.key] = "Must be a valid finite number";
      } else if (cfg.isInt && !Number.isInteger(val)) {
        errors[cfg.key] = "Must be a whole number (no decimals)";
      } else if (val < cfg.min) {
        errors[cfg.key] =
          cfg.min === 0
            ? "Must be a non-negative number (≥ 0)"
            : `Value must be at least ${cfg.min}`;
      } else if (val > cfg.max) {
        errors[cfg.key] = `Value cannot exceed ${cfg.max}`;
      }
    }
  });

  const hasValidationErrors = Object.values(errors).some(
    (err) => err !== null && err !== undefined
  );

  const requiredFields: (keyof SessionData)[] = [
    "PageValues",
    "ExitRates",
    "ProductRelated",
    "Month",
    "VisitorType",
  ];

  const requiredValidCount = requiredFields.filter(
    (k) =>
      !errors[k] &&
      session[k] !== null &&
      session[k] !== undefined &&
      !unknownMap[k]
  ).length;

  const allRequiredValid = requiredValidCount === 5;

  // Calculate count of provided (non-null, non-unknown, and valid) fields
  let providedCount = 0;
  const totalFields = 17;

  // Browsing (6) + Metrics (4) + Visitor Numeric (4)
  ALL_NUMERIC_FIELDS.forEach((cfg) => {
    if (
      !unknownMap[cfg.key] &&
      session[cfg.key] !== null &&
      session[cfg.key] !== undefined &&
      !errors[cfg.key]
    ) {
      providedCount++;
    }
  });

  // Categoricals & Weekend (3)
  if (!unknownMap["Month"] && session.Month && !errors["Month"]) {
    providedCount++;
  }
  if (
    !unknownMap["VisitorType"] &&
    session.VisitorType &&
    !errors["VisitorType"]
  ) {
    providedCount++;
  }
  if (
    !unknownMap["Weekend"] &&
    session.Weekend !== null &&
    session.Weekend !== undefined &&
    !errors["Weekend"]
  ) {
    providedCount++;
  }

  const canSubmit = allRequiredValid && !hasValidationErrors && !loading;

  return (
    <form
      onSubmit={onSubmit}
      className="bg-card rounded-2xl border border-border shadow-card p-5 sm:p-7 space-y-7 transition-all"
    >
      {/* SECTION 1: Browsing behaviour */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#2A66F7] dark:text-[#60A5FA] border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center shadow-2xs">
            <MousePointerClick className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">
              Browsing Behaviour
            </h3>
            <p className="text-xs text-text-muted">
              Page navigation volume and duration across site sections
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {BROWSING_FIELDS.map((cfg) => (
            <NumericField
              key={cfg.key}
              config={cfg}
              value={session[cfg.key] as number}
              isUnknown={!!unknownMap[cfg.key]}
              isRequired={cfg.key === "ProductRelated"}
              error={errors[cfg.key]}
              onChange={(val) => onUpdateField(cfg.key, val)}
              onToggleUnknown={(u) => onToggleUnknown(cfg.key, u)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 2: Session metrics - Bright Active Teal (#0D9488) */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-[#0D9488] dark:text-[#14B8A6] border border-teal-200/50 dark:border-teal-800/50 flex items-center justify-center shadow-2xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">Session Metrics</h3>
            <p className="text-xs text-text-muted">
              Analytics indicators including bounce rates, exit rates, and page value
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {METRIC_FIELDS.map((cfg) => (
            <NumericField
              key={cfg.key}
              config={cfg}
              value={session[cfg.key] as number}
              isUnknown={!!unknownMap[cfg.key]}
              isRequired={cfg.key === "PageValues" || cfg.key === "ExitRates"}
              error={errors[cfg.key]}
              onChange={(val) => onUpdateField(cfg.key, val)}
              onToggleUnknown={(u) => onToggleUnknown(cfg.key, u)}
            />
          ))}
        </div>
      </section>

      {/* SECTION 3: Visitor context - Energetic Indigo */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center shadow-2xs">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">Visitor Context</h3>
            <p className="text-xs text-text-muted">
              Temporal, cohort, and client browser/operating system metadata
            </p>
          </div>
        </div>

        <VisitorContextFields
          month={session.Month ?? null}
          visitorType={session.VisitorType ?? null}
          weekend={session.Weekend ?? null}
          operatingSystems={session.OperatingSystems ?? null}
          browser={session.Browser ?? null}
          region={session.Region ?? null}
          trafficType={session.TrafficType ?? null}
          errors={errors}
          onMonthChange={(m: Month | null) => onUpdateField("Month", m)}
          onVisitorTypeChange={(v: VisitorType | null) =>
            onUpdateField("VisitorType", v)
          }
          onWeekendChange={(w: boolean | null) => onUpdateField("Weekend", w)}
          onNumericChange={(k: string, v: number | null) =>
            onUpdateField(k as keyof SessionData, v)
          }
          onToggleUnknown={onToggleUnknown}
          unknownMap={unknownMap}
        />
      </section>

      {/* Live debounced estimate preview line */}
      {allRequiredValid && !hasValidationErrors && liveEstimate && (
        <div className="pt-2 px-1 flex items-center justify-end text-xs text-text-muted animate-fade-in">
          <div className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-subtle border border-border">
            {liveEstimate.loading ? (
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
            ) : (
              <Sparkles className="w-3 h-3 text-[#2A66F7]" />
            )}
            <span>
              Live estimate:{" "}
              <strong className="text-text font-bold">
                {liveEstimate.intent_level}
              </strong>{" "}
              (updates as you type) — click Predict for the full result.
            </span>
          </div>
        </div>
      )}

      {/* FOOTER & SUBMIT AREA */}
      <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Friendly Progress Badge ("10 of 17 fields") - Vibrant High-Contrast Pill */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold transition-colors shadow-2xs ${
              allRequiredValid && !hasValidationErrors
                ? "bg-[#E6F4EA] text-[#137333] dark:bg-emerald-950/60 dark:text-[#34D399] border border-[#137333]/30 dark:border-emerald-700/50"
                : "bg-blue-50 text-[#2A66F7] dark:bg-blue-950/60 dark:text-[#60A5FA] border border-blue-200 dark:border-blue-800/50"
            }`}
          >
            {allRequiredValid && !hasValidationErrors ? (
              <CheckCircle2 className="w-5 h-5 text-[#137333] dark:text-[#34D399]" />
            ) : (
              `${requiredValidCount}/5`
            )}
          </div>
          <div className="text-xs">
            <div
              className={`font-semibold ${
                allRequiredValid && !hasValidationErrors
                  ? "text-text"
                  : "text-[#2A66F7] dark:text-[#60A5FA]"
              }`}
            >
              {allRequiredValid && !hasValidationErrors
                ? `${providedCount} of ${totalFields} fields configured`
                : `${requiredValidCount} of 5 required fields configured`}
            </div>
            <div className="text-text-muted">
              {allRequiredValid && !hasValidationErrors
                ? "Ready for high-accuracy inference"
                : "All 5 required fields must be valid before predicting"}
            </div>
          </div>
        </div>

        {/* Buttons & Reset to Preset Link */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 w-full sm:w-auto">
          {/* Reset to preset quick link if user modified preset values */}
          {isModifiedFromPreset && activePresetId !== "custom" && (
            <button
              type="button"
              onClick={onResetToPreset}
              className="text-xs text-[#2A66F7] hover:text-[#1E51D8] font-semibold flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
              title="Reset fields to original preset values"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Reset to {activePresetId === "casual" ? "Casual" : "Serious"} preset
            </button>
          )}

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onReset}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-subtle text-text-secondary hover:text-text text-sm font-semibold transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center gap-1.5"
              title="Reset form fields"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Vibrant ShopSense Brand Blue Primary Button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
                canSubmit
                  ? "bg-[#2A66F7] hover:bg-[#1E51D8] active:bg-[#1742B8] shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Predicting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Predict Purchase Intent</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
