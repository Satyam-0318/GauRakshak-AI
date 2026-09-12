"""
main.py - FastAPI application serving bovine mastitis prediction model.
Provides /health, /predict, /predict/batch, and /metrics endpoints with CORS.
"""

import io
import pandas as pd
from typing import List, Optional, Literal
from fastapi import FastAPI, HTTPException, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import os
from fastapi.staticfiles import StaticFiles

try:
    from backend.model_service import model_service
    from backend.database import (
        init_db, get_all_cows, get_cow_by_rfid, 
        register_cow, save_cow_prediction, search_cows
    )
except ImportError:
    from model_service import model_service
    from database import (
        init_db, get_all_cows, get_cow_by_rfid, 
        register_cow, save_cow_prediction, search_cows
    )

app = FastAPI(
    title="GauRakshak AI - Bovine Mastitis Diagnostic API",
    description="Machine Learning service for real-time bovine mastitis classification, RFID cow tracking, and physiological risk assessment.",
    version="2.1.0"
)

# Initialize SQLite database schema and seed data
init_db()

# Enable CORS for local and web frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Input Schemas with friendly validation
class CowRegisterInput(BaseModel):
    rfid: str = Field(..., description="Unique RFID tag ID for the cow (e.g. RFID-IND-1005)")
    name: Optional[str] = Field(None, description="Optional name/nickname (e.g. Gauri)")
    breed: str = Field("Gir", description="Cow breed")
    notes: Optional[str] = Field(None, description="Health or herd notes")


class CowParameterInput(BaseModel):
    rfid: Optional[str] = Field(
        None,
        description="RFID Tag identifier. If provided, prediction is automatically saved to that cow's history.",
        examples=["RFID-IND-1001"]
    )
    pH: float = Field(
        ...,
        ge=5.5,
        le=8.0,
        description="Milk pH (typically 6.4 - 6.7 for healthy udders, alkaline >6.8 in mastitis)",
        examples=[6.6]
    )
    EC: float = Field(
        ...,
        ge=0.0,
        le=25.0,
        description="Electrical Conductivity in mS/cm (typically 4.0 - 4.8 mS/cm)",
        examples=[4.5]
    )
    SCC: float = Field(
        ...,
        ge=0.0,
        le=300.0,
        description="Somatic Cell Count in ×10⁵ cells/mL (healthy < 2.0, clinical > 5.0)",
        examples=[1.8]
    )
    Season: Literal["Winter", "Summer", "Rainy"] = Field(
        ...,
        description="Current environmental calving/milking season",
        examples=["Winter"]
    )
    LactationStage: Literal["Early", "Mid", "Late"] = Field(
        ...,
        description="Lactation period stage",
        examples=["Mid"]
    )
    Parity: Literal["Primiparous", "2nd", "3rd", "4th and above"] = Field(
        ...,
        description="Number of calvings / lactation number",
        examples=["2nd"]
    )
    MilkYield: Literal["0-4", "5-10", ">10"] = Field(
        ...,
        description="Daily milk yield group in liters",
        examples=["5-10"]
    )


class BatchCowInput(BaseModel):
    id: Optional[str] = None
    rfid: Optional[str] = None
    pH: float = Field(..., ge=5.5, le=8.0)
    EC: float = Field(..., ge=0.0, le=25.0)
    SCC: float = Field(..., ge=0.0, le=300.0)
    Season: Literal["Winter", "Summer", "Rainy"] = "Winter"
    LactationStage: Literal["Early", "Mid", "Late"] = "Mid"
    Parity: Literal["Primiparous", "2nd", "3rd", "4th and above"] = "2nd"
    MilkYield: Literal["0-4", "5-10", ">10"] = "5-10"


@app.get("/health", status_code=status.HTTP_200_OK, summary="Health Check")
def health_check():
    """Confirms API status and model availability."""
    return {
        "status": "healthy",
        "service": "GauRakshak AI Diagnostic API",
        "model_loaded": model_service.model is not None,
        "model_name": model_service.model_name,
        "test_accuracy": model_service.test_accuracy,
        "classes": list(model_service.label_map.keys())
    }


# --- Cow Profile & RFID Management Endpoints ---

@app.get("/cows", summary="List All Registered Cows")
def list_cows():
    """Returns all cows registered in the database with their latest health status and test count."""
    try:
        return get_all_cows()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch cows: {str(e)}")


@app.post("/cows", summary="Register a New Cow")
def create_cow(payload: CowRegisterInput):
    """Registers a new cow with an RFID tag ID identifier."""
    if not payload.rfid or not payload.rfid.strip():
        raise HTTPException(status_code=400, detail="RFID tag ID is required.")
    try:
        cow = register_cow(payload.rfid, payload.name, payload.breed, payload.notes)
        return cow
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to register cow: {str(e)}")


@app.get("/cows/search", summary="Search Cows by RFID or Name")
def search_cow_records(q: str):
    """Searches cows by RFID tag or name query."""
    try:
        return search_cows(q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/cows/{rfid}", summary="Get Cow Profile and Full Prediction History")
def get_cow(rfid: str):
    """Fetches cow profile, breed, registration date, and complete chronological prediction history."""
    cow = get_cow_by_rfid(rfid)
    if not cow:
        raise HTTPException(status_code=404, detail=f"Cow with RFID '{rfid}' not found.")
    return cow


@app.get("/cows/{rfid}/history", summary="Get Cow Prediction History Timeline")
def get_cow_history(rfid: str):
    """Fetches timeline of past predictions for a specific cow."""
    cow = get_cow_by_rfid(rfid)
    if not cow:
        raise HTTPException(status_code=404, detail=f"Cow with RFID '{rfid}' not found.")
    return cow.get("predictions", [])


@app.post("/predict", summary="Predict Mastitis Risk for a Single Cow")
def predict_mastitis(payload: CowParameterInput):
    """
    Accepts cow physiological and environmental indicators, applies scaling and one-hot encoding,
    returns predicted stage, probabilities, and clinical explanation.
    If 'rfid' is provided, automatically records prediction in that cow's persistent history!
    """
    try:
        data = payload.model_dump()
        result = model_service.predict(data)
        
        # Automatically save to cow's history if RFID is provided
        rfid = data.get("rfid")
        if rfid and rfid.strip():
            record_id = save_cow_prediction(rfid.strip(), data, result)
            result["rfid"] = rfid.strip().upper()
            result["saved_to_history"] = True
            result["history_record_id"] = record_id
            
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline execution error: {str(e)}"
        )


@app.post("/predict/batch", summary="Batch Predict Mastitis Risk")
def predict_batch_json(records: List[BatchCowInput]):
    """Accepts JSON array of multiple cows for batch diagnosis."""
    try:
        dict_records = [r.model_dump() for r in records]
        return model_service.predict_batch(dict_records)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch inference failed: {str(e)}"
        )


@app.post("/predict/upload-csv", summary="Upload CSV for Batch Prediction")
async def upload_csv_batch(file: UploadFile = File(...)):
    """Accepts CSV file with cow features and returns enriched records with predictions."""
    if not file.filename.endswith((".csv", ".txt")):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a .csv file.")

    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

        # Check required columns
        req_cols = ["pH", "EC", "SCC"]
        for col in req_cols:
            if col not in df.columns:
                raise HTTPException(
                    status_code=400,
                    detail=f"CSV is missing required biophysical column: '{col}'"
                )

        # Fill defaults if missing categorical columns
        if "Season" not in df.columns:
            df["Season"] = "Winter"
        if "LactationStage" not in df.columns:
            df["LactationStage"] = "Mid"
        if "Parity" not in df.columns:
            df["Parity"] = "2nd"
        if "MilkYield" not in df.columns:
            df["MilkYield"] = "5-10"
        if "id" not in df.columns:
            df["id"] = [f"COW-{i+1:03d}" for i in range(len(df))]

        records = df.to_dict(orient="records")
        predictions = model_service.predict_batch(records)
        return {
            "total_records": len(predictions),
            "results": predictions
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV: {str(e)}")


@app.get("/metrics", summary="Model Performance & Explanations")
def get_model_metrics():
    """Returns classification metrics, feature importances, and validation benchmark data."""
    return model_service.get_metrics_payload()


# Mount built frontend assets if present
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
