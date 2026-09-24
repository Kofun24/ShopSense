"""src/train.py - model zoo, pipeline builder, hyper-parameter tuning, final-model training and saving."""
import json
from datetime import datetime

import joblib
import pandas as pd
from scipy.stats import loguniform, randint, uniform
from sklearn.base import clone
from sklearn.model_selection import RandomizedSearchCV
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

from .preprocessing import BEST_PREP, MODELS_DIR, N_JOBS, FAST, RANDOM_STATE, make_preprocessing_steps

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


# ------------------------------------------------------------------ hyper-parameter tuning
def get_search_spaces() -> dict:
    """name -> (imbalance handling of the base pipeline, search space)."""
    spaces = {
        "LogisticRegression": ("class_weight", {"model__C": loguniform(1e-3, 1e2)}),
        "RandomForest": ("none", {
            "model__n_estimators": randint(200, 600), "model__max_depth": [None, 8, 12, 16, 24],
            "model__min_samples_leaf": randint(1, 12), "model__max_features": ["sqrt", "log2", 0.3, 0.5],
            "model__class_weight": ["balanced", "balanced_subsample", None]}),
        "HistGradientBoosting": ("none", {
            "model__learning_rate": loguniform(0.02, 0.3), "model__max_iter": randint(100, 500),
            "model__max_leaf_nodes": randint(8, 64), "model__min_samples_leaf": randint(10, 80),
            "model__l2_regularization": loguniform(1e-3, 10), "model__class_weight": ["balanced", None]}),
    }
    if HAS_XGB:
        spaces["XGBoost"] = ("none", {
            "model__n_estimators": randint(150, 600), "model__max_depth": randint(3, 9),
            "model__learning_rate": loguniform(0.02, 0.3), "model__subsample": uniform(0.6, 0.4),
            "model__colsample_bytree": uniform(0.5, 0.5), "model__min_child_weight": randint(1, 10),
            "model__scale_pos_weight": [1, 3, 5.5]})
    return spaces


def tune_models(X_train, y_train, cv, n_iter=None, prep=None, only=None):
    """RandomizedSearchCV (refit on PR-AUC) for each model family.
    Returns (best_params dict, summary DataFrame, {name: cv_results DataFrame})."""
    prep = prep or BEST_PREP
    n_iter = n_iter or (5 if FAST else 40)
    scoring = {"pr_auc": "average_precision", "roc_auc": "roc_auc", "f1": "f1",
               "recall": "recall", "precision": "precision"}
    zoo, best, rows, details = get_models(), {}, [], {}
    for name, (imb, space) in get_search_spaces().items():
        if only and name not in only:
            continue
        print(f"Tuning {name}: {n_iter} candidates x CV")
        search = RandomizedSearchCV(build_pipeline(zoo[name], imb, **prep), space, n_iter=n_iter,
                                    scoring=scoring, refit="pr_auc", cv=cv, n_jobs=N_JOBS,
                                    random_state=RANDOM_STATE, verbose=1)
        search.fit(X_train, y_train)
        i, r = search.best_index_, search.cv_results_
        best[name] = {k: (v.item() if hasattr(v, "item") else v) for k, v in search.best_params_.items()}
        rows.append({"model": name, "imbalance_base": imb,
                     **{f"cv_{k}": r[f"mean_test_{k}"][i] for k in scoring},
                     "cv_pr_auc_std": r["std_test_pr_auc"][i], "best_params": json.dumps(best[name])})
        details[name] = pd.DataFrame(r).sort_values("rank_test_pr_auc")
    summary = pd.DataFrame(rows).sort_values("cv_pr_auc", ascending=False).reset_index(drop=True)
    return best, summary, details


# ------------------------------------------------------------------ final model
def make_final_pipeline(name, imbalance, params, prep=None):
    return build_pipeline(get_models()[name], imbalance, **(prep or BEST_PREP)).set_params(**params)


def save_artefact(pipeline, threshold, name, params, test_metrics, path=None):
    """The backend loads this file. It contains the FULL pipeline (imputer -> features -> encoder -> model)."""
    from .preprocessing import FEATURE_COLS
    art = {"pipeline": pipeline, "threshold": float(threshold), "model_name": name, "prep": BEST_PREP,
           "params": params, "test_metrics": test_metrics, "feature_columns": FEATURE_COLS,
           "trained_at": datetime.now().isoformat(timespec="seconds")}
    path = path or MODELS_DIR / "final_model.joblib"
    joblib.dump(art, path)
    print(f"[saved] {path}")
    return art