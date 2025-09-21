"""
ICS Calendar File Generator Service

Handles generation of ICS (iCalendar) files for meeting invitations.
"""

from datetime import datetime
from typing import List, Optional
import uuid


class ICSGenerator:
    """Service for generating ICS calendar files"""
    
    def __init__(self):
        self.version = "2.0"
        self.prodid = "-//Grok SDR//Meeting Scheduler//EN"
    
    def generate_ics(
        self,
        start_datetime: str,
        end_datetime: str,
        subject: str,
        description: str = "",
        location: str = "",
        attendees: List[str] = None,
        organizer_email: str = "sdr@grok-sdr.com",
        organizer_name: str = "Grok SDR Team"
    ) -> str:
        """
        Generate an ICS calendar file content
        
        Args:
            start_datetime: Meeting start time in ISO format
            end_datetime: Meeting end time in ISO format
            subject: Meeting subject/title
            description: Meeting description
            location: Meeting location (optional)
            attendees: List of attendee email addresses
            organizer_email: Organizer email address
            organizer_name: Organizer name
            
        Returns:
            ICS file content as string
        """
        if attendees is None:
            attendees = []
        
        # Generate unique event ID
        event_uid = f"{uuid.uuid4()}@grok-sdr.com"
        
        # Format datetimes for ICS (YYYYMMDDTHHMMSSZ)
        start_formatted = self._format_datetime_for_ics(start_datetime)
        end_formatted = self._format_datetime_for_ics(end_datetime)
        now_formatted = self._format_datetime_for_ics(datetime.now().isoformat())
        
        # Build ICS content
        ics_content = [
            "BEGIN:VCALENDAR",
            f"VERSION:{self.version}",
            f"PRODID:{self.prodid}",
            "CALSCALE:GREGORIAN",
            "METHOD:REQUEST",
            "BEGIN:VEVENT",
            f"UID:{event_uid}",
            f"DTSTART:{start_formatted}",
            f"DTEND:{end_formatted}",
            f"DTSTAMP:{now_formatted}",
            f"SUMMARY:{self._escape_text(subject)}",
            f"DESCRIPTION:{self._escape_text(description)}",
            f"LOCATION:{self._escape_text(location)}",
            f"ORGANIZER:CN={self._escape_text(organizer_name)}:MAILTO:{organizer_email}",
            "STATUS:CONFIRMED",
            "SEQUENCE:0",
            "TRANSP:OPAQUE",
        ]
        
        # Add attendees
        for attendee in attendees:
            ics_content.append(f"ATTENDEE:MAILTO:{attendee}")
        
        # Add reminder
        ics_content.extend([
            "BEGIN:VALARM",
            "TRIGGER:-PT15M",
            "ACTION:DISPLAY",
            f"DESCRIPTION:{self._escape_text(subject)}",
            "END:VALARM",
            "END:VEVENT",
            "END:VCALENDAR"
        ])
        
        return "\r\n".join(ics_content)
    
    def _format_datetime_for_ics(self, iso_datetime: str) -> str:
        """Convert ISO datetime to ICS format (YYYYMMDDTHHMMSSZ)"""
        try:
            # Parse ISO datetime
            if iso_datetime.endswith('Z'):
                dt = datetime.fromisoformat(iso_datetime[:-1])
                dt = dt.replace(tzinfo=None)  # Remove timezone info for UTC
            elif '+' in iso_datetime or iso_datetime.count('-') > 2:
                # Handle timezone offset
                dt = datetime.fromisoformat(iso_datetime.replace('Z', '+00:00'))
                dt = dt.utctimetuple()
                return datetime(*dt[:6]).strftime('%Y%m%dT%H%M%SZ')
            else:
                dt = datetime.fromisoformat(iso_datetime)
            
            # Format as ICS datetime
            return dt.strftime('%Y%m%dT%H%M%SZ')
        except Exception:
            # Fallback to current time if parsing fails
            return datetime.now().strftime('%Y%m%dT%H%M%SZ')
    
    def _escape_text(self, text: str) -> str:
        """Escape text for ICS format"""
        if not text:
            return ""
        
        # Replace special characters
        text = text.replace("\\", "\\\\")
        text = text.replace(",", "\\,")
        text = text.replace(";", "\\;")
        text = text.replace("\n", "\\n")
        text = text.replace("\r", "")
        
        return text
