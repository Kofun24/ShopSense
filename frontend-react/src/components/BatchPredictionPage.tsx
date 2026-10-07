import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  AlertCircle,
} from "lucide-react";
import { BatchPredictResponse, BatchResultItem } from "../types";
import { predictBatch, ApiClientError } from "../lib/api";
import { INTENT_COLORS } from "../lib/constants";

export const BatchPredictionPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<BatchPredictResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Table filtering and pagination state
  const [filterMode, setFilterMode] = useState<"all" | "flagged" | "purchasers">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.name.toLowerCase().endsWith(".csv")) {
        setFile(dropped);
        setError(null);
      } else {
        setError("Only CSV files are supported. Please upload a .csv file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.name.toLowerCase().endsWith(".csv")) {
        setFile(selected);
        setError(null);
      } else {
        setError("Only CSV files are supported. Please upload a .csv file.");
      }
    }
  };

  const handleUploadAndPredict = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await predictBatch(file);
      setResponse(res);
      setCurrentPage(1);
    } catch (err: unknown) {
      const clientError = err as ApiClientError;
      setError(
        clientError.detail || clientError.message || "Failed to process batch CSV."
      );
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // Download Sample CSV template
  const handleDownloadTemplate = () => {
    const headers = [
      "Administrative",
      "Administrative_Duration",
      "Informational",
      "Informational_Duration",
      "ProductRelated",
      "ProductRelated_Duration",
      "BounceRates",
      "ExitRates",
      "PageValues",
      "SpecialDay",
      "Month",
      "OperatingSystems",
      "Browser",
      "Region",
      "TrafficType",
      "VisitorType",
      "Weekend",
    ];

    const sampleRow1 = "0,0,0,0,4,120,0.05,0.08,0,0,Mar,1,1,1,1,New_Visitor,FALSE";
    const sampleRow2 = "3,0,1,0,45,2100,0.005,0.02,35,0,Nov,2,2,1,2,Returning_Visitor,FALSE";
    const sampleRow3 = "1,,,,10,300,0.02,0.04,15,0,May,1,1,1,1,Returning_Visitor,TRUE";

    const csvContent = [headers.join(","), sampleRow1, sampleRow2, sampleRow3].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "online_shoppers_batch_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Client-side export of results as CSV
  const handleExportResults = () => {
    if (!response || !response.results.length) return;

    const headers = [
      "row_index",
      "purchase_probability",
      "will_purchase",
      "intent_level",
      "low_confidence",
      "imputed_fields_count",
      "fields_imputed",
    ];

    const rows = response.results.map((r) => [
      r.row_index,
      r.purchase_probability,
      r.will_purchase ? "TRUE" : "FALSE",
      `"${r.intent_level}"`,
      r.low_confidence ? "TRUE" : "FALSE",
      r.fields_imputed.length,
      `"${r.fields_imputed.join(";")}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `prediction_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter results
  const filteredResults = (response?.results || []).filter((item: BatchResultItem) => {
    if (filterMode === "flagged") return item.low_confidence;
    if (filterMode === "purchasers") return item.will_purchase;
    return true;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Info */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <span>Batch Session Prediction</span>
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Upload shopping session CSV datasets (up to 5,000 rows) for high-performance vectorized ML scoring.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-subtle text-text-muted hover:text-text text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <FileText className="w-4 h-4 text-primary" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* Upload Drop Zone */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 sm:p-8 space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
            isDragOver
              ? "border-[#2A66F7] bg-blue-50/60 dark:bg-blue-950/40 scale-[0.99]"
              : "border-slate-300 dark:border-slate-700 hover:border-[#2A66F7]/70 bg-subtle/40 hover:bg-subtle/70"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#2A66F7] dark:text-[#60A5FA] border border-blue-200/50 dark:border-blue-800/50 flex items-center justify-center shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-text">
              {file ? (
                <span className="text-[#2A66F7] font-bold">{file.name}</span>
              ) : (
                "Click to upload or drag and drop your CSV"
              )}
            </p>
            <p className="text-xs text-text-muted">
              Standard 17-column session CSV · Maximum 5,000 rows per batch
            </p>
            {file && (
              <p className="text-[11px] text-text-muted pt-1">
                {(file.size / 1024).toFixed(1)} KB · Ready for scoring
              </p>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-text-muted">
            Header row required. Blank cells will be automatically imputed by the pipeline.
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {file && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setResponse(null);
                  setError(null);
                }}
                disabled={loading}
                className="px-3.5 py-2 text-xs font-semibold text-text-muted hover:text-text transition-colors"
              >
                Clear
              </button>
            )}

            {/* Vibrant ShopSense Brand Blue Primary Button */}
            <button
              type="button"
              onClick={handleUploadAndPredict}
              disabled={!file || loading}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all ${
                file && !loading
                  ? "bg-[#2A66F7] hover:bg-[#1E51D8] active:bg-[#1742B8] shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Batch...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Run Batch Prediction</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-danger-soft border border-danger/30 text-danger shadow-xs flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Batch Processing Failed</h4>
            <p className="text-xs sm:text-sm text-text leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {response && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary Strip */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-base font-bold text-text">
                {response.total_records} records processed
              </span>
              <span className="text-text-muted">·</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  response.flagged_for_review > 0
                    ? "bg-[#FEF2F2] text-[#DC2626] dark:bg-rose-950/50 dark:text-[#FB7185] border border-rose-300 dark:border-rose-700/60"
                    : "bg-[#E6F4EA] text-[#137333] dark:bg-emerald-950/50 dark:text-[#34D399] border border-[#137333]/30 dark:border-emerald-700/60"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{response.flagged_for_review} flagged for review (≥8 imputed)</span>
              </span>
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportResults}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A66F7] hover:bg-[#1E51D8] text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export results as CSV</span>
            </button>
          </div>

          {/* Table Filters */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-text-muted font-medium">Filter:</span>
              <button
                type="button"
                onClick={() => {
                  setFilterMode("all");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  filterMode === "all"
                    ? "bg-[#2A66F7] text-white font-bold shadow-2xs"
                    : "bg-subtle text-text-secondary hover:text-text font-medium"
                }`}
              >
                All ({response.results.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode("flagged");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  filterMode === "flagged"
                    ? "bg-[#DC2626] text-white font-bold shadow-2xs"
                    : "bg-subtle text-[#DC2626] hover:bg-rose-50 font-medium"
                }`}
              >
                Flagged ({response.flagged_for_review})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterMode("purchasers");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  filterMode === "purchasers"
                    ? "bg-[#047857] text-white font-bold shadow-2xs"
                    : "bg-subtle text-[#047857] hover:bg-emerald-50 font-medium"
                }`}
              >
                Predicted Buyers (
                {response.results.filter((r) => r.will_purchase).length})
              </button>
            </div>

            <span className="text-xs text-text-muted font-medium">
              Showing {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredResults.length)} of{" "}
              {filteredResults.length}
            </span>
          </div>

          {/* Results Table */}
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-subtle border-b border-border text-text-secondary font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Row #</th>
                    <th className="py-3 px-4">Probability</th>
                    <th className="py-3 px-4">Prediction</th>
                    <th className="py-3 px-4">Intent Level</th>
                    <th className="py-3 px-4">Confidence Status</th>
                    <th className="py-3 px-4">Imputed Fields</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedResults.map((item) => {
                    const colorInfo =
                      INTENT_COLORS[item.intent_level] || INTENT_COLORS["Undecided"];
                    return (
                      <tr
                        key={item.row_index}
                        className={`hover:bg-subtle/60 transition-colors ${
                          item.low_confidence ? "bg-rose-50/30 dark:bg-rose-950/20" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-medium text-text">
                          #{item.row_index + 1}
                        </td>
                        <td className="py-3 px-4 font-black text-text">
                          {(item.purchase_probability * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                              item.will_purchase
                                ? "bg-[#ECFDF5] text-[#047857] dark:bg-emerald-950/50 dark:text-[#34D399] border border-emerald-300/50"
                                : "bg-[#FEF2F2] text-[#DC2626] dark:bg-rose-950/50 dark:text-[#FB7185] border border-rose-300/50"
                            }`}
                          >
                            {item.will_purchase ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-[#047857] dark:text-[#34D399]" /> Buy
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-[#DC2626] dark:text-[#FB7185]" /> No
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold"
                            style={{
                              backgroundColor: `${colorInfo.hex}18`,
                              color: colorInfo.hex,
                            }}
                          >
                            {item.intent_level}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {item.low_confidence ? (
                            <span className="inline-flex items-center gap-1 text-[#DC2626] dark:text-[#FB7185] font-bold bg-[#FEF2F2] dark:bg-rose-950/50 border border-rose-300/40 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" /> Flagged (Low)
                            </span>
                          ) : (
                            <span className="text-text-muted font-medium">Normal</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-text-muted font-medium">
                          {item.fields_imputed.length === 0 ? (
                            <span className="text-slate-400 dark:text-slate-600 italic">None</span>
                          ) : (
                            <span title={item.fields_imputed.join(", ")}>
                              {item.fields_imputed.length} fields estimated
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-text-muted bg-subtle/50">
                <div>
                  Page <strong className="text-text font-bold">{currentPage}</strong> of{" "}
                  <strong className="text-text font-bold">{totalPages}</strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-border bg-card hover:bg-subtle disabled:opacity-40 disabled:cursor-not-allowed text-text transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="p-1.5 rounded-lg border border-border bg-card hover:bg-subtle disabled:opacity-40 disabled:cursor-not-allowed text-text transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
