export interface CandidateModelMetric {
  model: string;
  cvPrAuc: number;
  cvRocAuc: number;
  cvF1: number;
}

export const tunedModelComparison: CandidateModelMetric[] = [
  { model: "RandomForest", cvPrAuc: 0.7526, cvRocAuc: 0.9304, cvF1: 0.6467 },
  { model: "HistGradientBoosting", cvPrAuc: 0.7514, cvRocAuc: 0.9338, cvF1: 0.6514 },
  { model: "XGBoost", cvPrAuc: 0.7512, cvRocAuc: 0.9327, cvF1: 0.6602 },
  { model: "SVM_RBF", cvPrAuc: 0.7253, cvRocAuc: 0.9073, cvF1: 0.6575 },
  { model: "KNN", cvPrAuc: 0.7233, cvRocAuc: 0.9208, cvF1: 0.6134 },
  { model: "DecisionTree", cvPrAuc: 0.7016, cvRocAuc: 0.9123, cvF1: 0.6494 },
  { model: "LogisticRegression", cvPrAuc: 0.6668, cvRocAuc: 0.9196, cvF1: 0.6560 },
];

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export const permutationImportance: FeatureImportanceItem[] = [
  { feature: "PageValues", importance: 0.5598 },
  { feature: "Month", importance: 0.0461 },
  { feature: "ExitRates", importance: 0.0254 },
  { feature: "ProductRelated", importance: 0.0248 },
  { feature: "Administrative", importance: 0.0169 },
  { feature: "VisitorType", importance: 0.0134 },
  { feature: "ProductRelated_Duration", importance: 0.0118 },
  { feature: "BounceRates", importance: 0.0116 },
];

export const holdoutTestMetrics = {
  threshold: 0.381,
  accuracy: 0.897,
  balancedAccuracy: 0.825,
  precision: 0.656,
  recall: 0.720,
  f1: 0.687,
  rocAuc: 0.938,
  prAuc: 0.772,
};

export const confusionMatrix = {
  trueNegative: 1922,
  falsePositive: 144,
  falseNegative: 107,
  truePositive: 275,
};

export const trainingClassDistribution = {
  nonPurchase: 10422,
  purchase: 1908,
  total: 12330,
  nonPurchasePct: 84.5,
  purchasePct: 15.5,
};
