import { Month, VisitorType, IntentLevel, SessionData } from "../types";

export interface FieldConfig {
  key: keyof SessionData;
  label: string;
  helperText?: string;
  min: number;
  max: number;
  step: number;
  isInt: boolean;
  defaultValue: number;
}

export const BROWSING_FIELDS: FieldConfig[] = [
  {
    key: "Administrative",
    label: "Account/admin pages viewed",
    min: 0,
    max: 100,
    step: 1,
    isInt: true,
    defaultValue: 0,
  },
  {
    key: "Administrative_Duration",
    label: "Time on admin pages (seconds)",
    min: 0,
    max: 100000,
    step: 1,
    isInt: false,
    defaultValue: 0,
  },
  {
    key: "Informational",
    label: "Info pages viewed",
    min: 0,
    max: 100,
    step: 1,
    isInt: true,
    defaultValue: 0,
  },
  {
    key: "Informational_Duration",
    label: "Time on info pages (seconds)",
    min: 0,
    max: 100000,
    step: 1,
    isInt: false,
    defaultValue: 0,
  },
  {
    key: "ProductRelated",
    label: "Product pages viewed",
    min: 0,
    max: 5000,
    step: 1,
    isInt: true,
    defaultValue: 10,
  },
  {
    key: "ProductRelated_Duration",
    label: "Time on product pages (seconds)",
    min: 0,
    max: 500000,
    step: 1,
    isInt: false,
    defaultValue: 300,
  },
];

export const METRIC_FIELDS: FieldConfig[] = [
  {
    key: "BounceRates",
    label: "Bounce rate (0–1)",
    min: 0,
    max: 1,
    step: 0.001,
    isInt: false,
    defaultValue: 0.02,
  },
  {
    key: "ExitRates",
    label: "Exit rate (0–1)",
    min: 0,
    max: 1,
    step: 0.001,
    isInt: false,
    defaultValue: 0.04,
  },
  {
    key: "PageValues",
    label: "Page value",
    helperText: "Average value of pages visited before purchase",
    min: 0,
    max: 1000,
    step: 0.1,
    isInt: false,
    defaultValue: 0,
  },
  {
    key: "SpecialDay",
    label: "Closeness to special day (0–1)",
    min: 0,
    max: 1,
    step: 0.1,
    isInt: false,
    defaultValue: 0,
  },
];

export const VISITOR_NUMERIC_FIELDS: FieldConfig[] = [
  {
    key: "OperatingSystems",
    label: "Operating system (ID)",
    min: 1,
    max: 20,
    step: 1,
    isInt: true,
    defaultValue: 1,
  },
  {
    key: "Browser",
    label: "Browser (ID)",
    min: 1,
    max: 20,
    step: 1,
    isInt: true,
    defaultValue: 1,
  },
  {
    key: "Region",
    label: "Region (ID)",
    min: 1,
    max: 20,
    step: 1,
    isInt: true,
    defaultValue: 1,
  },
  {
    key: "TrafficType",
    label: "Traffic type (ID)",
    min: 1,
    max: 30,
    step: 1,
    isInt: true,
    defaultValue: 1,
  },
];

export const ALL_NUMERIC_FIELDS: FieldConfig[] = [
  ...BROWSING_FIELDS,
  ...METRIC_FIELDS,
  ...VISITOR_NUMERIC_FIELDS,
];

export const MONTHS: Month[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const VISITOR_TYPES: VisitorType[] = [
  "Returning_Visitor",
  "New_Visitor",
  "Other",
];

export const FRIENDLY_LABELS: Record<string, string> = {
  Administrative: "Account/admin pages viewed",
  Administrative_Duration: "Time on admin pages (seconds)",
  Informational: "Info pages viewed",
  Informational_Duration: "Time on info pages (seconds)",
  ProductRelated: "Product pages viewed",
  ProductRelated_Duration: "Time on product pages (seconds)",
  BounceRates: "Bounce rate (0–1)",
  ExitRates: "Exit rate (0–1)",
  PageValues: "Page value",
  SpecialDay: "Closeness to special day (0–1)",
  Month: "Month",
  VisitorType: "Visitor type",
  Weekend: "Weekend session",
  OperatingSystems: "Operating system (ID)",
  Browser: "Browser (ID)",
  Region: "Region (ID)",
  TrafficType: "Traffic type (ID)",
};

export interface Preset {
  id: string;
  name: string;
  description: string;
  values: SessionData;
}

export const PRESETS: Record<string, Preset> = {
  custom: {
    id: "custom",
    name: "Custom",
    description: "Build your own custom browsing session",
    values: {
      Administrative: 0,
      Administrative_Duration: 0,
      Informational: 0,
      Informational_Duration: 0,
      ProductRelated: 10,
      ProductRelated_Duration: 300,
      BounceRates: 0.02,
      ExitRates: 0.04,
      PageValues: 0,
      SpecialDay: 0,
      Month: "May",
      VisitorType: "Returning_Visitor",
      Weekend: false,
      OperatingSystems: null,
      Browser: null,
      Region: null,
      TrafficType: null,
    },
  },
  casual: {
    id: "casual",
    name: "Casual browser",
    description: "New visitor glancing at a few product pages",
    values: {
      Administrative: 0,
      Informational: 0,
      ProductRelated: 4,
      ProductRelated_Duration: 120,
      BounceRates: 0.05,
      ExitRates: 0.08,
      PageValues: 0,
      Month: "Mar",
      VisitorType: "New_Visitor",
      Weekend: false,
      Administrative_Duration: null,
      Informational_Duration: null,
      SpecialDay: null,
      OperatingSystems: null,
      Browser: null,
      Region: null,
      TrafficType: null,
    },
  },
  serious: {
    id: "serious",
    name: "Serious shopper",
    description: "Returning visitor with high engagement and page value",
    values: {
      Administrative: 3,
      Informational: 1,
      ProductRelated: 45,
      ProductRelated_Duration: 2100,
      BounceRates: 0.005,
      ExitRates: 0.02,
      PageValues: 35,
      Month: "Nov",
      VisitorType: "Returning_Visitor",
      Weekend: false,
      Administrative_Duration: null,
      Informational_Duration: null,
      SpecialDay: null,
      OperatingSystems: null,
      Browser: null,
      Region: null,
      TrafficType: null,
    },
  },
};

export const INTENT_COLORS: Record<
  IntentLevel,
  {
    hex: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    badgeBg: string;
  }
> = {
  "High intent": {
    hex: "#10B981",
    bgClass: "bg-success",
    textClass: "text-[#047857] dark:text-[#34D399]",
    borderClass: "border-[#10B981]/30",
    badgeBg: "bg-[#ECFDF5] dark:bg-emerald-950/40",
  },
  "Medium-high intent": {
    hex: "#2A66F7",
    bgClass: "bg-primary",
    textClass: "text-[#2A66F7] dark:text-[#60A5FA]",
    borderClass: "border-[#2A66F7]/30",
    badgeBg: "bg-[#EEF4FF] dark:bg-blue-950/40",
  },
  "Undecided": {
    hex: "#F59E0B",
    bgClass: "bg-warning",
    textClass: "text-[#D97706] dark:text-[#FBBF24]",
    borderClass: "border-[#F59E0B]/30",
    badgeBg: "bg-[#FFFBEB] dark:bg-amber-950/40",
  },
  "Low intent": {
    hex: "#EF4444",
    bgClass: "bg-danger",
    textClass: "text-[#DC2626] dark:text-[#F87171]",
    borderClass: "border-[#EF4444]/30",
    badgeBg: "bg-[#FEF2F2] dark:bg-rose-950/40",
  },
};
