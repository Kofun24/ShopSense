"""FastAPI backend.   Run from the repo root:  uvicorn backend.api:app --reload --port 8000
Docs (auto-generated, good for the demo):  http://localhost:8000/docs"""
import io
from typing import Literal, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend import service

app = FastAPI(title="Online Shopper Purchase-Intention API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MonthLiteral = Literal["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


class Session(BaseModel):
    """All fields are optional: missing ones are imputed by the same pipeline used in training.
    At least 5 fields must be supplied."""
    Administrative: Optional[int] = Field(None, ge=0, le=100, description="# account/admin pages viewed")
    Administrative_Duration: Optional[float] = Field(None, ge=0, le=100000, description="seconds")
    Informational: Optional[int] = Field(None, ge=0, le=100)
    Informational_Duration: Optional[float] = Field(None, ge=0, le=100000)
    ProductRelated: Optional[int] = Field(None, ge=0, le=5000, description="# product pages viewed")
    ProductRelated_Duration: Optional[float] = Field(None, ge=0, le=500000)
    BounceRates: Optional[float] = Field(None, ge=0, le=1)
    ExitRates: Optional[float] = Field(None, ge=0, le=1)
    PageValues: Optional[float] = Field(None, ge=0, le=1000)
    SpecialDay: Optional[float] = Field(None, ge=0, le=1, description="closeness to special day (0-1)")
    Month: Optional[MonthLiteral] = None
    OperatingSystems: Optional[int] = Field(None, ge=1, le=20)
    Browser: Optional[int] = Field(None, ge=1, le=20)
    Region: Optional[int] = Field(None, ge=1, le=20)
    TrafficType: Optional[int] = Field(None, ge=1, le=30)
    VisitorType: Optional[Literal["Returning_Visitor", "New_Visitor", "Other"]] = None
    Weekend: Optional[bool] = None


@app.get("/health")
def health():
    try:
        art = service.load_artefact()
        return {"status": "ok", "model": art["model_name"], "trained_at": art["trained_at"]}
    except Exception as e:  # model file missing
        raise HTTPException(status_code=503, detail=f"Model not loaded: {e}")


@app.get("/model-info")
def model_info():
    art = service.load_artefact()
    return {"model": art["model_name"], "threshold": art["threshold"], "preprocessing": art["prep"],
            "hyperparameters": art["params"], "test_metrics": art["test_metrics"]}


@app.post("/predict")
def predict(session: Session):
    try:
        return service.predict_one(session.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Model file not found. Run notebooks/03_modelling.ipynb")


@app.post("/predict/batch")
async def predict_batch(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=422, detail="Only CSV files are supported.")
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Unparseable CSV file: {e}")

    try:
        return service.predict_batch(df)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="Model file not found. Run notebooks/03_modelling.ipynb")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Error processing CSV: {e}")