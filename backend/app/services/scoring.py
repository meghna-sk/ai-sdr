"""
Lead Scoring Service

Calculates lead scores based on configurable weights and multiple factors:
- Data completeness (how much information we have)
- Title seniority (executive level, decision-making power)
- Company size (enterprise vs startup indicators)
- Contact quality (professional email, LinkedIn presence)
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import re
from app.models import Lead


@dataclass
class ScoreItem:
    """Individual scoring factor"""
    factor: str
    score: float
    weight: float
    reasoning: str


@dataclass 
class ScoreBreakdown:
    """Complete scoring breakdown"""
    total_score: float
    breakdown: List[Dict[str, Any]]
    factors: Dict[str, float]


class ScoringService:
    """Service for calculating lead scores with configurable weights"""
    
    DEFAULT_WEIGHTS = {
        'data_completeness': 30,
        'title_seniority': 35, 
        'company_size': 20,
        'contact_quality': 15
    }
    
    # Company size indicators
    ENTERPRISE_DOMAINS = {
        'microsoft.com', 'google.com', 'amazon.com', 'apple.com', 'meta.com',
        'salesforce.com', 'oracle.com', 'ibm.com', 'cisco.com', 'intel.com',
        'adobe.com', 'netflix.com', 'uber.com', 'airbnb.com', 'stripe.com'
    }
    
    ENTERPRISE_KEYWORDS = {
        'corp', 'corporation', 'inc', 'incorporated', 'ltd', 'limited',
        'global', 'international', 'worldwide', 'enterprise', 'systems',
        'solutions', 'technologies', 'group', 'holdings'
    }
    
    # Executive/senior titles
    EXECUTIVE_TITLES = {
        'ceo', 'chief executive officer', 'president', 'founder', 'co-founder',
        'cto', 'chief technology officer', 'cfo', 'chief financial officer',
        'cmo', 'chief marketing officer', 'coo', 'chief operating officer',
        'vp', 'vice president', 'svp', 'senior vice president',
        'evp', 'executive vice president', 'head of', 'director',
        'senior director', 'principal', 'partner', 'owner'
    }
    
    SENIOR_TITLES = {
        'manager', 'senior manager', 'lead', 'senior lead', 'team lead',
        'architect', 'senior architect', 'principal engineer', 'staff engineer',
        'senior engineer', 'senior developer', 'tech lead', 'engineering manager'
    }
    
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        """Initialize scoring service with optional custom weights"""
        self.weights = weights or self.DEFAULT_WEIGHTS.copy()
        
        # Normalize weights to sum to 100
        total_weight = sum(self.weights.values())
        if total_weight != 100:
            for key in self.weights:
                self.weights[key] = (self.weights[key] / total_weight) * 100
    
    def calculate_score(self, lead: Lead) -> ScoreBreakdown:
        """Calculate comprehensive lead score with breakdown"""
        
        # Calculate individual factor scores
        completeness_score = self._score_data_completeness(lead)
        seniority_score = self._score_title_seniority(lead)
        company_score = self._score_company_size(lead)
        contact_score = self._score_contact_quality(lead)
        
        # Apply weights and calculate total
        weighted_scores = {
            'data_completeness': (completeness_score.score * self.weights['data_completeness']) / 100,
            'title_seniority': (seniority_score.score * self.weights['title_seniority']) / 100,
            'company_size': (company_score.score * self.weights['company_size']) / 100,
            'contact_quality': (contact_score.score * self.weights['contact_quality']) / 100
        }
        
        total_score = sum(weighted_scores.values())
        
        # Build breakdown for transparency
        breakdown = [
            {
                'factor': completeness_score.factor,
                'score': completeness_score.score,
                'weight': self.weights['data_completeness'],
                'weighted_score': weighted_scores['data_completeness'],
                'reasoning': completeness_score.reasoning
            },
            {
                'factor': seniority_score.factor,
                'score': seniority_score.score,
                'weight': self.weights['title_seniority'],
                'weighted_score': weighted_scores['title_seniority'],
                'reasoning': seniority_score.reasoning
            },
            {
                'factor': company_score.factor,
                'score': company_score.score,
                'weight': self.weights['company_size'],
                'weighted_score': weighted_scores['company_size'],
                'reasoning': company_score.reasoning
            },
            {
                'factor': contact_score.factor,
                'score': contact_score.score,
                'weight': self.weights['contact_quality'],
                'weighted_score': weighted_scores['contact_quality'],
                'reasoning': contact_score.reasoning
            }
        ]
        
        return ScoreBreakdown(
            total_score=round(total_score, 1),
            breakdown=breakdown,
            factors=weighted_scores
        )
    
    def _score_data_completeness(self, lead: Lead) -> ScoreItem:
        """Score based on how complete the lead data is"""
        fields = ['name', 'email', 'company', 'title', 'phone', 'linkedin_url', 'notes']
        filled_fields = 0
        total_fields = len(fields)
        
        for field in fields:
            value = getattr(lead, field, None)
            if value and str(value).strip():
                filled_fields += 1
        
        # Name and email are required, so start from those
        completeness_ratio = filled_fields / total_fields
        score = completeness_ratio * 100
        
        reasoning = f"Profile is {completeness_ratio:.1%} complete ({filled_fields}/{total_fields} fields filled)"
        
        return ScoreItem(
            factor="Data Completeness",
            score=score,
            weight=self.weights['data_completeness'],
            reasoning=reasoning
        )
    
    def _score_title_seniority(self, lead: Lead) -> ScoreItem:
        """Score based on job title seniority and decision-making power"""
        title = getattr(lead, 'title', '') or ''
        title_lower = title.lower()
        
        score = 20  # Base score for having a title
        reasoning = "No title provided"
        
        if not title.strip():
            score = 0
        elif any(exec_title in title_lower for exec_title in self.EXECUTIVE_TITLES):
            score = 90
            reasoning = f"Executive-level title: {title}"
        elif any(senior_title in title_lower for senior_title in self.SENIOR_TITLES):
            score = 70
            reasoning = f"Senior-level title: {title}"
        elif any(keyword in title_lower for keyword in ['analyst', 'coordinator', 'specialist', 'associate']):
            score = 40
            reasoning = f"Individual contributor title: {title}"
        else:
            score = 50
            reasoning = f"Mid-level title: {title}"
        
        return ScoreItem(
            factor="Title Seniority",
            score=score,
            weight=self.weights['title_seniority'],
            reasoning=reasoning
        )
    
    def _score_company_size(self, lead: Lead) -> ScoreItem:
        """Score based on company size indicators"""
        email = getattr(lead, 'email', '') or ''
        company = getattr(lead, 'company', '') or ''
        
        score = 50  # Default score
        reasoning = "Unknown company size"
        
        # Extract domain from email
        domain = ''
        if '@' in email:
            domain = email.split('@')[1].lower()
        
        # Check for enterprise domains
        if domain in self.ENTERPRISE_DOMAINS:
            score = 95
            reasoning = f"Fortune 500 company domain: {domain}"
        elif any(keyword in company.lower() for keyword in self.ENTERPRISE_KEYWORDS):
            score = 80
            reasoning = f"Enterprise company indicators in: {company}"
        elif domain.endswith('.edu'):
            score = 60
            reasoning = f"Educational institution: {domain}"
        elif domain.endswith('.gov'):
            score = 75
            reasoning = f"Government organization: {domain}"
        elif any(startup_indicator in company.lower() for startup_indicator in ['startup', 'inc.', 'llc']):
            score = 40
            reasoning = f"Startup/small business indicators: {company}"
        elif company and len(company) > 0:
            score = 55
            reasoning = f"Mid-size company: {company}"
        else:
            score = 30
            reasoning = "No company information available"
        
        return ScoreItem(
            factor="Company Size",
            score=score,
            weight=self.weights['company_size'],
            reasoning=reasoning
        )
    
    def _score_contact_quality(self, lead: Lead) -> ScoreItem:
        """Score based on contact information quality"""
        email = getattr(lead, 'email', '') or ''
        phone = getattr(lead, 'phone', '') or ''
        linkedin_url = getattr(lead, 'linkedin_url', '') or ''
        
        score = 0
        quality_factors = []
        
        # Email quality (always present since it's required)
        if '@' in email:
            domain = email.split('@')[1].lower()
            if domain in self.ENTERPRISE_DOMAINS:
                score += 40
                quality_factors.append("enterprise email domain")
            elif not any(consumer in domain for consumer in ['gmail', 'yahoo', 'hotmail', 'outlook']):
                score += 35
                quality_factors.append("business email domain")
            else:
                score += 20
                quality_factors.append("consumer email domain")
        
        # Phone number presence and format
        if phone and len(phone.strip()) > 0:
            if re.match(r'^[\+]?[1]?[\s\-\.]?[\(]?[0-9]{3}[\)]?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}$', 
                       phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '').replace('.', '')):
                score += 30
                quality_factors.append("properly formatted phone")
            else:
                score += 20
                quality_factors.append("phone number provided")
        
        # LinkedIn profile
        if linkedin_url and 'linkedin.com' in linkedin_url.lower():
            score += 30
            quality_factors.append("LinkedIn profile")
        
        # Cap at 100
        score = min(score, 100)
        
        if quality_factors:
            reasoning = f"Quality indicators: {', '.join(quality_factors)}"
        else:
            reasoning = "Basic contact info only"
        
        return ScoreItem(
            factor="Contact Quality",
            score=score,
            weight=self.weights['contact_quality'],
            reasoning=reasoning
        )
