"""Pydantic schemas for request/response validation."""
from datetime import datetime
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field


# ============ Enums ============
class ApplicationStatus(str, Enum):
    """Application status options."""
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    OFFER = "offer"
    REJECTED = "rejected"


class TaskPriority(str, Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# ============ CV Schemas ============
class CVUploadResponse(BaseModel):
    """Response after CV upload."""
    success: bool
    message: str
    cv_id: Optional[str] = None
    sections_found: List[str] = []


class CVStatusResponse(BaseModel):
    """CV processing status."""
    cv_id: str
    filename: str
    status: str  # "pending", "processing", "completed", "failed"
    skills: List[str] = []
    experience_years: Optional[float] = None
    education: List[str] = []
    sections: dict = {}
    processed_at: Optional[datetime] = None


# ============ Job Schemas ============
class JobSearchRequest(BaseModel):
    """Job search request payload."""
    query: str = Field(..., description="Natural language job search query")
    location: Optional[str] = None
    job_type: Optional[str] = None  # "full-time", "internship", "contract"
    experience_level: Optional[str] = None
    limit: int = Field(default=10, ge=1, le=50)


class JobCard(BaseModel):
    """Structured job card data."""
    job_id: str
    title: str
    company: str
    location: str
    salary: Optional[str] = None
    deadline: Optional[str] = None
    description: str
    requirements: List[str] = []
    source: str  # "jsearch"
    url: Optional[str] = None
    posted_date: Optional[str] = None


class JobSearchResponse(BaseModel):
    """Job search response."""
    jobs: List[JobCard]
    total: int
    query: str


class FitScoreResponse(BaseModel):
    """Fit score for a job."""
    job_id: str
    fit_score: float = Field(ge=0, le=100)
    breakdown: dict
    match_reasoning: str
    missing_skills: List[str] = []
    recommended_actions: List[str] = []


# ============ Chat Schemas ============
class ChatMessage(BaseModel):
    """Single chat message."""
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatRequest(BaseModel):
    """Chat message request."""
    message: str
    session_id: Optional[str] = None
    context_job_id: Optional[str] = None  # Optional job context for cover letters etc.


class ChatResponse(BaseModel):
    """Chat response."""
    response: str
    session_id: str
    sources: List[str] = []  # Retrieved context chunks
    suggested_actions: List[str] = []


class SessionContext(BaseModel):
    """Session context for conversation memory."""
    session_id: str
    messages: List[ChatMessage] = []
    cv_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============ Task Schemas ============
class TaskCreate(BaseModel):
    """Create a new task."""
    title: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    category: str = "general"  # "general", "job_search", "learning", "interview"
    completed: bool = False


class TaskUpdate(BaseModel):
    """Update an existing task."""
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    category: Optional[str] = None
    completed: Optional[bool] = None


class TaskResponse(BaseModel):
    """Task response."""
    id: int
    title: str
    description: Optional[str]
    priority: TaskPriority
    due_date: Optional[datetime]
    category: str
    completed: bool
    created_at: datetime
    updated_at: datetime


class TaskListResponse(BaseModel):
    """List of tasks."""
    tasks: List[TaskResponse]
    total: int
    pending: int
    completed: int


# ============ Application Tracker Schemas ============
class ApplicationCreate(BaseModel):
    """Create a new application entry."""
    job_id: str
    company: str
    position: str
    applied_date: Optional[datetime] = None
    status: ApplicationStatus = ApplicationStatus.APPLIED
    notes: Optional[str] = None
    link: Optional[str] = None
    salary: Optional[str] = None


class ApplicationUpdate(BaseModel):
    """Update application status."""
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None
    interview_date: Optional[datetime] = None
    salary: Optional[str] = None
    offer_details: Optional[str] = None


class ApplicationResponse(BaseModel):
    """Application response."""
    id: int
    job_id: str
    company: str
    position: str
    applied_date: Optional[datetime]
    status: ApplicationStatus
    notes: Optional[str]
    link: Optional[str]
    salary: Optional[str]
    interview_date: Optional[datetime]
    offer_details: Optional[str]
    created_at: datetime
    updated_at: datetime


class ApplicationKanbanResponse(BaseModel):
    """Applications organized by kanban column."""
    applied: List[ApplicationResponse] = []
    interviewing: List[ApplicationResponse] = []
    offer: List[ApplicationResponse] = []
    rejected: List[ApplicationResponse] = []


# ============ Dashboard Schemas ============
class DashboardStats(BaseModel):
    """Dashboard statistics."""
    total_applications: int
    applications_by_status: dict
    tasks_pending: int
    tasks_completed_today: int
    streak_days: int
    skills_identified: List[str]
    recent_activity: List[dict]


# ============ Calendar Schemas ============
class CalendarEvent(BaseModel):
    """Calendar event."""
    id: int
    title: str
    description: Optional[str]
    event_date: datetime
    event_type: str  # "deadline", "interview", "goal", "reminder"
    related_job_id: Optional[str] = None
    created_at: datetime


class CalendarEventCreate(BaseModel):
    """Create calendar event."""
    title: str
    description: Optional[str] = None
    event_date: datetime
    event_type: str = "reminder"
    related_job_id: Optional[str] = None
