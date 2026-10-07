import React, { useState } from "react";
import { ChevronDown, Sliders } from "lucide-react";
import { Month, VisitorType } from "../types";
import { MONTHS, VISITOR_TYPES, VISITOR_NUMERIC_FIELDS } from "../lib/constants";
import { NumericField } from "./NumericField";

interface VisitorContextFieldsProps {
  month: Month | null;
  visitorType: VisitorType | null;
  weekend: boolean | null;
  operatingSystems: number | null;
  browser: number | null;
  region: number | null;
  trafficType: number | null;
  errors: Record<string, string | null>;
  onMonthChange: (val: Month | null) => void;
  onVisitorTypeChange: (val: VisitorType | null) => void;
  onWeekendChange: (val: boolean | null) => void;
  onNumericChange: (key: string, val: number | null) => void;
  onToggleUnknown: (key: string, unknown: boolean) => void;
  unknownMap: Record<string, boolean>;
}

export const VisitorContextFields: React.FC<VisitorContextFieldsProps> = ({
  month,
  visitorType,
  weekend,
  operatingSystems,
  browser,
  region,
  trafficType,
  errors,
  onMonthChange,
  onVisitorTypeChange,
  onWeekendChange,
  onNumericChange,
  onToggleUnknown,
  unknownMap,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Check how many advanced technical fields are configured
  const advancedConfiguredCount = VISITOR_NUMERIC_FIELDS.filter(
    (cfg) => !unknownMap[cfg.key]
  ).length;

  return (
    <div className="space-y-4">
      {/* Categoricals & Weekend Segmented Control */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Month */}
        <div className="p-3 rounded-xl bg-subtle/50 border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label
              htmlFor="select-month"
              className="text-xs sm:text-sm font-medium text-text select-none"
            >
              Month
            </label>
            <div className="flex items-center gap-1.5 shrink-0">
              <label
                htmlFor="toggle-month"
                className="text-xs text-text-muted select-none cursor-pointer hover:text-text transition-colors"
              >
                Unknown
              </label>
              <input
                id="toggle-month"
                type="checkbox"
                checked={!!unknownMap["Month"]}
                onChange={(e) => {
                  onToggleUnknown("Month", e.target.checked);
                  if (!e.target.checked && !month) {
                    onMonthChange("May");
                  }
                }}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer accent-primary"
              />
            </div>
          </div>
          <select
            id="select-month"
            disabled={!!unknownMap["Month"]}
            value={unknownMap["Month"] || !month ? "" : month}
            onChange={(e) => onMonthChange((e.target.value as Month) || null)}
            className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all ${
              unknownMap["Month"]
                ? "bg-subtle text-text-muted/60 border-border cursor-not-allowed italic"
                : "bg-card text-text border-border hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
            }`}
          >
            {unknownMap["Month"] && <option value="">Auto-imputed</option>}
            {!unknownMap["Month"] &&
              MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
          </select>
        </div>

        {/* Visitor Type */}
        <div className="p-3 rounded-xl bg-subtle/50 border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label
              htmlFor="select-visitor-type"
              className="text-xs sm:text-sm font-medium text-text select-none"
            >
              Visitor type
            </label>
            <div className="flex items-center gap-1.5 shrink-0">
              <label
                htmlFor="toggle-visitor-type"
                className="text-xs text-text-muted select-none cursor-pointer hover:text-text transition-colors"
              >
                Unknown
              </label>
              <input
                id="toggle-visitor-type"
                type="checkbox"
                checked={!!unknownMap["VisitorType"]}
                onChange={(e) => {
                  onToggleUnknown("VisitorType", e.target.checked);
                  if (!e.target.checked && !visitorType) {
                    onVisitorTypeChange("Returning_Visitor");
                  }
                }}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer accent-primary"
              />
            </div>
          </div>
          <select
            id="select-visitor-type"
            disabled={!!unknownMap["VisitorType"]}
            value={unknownMap["VisitorType"] || !visitorType ? "" : visitorType}
            onChange={(e) =>
              onVisitorTypeChange((e.target.value as VisitorType) || null)
            }
            className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all ${
              unknownMap["VisitorType"]
                ? "bg-subtle text-text-muted/60 border-border cursor-not-allowed italic"
                : "bg-card text-text border-border hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
            }`}
          >
            {unknownMap["VisitorType"] && (
              <option value="">Auto-imputed</option>
            )}
            {!unknownMap["VisitorType"] &&
              VISITOR_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v.replace("_", " ")}
                </option>
              ))}
          </select>
        </div>

        {/* Weekend Session: Segmented Toggle (Weekday vs Weekend) */}
        <div className="p-3 rounded-xl bg-subtle/50 border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs sm:text-sm font-medium text-text select-none">
              Weekend session
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <label
                htmlFor="toggle-weekend-unknown"
                className="text-xs text-text-muted select-none cursor-pointer hover:text-text transition-colors"
              >
                Unknown
              </label>
              <input
                id="toggle-weekend-unknown"
                type="checkbox"
                checked={!!unknownMap["Weekend"]}
                onChange={(e) => {
                  onToggleUnknown("Weekend", e.target.checked);
                  if (!e.target.checked && weekend === null) {
                    onWeekendChange(false);
                  }
                }}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="pt-1">
            {unknownMap["Weekend"] ? (
              <div className="py-2 text-center text-xs text-text-muted/60 italic bg-subtle rounded-lg">
                Auto-imputed by model
              </div>
            ) : (
              <div className="flex rounded-lg p-1 bg-subtle border border-border">
                <button
                  type="button"
                  onClick={() => onWeekendChange(false)}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                    !weekend
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-secondary hover:text-text"
                  }`}
                >
                  Weekday
                </button>
                <button
                  type="button"
                  onClick={() => onWeekendChange(true)}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all ${
                    weekend
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-secondary hover:text-text"
                  }`}
                >
                  Weekend
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced / Technical Fields Disclosure */}
      <div className="rounded-xl border border-border bg-card overflow-hidden transition-all shadow-xs">
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-subtle transition-colors focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-text-muted" />
            <span className="text-xs sm:text-sm font-medium text-text">
              Advanced / technical fields (optional)
            </span>
            <span className="text-[11px] text-text-muted">
              ({advancedConfiguredCount} of 4 configured)
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-text-muted transition-transform duration-200 ${
              isAdvancedOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isAdvancedOpen && (
          <div className="p-4 border-t border-border/80 bg-subtle/30 animate-fade-in">
            <p className="text-xs text-text-muted mb-3">
              Operating system, browser, region, and traffic source IDs. These can be left Unknown to let the ML model impute them automatically.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {VISITOR_NUMERIC_FIELDS.map((cfg) => {
                const val =
                  cfg.key === "OperatingSystems"
                    ? operatingSystems
                    : cfg.key === "Browser"
                    ? browser
                    : cfg.key === "Region"
                    ? region
                    : trafficType;
                return (
                  <NumericField
                    key={cfg.key}
                    config={cfg}
                    value={val}
                    isUnknown={!!unknownMap[cfg.key]}
                    error={errors[cfg.key]}
                    onChange={(v) => onNumericChange(cfg.key, v)}
                    onToggleUnknown={(u) => onToggleUnknown(cfg.key, u)}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
