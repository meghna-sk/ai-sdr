"""
Grok AI Integration Router

Handles lead qualification and outreach generation using Grok AI.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Lead, Activity
from app.services.grok_client import GrokClient, GrokError
import asyncio

router = APIRouter(prefix="/api/leads", tags=["grok"])


@router.post("/{lead_id}/qualify")
async def qualify_lead(lead_id: int, db: Session = Depends(get_db)):
    """
    Qualify a lead using Grok AI
    
    Returns structured qualification verdict with confidence, reasoning, and factors.
    Creates an activity record with the qualification result.
    """
    
    # Get the lead
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found"
        )
    
    try:
        # Initialize Grok client
        grok_client = GrokClient()
        
        # Prepare lead data for Grok
        lead_data = {
            "name": lead.name,
            "email": lead.email,
            "company": lead.company,
            "title": lead.title,
            "phone": lead.phone,
            "linkedin_url": lead.linkedin_url,
            "notes": lead.notes
        }
        
        # Call Grok for qualification
        qualification_result = await grok_client.qualify_lead(lead_data)
        
        # Create activity log for qualification
        activity = Activity(
            lead_id=lead.id,
            activity_type="grok_qualification",
            description=f"Lead qualified by Grok: {qualification_result.verdict} ({qualification_result.confidence}% confidence)",
            data={
                "verdict": qualification_result.verdict,
                "confidence": qualification_result.confidence,
                "reasoning": qualification_result.reasoning,
                "factors": qualification_result.factors,
                "grok_model": grok_client.model,
                "qualification_timestamp": "auto"
            }
        )
        db.add(activity)
        
        # Update lead stage if qualification verdict is positive and lead isn't already advanced
        stage_stages_hierarchy = ["New", "Qualified", "Contacted", "Meeting Scheduled", "Won", "Lost"]
        current_stage_index = stage_stages_hierarchy.index(lead.stage) if lead.stage in stage_stages_hierarchy else 0
        
        if qualification_result.verdict == "qualified" and current_stage_index < 1:  # Only advance if below "Qualified"
            old_stage = lead.stage
            lead.stage = "Qualified"
            
            # Create stage change activity
            stage_activity = Activity(
                lead_id=lead.id,
                activity_type="stage_change",
                description=f"Stage updated: {old_stage} → Qualified (triggered by Grok qualification)",
                data={
                    "old_stage": old_stage,
                    "new_stage": "Qualified",
                    "trigger": "grok_qualification",
                    "verdict": qualification_result.verdict,
                    "confidence": qualification_result.confidence
                }
            )
            db.add(stage_activity)
        
        db.commit()
        
        return {
            "message": "Lead qualified successfully",
            "lead_id": lead.id,
            "verdict": qualification_result.verdict,
            "confidence": qualification_result.confidence,
            "reasoning": qualification_result.reasoning,
            "factors": qualification_result.factors
        }
        
    except GrokError as e:
        # Handle Grok-specific errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Qualification failed: {str(e)}"
        )
    except Exception as e:
        # Handle unexpected errors
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Qualification failed: {str(e)}"
        )


@router.post("/{lead_id}/message")
async def generate_outreach(
    lead_id: int, 
    request_data: Optional[Dict[str, Any]] = Body(None),
    db: Session = Depends(get_db)
):
    """
    Generate personalized outreach message using Grok AI
    
    Optional request body can include:
    - context: Additional context for personalization
    
    Returns structured message with subject, body, and variants.
    Creates an activity record with the outreach content.
    """
    
    # Get the lead
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found"
        )
    
    try:
        # Initialize Grok client
        grok_client = GrokClient()
        
        # Prepare lead data for Grok
        lead_data = {
            "name": lead.name,
            "email": lead.email,
            "company": lead.company,
            "title": lead.title,
            "phone": lead.phone,
            "linkedin_url": lead.linkedin_url,
            "notes": lead.notes
        }
        
        # Extract context from request if provided
        context = None
        if request_data and "context" in request_data:
            context = request_data["context"]
        
        # Call Grok for outreach generation
        outreach_result = await grok_client.generate_outreach(lead_data, context)
        
        # Create activity log for outreach generation
        activity = Activity(
            lead_id=lead.id,
            activity_type="grok_outreach",
            description="Outreach message generated by Grok",
            data={
                "subject": outreach_result.subject,
                "body": outreach_result.body,
                "variants": outreach_result.variants,
                "context": context,
                "grok_model": grok_client.model,
                "generation_timestamp": "auto"
            }
        )
        db.add(activity)
        db.commit()
        
        return {
            "message": "Outreach generated successfully",
            "lead_id": lead.id,
            "subject": outreach_result.subject,
            "body": outreach_result.body,
            "variants": outreach_result.variants
        }
        
    except GrokError as e:
        # Handle Grok-specific errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Outreach generation failed: {str(e)}"
        )
    except Exception as e:
        # Handle unexpected errors
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Outreach generation failed: {str(e)}"
        )
