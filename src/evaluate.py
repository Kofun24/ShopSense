"""src/evaluate.py - metrics, cross-validation helpers, threshold tuning, saving figures/tables."""
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.metrics import (accuracy_score, average_precision_score, balanced_accuracy_score,
                             f1_score, precision_recall_curve, precision_score, recall_score,
                             roc_auc_score)
from sklearn.model_selection import StratifiedKFold, cross_validate

from .preprocessing import CV_FOLDS, FAST, FIG_DIR, N_JOBS, RANDOM_STATE, TABLE_DIR

SCORING = {"accuracy": "accuracy", "balanced_accuracy": "balanced_accuracy",
           "precision": "precision", "recall": "recall", "f1": "f1",
           "roc_auc": "roc_auc", "pr_auc": "average_precision"}


def get_cv():
    return StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_STATE)


def maybe_subsample(X, y, n=3000):
    """Only active with FAST=1 (dry runs)."""
    if FAST and len(X) > n:
        idx = X.sample(n, random_state=RANDOM_STATE).index
        return X.loc[idx], y.loc[idx]
    return X, y


def cv_summary(pipe, X, y, name, **extra) -> dict:
    res = cross_validate(pipe, X, y, cv=get_cv(), scoring=SCORING, n_jobs=N_JOBS)
    row = {"model": name, **extra}
    for k in SCORING:
        row[k] = res[f"test_{k}"].mean()
        row[f"{k}_std"] = res[f"test_{k}"].std()
    row["fit_time_s"] = res["fit_time"].mean()
    return row


def best_f_threshold(y_true, proba, beta=1.0):
    """Threshold maximising F-beta (beta>1 favours recall)."""
    p, r, t = precision_recall_curve(y_true, proba)
    b2 = beta ** 2
    f = (1 + b2) * p[:-1] * r[:-1] / np.clip(b2 * p[:-1] + r[:-1], 1e-12, None)
    i = int(np.argmax(f))
    return float(t[i]), float(f[i])


def holdout_metrics(y_true, proba, threshold=0.5) -> dict:
    pred = (proba >= threshold).astype(int)
    return {"threshold": threshold,
            "accuracy": accuracy_score(y_true, pred),
            "balanced_accuracy": balanced_accuracy_score(y_true, pred),
            "precision": precision_score(y_true, pred, zero_division=0),
            "recall": recall_score(y_true, pred),
            "f1": f1_score(y_true, pred),
            "roc_auc": roc_auc_score(y_true, proba),
            "pr_auc": average_precision_score(y_true, proba)}


def save_table(df: pd.DataFrame, name: str, index=False):
    path = TABLE_DIR / f"{name}.csv"
    df.to_csv(path, index=index)
    print(f"[saved] {path}")


def save_fig(fig, name: str):
    path = FIG_DIR / f"{name}.png"
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.show()          # displays inline in a notebook; harmless in scripts
    plt.close(fig)
    print(f"[saved] {path}")