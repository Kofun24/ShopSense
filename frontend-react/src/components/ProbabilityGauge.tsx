import React, { useEffect, useState } from "react";
import { IntentLevel } from "../types";
import { INTENT_COLORS } from "../lib/constants";

interface ProbabilityGaugeProps {
  probability: number; // 0 to 1
  threshold: number; // 0 to 1
  intentLevel: IntentLevel;
}

export const ProbabilityGauge: React.FC<ProbabilityGaugeProps> = ({
  probability,
  threshold,
  intentLevel,
}) => {
  const [animatedPct, setAnimatedPct] = useState(0);
  const targetPct = Math.round(probability * 1000) / 10; // e.g. 57.3
  const colorInfo = INTENT_COLORS[intentLevel] || INTENT_COLORS["Undecided"];

  useEffect(() => {
    // Smooth counter animation on result appear
    const duration = 650;
    const start = performance.now();
    let frameId: number;

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedPct(Math.round(eased * targetPct * 10) / 10);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [targetPct]);

  // SVG Gauge parameters (half-circle gauge)
  const radius = 70;
  const strokeWidth = 14;
  const arcLength = Math.PI * radius; // length of half circle
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, animatedPct))) / 100;

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-card rounded-2xl border border-border shadow-card relative overflow-hidden">
      {/* Background glow matching intent color */}
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: colorInfo.hex }}
      />

      <div className="relative w-48 h-28 flex items-end justify-center select-none">
        <svg
          viewBox="0 0 160 90"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          {/* Background Arc */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-700"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled Progress Arc */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke={colorInfo.hex}
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />

          {/* Threshold Tick Marker */}
          {threshold > 0 && threshold < 1 && (
            <g
              transform={`translate(80, 80) rotate(${threshold * 180 - 180})`}
            >
              <line
                x1={radius - 12}
                y1="0"
                x2={radius + 10}
                y2="0"
                stroke="#64748B"
                strokeWidth="2.5"
                strokeDasharray="2 1"
              />
            </g>
          )}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 top-10 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: colorInfo.hex }}
          >
            {animatedPct.toFixed(1)}%
          </span>
          <span className="text-xs font-medium text-text-muted mt-0.5">
            Purchase Probability
          </span>
        </div>
      </div>

      {/* Threshold comparison pill */}
      <div className="mt-3 flex items-center justify-between w-full max-w-xs px-3 py-1.5 rounded-lg bg-subtle border border-border text-xs">
        <span className="text-text-muted">Threshold:</span>
        <span className="font-semibold text-text">
          {(threshold * 100).toFixed(1)}%
        </span>
        <span
          className={`font-semibold ml-2 px-1.5 py-0.5 rounded text-[11px] ${
            probability >= threshold
              ? "bg-[#ECFDF5] text-[#059669] dark:bg-emerald-950/40 dark:text-[#34D399]"
              : "bg-[#FEF2F2] text-[#DC2626] dark:bg-red-950/40 dark:text-[#F87171]"
          }`}
        >
          {probability >= threshold ? "Above Threshold" : "Below Threshold"}
        </span>
      </div>
    </div>
  );
};
