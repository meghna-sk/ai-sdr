"""
Grok AI Client Service

Provides a wrapper around the xAI Grok API for lead qualification and outreach generation.
Includes retry logic, schema validation, and structured response handling.
"""

import os
import json
import asyncio
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from pathlib import Path
from xai_sdk import Client
from xai_sdk.chat import user, system
import dotenv





class GrokError(Exception):
    """Custom exception for Grok API errors"""
    pass


@dataclass
class QualificationResult:
    """Structured result from lead qualification"""
    verdict: str  # "qualified", "not_qualified", "needs_more_info"
    confidence: int  # 0-100
    reasoning: str
    factors: List[str]


@dataclass
class OutreachResult:
    """Structured result from outreach generation"""
    subject: str
    body: str
    variants: List[Dict[str, str]]  # Alternative subject/body combinations


class GrokClient:
    """Grok API client with retry logic and validation"""
    
    def __init__(self, api_key: Optional[str] = None, model: str = "grok-4", max_retries: int = 3):
        """Initialize Grok client"""
        try:
            print("=== GrokClient.__init__ starting ===")
            
            # Load .env file from project root directory (three levels up from services)
            project_root = Path(__file__).parent.parent.parent.parent
            dotenv_path = project_root / ".env"
            
            
            dotenv.load_dotenv(dotenv_path=dotenv_path)
            env_api_key = os.getenv("XAI_API_KEY")
            
            print(f"=== Looking for .env at: {dotenv_path} ===")
            print(f"=== .env file exists: {dotenv_path.exists()} ===")
            print(f"=== API key from env: {'Found' if env_api_key else 'None'} ===")

            self.api_key = api_key or env_api_key

            
            if not self.api_key:
                raise GrokError("XAI_API_KEY environment variable is required")
            
            self.model = model
            self.max_retries = max_retries
            
            print("=== Creating xAI Client ===")
            self.client = Client(api_key=self.api_key)
            print("=== GrokClient.__init__ completed successfully ===")
            
        except Exception as e:
            print(f"=== ERROR in GrokClient.__init__: {e} ===")
            print(f"Exception type: {type(e)}")
            raise
    
    async def qualify_lead(self, lead_data: Dict[str, Any]) -> QualificationResult:
        """
        Qualify a lead using Grok AI
        
        Args:
            lead_data: Dictionary containing lead information (name, title, company, email, etc.)
            
        Returns:
            QualificationResult with verdict, confidence, reasoning, and factors
            
        Raises:
            GrokError: If API call fails or response is invalid
        """
        
        # Build qualification prompt
        prompt = self._build_qualification_prompt(lead_data)
        
        # Call Grok with retry logic
        response_content = await self._call_grok_with_retry(prompt)
        
        # Parse and validate response
        try:
            response_data = json.loads(response_content)
        except json.JSONDecodeError:
            raise GrokError(f"Invalid JSON response from Grok: {response_content}")
        
        # Validate required fields
        required_fields = ["verdict", "confidence", "reasoning", "factors"]
        missing_fields = [field for field in required_fields if field not in response_data]
        if missing_fields:
            raise GrokError(f"Missing required fields in Grok response: {missing_fields}")
        
        # Validate verdict value
        valid_verdicts = ["qualified", "not_qualified", "needs_more_info"]
        if response_data["verdict"] not in valid_verdicts:
            raise GrokError(f"Invalid verdict: {response_data['verdict']}. Must be one of {valid_verdicts}")
        
        # Validate confidence range
        confidence = response_data["confidence"]
        if not isinstance(confidence, int) or not 0 <= confidence <= 100:
            raise GrokError(f"Invalid confidence: {confidence}. Must be integer between 0-100")
        
        return QualificationResult(
            verdict=response_data["verdict"],
            confidence=confidence,
            reasoning=response_data["reasoning"],
            factors=response_data["factors"]
        )
    
    async def generate_outreach(self, lead_data: Dict[str, Any], context: Optional[str] = None) -> OutreachResult:
        """
        Generate personalized outreach email using Grok AI
        
        Args:
            lead_data: Dictionary containing lead information
            context: Optional additional context for personalization
            
        Returns:
            OutreachResult with subject, body, and variants
            
        Raises:
            GrokError: If API call fails or response is invalid
        """
        
        # Build outreach prompt
        prompt = self._build_outreach_prompt(lead_data, context)
        
        # Call Grok with retry logic
        response_content = await self._call_grok_with_retry(prompt)
        
        # Parse and validate response
        try:
            response_data = json.loads(response_content)
        except json.JSONDecodeError:
            raise GrokError(f"Invalid JSON response from Grok: {response_content}")
        
        # Validate required fields
        required_fields = ["subject", "body", "variants"]
        missing_fields = [field for field in required_fields if field not in response_data]
        if missing_fields:
            raise GrokError(f"Missing required fields in Grok response: {missing_fields}")
        
        return OutreachResult(
            subject=response_data["subject"],
            body=response_data["body"],
            variants=response_data["variants"]
        )
    
    async def _call_grok_with_retry(self, prompt: str) -> str:
        """Call Grok API with retry logic"""
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                chat = self.client.chat.create(model=self.model)
                chat.append(user(prompt))
                response = chat.sample()
                return response.content
                
            except Exception as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    # Exponential backoff: 1s, 2s, 4s
                    wait_time = 2 ** attempt
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    break
        
        raise GrokError(f"Max retries exceeded. Last error: {last_error}")
    
    def _build_qualification_prompt(self, lead_data: Dict[str, Any]) -> str:
        """Build prompt for lead qualification"""
        
        # Extract available lead information
        name = lead_data.get("name", "Unknown")
        title = lead_data.get("title", "Unknown")
        company = lead_data.get("company", "Unknown")
        email = lead_data.get("email", "Unknown")
        phone = lead_data.get("phone", "")
        linkedin = lead_data.get("linkedin_url", "")
        notes = lead_data.get("notes", "")
        
        prompt = f"""
You are an expert sales development representative. Analyze this lead and determine if they should be qualified for our sales pipeline.

Lead Information:
- Name: {name}
- Title: {title}
- Company: {company}
- Email: {email}
- Phone: {phone if phone else "Not provided"}
- LinkedIn: {linkedin if linkedin else "Not provided"}
- Notes: {notes if notes else "None"}

Qualification Criteria:
- Decision-making authority (senior roles, executives)
- Company size and potential budget
- Professional contact quality
- Likelihood of being interested in B2B solutions

Please respond with a JSON object containing:
- "verdict": "qualified" | "not_qualified" | "needs_more_info"
- "confidence": integer from 0-100
- "reasoning": detailed explanation of your decision
- "factors": array of key factors that influenced your decision

Example response:
{{
    "verdict": "qualified",
    "confidence": 85,
    "reasoning": "Senior technical role at enterprise company with professional contact details",
    "factors": ["senior_title", "enterprise_company", "professional_email"]
}}

Respond only with the JSON object, no additional text.
"""
        return prompt.strip()
    
    def _build_outreach_prompt(self, lead_data: Dict[str, Any], context: Optional[str] = None) -> str:
        """Build prompt for outreach generation"""
        
        # Extract available lead information
        name = lead_data.get("name", "there")
        title = lead_data.get("title", "")
        company = lead_data.get("company", "")
        
        context_section = f"\nAdditional Context: {context}" if context else ""
        
        prompt = f"""
You are an expert sales development representative. Write a personalized outreach email for this lead.

Lead Information:
- Name: {name}
- Title: {title}
- Company: {company}{context_section}

Email Guidelines:
- Professional but friendly tone
- Personalized to their role and company
- Clear value proposition
- Soft call-to-action
- Keep it concise (under 150 words)
- Avoid being overly salesy

Please respond with a JSON object containing:
- "subject": compelling email subject line
- "body": email body text
- "variants": array of 2 alternative versions with different subject/body combinations

Example response:
{{
    "subject": "Quick question about [company]'s tech stack",
    "body": "Hi [name],\\n\\nI noticed your role as [title] at [company]. We've helped similar companies reduce their infrastructure costs by 30%.\\n\\nWould you be open to a 15-minute conversation about your current challenges?\\n\\nBest regards,\\nSales Team",
    "variants": [
        {{
            "subject": "Alternative subject line",
            "body": "Alternative email body"
        }},
        {{
            "subject": "Another subject option", 
            "body": "Another email body option"
        }}
    ]
}}

Respond only with the JSON object, no additional text.
"""
        return prompt.strip()
