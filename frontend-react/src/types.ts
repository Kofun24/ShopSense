export type Month =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "May"
  | "Jun"
  | "Jul"
  | "Aug"
  | "Sep"
  | "Oct"
  | "Nov"
  | "Dec";

export type VisitorType = "Returning_Visitor" | "New_Visitor" | "Other";

export type IntentLevel =
  | "High intent"
  | "Medium-high intent"
  | "Undecided"
  | "Low intent";

export interface SessionData {
  Administrative?: number | null;
  Administrative_Duration?: number | null;
  Informational?: number | null;
  Informational_Duration?: number | null;
  ProductRelated?: number | null;
  ProductRelated_Duration?: number | null;
  BounceRates?: number | null;
  ExitRates?: number | null;
  PageValues?: number | null;
  SpecialDay?: number | null;
  Month?: Month | null;
  OperatingSystems?: number | null;
  Browser?: number | null;
  Region?: number | null;
  TrafficType?: number | null;
  VisitorType?: VisitorType | null;
  Weekend?: boolean | null;
}

export interface KeyFactor {
  field: string;
  value: number | string | boolean | null;
  provided: boolean;
}

export interface PredictResponse {
  purchase_probability: number;
  will_purchase: boolean;
  decision_threshold: number;
  intent_level: IntentLevel;
  recommended_action: string;
  fields_imputed: string[];
  low_confidence: boolean;
  key_factors: KeyFactor[];
  model: string;
}

export interface BatchResultItem {
  row_index: number;
  purchase_probability: number;
  will_purchase: boolean;
  intent_level: IntentLevel;
  low_confidence: boolean;
  fields_imputed: string[];
}

export interface BatchPredictResponse {
  total_records: number;
  flagged_for_review: number;
  results: BatchResultItem[];
}

export interface HealthResponse {
  status: string;
  model: string;
  trained_at: string;
}

export interface PreprocessingInfo {
  imputer: string;
  cat_imputer: string;
  outlier: string;
  scale: boolean;
  use_fe: boolean;
  selector: unknown;
  drop_cols: string[];
}

export interface HyperparametersInfo {
  n_estimators?: number;
  max_depth?: number;
  max_features?: string;
  min_samples_leaf?: number;
  class_weight?: unknown;
  [key: string]: unknown;
}

export interface TestMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  pr_auc: number;
}

export interface ModelInfoResponse {
  model: string;
  threshold: number;
  preprocessing: PreprocessingInfo;
  hyperparameters: HyperparametersInfo;
  test_metrics: TestMetrics;
}

export interface ApiError {
  message: string;
  status?: number;
  detail?: string | Array<{ loc?: (string | number)[]; msg?: string; type?: string }>;
}
