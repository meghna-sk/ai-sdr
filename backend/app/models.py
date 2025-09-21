from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Boolean, ForeignKey, Float
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    company = Column(String, nullable=True)
    title = Column(String, nullable=True)
    stage = Column(String, default="New")  # New, Qualified, Contacted, Meeting Scheduled, Won, Lost
    score = Column(Float, nullable=True)
    phone = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    activities = relationship("Activity", back_populates="lead", cascade="all, delete-orphan")
    company_profile_id = Column(Integer, ForeignKey("company_profiles.id"), nullable=True)
    company_profile = relationship("CompanyProfile", back_populates="leads")

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    activity_type = Column(String, nullable=False)  # created, qualified, scored, contacted, etc.
    description = Column(Text, nullable=False)
    data = Column(JSON, nullable=True)  # Store additional data like scores, AI responses
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    lead = relationship("Lead", back_populates="activities")

class ScoringConfig(Base):
    __tablename__ = "scoring_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    weights = Column(JSON, nullable=False)  # Store scoring weights as JSON
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class CompanyProfile(Base):
    __tablename__ = "company_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    domain = Column(String, unique=True, nullable=True)
    size = Column(String, nullable=True)  # e.g., "1-10", "11-50", "51-200"
    industry = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    data = Column(JSON, nullable=True)  # Additional company data
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    leads = relationship("Lead", back_populates="company_profile")


class EvaluationRun(Base):
    """Model for storing evaluation run results"""
    __tablename__ = "evaluation_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=func.now())
    status = Column(String, default="running")  # running, completed, failed
    total_tests = Column(Integer, nullable=False)
    passed_tests = Column(Integer, nullable=False)
    failed_tests = Column(Integer, nullable=False)
    error_tests = Column(Integer, nullable=False)
    pass_rate = Column(Float, nullable=False)
    verdict_accuracy = Column(Float, nullable=False)
    confidence_accuracy = Column(Float, nullable=False)
    schema_compliance_rate = Column(Float, nullable=False)
    total_schema_errors = Column(Integer, nullable=False)
    avg_prompt_completeness = Column(Float, nullable=False)
    results = Column(JSON, nullable=False)  # Detailed results - stores the results list
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())