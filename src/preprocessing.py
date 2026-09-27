"""src/preprocessing.py



"""
import os
from functools import partial
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.experimental import enable_iterative_imputer  # noqa: F401
from sklearn.feature_selection import SelectFromModel, SelectKBest, mutual_info_classif
from sklearn.impute import IterativeImputer, KNNImputer, SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder, StandardScaler

# =====================================================================================
# 1. CONFIGURATION
# =====================================================================================
ROOT = Path(__file__).resolve().parents[1]
DATA_RAW = ROOT / "data" / "raw"
DATA_PROCESSED = ROOT / "data" / "processed"
MODELS_DIR = ROOT / "models"
FIG_DIR = ROOT / "reports" / "figures"
TABLE_DIR = ROOT / "reports" / "tables"
for _d in (DATA_RAW, DATA_PROCESSED, MODELS_DIR, FIG_DIR, TABLE_DIR):
    _d.mkdir(parents=True, exist_ok=True)

# ---- files -------------------------------------------------------------
MODIFIED_FILE = DATA_RAW / "online_shoppers_intention_synthetic_missing.xlsx"
MODIFIED_CSV = DATA_RAW / "online_shoppers_intention_synthetic_missing.csv"

# ---- experiment settings ----------------------------------------------
RANDOM_STATE = 42
TEST_SIZE = 0.20
CV_FOLDS = 5
N_JOBS = -1
# Quick dry run: set the environment variable FAST=1 BEFORE importing src (small sample, 3 folds, few search iterations).
# In a notebook: import os; os.environ["FAST"] = "1"
FAST = os.getenv("FAST", "0") == "1"
if FAST:
    CV_FOLDS = 3

# ---- columns ------------------------------------------------------------
TARGET = "Revenue"
NUMERIC_COLS = [
    "Administrative", "Administrative_Duration",
    "Informational", "Informational_Duration",
    "ProductRelated", "ProductRelated_Duration",
    "BounceRates", "ExitRates", "PageValues", "SpecialDay",
]
CATEGORICAL_COLS = [
    "Month", "VisitorType", "Weekend",
    "OperatingSystems", "Browser", "Region", "TrafficType",
]
FEATURE_COLS = NUMERIC_COLS + CATEGORICAL_COLS
MISSING_NUMERIC = ["Administrative_Duration", "ProductRelated_Duration", "BounceRates"]
MISSING_CATEGORICAL = ["VisitorType"]
LEAKAGE_SUSPECTS = ["PageValues", "ExitRates", "BounceRates"]

# ---- DECISION POINT -----------------------------------------------------
# Defaults used by notebook 03 (modelling) and the deployed model.
# Update these once notebook 02 (imputation + feature experiments) tells you what is best.
BEST_PREP = dict(
    imputer="median",        # mean | median | knn | iterative
    cat_imputer="mode",      # mode | unknown
    outlier="log",           # none | log | cap
    scale=True,
    use_fe=True,             # engineered features on/off
    selector=None,           # None | kbest | rf
    drop_cols=[],            # e.g. ["PageValues"] if you decide it is leakage
)


# =====================================================================================
# 2. DATA LOADING, CLEANING, SPLITTING
# =====================================================================================
MONTH_FIX = {"June": "Jun"}  # UCI file uses 'June' but 'Jul', 'Sep', ... (inconsistent)


def load_modified() -> pd.DataFrame:
    """The project dataset (contains missing values in 4 columns). Raw, untouched."""
    if MODIFIED_FILE.exists():
        return pd.read_excel(MODIFIED_FILE)
    if MODIFIED_CSV.exists():
        return pd.read_csv(MODIFIED_CSV)
    raise FileNotFoundError(f"Put the modified dataset in {MODIFIED_FILE}")


def prepare_input(df: pd.DataFrame) -> pd.DataFrame:
    """Enforce dtypes so training and the API see exactly the same schema.
    Numerics -> float, categoricals -> object (NaN preserved)."""
    df = df.copy()
    for c in NUMERIC_COLS:
        if c in df:
            df[c] = pd.to_numeric(df[c], errors="coerce").astype(float)
    if "Month" in df:
        df["Month"] = df["Month"].replace(MONTH_FIX)
    if "Weekend" in df:
        df["Weekend"] = df["Weekend"].map(lambda v: np.nan if pd.isna(v) else int(bool(v)))
    for c in CATEGORICAL_COLS:
        if c in df:
            df[c] = df[c].astype(object).where(df[c].notna(), np.nan)
    return df


def basic_clean(df: pd.DataFrame) -> pd.DataFrame:
    """Standardise labels/dtypes. Does NOT drop rows and does NOT impute."""
    df = prepare_input(df)
    if TARGET in df:
        df[TARGET] = df[TARGET].astype(int)
    return df


def drop_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    return df.drop_duplicates(keep="first")


def load_clean(dedupe: bool = True) -> pd.DataFrame:
    df = basic_clean(load_modified())
    return drop_duplicates(df) if dedupe else df


def get_split(dedupe: bool = True):
    """Stratified train/test split. Split happens BEFORE any fitting (no leakage).
    Index is preserved."""
    df = load_clean(dedupe)
    X, y = df[FEATURE_COLS], df[TARGET]
    return train_test_split(X, y, test_size=TEST_SIZE, stratify=y, random_state=RANDOM_STATE)


# =====================================================================================
# 3. TRANSFORMERS AND PIPELINE STAGES
# =====================================================================================
OTHER_CAT = [c for c in CATEGORICAL_COLS if c != "VisitorType"]
ENGINEERED_NUM = ["TotalPages", "TotalDuration", "AvgTimePerPage",
                  "ProductRelatedShare", "IsHolidaySeason", "HasPageValue"]


# ---------------------------------------------------------------- transformers
def log1p_clip(X):
    """log(1+x) for right-skewed, non-negative features (negatives clipped to 0)."""
    return np.log1p(np.clip(np.asarray(X, dtype=float), 0, None))



class _NamesMixin:
    def _store_names(self, X):
        self._names = (list(X.columns) if hasattr(X, "columns")
                       else [f"x{i}" for i in range(np.asarray(X).shape[1])])

    def get_feature_names_out(self, input_features=None):
        names = input_features if input_features is not None else self._names
        return np.asarray(names, dtype=object)

class QuantileCapper(_NamesMixin, BaseEstimator, TransformerMixin):
    """Winsorise: clip each column to [q_low, q_high] learned on TRAIN data only.
    (IQR fences break on zero-inflated columns where Q3 = 0, so quantiles are used.)"""

    def __init__(self, lower=0.01, upper=0.99):
        self.lower, self.upper = lower, upper

    def fit(self, X, y=None):
        self._store_names(X)
        X = np.asarray(X, dtype=float)
        self.low_ = np.nanquantile(X, self.lower, axis=0)
        self.high_ = np.nanquantile(X, self.upper, axis=0)
        return self

    def transform(self, X):
        return np.clip(np.asarray(X, dtype=float), self.low_, self.high_)


class ScaledImputer(_NamesMixin, BaseEstimator, TransformerMixin):
    """Standardise -> KNN/Iterative imputation -> inverse-standardise.
    Scaling first stops large-scale columns (durations) dominating the distance."""

    def __init__(self, method="knn", n_neighbors=5, random_state=RANDOM_STATE):
        self.method, self.n_neighbors, self.random_state = method, n_neighbors, random_state

    def fit(self, X, y=None):
        self._store_names(X)
        X = np.asarray(X, dtype=float)
        self.scaler_ = StandardScaler().fit(X)  # ignores NaN when fitting
        Xs = self.scaler_.transform(X)
        if self.method == "knn":
            self.imputer_ = KNNImputer(n_neighbors=self.n_neighbors)
        else:
            self.imputer_ = IterativeImputer(max_iter=10, random_state=self.random_state)
        self.imputer_.fit(Xs)
        return self

    def transform(self, X):
        Xs = self.scaler_.transform(np.asarray(X, dtype=float))
        return self.scaler_.inverse_transform(self.imputer_.transform(Xs))


class FeatureEngineer(BaseEstimator, TransformerMixin):
    """Adds behavioural features (works on a DataFrame, stateless)."""

    def __init__(self, enabled=True):
        self.enabled = enabled

    def fit(self, X, y=None):
        self.feature_names_in_ = np.asarray(X.columns, dtype=object)
        return self

    def transform(self, X):
        X = X.copy()
        if not self.enabled:
            return X
        pages = X["Administrative"] + X["Informational"] + X["ProductRelated"]
        dur = (X["Administrative_Duration"] + X["Informational_Duration"]
               + X["ProductRelated_Duration"])
        X["TotalPages"] = pages
        X["TotalDuration"] = dur
        X["AvgTimePerPage"] = (dur / pages.replace(0, np.nan)).fillna(0.0)
        X["ProductRelatedShare"] = (X["ProductRelated"] / pages.replace(0, np.nan)).fillna(0.0)
        X["IsHolidaySeason"] = X["Month"].isin(["Nov", "Dec"]).astype(float)
        if "PageValues" in X:
            X["HasPageValue"] = (X["PageValues"] > 0).astype(float)
        else:
            X["HasPageValue"] = 0.0
        return X

    def get_feature_names_out(self, input_features=None):
        names = list(self.feature_names_in_)
        return np.asarray(names + (ENGINEERED_NUM if self.enabled else []), dtype=object)


# ---------------------------------------------------------------- stage builders
def _num_imputer(strategy):
    if strategy in ("mean", "median"):
        return SimpleImputer(strategy=strategy)
    if strategy in ("knn", "iterative"):
        return ScaledImputer(method=strategy)
    raise ValueError(f"unknown numeric imputer: {strategy}")


def _cat_imputer(strategy):
    if strategy == "mode":
        return SimpleImputer(strategy="most_frequent")
    if strategy == "unknown":
        return SimpleImputer(strategy="constant", fill_value="Unknown")
    raise ValueError(f"unknown categorical imputer: {strategy}")


def make_imputer_stage(imputer="median", cat_imputer="mode", drop_cols=()):
    """Stage 1: fills missing values. Outputs a pandas DataFrame with the same column names."""
    num_cols = [c for c in NUMERIC_COLS if c not in drop_cols]
    ct = ColumnTransformer(
        [("num", _num_imputer(imputer), num_cols),
         ("vis", _cat_imputer(cat_imputer), ["VisitorType"]),
         ("cat", SimpleImputer(strategy="most_frequent"), OTHER_CAT)],
        remainder="drop", verbose_feature_names_out=False)
    ct.set_output(transform="pandas")
    return ct


def make_encoder_stage(outlier="log", scale=True, use_fe=True, drop_cols=()):
    """Stage 3: outlier treatment + scaling for numerics, one-hot for categoricals."""
    num_cols = [c for c in NUMERIC_COLS if c not in drop_cols]
    if use_fe:
        num_cols = num_cols + ENGINEERED_NUM
    steps = []
    if outlier == "log":
        steps.append(("log", FunctionTransformer(log1p_clip, feature_names_out="one-to-one")))
    elif outlier == "cap":
        steps.append(("cap", QuantileCapper()))
    elif outlier != "none":
        raise ValueError(f"unknown outlier option: {outlier}")
    if scale:
        steps.append(("scale", StandardScaler()))
    num_pipe = Pipeline(steps) if steps else "passthrough"
    ohe = OneHotEncoder(handle_unknown="infrequent_if_exist", min_frequency=0.01,
                        sparse_output=False)
    return ColumnTransformer([("num", num_pipe, num_cols), ("cat", ohe, CATEGORICAL_COLS)],
                             remainder="drop", verbose_feature_names_out=False)


def make_selector(kind, k=30):
    if kind is None:
        return None
    if kind == "kbest":
        return SelectKBest(partial(mutual_info_classif, random_state=RANDOM_STATE), k=k)
    if kind == "rf":
        rf = RandomForestClassifier(n_estimators=150, class_weight="balanced",
                                    min_samples_leaf=3, random_state=RANDOM_STATE, n_jobs=1)
        return SelectFromModel(rf, threshold="median")
    raise ValueError(f"unknown selector: {kind}")


def make_preprocessing_steps(imputer="median", cat_imputer="mode", outlier="log", scale=True,
                             use_fe=True, selector=None, drop_cols=()):
    drop_cols = tuple(drop_cols)
    steps = [("impute", make_imputer_stage(imputer, cat_imputer, drop_cols)),
             ("fe", FeatureEngineer(enabled=use_fe)),
             ("encode", make_encoder_stage(outlier, scale, use_fe, drop_cols))]
    sel = make_selector(selector)
    if sel is not None:
        steps.append(("select", sel))
    return steps