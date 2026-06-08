"""Application tracker routes with Kanban support."""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.auth import get_current_clerk_id
from app.models import Application, User, Task, CalendarEvent
from app.schemas import (
    ApplicationCreate, ApplicationUpdate, ApplicationResponse,
    ApplicationKanbanResponse, DashboardStats, CalendarEventCreate, CalendarEvent as CalendarEventSchema
)

router = APIRouter()


async def get_or_create_user(db: AsyncSession, clerk_id: str) -> User:
    """Get or create user by Clerk ID."""
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(clerk_id=clerk_id)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    return user


# ============ Application Tracker ============

@router.get("", response_model=ApplicationKanbanResponse)
async def get_applications(
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """Get all applications organized by kanban status."""
    user = await get_or_create_user(db, clerk_id)
    
    result = await db.execute(
        select(Application)
        .where(Application.user_id == user.id)
        .order_by(Application.created_at.desc())
    )
    applications = result.scalars().all()
    
    # Organize by status
    organized = {
        "applied": [],
        "interviewing": [],
        "offer": [],
        "rejected": []
    }
    
    for app in applications:
        app_response = ApplicationResponse.model_validate(app)
        status = app.status or "applied"
        if status in organized:
            organized[status].append(app_response)
    
    return ApplicationKanbanResponse(**organized)


@router.post("", response_model=ApplicationResponse)
async def create_application(
    app_data: ApplicationCreate,
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """Add a new job application to tracker."""
    user = await get_or_create_user(db, clerk_id)
    
    application = Application(
        user_id=user.id,
        job_id=app_data.job_id,
        company=app_data.company,
        position=app_data.position,
        applied_date=app_data.applied_date or datetime.utcnow(),
        status=app_data.status.value,
        notes=app_data.notes,
        link=app_data.link,
        salary=app_data.salary
    )
    
    db.add(application)
    await db.commit()
    await db.refresh(application)
    
    # Create a task for following up
    follow_up_task = Task(
        user_id=user.id,
        title=f"Follow up: {app_data.position} at {app_data.company}",
        category="job_search",
        priority="medium"
    )
    db.add(follow_up_task)
    await db.commit()
    
    return ApplicationResponse.model_validate(application)


@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: int,
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """Get a specific application."""
    user = await get_or_create_user(db, clerk_id)
    
    result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.user_id == user.id
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return ApplicationResponse.model_validate(application)


@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: int,
    app_data: ApplicationUpdate,
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """Update application status or details."""
    user = await get_or_create_user(db, clerk_id)
    
    result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.user_id == user.id
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Update fields
    update_data = app_data.model_dump(exclude_unset=True)
    
    if "status" in update_data and update_data["status"]:
        update_data["status"] = update_data["status"].value
    
    for key, value in update_data.items():
        setattr(application, key, value)
    
    await db.commit()
    await db.refresh(application)
    
    return ApplicationResponse.model_validate(application)


@router.delete("/{application_id}")
async def delete_application(
    application_id: int,
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """Delete an application."""
    user = await get_or_create_user(db, clerk_id)
    
    result = await db.execute(
        select(Application).where(
            Application.id == application_id,
            Application.user_id == user.id
        )
    )
    application = result.scalar_one_or_none()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    await db.delete(application)
    await db.commit()
    
    return {"message": "Application deleted successfully"}


@router.get("/stats/summary")
async def get_application_stats(
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """Get application statistics."""
    user = await get_or_create_user(db, clerk_id)
    
    result = await db.execute(
        select(Application).where(Application.user_id == user.id)
    )
    applications = result.scalars().all()
    
    # Calculate stats
    total = len(applications)
    by_status = {}
    
    for app in applications:
        status = app.status or "applied"
        by_status[status] = by_status.get(status, 0) + 1
    
    # Success rate (offers / total with outcome)
    outcomes = by_status.get("offer", 0) + by_status.get("rejected", 0)
    success_rate = (by_status.get("offer", 0) / outcomes * 100) if outcomes > 0 else 0
    
    return {
        "total_applications": total,
        "by_status": by_status,
        "success_rate": round(success_rate, 1),
        "pending": by_status.get("applied", 0) + by_status.get("interviewing", 0)
    }


# ============ Calendar Events ============

@router.get("/calendar/events", response_model=List[CalendarEventSchema])
async def get_calendar_events(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    event_type: Optional[str] = None,
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """Get calendar events within date range."""
    user = await get_or_create_user(db, clerk_id)
    
    query = select(CalendarEvent).where(CalendarEvent.user_id == user.id)
    
    if start_date:
        query = query.where(CalendarEvent.event_date >= start_date)
    if end_date:
        query = query.where(CalendarEvent.event_date <= end_date)
    if event_type:
        query = query.where(CalendarEvent.event_type == event_type)
    
    query = query.order_by(CalendarEvent.event_date.asc())
    
    result = await db.execute(query)
    events = result.scalars().all()
    
    return [CalendarEventSchema.model_validate(e) for e in events]


@router.post("/calendar/events", response_model=CalendarEventSchema)
async def create_calendar_event(
    event_data: CalendarEventCreate,
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """Create a new calendar event."""
    user = await get_or_create_user(db, clerk_id)
    
    event = CalendarEvent(
        user_id=user.id,
        title=event_data.title,
        description=event_data.description,
        event_date=event_data.event_date,
        event_type=event_data.event_type,
        related_job_id=event_data.related_job_id
    )
    
    db.add(event)
    await db.commit()
    await db.refresh(event)
    
    return CalendarEventSchema.model_validate(event)


@router.delete("/calendar/events/{event_id}")
async def delete_calendar_event(
    event_id: int,
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """Delete a calendar event."""
    user = await get_or_create_user(db, clerk_id)
    
    result = await db.execute(
        select(CalendarEvent).where(
            CalendarEvent.id == event_id,
            CalendarEvent.user_id == user.id
        )
    )
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    await db.delete(event)
    await db.commit()
    
    return {"message": "Event deleted successfully"}


# ============ Dashboard ============

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard statistics combining all data."""
    user = await get_or_create_user(db, clerk_id)
    
    # Get applications
    result = await db.execute(
        select(Application).where(Application.user_id == user.id)
    )
    applications = result.scalars().all()
    
    # Get tasks
    result = await db.execute(
        select(Task).where(Task.user_id == user.id)
    )
    tasks = result.scalars().all()
    
    # Get upcoming events
    result = await db.execute(
        select(CalendarEvent).where(
            CalendarEvent.user_id == user.id,
            CalendarEvent.event_date >= datetime.utcnow()
        ).order_by(CalendarEvent.event_date.asc()).limit(5)
    )
    events = result.scalars().all()
    
    # Calculate stats
    applications_by_status = {}
    for app in applications:
        status = app.status or "applied"
        applications_by_status[status] = applications_by_status.get(status, 0) + 1
    
    today = datetime.utcnow().date()
    tasks_completed_today = sum(
        1 for t in tasks 
        if t.completed and t.completed_at and t.completed_at.date() == today
    )
    
    # Calculate streak (simplified - days with activity)
    streak = min(len(applications) + tasks_completed_today, 30)  # Placeholder
    
    return DashboardStats(
        total_applications=len(applications),
        applications_by_status=applications_by_status,
        tasks_pending=sum(1 for t in tasks if not t.completed),
        tasks_completed_today=tasks_completed_today,
        streak_days=streak,
        skills_identified=[],  # Would come from CV
        recent_activity=[
            {
                "type": "application",
                "title": f"Applied to {app.company}",
                "date": app.created_at.isoformat() if app.created_at else None
            }
            for app in applications[:5]
        ]
    )


@router.get("/nudges")
async def get_ai_nudges(
    clerk_id: str = "demo_user",
    db: AsyncSession = Depends(get_db),
):
    """Generate AI-powered nudges based on user activity."""
    user = await get_or_create_user(db, clerk_id)
    
    nudges = []
    
    # Check application frequency
    result = await db.execute(
        select(Application).where(Application.user_id == user.id)
    )
    applications = result.scalars().all()
    
    # Check recent activity
    week_ago = datetime.utcnow().timestamp() - (7 * 24 * 60 * 60)
    recent_apps = [
        a for a in applications 
        if a.created_at and a.created_at.timestamp() > week_ago
    ]
    
    if not recent_apps:
        nudges.append({
            "type": "action",
            "message": "You haven't applied to any jobs this week. Keep up the momentum!",
            "action": "Search for jobs"
        })
    
    # Check for interview stages
    interviewing = sum(1 for a in applications if a.status == "interviewing")
    if interviewing > 0:
        nudges.append({
            "type": "reminder",
            "message": f"You have {interviewing} application(s) in the interview stage. Good luck!",
            "action": None
        })
    
    # Check pending tasks
    result = await db.execute(
        select(Task).where(
            Task.user_id == user.id,
            Task.completed == False
        )
    )
    pending_tasks = result.scalars().all()
    
    if len(pending_tasks) > 5:
        nudges.append({
            "type": "organization",
            "message": f"You have {len(pending_tasks)} pending tasks. Consider completing some!",
            "action": "View tasks"
        })
    
    if not nudges:
        nudges.append({
            "type": "motivation",
            "message": "You're on track! Keep pushing towards your career goals.",
            "action": None
        })
    
    return {"nudges": nudges}
