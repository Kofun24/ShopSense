"""src/train.py - model zoo and pipeline builder.

Used by notebooks/02_preprocessing.ipynb (downstream-effect experiment, section 2B) to build
real model pipelines when testing how imputation choice affects model performance.

Note: notebooks/03_model_development.ipynb and notebooks/04_model_optimization.ipynb define their
own, self-contained copies of these two functions (plus tuning logic) directly in their cells, so
every line of model-building and tuning code for PE2 is visible in the notebook itself. This file
is kept small and focused on just what 02_preprocessing.ipynb still needs.
"""
from sklearn.base import clone
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

from .preprocessing import RANDOM_STATE, make_preprocessing_steps

try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except Exception:  # pragma: no cover
    HAS_XGB = False

try:
    from imblearn.over_sampling import SMOTE
    from imblearn.pipeline import Pipeline as ImbPipeline
    HAS_IMBLEARN = True
except Exception:  # pragma: no cover
    HAS_IMBLEARN = False

POS_WEIGHT = 5.5  # ~ negatives / positives (10422 / 1908)


def get_models() -> dict:
    """Six (seven with XGBoost) algorithms. n_jobs=1 inside models because the CV loop parallelises."""
    models = {
        "LogisticRegression": LogisticRegression(max_iter=2000, random_state=RANDOM_STATE),
        "DecisionTree": DecisionTreeClassifier(min_samples_leaf=5, random_state=RANDOM_STATE),
        "RandomForest": RandomForestClassifier(n_estimators=300, random_state=RANDOM_STATE, n_jobs=1),
        "HistGradientBoosting": HistGradientBoostingClassifier(random_state=RANDOM_STATE),
        "SVM_RBF": SVC(kernel="rbf", random_state=RANDOM_STATE),
        "KNN": KNeighborsClassifier(n_neighbors=15),
    }
    if HAS_XGB:
        models["XGBoost"] = XGBClassifier(eval_metric="logloss", tree_method="hist",
                                          random_state=RANDOM_STATE, n_jobs=1)
    return models


def _apply_class_weight(est):
    est = clone(est)
    params = est.get_params()
    if "class_weight" in params:
        est.set_params(class_weight="balanced")
    elif "scale_pos_weight" in params:
        est.set_params(scale_pos_weight=POS_WEIGHT)
    return est


def build_pipeline(estimator, imbalance="none", **prep_kwargs):
    """imbalance: none | class_weight | smote. SMOTE sits inside the pipeline so it only
    ever touches the training part of each CV fold."""
    est = clone(estimator)
    if imbalance == "class_weight":
        est = _apply_class_weight(est)
    steps = make_preprocessing_steps(**prep_kwargs)
    if imbalance == "smote":
        if not HAS_IMBLEARN:
            raise ImportError("pip install imbalanced-learn to use SMOTE")
        return ImbPipeline(steps + [("smote", SMOTE(random_state=RANDOM_STATE)), ("model", est)])
    return Pipeline(steps + [("model", est)])