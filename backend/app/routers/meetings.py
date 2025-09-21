"""
Meetings Router

Handles meeting-related API endpoints including slot suggestions and scheduling.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.schemas import MeetingSlotRequest, MeetingSlotsResponse, ICSRequest
from app.services.meetings import MeetingService
from app.services.ics_generator import ICSGenerator
import uuid

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

# Initialize meeting service
meeting_service = MeetingService()
ics_generator = ICSGenerator()


@router.post("/slots", response_model=MeetingSlotsResponse)
async def suggest_meeting_slots(request: MeetingSlotRequest):
    """
    Suggest 3 meeting time slots for the next 5 business days
    
    Args:
        request: MeetingSlotRequest with timezone and duration preferences
        
    Returns:
        MeetingSlotsResponse with 3 suggested time slots
    """
    try:
        # Generate meeting slots
        response = meeting_service.generate_meeting_slots(
            timezone=request.timezone,
            duration_minutes=request.duration_minutes,
            num_slots=3
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate meeting slots: {str(e)}"
        )


@router.post("/ics")
async def generate_ics_file(request: ICSRequest):
    """
    Generate an ICS calendar file for meeting invitation
    
    Args:
        request: ICSRequest with meeting details
        
    Returns:
        ICS file as downloadable attachment
    """
    try:
        # Generate ICS content
        ics_content = ics_generator.generate_ics(
            start_datetime=request.start_datetime,
            end_datetime=request.end_datetime,
            subject=request.subject,
            description=request.description,
            location=request.location,
            attendees=request.attendees,
            organizer_email=request.organizer_email,
            organizer_name=request.organizer_name
        )
        
        # Generate filename
        filename = f"meeting_{uuid.uuid4().hex[:8]}.ics"
        
        # Return ICS file as downloadable response
        return Response(
            content=ics_content,
            media_type="text/calendar",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Content-Type": "text/calendar; charset=utf-8"
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate ICS file: {str(e)}"
        )
