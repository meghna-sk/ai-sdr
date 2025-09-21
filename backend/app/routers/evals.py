"""
Evaluation API endpoints for running and managing evaluations
"""
import sys
import asyncio
from pathlib import Path
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import EvaluationRun as EvaluationRunModel
from app.schemas import EvaluationRunRequest, EvaluationRunResponse

# Add evals to path
backend_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_dir / "evals"))

try:
    import run as eval_runner
except ImportError:
    eval_runner = None

router = APIRouter(prefix="/api/evals", tags=["evaluations"])


@router.post("/run", response_model=EvaluationRunResponse)
async def run_evaluation(
    request: EvaluationRunRequest = EvaluationRunRequest(),
    db: Session = Depends(get_db)
):
    """
    Run evaluation framework and store results in database
    
    Args:
        request: Optional evaluation request with filters
        db: Database session
        
    Returns:
        Evaluation results with database ID
    """
    if eval_runner is None:
        raise HTTPException(
            status_code=500, 
            detail="Evaluation framework not available"
        )
    
    # Create initial evaluation record
    eval_record = EvaluationRunModel(
        status="running",
        total_tests=0,
        passed_tests=0,
        failed_tests=0,
        error_tests=0,
        pass_rate=0.0,
        verdict_accuracy=0.0,
        confidence_accuracy=0.0,
        schema_compliance_rate=0.0,
        total_schema_errors=0,
        avg_prompt_completeness=0.0,
        results={}
    )
    
    db.add(eval_record)
    db.commit()
    db.refresh(eval_record)
    
    try:
        # Run evaluations
        if request.include_leads:
            # Filter fixture leads by names
            fixture_leads = eval_runner.load_fixture_leads()
            filtered_leads = [
                lead for lead in fixture_leads 
                if lead["name"] in request.include_leads
            ]
            
            # Run filtered evaluations
            results = []
            for lead in filtered_leads:
                result = await eval_runner.run_evaluation(lead)
                results.append(result)
            
            # Generate report from filtered results
            report = eval_runner.generate_enhanced_report(results)
        else:
            # Run all evaluations
            report = await eval_runner.run_all_evaluations()
        
        # Update database record with results
        eval_record.status = "completed"
        eval_record.total_tests = report["total_tests"]
        eval_record.passed_tests = report["passed_tests"]
        eval_record.failed_tests = report["failed_tests"]
        eval_record.error_tests = report["error_tests"]
        eval_record.pass_rate = report["pass_rate"]
        eval_record.verdict_accuracy = report["verdict_accuracy"]
        eval_record.confidence_accuracy = report["confidence_accuracy"]
        eval_record.schema_compliance_rate = report["schema_compliance_rate"]
        eval_record.total_schema_errors = report["total_schema_errors"]
        eval_record.avg_prompt_completeness = report["prompt_validation_summary"]["avg_completeness_score"]
        eval_record.results = report["results"]  # This is a list of result dictionaries
        
        db.commit()
        db.refresh(eval_record)
        
        # Return formatted response
        return EvaluationRunResponse(
            evaluation_id=eval_record.id,
            timestamp=report["timestamp"],
            status=eval_record.status,
            total_tests=eval_record.total_tests,
            passed_tests=eval_record.passed_tests,
            failed_tests=eval_record.failed_tests,
            error_tests=eval_record.error_tests,
            pass_rate=eval_record.pass_rate,
            verdict_accuracy=eval_record.verdict_accuracy,
            confidence_accuracy=eval_record.confidence_accuracy,
            schema_compliance_rate=eval_record.schema_compliance_rate,
            total_schema_errors=eval_record.total_schema_errors,
            avg_prompt_completeness=eval_record.avg_prompt_completeness,
            results=eval_record.results
        )
        
    except Exception as e:
        # Update record with error
        eval_record.status = "failed"
        eval_record.error_message = str(e)
        db.commit()
        
        raise HTTPException(
            status_code=500,
            detail=f"Evaluation failed: {str(e)}"
        )


@router.get("/{evaluation_id}", response_model=EvaluationRunResponse)
def get_evaluation(evaluation_id: int, db: Session = Depends(get_db)):
    """
    Get specific evaluation results by ID
    
    Args:
        evaluation_id: Evaluation run ID
        db: Database session
        
    Returns:
        Evaluation results
    """
    eval_record = db.query(EvaluationRunModel).filter(
        EvaluationRunModel.id == evaluation_id
    ).first()
    
    if not eval_record:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    return EvaluationRunResponse(
        evaluation_id=eval_record.id,
        timestamp=eval_record.timestamp.isoformat(),
        status=eval_record.status,
        total_tests=eval_record.total_tests,
        passed_tests=eval_record.passed_tests,
        failed_tests=eval_record.failed_tests,
        error_tests=eval_record.error_tests,
        pass_rate=eval_record.pass_rate,
        verdict_accuracy=eval_record.verdict_accuracy,
        confidence_accuracy=eval_record.confidence_accuracy,
        schema_compliance_rate=eval_record.schema_compliance_rate,
        total_schema_errors=eval_record.total_schema_errors,
        avg_prompt_completeness=eval_record.avg_prompt_completeness,
        results=eval_record.results
    )


@router.get("/", response_model=List[EvaluationRunResponse])
def list_evaluations(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    List evaluation runs with pagination
    
    Args:
        limit: Maximum number of results
        offset: Number of results to skip
        db: Database session
        
    Returns:
        List of evaluation runs
    """
    eval_records = db.query(EvaluationRunModel).order_by(
        EvaluationRunModel.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    return [
        EvaluationRunResponse(
            evaluation_id=record.id,
            timestamp=record.timestamp.isoformat(),
            status=record.status,
            total_tests=record.total_tests,
            passed_tests=record.passed_tests,
            failed_tests=record.failed_tests,
            error_tests=record.error_tests,
            pass_rate=record.pass_rate,
            verdict_accuracy=record.verdict_accuracy,
            confidence_accuracy=record.confidence_accuracy,
            schema_compliance_rate=record.schema_compliance_rate,
            total_schema_errors=record.total_schema_errors,
            avg_prompt_completeness=record.avg_prompt_completeness,
            results=record.results
        )
        for record in eval_records
    ]
