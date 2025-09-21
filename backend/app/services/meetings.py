"""
Meeting Service

Handles meeting slot generation and scheduling logic.
"""

from datetime import datetime, timedelta, time
from typing import List, Optional
import pytz
from app.schemas import MeetingSlot, MeetingSlotsResponse


class MeetingService:
    """Service for handling meeting-related operations"""
    
    def __init__(self):
        self.business_hours_start = time(9, 0)  # 9:00 AM
        self.business_hours_end = time(17, 0)   # 5:00 PM
        self.preferred_times = [
            time(10, 0),  # 10:00 AM
            time(14, 0),  # 2:00 PM
            time(15, 30), # 3:30 PM
        ]
    
    def generate_meeting_slots(
        self, 
        timezone: str = "UTC", 
        duration_minutes: int = 30,
        num_slots: int = 3
    ) -> MeetingSlotsResponse:
        """
        Generate meeting slot suggestions for the next 5 business days
        
        Args:
            timezone: Target timezone for the meeting slots
            duration_minutes: Duration of the meeting in minutes
            num_slots: Number of slots to generate (default 3)
            
        Returns:
            MeetingSlotsResponse with suggested time slots
        """
        try:
            # Parse timezone
            tz = pytz.timezone(timezone)
        except pytz.exceptions.UnknownTimeZoneError:
            # Fallback to UTC if timezone is invalid
            tz = pytz.UTC
            timezone = "UTC"
        
        # Get current time in the target timezone
        now = datetime.now(tz)
        
        # Generate slots for the next 5 business days
        slots = []
        current_date = now.date()
        days_ahead = 0
        
        while len(slots) < num_slots and days_ahead < 10:  # Look ahead max 10 days
            # Skip weekends
            if current_date.weekday() < 5:  # Monday = 0, Friday = 4
                # Try preferred times first
                for preferred_time in self.preferred_times:
                    if len(slots) >= num_slots:
                        break
                    
                    # Create datetime for this slot
                    slot_datetime = tz.localize(
                        datetime.combine(current_date, preferred_time)
                    )
                    
                    # Only suggest future slots
                    if slot_datetime > now:
                        slot = self._create_meeting_slot(
                            slot_datetime, 
                            timezone, 
                            duration_minutes
                        )
                        slots.append(slot)
                
                # If we need more slots, try other business hours
                if len(slots) < num_slots:
                    for hour in range(9, 17):  # 9 AM to 5 PM
                        if len(slots) >= num_slots:
                            break
                        
                        for minute in [0, 30]:  # Every 30 minutes
                            slot_time = time(hour, minute)
                            
                            # Skip if we already have this time
                            if slot_time in self.preferred_times:
                                continue
                            
                            slot_datetime = tz.localize(
                                datetime.combine(current_date, slot_time)
                            )
                            
                            if slot_datetime > now:
                                slot = self._create_meeting_slot(
                                    slot_datetime, 
                                    timezone, 
                                    duration_minutes
                                )
                                slots.append(slot)
            
            # Move to next day
            current_date += timedelta(days=1)
            days_ahead += 1
        
        # Sort slots by datetime
        slots.sort(key=lambda x: x.datetime)
        
        # Take only the requested number of slots
        slots = slots[:num_slots]
        
        return MeetingSlotsResponse(
            slots=slots,
            total_slots=len(slots),
            timezone=timezone,
            generated_at=now.isoformat()
        )
    
    def _create_meeting_slot(
        self, 
        slot_datetime: datetime, 
        timezone: str, 
        duration_minutes: int
    ) -> MeetingSlot:
        """Create a MeetingSlot object from datetime"""
        
        # Format day of week
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        day_of_week = day_names[slot_datetime.weekday()]
        
        # Format time for display
        time_formatted = slot_datetime.strftime("%I:%M %p")
        
        return MeetingSlot(
            datetime=slot_datetime.isoformat(),
            timezone=timezone,
            duration_minutes=duration_minutes,
            day_of_week=day_of_week,
            time_formatted=time_formatted
        )
