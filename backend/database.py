"""
MotionEase Database Module
Uses SQLAlchemy with SQLite (local persistent database) or PostgreSQL.
Stores User Profiles, Journey Records, and Symptom Logs with GDPR deletion.
"""

import os
from datetime import datetime
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./motionease.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    sensitivity_level = Column(String, default="Moderate")
    sensitivity_score = Column(Integer, default=50)
    created_at = Column(DateTime, default=datetime.utcnow)

    journeys = relationship("JourneyModel", back_populates="user", cascade="all, delete-orphan")
    symptoms = relationship("SymptomModel", back_populates="user", cascade="all, delete-orphan")

class JourneyModel(Base):
    __tablename__ = "journeys"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    date = Column(String, nullable=False)
    transport_type = Column(String, nullable=False)
    duration_minutes = Column(Integer, default=30)
    origin = Column(String, default="")
    destination = Column(String, default="")
    predicted_risk_percent = Column(Integer, default=50)
    actual_severity = Column(Integer, default=0)
    used_travel_mode = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)

    user = relationship("UserModel", back_populates="journeys")

class SymptomModel(Base):
    __tablename__ = "symptoms"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    timestamp = Column(String, nullable=False)
    transport_type = Column(String, nullable=False)
    severity = Column(Integer, default=5)
    symptoms_list = Column(Text, default="") # comma-separated
    duration_minutes = Column(Integer, default=15)
    intervention_name = Column(String, default="")
    intervention_rating = Column(Integer, default=4)
    notes = Column(Text, nullable=True)

    user = relationship("UserModel", back_populates="symptoms")

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
