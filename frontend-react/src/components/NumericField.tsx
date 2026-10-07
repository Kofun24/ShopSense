import React from "react";
import { HelpCircle } from "lucide-react";
import { FieldConfig } from "../lib/constants";

interface NumericFieldProps {
  config: FieldConfig;
  value: number | null | undefined;
  isUnknown: boolean;
  error?: string | null;
  onChange: (value: number | null) => void;
  onToggleUnknown: (unknown: boolean) => void;
}

export const NumericField: React.FC<NumericFieldProps> = ({
  config,
  value,
  isUnknown,
  error,
  onChange,
  onToggleUnknown,
}) => {
  const { key, label, helperText, min, max, step, isInt, defaultValue } = config;
  const inputId = `input-${key}`;
  const toggleId = `toggle-${key}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(null);
      return;
    }
    const parsed = isInt ? parseInt(raw, 10) : parseFloat(raw);
    onChange(isNaN(parsed) ? null : parsed);
  };

  const handleToggle = (checked: boolean) => {
    onToggleUnknown(checked);
    if (!checked && (value === null || value === undefined)) {
      // restore default value when toggling off Unknown
      onChange(defaultValue);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-subtle/50 border border-border hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className="text-xs sm:text-sm font-medium text-text flex items-center gap-1.5 select-none"
        >
          <span>{label}</span>
          {helperText && (
            <span
              className="text-text-muted hover:text-text cursor-help transition-colors"
              title={helperText}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          )}
        </label>

        {/* Unknown Toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <label
            htmlFor={toggleId}
            className="text-xs text-text-muted select-none cursor-pointer hover:text-text transition-colors"
          >
            Unknown
          </label>
          <input
            id={toggleId}
            type="checkbox"
            checked={isUnknown}
            onChange={(e) => handleToggle(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/40 cursor-pointer accent-primary"
            title="Mark as unknown to let model impute"
          />
        </div>
      </div>

      {helperText && (
        <span className="text-[11px] text-text-muted leading-tight -mt-0.5">
          {helperText}
        </span>
      )}

      {/* Input */}
      <div className="relative mt-0.5">
        <input
          id={inputId}
          type="number"
          disabled={isUnknown}
          min={min}
          max={max}
          step={step}
          value={isUnknown || value === null || value === undefined ? "" : value}
          onChange={handleInputChange}
          placeholder={isUnknown ? "Auto-imputed by model" : `${min} – ${max}`}
          className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
            isUnknown
              ? "bg-subtle text-text-muted/60 border-border cursor-not-allowed italic"
              : error
              ? "bg-card text-text border-danger ring-1 ring-danger/30 focus:border-danger focus:ring-danger/40"
              : "bg-card text-text border-border hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20"
          } outline-none`}
        />
        <div className="absolute right-2.5 top-2.5 text-[10px] text-text-muted pointer-events-none select-none">
          {!isUnknown && (
            <span>
              {min}..{max}
            </span>
          )}
        </div>
      </div>

      {/* Inline error */}
      {!isUnknown && error && (
        <span className="text-xs text-danger font-medium animate-fade-in">
          {error}
        </span>
      )}
    </div>
  );
};
