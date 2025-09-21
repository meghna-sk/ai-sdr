from sqlalchemy.orm import Session
from app.models import Lead, Activity, CompanyProfile
from app.db import SessionLocal
import random
from datetime import datetime, timedelta


def seed_sample_leads(db: Session) -> None:
    """Seed the database with 10 sample leads for development and testing."""
    
    # Sample company data
    companies_data = [
        {"name": "TechCorp Inc", "domain": "techcorp.com", "size": "51-200", "industry": "Technology", "description": "Leading software development company"},
        {"name": "DataFlow Systems", "domain": "dataflow.io", "size": "11-50", "industry": "Analytics", "description": "Data analytics and business intelligence"},
        {"name": "CloudNext Solutions", "domain": "cloudnext.co", "size": "201-500", "industry": "Cloud Services", "description": "Enterprise cloud infrastructure"},
        {"name": "StartupX", "domain": "startupx.com", "size": "1-10", "industry": "Fintech", "description": "Revolutionary fintech startup"},
        {"name": "Enterprise Global", "domain": "entglobal.com", "size": "1000+", "industry": "Consulting", "description": "Global enterprise consulting firm"},
    ]
    
    # Create company profiles
    company_profiles = []
    for company_data in companies_data:
        # Check if company already exists
        existing = db.query(CompanyProfile).filter_by(domain=company_data["domain"]).first()
        if not existing:
            company = CompanyProfile(**company_data)
            db.add(company)
            db.flush()  # To get the ID
            company_profiles.append(company)
        else:
            company_profiles.append(existing)
    
    # Sample lead data
    sample_leads = [
        {
            "name": "Sarah Johnson",
            "email": "sarah.johnson@techcorp.com",
            "company": "TechCorp Inc",
            "title": "VP of Engineering",
            "stage": "New",
            "phone": "+1-555-0123",
            "linkedin_url": "https://linkedin.com/in/sarahjohnson",
            "notes": "Interested in AI solutions for development team"
        },
        {
            "name": "Michael Chen",
            "email": "m.chen@dataflow.io",
            "company": "DataFlow Systems",
            "title": "CTO",
            "stage": "Qualified",
            "phone": "+1-555-0124",
            "linkedin_url": "https://linkedin.com/in/michaelchen",
            "notes": "Looking for advanced analytics platform"
        },
        {
            "name": "Emily Rodriguez",
            "email": "emily.r@cloudnext.co",
            "company": "CloudNext Solutions",
            "title": "Head of Product",
            "stage": "Contacted",
            "phone": "+1-555-0125",
            "linkedin_url": "https://linkedin.com/in/emilyrodriguez",
            "notes": "Evaluating multiple vendors"
        },
        {
            "name": "David Kim",
            "email": "david@startupx.com",
            "company": "StartupX",
            "title": "Founder & CEO",
            "stage": "Meeting Scheduled",
            "phone": "+1-555-0126",
            "linkedin_url": "https://linkedin.com/in/davidkim",
            "notes": "Demo scheduled for next week"
        },
        {
            "name": "Lisa Thompson",
            "email": "l.thompson@entglobal.com",
            "company": "Enterprise Global",
            "title": "Director of Technology",
            "stage": "Won",
            "phone": "+1-555-0127",
            "linkedin_url": "https://linkedin.com/in/lisathompson",
            "notes": "Contract signed, implementation starting"
        },
        {
            "name": "Robert Martinez",
            "email": "rob.martinez@techsolutions.com",
            "company": "TechSolutions Ltd",
            "title": "IT Manager",
            "stage": "Lost",
            "phone": "+1-555-0128",
            "linkedin_url": "https://linkedin.com/in/robertmartinez",
            "notes": "Chose competitor solution"
        },
        {
            "name": "Amanda White",
            "email": "amanda.white@innovate.co",
            "company": "Innovate Co",
            "title": "Product Manager",
            "stage": "New",
            "phone": "+1-555-0129",
            "linkedin_url": "https://linkedin.com/in/amandawhite",
            "notes": "Inbound lead from website"
        },
        {
            "name": "James Wilson",
            "email": "j.wilson@futuretech.ai",
            "company": "FutureTech AI",
            "title": "Chief AI Officer",
            "stage": "Qualified",
            "phone": "+1-555-0130",
            "linkedin_url": "https://linkedin.com/in/jameswilson",
            "notes": "High-value enterprise prospect"
        },
        {
            "name": "Jessica Brown",
            "email": "jessica@digitalfirst.com",
            "company": "Digital First",
            "title": "VP of Sales",
            "stage": "Contacted",
            "phone": "+1-555-0131",
            "linkedin_url": "https://linkedin.com/in/jessicabrown",
            "notes": "Interested in sales enablement tools"
        },
        {
            "name": "Mark Davis",
            "email": "mark.davis@scaleup.io",
            "company": "ScaleUp Solutions",
            "title": "Growth Lead",
            "stage": "New",
            "phone": "+1-555-0132",
            "linkedin_url": "https://linkedin.com/in/markdavis",
            "notes": "Referral from existing customer"
        }
    ]
    
    # Create leads with activities
    for lead_data in sample_leads:
        # Check if lead already exists
        existing_lead = db.query(Lead).filter_by(email=lead_data["email"]).first()
        if existing_lead:
            continue
            
        # Find matching company profile
        company_profile = None
        for cp in company_profiles:
            if cp.name == lead_data["company"]:
                company_profile = cp
                break
        
        # Create lead
        lead = Lead(
            name=lead_data["name"],
            email=lead_data["email"],
            company=lead_data["company"],
            title=lead_data["title"],
            stage=lead_data["stage"],
            phone=lead_data.get("phone"),
            linkedin_url=lead_data.get("linkedin_url"),
            notes=lead_data.get("notes"),
            company_profile_id=company_profile.id if company_profile else None,
            score=round(random.uniform(60, 95), 1) if lead_data["stage"] != "New" else None
        )
        
        db.add(lead)
        db.flush()  # To get the lead ID
        
        # Create initial activity
        activity = Activity(
            lead_id=lead.id,
            activity_type="created",
            description=f"Lead created with stage: {lead.stage}",
            data={
                "initial_stage": lead.stage,
                "source": "seed_data",
                "notes": lead.notes
            }
        )
        db.add(activity)
        
        # Add some additional activities for non-New leads
        if lead.stage != "New":
            # Add qualification activity
            qualification_activity = Activity(
                lead_id=lead.id,
                activity_type="qualified",
                description="Lead qualified through initial screening",
                data={
                    "qualification_score": lead.score,
                    "qualification_method": "manual"
                }
            )
            db.add(qualification_activity)
            
        if lead.stage in ["Contacted", "Meeting Scheduled", "Won", "Lost"]:
            # Add contact activity
            contact_activity = Activity(
                lead_id=lead.id,
                activity_type="contacted",
                description="Initial outreach completed",
                data={
                    "contact_method": "email",
                    "response_received": lead.stage != "Contacted"
                }
            )
            db.add(contact_activity)
    
    # Commit all changes
    db.commit()
    print(f"Seeded database with {len(sample_leads)} leads and {len(company_profiles)} company profiles")


def main():
    """Main function to run seeding independently."""
    db = SessionLocal()
    try:
        seed_sample_leads(db)
        print("Sample data seeded successfully!")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
