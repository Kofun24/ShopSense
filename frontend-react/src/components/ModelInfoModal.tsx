import React from "react";
import { X, Cpu, Gauge, CheckCircle, Database } from "lucide-react";
import { ModelInfoResponse } from "../types";

interface ModelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  info: ModelInfoResponse | null;
  loading: boolean;
  error: string | null;
}

export const ModelInfoModal: React.FC<ModelInfoModalProps> = ({
  isOpen,
  onClose,
  info,
  loading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="model-info-title"
    >
      <div className="bg-surface rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="model-info-title"
                className="text-base font-semibold text-text"
              >
                Trained Model Specifications
              </h2>
              <p className="text-xs text-text-muted">
                Validation & hyperparameter configuration from the ML pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading && (
            <div className="py-12 text-center text-text-muted space-y-2">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-sm">Fetching model parameters...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-danger-light text-danger text-sm border border-danger/20">
              {error}
            </div>
          )}

          {info && !loading && (
            <>
              {/* Primary overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-text-muted">Model Algorithm</div>
                  <div className="text-sm font-semibold text-text mt-0.5">
                    {info.model}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-xs text-text-muted">Decision Threshold</div>
                  <div className="text-sm font-semibold text-text mt-0.5">
                    {(info.threshold * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                  <div className="text-xs text-text-muted">Missing Values</div>
                  <div className="text-sm font-semibold text-text mt-0.5">
                    Median / Mode Imputation
                  </div>
                </div>
              </div>

              {/* Test Metrics */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2.5 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-primary" /> Test Metrics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div className="text-xs text-text-muted">ROC AUC</div>
                    <div className="text-lg font-bold text-primary mt-0.5">
                      {(info.test_metrics.roc_auc * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div className="text-xs text-text-muted">PR AUC</div>
                    <div className="text-lg font-bold text-primary mt-0.5">
                      {(info.test_metrics.pr_auc * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div className="text-xs text-text-muted">Accuracy</div>
                    <div className="text-lg font-bold text-text mt-0.5">
                      {(info.test_metrics.accuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div className="text-xs text-text-muted">Precision</div>
                    <div className="text-lg font-bold text-text mt-0.5">
                      {(info.test_metrics.precision * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div className="text-xs text-text-muted">Recall</div>
                    <div className="text-lg font-bold text-text mt-0.5">
                      {(info.test_metrics.recall * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                    <div className="text-xs text-text-muted">F1 Score</div>
                    <div className="text-lg font-bold text-text mt-0.5">
                      {(info.test_metrics.f1 * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Preprocessing & Hyperparameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-secondary" /> Preprocessing
                  </h4>
                  <ul className="text-xs space-y-1 text-text">
                    <li>• Imputer: <span className="font-medium">{info.preprocessing.imputer}</span></li>
                    <li>• Categorical Imputer: <span className="font-medium">{info.preprocessing.cat_imputer}</span></li>
                    <li>• Outlier Treatment: <span className="font-medium">{info.preprocessing.outlier}</span></li>
                    <li>• Feature Scaling: <span className="font-medium">{info.preprocessing.scale ? "StandardScaler" : "None"}</span></li>
                    <li>• Feature Engineering: <span className="font-medium">{info.preprocessing.use_fe ? "Active" : "None"}</span></li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-success" /> Hyperparameters
                  </h4>
                  <ul className="text-xs space-y-1 text-text">
                    {Object.entries(info.hyperparameters).map(([key, val]) => (
                      <li key={key}>
                        • {key}: <span className="font-medium">{String(val ?? "None")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-white border border-slate-200 text-text hover:bg-slate-50 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
