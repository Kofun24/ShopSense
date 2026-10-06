"""Framework-independent prediction logic (used by the FastAPI backend and by the tests)."""
import numpy as np
import pandas as pd
import joblib

from src.preprocessing import CATEGORICAL_COLS, FEATURE_COLS, MODELS_DIR, NUMERIC_COLS, prepare_input

MIN_FIELDS = 5  # refuse requests that give (almost) no information
LOW_CONFIDENCE_IMPUTED = 8  # warn if this many or more of the 17 fields were estimated

_ARTEFACT = None
_IMPORTANCE_CACHE = {}  # keyed by id(pipeline) -> ordered list of original column names


def load_artefact(path=None):
    global _ARTEFACT
    if _ARTEFACT is None or path is not None:
        _ARTEFACT = joblib.load(path or MODELS_DIR / "final_model.joblib")
    return _ARTEFACT


def _original_column(encoded_name: str):
    """Map an encoded/engineered feature name back to one of the raw input fields.
    One-hot columns ('Month_Nov') map back to their source ('Month'); engineered
    features ('TotalDuration') are derived from several fields and are skipped,
    since they don't correspond to a single thing the user typed in."""
    for c in CATEGORICAL_COLS:
        if encoded_name == c or encoded_name.startswith(c + "_"):
            return c
    if encoded_name in NUMERIC_COLS:
        return encoded_name
    return None


def get_top_factors(art, n=5):
    """Global feature importance (from the trained model), aggregated back to the
    original input fields. Cached per loaded pipeline so this only runs once.
    Returns [] for models without `feature_importances_` (e.g. SVM, KNN)."""
    pipe = art["pipeline"]
    key = id(pipe)
    if key in _IMPORTANCE_CACHE:
        return _IMPORTANCE_CACHE[key]
    model = pipe.named_steps.get("model")
    importances = getattr(model, "feature_importances_", None)
    if importances is None:
        _IMPORTANCE_CACHE[key] = []
        return []
    names = pipe[:-1].get_feature_names_out()
    agg = {}
    for name, imp in zip(names, importances):
        col = _original_column(name)
        if col:
            agg[col] = agg.get(col, 0.0) + float(imp)
    top = [c for c, _ in sorted(agg.items(), key=lambda kv: kv[1], reverse=True)[:n]]
    _IMPORTANCE_CACHE[key] = top
    return top


def recommend(p: float, thr: float):
    """Turn a probability into a business-friendly band + action."""
    if p >= max(0.6, thr):
        return "High intent", ("Likely buyer. Don't discount; remove friction (fast checkout, "
                               "stock/delivery reassurance).")
    if p >= thr:
        return "Medium-high intent", "Probable buyer. Show social proof or free-shipping message to close the sale."
    if p >= 0.5 * thr:
        return "Undecided", ("Browsing but not committed. Trigger a targeted offer, product "
                             "recommendations or a cart reminder.")
    return "Low intent", "Unlikely to buy this session. Use low-cost tactics only (retargeting, newsletter sign-up)."


def predict_one(payload: dict) -> dict:
    art = load_artefact()
    row = {c: payload.get(c) for c in FEATURE_COLS}
    provided = [c for c, v in row.items() if v is not None]
    if len(provided) < MIN_FIELDS:
        raise ValueError(f"Please provide at least {MIN_FIELDS} fields (got {len(provided)}).")

    df = prepare_input(pd.DataFrame([{c: (np.nan if v is None else v) for c, v in row.items()}]))
    proba = float(art["pipeline"].predict_proba(df)[0, 1])
    thr = float(art["threshold"])
    band, action = recommend(proba, thr)
    fields_imputed = [c for c in FEATURE_COLS if c not in provided]

    key_factors = [{"field": c, "value": row.get(c), "provided": c in provided}
                   for c in get_top_factors(art)]

    return {"purchase_probability": round(proba, 4), "will_purchase": bool(proba >= thr),
            "decision_threshold": round(thr, 3), "intent_level": band, "recommended_action": action,
            "fields_imputed": fields_imputed,
            "low_confidence": len(fields_imputed) >= LOW_CONFIDENCE_IMPUTED,
            "key_factors": key_factors,
            "model": art["model_name"]}