"""SQLAlchemy database models."""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean,
    DateTime, ForeignKey, Enum, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class User(Base):
    """User model for authentication."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    cv = relationship("CV", back_populates="user", uselist=False)
    tasks = relationship("Task", back_populates="user")
    applications = relationship("Application", back_populates="user")
    chat_sessions = relationship("ChatSession", back_populates="user")


class CV(Base):
    """CV/Resume model."""
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(10), nullable=False)  # "pdf" or "docx"
    
    # Parsed content
    raw_text = Column(Text, nullable=True)
    skills = Column(JSON, default=list)
    experience_years = Column(Float, nullable=True)
    education = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    work_history = Column(JSON, default=list)
    
    # Processing status
    status = Column(String(50), default="pending")  # "pending", "processing", "completed", "failed"
    chunks_count = Column(Integer, default=0)
    collection_id = Column(String(255), nullable=True)  # ChromaDB collection ID
    
    processed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="cv")


class Task(Base):
    """Task/To-Do model."""
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(20), default="medium")  # "low", "medium", "high"
    category = Column(String(50), default="general")  # "general", "job_search", "learning", "interview"
    
    due_date = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="tasks")


class Application(Base):
    """Job application tracker model."""
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    job_id = Column(String(255), nullable=True)  # External job ID from API
    company = Column(String(255), nullable=False)
    position = Column(String(255), nullable=False)
    
    applied_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="applied")  # "applied", "interviewing", "offer", "rejected"
    
    link = Column(String(500), nullable=True)
    salary = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    
    interview_date = Column(DateTime, nullable=True)
    offer_details = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="applications")


class ChatSession(Base):
    """Chat session for conversation memory."""
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    session_id = Column(String(255), unique=True, index=True, nullable=False)
    title = Column(String(255), default="New Chat")
    
    messages = Column(JSON, default=list)  # List of {role, content, timestamp}
    
    cv_id = Column(Integer, ForeignKey("cvs.id"), nullable=True)
    context_job_id = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="chat_sessions")


class CalendarEvent(Base):
    """Calendar event model."""
    __tablename__ = "calendar_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(DateTime, nullable=False)
    event_type = Column(String(50), default="reminder")  # "deadline", "interview", "goal", "reminder"
    
    related_job_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user_id_fk = Column(Integer, ForeignKey("users.id"))