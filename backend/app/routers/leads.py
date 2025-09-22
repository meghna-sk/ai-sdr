from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import csv
import io
from pydantic import ValidationError

from app.db import get_db
from app.models import Lead, Activity
from app.schemas import LeadCreate, Lead as LeadSchema
from app.seed_data import seed_sample_leads
from app.services.scoring import ScoringService
from typing import Optional, List

router = APIRouter(prefix="/api/leads", tags=["leads"])

@router.get("/", response_model=List[LeadSchema])
@router.get("", response_model=List[LeadSchema])  # Handle both with and without trailing slash
def get_leads(db: Session = Depends(get_db)):
    """Get all leads"""
    leads = db.query(Lead).all()
    return leads

@router.post("/", response_model=LeadSchema, status_code=status.HTTP_201_CREATED)
@router.post("", response_model=LeadSchema, status_code=status.HTTP_201_CREATED)  # Handle both with and without trailing slash
def create_lead(lead: LeadCreate, db: Session = Depends(get_db)):
    """Create a new lead"""
    try:
        # Create new lead
        db_lead = Lead(
            name=lead.name,
            email=lead.email,
            company=lead.company,
            title=lead.title,
            phone=lead.phone,
            linkedin_url=lead.linkedin_url,
            notes=lead.notes,
            stage="New"  # Default stage
        )
        
        db.add(db_lead)
        db.commit()
        db.refresh(db_lead)
        
        # Create activity for lead creation
        activity = Activity(
            lead_id=db_lead.id,
            activity_type="created",
            description=f"Lead {db_lead.name} created",
            data={"source": "api", "initial_stage": "New"}
        )
        db.add(activity)
        db.commit()
        
        return db_lead
        
    except IntegrityError as e:
        db.rollback()
        if "UNIQUE constraint failed: leads.email" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database constraint violation"
        )

@router.post("/import")
@router.post("/import/")  # Handle both with and without trailing slash
def import_leads_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Import leads from CSV file"""
    
    # Validate file type
    if not file.content_type or "csv" not in file.content_type.lower():
        if not file.filename or not file.filename.lower().endswith('.csv'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be a CSV file"
            )
    
    try:
        # Read file content
        content = file.file.read().decode('utf-8')
        if not content.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty"
            )
        
        # Parse CSV
        csv_reader = csv.DictReader(io.StringIO(content))
        
        # Validate required headers
        required_headers = {'name', 'email'}
        fieldnames = csv_reader.fieldnames or []
        if not required_headers.issubset(set(fieldnames)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"CSV must contain required headers: {', '.join(required_headers)}"
            )
        
        imported_count = 0
        failed_count = 0
        errors = []
        
        # Process each row
        for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 (after header)
            try:
                # Clean and validate row data
                lead_data = {
                    'name': row.get('name', '').strip(),
                    'email': row.get('email', '').strip(),
                    'company': row.get('company', '').strip() or None,
                    'title': row.get('title', '').strip() or None,
                    'phone': row.get('phone', '').strip() or None,
                    'linkedin_url': row.get('linkedin_url', '').strip() or None,
                    'notes': row.get('notes', '').strip() or None,
                }
                
                # Skip empty rows
                if not lead_data['name'] and not lead_data['email']:
                    continue
                
                # Validate required fields
                if not lead_data['name'] or not lead_data['email']:
                    failed_count += 1
                    if not lead_data['name']:
                        error_msg = f"Row {row_num}: Missing required field 'name'"
                    else:
                        error_msg = f"Row {row_num}: Missing required field 'email'"
                    errors.append(error_msg)
                    continue
                
                # Validate with Pydantic
                validated_lead = LeadCreate(**lead_data)
                
                # Create lead
                db_lead = Lead(
                    name=validated_lead.name,
                    email=validated_lead.email,
                    company=validated_lead.company,
                    title=validated_lead.title,
                    phone=validated_lead.phone,
                    linkedin_url=validated_lead.linkedin_url,
                    notes=validated_lead.notes,
                    stage="New"
                )
                
                db.add(db_lead)
                db.commit()
                db.refresh(db_lead)
                
                # Create activity
                activity = Activity(
                    lead_id=db_lead.id,
                    activity_type="imported",
                    description=f"Lead imported from CSV",
                    data={"source": "csv_import", "file": file.filename, "row": row_num}
                )
                db.add(activity)
                db.commit()
                
                imported_count += 1
                
            except ValidationError as e:
                failed_count += 1
                error_msg = f"Row {row_num}: Validation error - {str(e)}"
                errors.append(error_msg)
                db.rollback()
                
            except IntegrityError as e:
                failed_count += 1
                if "UNIQUE constraint failed: leads.email" in str(e):
                    error_msg = f"Row {row_num}: Email {lead_data.get('email')} already exists"
                else:
                    error_msg = f"Row {row_num}: Database error - {str(e)}"
                errors.append(error_msg)
                db.rollback()
                
            except Exception as e:
                failed_count += 1
                error_msg = f"Row {row_num}: Unexpected error - {str(e)}"
                errors.append(error_msg)
                db.rollback()
        
        # Note: Summary activity creation removed due to nullable lead_id constraint
        # Individual lead activities are still created during import
        
        return {
            "imported": imported_count,
            "failed": failed_count,
            "errors": errors,
            "message": f"Import completed: {imported_count} leads imported, {failed_count} failed"
        }
        
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File encoding not supported. Please use UTF-8 encoded CSV."
        )
    except HTTPException:
        # Re-raise HTTP exceptions (like 400 errors for validation)
        raise
    except Exception as e:
        error_message = str(e)
        if not error_message.strip():
            error_message = "Unknown error occurred during import"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Import failed: {error_message}"
        )


@router.post("/seed")
@router.post("/seed/")  # Handle both with and without trailing slash
def seed_leads(db: Session = Depends(get_db)):
    """Seed the database with sample leads for development."""
    try:
        seed_sample_leads(db)
        
        # Get count of leads after seeding
        lead_count = db.query(Lead).count()
        
        return {
            "message": "Sample leads seeded successfully",
            "total_leads": lead_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Seeding failed: {str(e)}"
        )


@router.post("/{lead_id}/score")
def score_lead(lead_id: int, db: Session = Depends(get_db)):
    """Calculate and save score for a specific lead"""
    
    # Get the lead
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found"
        )
    
    try:
        # Calculate score using scoring service
        scoring_service = ScoringService()
        score_result = scoring_service.calculate_score(lead)
        
        # Update lead with new score
        lead.score = score_result.total_score
        db.commit()
        db.refresh(lead)
        
        # Create activity log for scoring
        activity = Activity(
            lead_id=lead.id,
            activity_type="ai_score",
            description=f"Lead scored: {score_result.total_score}/100",
            data={
                "score": score_result.total_score,
                "breakdown": score_result.breakdown,
                "factors": score_result.factors,
                "scoring_timestamp": "auto"
            }
        )
        db.add(activity)
        db.commit()
        
        return {
            "message": "Lead scored successfully",
            "lead_id": lead.id,
            "total_score": score_result.total_score,
            "breakdown": score_result.breakdown,
            "factors": score_result.factors
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scoring failed: {str(e)}"
        )


@router.get("/{lead_id}/activities")
def get_lead_activities(
    lead_id: int, 
    type: Optional[str] = None,  # Filter by activity type(s), comma-separated
    limit: Optional[int] = None,
    offset: Optional[int] = 0,
    db: Session = Depends(get_db)
):
    """Get activities for a specific lead"""
    # Check if lead exists
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found"
        )
    
    # Build query for activities
    query = db.query(Activity).filter(Activity.lead_id == lead_id)
    
    # Filter by activity type(s) if provided
    if type:
        activity_types = [t.strip() for t in type.split(',')]
        query = query.filter(Activity.activity_type.in_(activity_types))
    
    # Get total count before applying limit/offset
    total_count = query.count()
    
    # Order by created_at desc (newest first)
    query = query.order_by(Activity.created_at.desc())
    
    # Apply offset
    if offset:
        query = query.offset(offset)
    
    # Apply limit
    if limit:
        query = query.limit(limit)
    
    activities = query.all()
    
    # Convert to response format
    activities_data = []
    for activity in activities:
        activities_data.append({
            "id": activity.id,
            "lead_id": activity.lead_id,
            "activity_type": activity.activity_type,
            "description": activity.description,
            "data": activity.data,
            "created_at": activity.created_at.isoformat() if activity.created_at else None
        })
    
    return {
        "activities": activities_data,
        "total": total_count,
        "lead_id": lead_id,
        "limit": limit,
        "offset": offset
    }
