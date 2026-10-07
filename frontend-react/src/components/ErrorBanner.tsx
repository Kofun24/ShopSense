import React from "react";
import { AlertCircle, X, Terminal, ServerOff } from "lucide-react";
import { ApiClientError } from "../lib/api";

interface ErrorBannerProps {
  error: ApiClientError | Error | null;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  const clientError = error as ApiClientError;
  const isNetwork = clientError.isNetworkError;
  const is503 = clientError.status === 503;
  const is422 = clientError.status === 422;

  let title = "Prediction Request Failed";
  let description = clientError.message;
  let subDetail: string | undefined = undefined;

  if (isNetwork) {
    title = "Backend Unreachable";
    description = "Cannot reach the prediction server. Make sure the backend is running.";
    subDetail = "Command: uvicorn backend.api:app --reload --port 8000";
  } else if (is503) {
    title = "Service Unavailable";
    description = "The prediction model isn't available right now.";
    subDetail = clientError.detail;
  } else if (is422) {
    title = "Validation Error";
    description = clientError.detail || clientError.message;
  }

  return (
    <div
      role="alert"
      className="p-4 rounded-2xl bg-[#FEF2F2] dark:bg-red-950/40 border border-danger/30 text-danger shadow-card flex items-start justify-between gap-3 animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-lg bg-danger/10 text-danger shrink-0 mt-0.5">
          {isNetwork ? <ServerOff className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-danger">{title}</h4>
          <p className="text-xs sm:text-sm text-text leading-relaxed">{description}</p>
          {subDetail && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-card/80 border border-danger/20 text-xs font-mono text-text-secondary">
              <Terminal className="w-3.5 h-3.5 text-danger" />
              <span>{subDetail}</span>
            </div>
          )}
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-danger hover:text-danger/80 p-1 rounded-lg transition-colors focus:outline-none"
          aria-label="Dismiss error banner"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
