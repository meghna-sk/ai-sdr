from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date, time

# Lead schemas
class LeadBase(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    title: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    title: Optional[str] = None
    stage: Optional[str] = None
    score: Optional[float] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    notes: Optional[str] = None

class Lead(LeadBase):
    id: int
    stage: str
    score: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    company_profile_id: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

# Activity schemas
class ActivityBase(BaseModel):
    activity_type: str
    description: str
    data: Optional[Dict[str, Any]] = None

class ActivityCreate(ActivityBase):
    lead_id: int

class Activity(ActivityBase):
    id: int
    lead_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# ScoringConfig schemas
class ScoringConfigBase(BaseModel):
    name: str
    description: Optional[str] = None
    weights: Dict[str, float]
    is_active: bool = False

class ScoringConfigCreate(ScoringConfigBase):
    pass

class ScoringConfig(ScoringConfigBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# CompanyProfile schemas
class CompanyProfileBase(BaseModel):
    name: str
    domain: Optional[str] = None
    size: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class CompanyProfileCreate(CompanyProfileBase):
    pass

class CompanyProfile(CompanyProfileBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Extended Lead schema with relationships
class LeadWithDetails(Lead):
    activities: List[Activity] = []
    company_profile: Optional[CompanyProfile] = None

# Evaluation schemas
class EvaluationRunRequest(BaseModel):
    include_leads: Optional[List[str]] = None  # Optional filter for specific leads
    
class EvaluationRunBase(BaseModel):
    timestamp: datetime
    status: str
    total_tests: int
    passed_tests: int
    failed_tests: int
    error_tests: int
    pass_rate: float
    verdict_accuracy: float
    confidence_accuracy: float
    schema_compliance_rate: float
    total_schema_errors: int
    avg_prompt_completeness: float
    error_message: Optional[str] = None

class EvaluationRunCreate(EvaluationRunBase):
    results: Dict[str, Any]

class EvaluationRun(EvaluationRunBase):
    id: int
    evaluation_id: int  # Alias for id for API response
    results: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
    
    def __init__(self, **data):
        super().__init__(**data)
        if 'id' in data:
            self.evaluation_id = data['id']

class EvaluationRunResponse(BaseModel):
    evaluation_id: int
    timestamp: str
    status: str
    total_tests: int
    passed_tests: int
    failed_tests: int
    error_tests: int
    pass_rate: float
    verdict_accuracy: float
    confidence_accuracy: float
    schema_compliance_rate: float
    total_schema_errors: int
    avg_prompt_completeness: float
    results: List[Dict[str, Any]] = []
    
    @field_validator('results', mode='before')
    @classmethod
    def validate_results(cls, v):
        if isinstance(v, dict):
            return []
        return v

# Meeting schemas
class MeetingSlotRequest(BaseModel):
    """Request schema for meeting slot suggestions"""
    timezone: Optional[str] = "UTC"
    lead_id: Optional[int] = None
    duration_minutes: Optional[int] = 30

class MeetingSlot(BaseModel):
    """Individual meeting slot"""
    datetime: str  # ISO format datetime
    timezone: str
    duration_minutes: int
    day_of_week: str
    time_formatted: str  # Human readable time

class MeetingSlotsResponse(BaseModel):
    """Response schema for meeting slot suggestions"""
    slots: List[MeetingSlot]
    total_slots: int
    timezone: str
    generated_at: str

# ICS Calendar schemas
class ICSRequest(BaseModel):
    """Request schema for ICS file generation"""
    start_datetime: str  # ISO format datetime
    end_datetime: str    # ISO format datetime
    subject: str
    description: Optional[str] = ""
    location: Optional[str] = ""
    attendees: Optional[List[str]] = []
    organizer_email: Optional[str] = "sdr@grok-sdr.com"
    organizer_name: Optional[str] = "Grok SDR Team"

class ICSResponse(BaseModel):
    """Response schema for ICS file generation"""
    filename: str
    content_type: str = "text/calendar"
    file_size: int
    event_uid: str