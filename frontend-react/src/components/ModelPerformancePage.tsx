import React from "react";
import { BarChart3, Target, ShieldCheck } from "lucide-react";
import { holdoutTestMetrics, confusionMatrix } from "../data/modelInsights";

export const ModelPerformancePage: React.FC = () => {
  const {
    threshold,
    accuracy,
    balancedAccuracy,
    precision,
    recall,
    f1,
    rocAuc,
    prAuc,
  } = holdoutTestMetrics;

  const { trueNegative, falsePositive, falseNegative, truePositive } =
    confusionMatrix;

  const totalSessions =
    trueNegative + falsePositive + falseNegative + truePositive; // 2448
  const actualNegative = trueNegative + falsePositive; // 2066
  const actualPositive = falseNegative + truePositive; // 382
  const predictedNegative = trueNegative + falseNegative; // 2029
  const predictedPositive = falsePositive + truePositive; // 419

  return (
    <div className="space-y-6 sm:space-y-7 animate-fade-in">
      {/* Page Title */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-7">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-soft text-primary border border-primary/20">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Hold-out Evaluation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
            Model Performance & Confusion Matrix
          </h2>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            Final unbiased performance evaluation computed on the test partition without data leakage.
          </p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-text">Hold-Out Test Metrics</h3>
          </div>
          <span className="text-xs text-text-muted font-medium">Threshold: {(threshold * 100).toFixed(1)}%</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <span className="text-xs text-text-muted font-medium">PR-AUC</span>
            <div className="text-2xl font-black text-primary mt-1">
              {(prAuc * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-text-muted mt-0.5 block">
              Primary imbalanced ranking metric
            </span>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <span className="text-xs text-text-muted font-medium">ROC-AUC</span>
            <div className="text-2xl font-black text-primary mt-1">
              {(rocAuc * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-text-muted mt-0.5 block">
              Global discriminative power
            </span>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <span className="text-xs text-text-muted font-medium">Recall (Sensitivity)</span>
            <div className="text-2xl font-black text-text mt-1">
              {(recall * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-text-muted mt-0.5 block">
              Buyers correctly caught
            </span>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <span className="text-xs text-text-muted font-medium">Precision</span>
            <div className="text-2xl font-black text-text mt-1">
              {(precision * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-text-muted mt-0.5 block">
              Predicted buyers that convert
            </span>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <span className="text-xs text-text-muted font-medium">F1 Score</span>
            <div className="text-xl font-bold text-text mt-1">
              {(f1 * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-text-muted mt-0.5 block">
              Harmonic mean of Prec/Recall
            </span>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <span className="text-xs text-text-muted font-medium">Accuracy</span>
            <div className="text-xl font-bold text-text mt-1">
              {(accuracy * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-text-muted mt-0.5 block">
              Overall session accuracy
            </span>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <span className="text-xs text-text-muted font-medium">Balanced Accuracy</span>
            <div className="text-xl font-bold text-text mt-1">
              {(balancedAccuracy * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-text-muted mt-0.5 block">
              Macro-average of both classes
            </span>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <span className="text-xs text-text-muted font-medium">Decision Cutoff</span>
            <div className="text-xl font-bold text-text mt-1">
              {(threshold * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-text-muted mt-0.5 block">
              Threshold chosen via PR curve
            </span>
          </div>
        </div>
      </div>

      {/* 2x2 Confusion Matrix Visual - Vibrant Pastel Tints & High-Contrast Punchy Text */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-text">
              2x2 Confusion Matrix (Hold-Out Set)
            </h3>
          </div>
          <span className="text-xs text-text-muted font-mono font-medium">
            N = {totalSessions.toLocaleString()} sessions
          </span>
        </div>

        {/* Matrix Visualization */}
        <div className="max-w-2xl mx-auto overflow-x-auto py-2">
          <div className="grid grid-cols-3 gap-3 text-center">
            {/* Corner header */}
            <div className="p-3 bg-subtle border border-border rounded-xl flex items-center justify-center font-bold text-xs text-text-secondary">
              Actual \ Predicted
            </div>
            <div className="p-3 bg-subtle border border-border rounded-xl font-bold text-xs text-text">
              Predicted No (0)
            </div>
            <div className="p-3 bg-subtle border border-border rounded-xl font-bold text-xs text-text">
              Predicted Yes (1)
            </div>

            {/* Row 1: Actual No */}
            <div className="p-4 bg-subtle border border-border rounded-xl flex flex-col justify-center text-xs font-bold text-text">
              <span>Actual No (0)</span>
              <span className="text-[11px] text-text-muted font-normal mt-0.5">
                {actualNegative.toLocaleString()} sessions
              </span>
            </div>

            {/* True Negative - Healthy Vibrant Light Emerald Tint */}
            <div className="p-5 rounded-xl bg-[#ECFDF5] dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60 shadow-xs flex flex-col items-center justify-center space-y-1">
              <span className="text-2xl font-black text-[#047857] dark:text-[#34D399]">
                {trueNegative.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#065F46] dark:text-[#A7F3D0]">True Negative</span>
              <span className="text-[10px] text-[#047857]/80 dark:text-[#6EE7B7] font-medium">
                {((trueNegative / actualNegative) * 100).toFixed(1)}% of Actual No
              </span>
            </div>

            {/* False Positive - Warm Clear Pastel Coral/Red Tint */}
            <div className="p-5 rounded-xl bg-[#FEF2F2] dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/60 shadow-xs flex flex-col items-center justify-center space-y-1">
              <span className="text-2xl font-black text-[#DC2626] dark:text-[#FB7185]">
                {falsePositive.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#991B1B] dark:text-[#FECDD3]">False Positive</span>
              <span className="text-[10px] text-[#B91C1C]/80 dark:text-[#FDA4AF] font-medium">
                {((falsePositive / actualNegative) * 100).toFixed(1)}% Type I Error
              </span>
            </div>

            {/* Row 2: Actual Yes */}
            <div className="p-4 bg-subtle border border-border rounded-xl flex flex-col justify-center text-xs font-bold text-text">
              <span>Actual Yes (1)</span>
              <span className="text-[11px] text-text-muted font-normal mt-0.5">
                {actualPositive.toLocaleString()} sessions
              </span>
            </div>

            {/* False Negative - Warm Clear Pastel Coral/Red Tint */}
            <div className="p-5 rounded-xl bg-[#FEF2F2] dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700/60 shadow-xs flex flex-col items-center justify-center space-y-1">
              <span className="text-2xl font-black text-[#DC2626] dark:text-[#FB7185]">
                {falseNegative.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#991B1B] dark:text-[#FECDD3]">False Negative</span>
              <span className="text-[10px] text-[#B91C1C]/80 dark:text-[#FDA4AF] font-medium">
                {((falseNegative / actualPositive) * 100).toFixed(1)}% Missed Buyers
              </span>
            </div>

            {/* True Positive - Healthy Vibrant Light Emerald Tint for Success */}
            <div className="p-5 rounded-xl bg-[#ECFDF5] dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/60 shadow-xs flex flex-col items-center justify-center space-y-1">
              <span className="text-2xl font-black text-[#047857] dark:text-[#34D399]">
                {truePositive.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#065F46] dark:text-[#A7F3D0]">True Positive</span>
              <span className="text-[10px] text-[#047857]/80 dark:text-[#6EE7B7] font-medium">
                {((truePositive / actualPositive) * 100).toFixed(1)}% of Actual Yes
              </span>
            </div>

            {/* Column Totals Row */}
            <div className="p-3 bg-subtle border border-border rounded-xl text-xs font-semibold text-text-muted flex items-center justify-center">
              Column Totals
            </div>
            <div className="p-3 bg-subtle border border-border rounded-xl text-xs font-semibold text-text">
              {predictedNegative.toLocaleString()} predicted No
            </div>
            <div className="p-3 bg-subtle border border-border rounded-xl text-xs font-semibold text-text">
              {predictedPositive.toLocaleString()} predicted Yes
            </div>
          </div>
        </div>

        {/* Required Explanatory Sentence */}
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed bg-subtle/80 p-4 rounded-xl border border-border">
          Evaluated once on a stratified, untouched 20% hold-out set (2,448 sessions) that the model never saw during training or tuning.
        </p>
      </div>
    </div>
  );
};
