"""Job search and fit score routes."""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models import CV, User
from app.schemas import (
    JobSearchRequest, JobSearchResponse, FitScoreResponse,
    JobCard
)
from app.services import job_search_service, fit_score_calculator

router = APIRouter()


async def get_user_cv(db: AsyncSession, clerk_id: str) -> Optional[CV]:
    """Get user's CV record."""
    result = await db.execute(
        select(User).where(User.clerk_id == clerk_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        return None
    
    result = await db.execute(
        select(CV).where(CV.user_id == user.id, CV.status == "completed")
    )
    return result.scalar_one_or_none()


@router.post("/search", response_model=JobSearchResponse)
async def search_jobs(
    request: JobSearchRequest,
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """
    Search for jobs using natural language query.
    
    Example: "Find me ML internships in Dhaka open this month"
    """
    # Search jobs
    jobs = await job_search_service.search_jobs(
        query=request.query,
        location=request.location,
        job_type=request.job_type,
        limit=request.limit
    )
    
    # If user has CV, calculate fit scores
    cv = await get_user_cv(db, clerk_id)
    
    if cv and cv.skills:
        for job in jobs:
            fit_result = fit_score_calculator.calculate_fit_score(
                cv_skills=cv.skills,
                cv_experience_years=cv.experience_years,
                cv_education=cv.education or [],
                cv_projects=cv.projects or [],
                job_requirements=job.requirements,
                job_title=job.title,
                job_description=job.description
            )
            # Attach fit score to job card
            job.fit_score = fit_result.fit_score
    
    # Sort by fit score if available
    jobs_with_scores = [j for j in jobs if hasattr(j, 'fit_score')]
    jobs_without_scores = [j for j in jobs if not hasattr(j, 'fit_score')]
    
    sorted_jobs = sorted(jobs_with_scores, key=lambda x: x.fit_score, reverse=True) + jobs_without_scores
    
    return JobSearchResponse(
        jobs=sorted_jobs,
        total=len(sorted_jobs),
        query=request.query
    )


@router.get("/{job_id}/score", response_model=FitScoreResponse)
async def get_job_fit_score(
    job_id: str,
    job_title: str = Query(...),
    job_company: str = Query(...),
    job_description: str = Query(...),
    job_requirements: str = Query(""),  # Comma-separated
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """Calculate detailed fit score for a specific job."""
    cv = await get_user_cv(db, clerk_id)
    
    if not cv:
        raise HTTPException(
            status_code=404,
            detail="No CV found. Please upload your CV first."
        )
    
    if not cv.skills:
        raise HTTPException(
            status_code=400,
            detail="CV not yet processed. Please wait or re-upload."
        )
    
    requirements = [r.strip() for r in job_requirements.split(",") if r.strip()]
    
    fit_result = fit_score_calculator.calculate_fit_score(
        cv_skills=cv.skills,
        cv_experience_years=cv.experience_years,
        cv_education=cv.education or [],
        cv_projects=cv.projects or [],
        job_requirements=requirements,
        job_title=job_title,
        job_description=job_description
    )
    
    fit_result.job_id = job_id
    return fit_result


@router.post("/match")
async def find_matching_jobs(
    limit: int = Query(default=10, ge=1, le=50),
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """
    Find jobs that match user's CV profile.
    
    Uses CV skills and experience to find relevant opportunities.
    """
    cv = await get_user_cv(db, clerk_id)
    
    if not cv:
        raise HTTPException(
            status_code=404,
            detail="No CV found. Please upload your CV first."
        )
    
    # Build search query from CV skills
    top_skills = cv.skills[:5] if cv.skills else []
    
    if not top_skills:
        raise HTTPException(
            status_code=400,
            detail="No skills found in CV. Please re-upload a complete CV."
        )
    
    # Create search query from skills
    search_query = " ".join(top_skills)
    
    # Search for jobs
    jobs = await job_search_service.search_jobs(
        query=search_query,
        limit=limit
    )
    
    # Calculate fit scores and sort
    scored_jobs = []
    for job in jobs:
        fit_result = fit_score_calculator.calculate_fit_score(
            cv_skills=cv.skills,
            cv_experience_years=cv.experience_years,
            cv_education=cv.education or [],
            cv_projects=cv.projects or [],
            job_requirements=job.requirements,
            job_title=job.title,
            job_description=job.description
        )
        
        scored_jobs.append({
            "job": job,
            "fit_score": fit_result.fit_score,
            "breakdown": fit_result.breakdown,
            "missing_skills": fit_result.missing_skills
        })
    
    # Sort by fit score
    scored_jobs.sort(key=lambda x: x["fit_score"], reverse=True)
    
    return {
        "cv_skills": top_skills,
        "matched_jobs": scored_jobs,
        "total": len(scored_jobs)
    }


@router.post("/save-job")
async def save_job_for_later(
    job_id: str,
    job_title: str,
    job_company: str,
    job_description: str = "",
    job_url: str = "",
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """Save a job to user's saved jobs list."""
    # This would typically save to a separate table
    # For now, returning a success response
    return {
        "success": True,
        "message": f"Job '{job_title}' at {job_company} saved to your list",
        "job_id": job_id
    }
