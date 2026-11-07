"""
MotionEase FastAPI Application
Production REST API for User Auth, Journey Logging, Symptom Tracking, and ML Risk Estimation.
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

import ml_model
from database import init_db, get_db, UserModel, JourneyModel, SymptomModel

app = FastAPI(
    title="MotionEase REST API",
    description="Intelligent Travel Wellness & Motion Sickness Relief Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables
@app.on_event("startup")
def on_startup():
    init_db()

# Pydantic Schemas
class RiskPredictionRequest(BaseModel):
    transport_type: str = Field(..., example="car")
    duration_minutes: int = Field(..., ge=1, le=600, example=45)
    seating_position: str = Field(..., example="back")
    ventilation: str = Field(..., example="ac_fresh")
    screen_reading_minutes: int = Field(0, ge=0, example=20)
    expected_roughness: int = Field(3, ge=1, le=5, example=3)
    user_sensitivity_score: int = Field(50, ge=0, le=100, example=62)

class UserAuthRequest(BaseModel):
    name: Optional[str] = "Traveler"
    email: str
    password: str

class JourneyCreateRequest(BaseModel):
    user_id: str
    date: str
    transport_type: str
    duration_minutes: int
    origin: str
    destination: str
    predicted_risk_percent: int
    actual_severity: int
    used_travel_mode: bool
    notes: Optional[str] = None

class SymptomCreateRequest(BaseModel):
    user_id: str
    timestamp: str
    transport_type: str
    severity: int
    symptoms: List[str]
    duration_minutes: int
    intervention_name: str
    intervention_rating: int
    notes: Optional[str] = None

# Health Check
@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "MotionEase Backend API",
        "timestamp": datetime.utcnow().isoformat()
    }

# 1. AI Risk Estimation Endpoint
@app.post("/api/ml/predict")
def predict_motion_risk(payload: RiskPredictionRequest):
    try:
        results = ml_model.predict(payload.dict())
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# 2. Authentication & User Profile
@app.post("/api/auth/register")
def register(user: UserAuthRequest, db = Depends(get_db)):
    existing = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing:
        return {
            "id": existing.id,
            "name": existing.name,
            "email": existing.email,
            "sensitivity_level": existing.sensitivity_level,
            "sensitivity_score": existing.sensitivity_score,
            "message": "User signed in"
        }

    new_id = f"usr_{uuid.uuid4().hex[:8]}"
    new_user = UserModel(
        id=new_id,
        name=user.name or "Traveler",
        email=user.email,
        sensitivity_level="Moderate",
        sensitivity_score=55
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "sensitivity_level": new_user.sensitivity_level,
        "sensitivity_score": new_user.sensitivity_score,
        "message": "User registered successfully"
    }

# 3. Journey Management
@app.post("/api/journeys")
def create_journey(journey: JourneyCreateRequest, db = Depends(get_db)):
    j_id = f"jrn_{uuid.uuid4().hex[:8]}"
    entry = JourneyModel(
        id=j_id,
        user_id=journey.user_id,
        date=journey.date,
        transport_type=journey.transport_type,
        duration_minutes=journey.duration_minutes,
        origin=journey.origin,
        destination=journey.destination,
        predicted_risk_percent=journey.predicted_risk_percent,
        actual_severity=journey.actual_severity,
        used_travel_mode=journey.used_travel_mode,
        notes=journey.notes
    )
    db.add(entry)
    db.commit()
    return {"id": j_id, "status": "created"}

@app.get("/api/journeys/{user_id}")
def get_user_journeys(user_id: str, db = Depends(get_db)):
    records = db.query(JourneyModel).filter(JourneyModel.user_id == user_id).all()
    return records

# 4. Symptom Log Management
@app.post("/api/symptoms")
def log_symptom(sym: SymptomCreateRequest, db = Depends(get_db)):
    s_id = f"sym_{uuid.uuid4().hex[:8]}"
    entry = SymptomModel(
        id=s_id,
        user_id=sym.user_id,
        timestamp=sym.timestamp,
        transport_type=sym.transport_type,
        severity=sym.severity,
        symptoms_list=",".join(sym.symptoms),
        duration_minutes=sym.duration_minutes,
        intervention_name=sym.intervention_name,
        intervention_rating=sym.intervention_rating,
        notes=sym.notes
    )
    db.add(entry)
    db.commit()
    return {"id": s_id, "status": "created"}

@app.get("/api/symptoms/{user_id}")
def get_user_symptoms(user_id: str, db = Depends(get_db)):
    records = db.query(SymptomModel).filter(SymptomModel.user_id == user_id).all()
    return records

# 5. GDPR Data Deletion Endpoint
@app.delete("/api/user/{user_id}/data")
def delete_all_user_data(user_id: str, db = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user:
        db.delete(user) # cascades to journeys & symptoms
        db.commit()
    return {"status": "success", "message": f"All data for {user_id} has been permanently deleted."}
