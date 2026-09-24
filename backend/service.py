"""Framework-independent prediction logic (used by the FastAPI backend and by the tests)."""
import numpy as np
import pandas as pd
import joblib

from src.preprocessing import FEATURE_COLS, MODELS_DIR, prepare_input

MIN_FIELDS = 5  # refuse requests that give (almost) no information

_ARTEFACT = None


def load_artefact(path=None):
    global _ARTEFACT
    if _ARTEFACT is None or path is not None:
        _ARTEFACT = joblib.load(path or MODELS_DIR / "final_model.joblib")
    return _ARTEFACT


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
    return {"purchase_probability": round(proba, 4), "will_purchase": bool(proba >= thr),
            "decision_threshold": round(thr, 3), "intent_level": band, "recommended_action": action,
            "fields_imputed": [c for c in FEATURE_COLS if c not in provided],
            "model": art["model_name"]}