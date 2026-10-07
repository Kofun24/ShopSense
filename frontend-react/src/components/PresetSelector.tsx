import React from "react";
import { Sparkles, ShoppingCart, UserCheck, SlidersHorizontal } from "lucide-react";

interface PresetSelectorProps {
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  activePresetId,
  onSelectPreset,
}) => {
  const presetList = [
    {
      id: "casual",
      name: "Casual browser",
      icon: ShoppingCart,
      desc: "New visitor glancing at a few product pages (Mar, low engagement)",
    },
    {
      id: "serious",
      name: "Serious shopper",
      icon: UserCheck,
      desc: "Returning visitor with high page value and cart focus (Nov)",
    },
    {
      id: "custom",
      name: "Custom",
      icon: SlidersHorizontal,
      desc: "Manually configure session behaviour and context",
    },
  ];

  return (
    <div className="bg-card rounded-2xl p-4 sm:p-5 border border-border shadow-card transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-text">Preset Scenarios</h2>
        </div>
        <span className="text-xs text-text-muted">
          Quickly test pre-configured archetypes or configure your own
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {presetList.map((preset) => {
          const Icon = preset.icon;
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              className={`flex flex-col text-left p-3.5 rounded-xl border transition-all relative ${
                isActive
                  ? "border-primary bg-primary-soft/60 dark:bg-primary/15 text-primary shadow-xs ring-1 ring-primary/40"
                  : "border-border bg-card hover:border-slate-300 dark:hover:border-slate-700 hover:bg-subtle/60 text-text"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-text-muted"}`} />
                  {preset.name}
                </span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <p
                className={`text-xs line-clamp-2 ${
                  isActive ? "text-primary/90 dark:text-blue-300 font-normal" : "text-text-muted"
                }`}
              >
                {preset.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
