"""AI Chat routes with RAG and session memory."""
import json
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.core.database import get_db
from app.core.auth import get_current_clerk_id
from app.models import CV, User, ChatSession
from app.schemas import ChatRequest, ChatResponse, ChatMessage
from app.services import chat_service, embedding_service

router = APIRouter()

# In-memory session storage (in production, use Redis or database)
session_store: Dict[str, List[Dict]] = {}


async def get_or_create_session(
    db: AsyncSession,
    clerk_id: str,
    session_id: Optional[str] = None
) -> tuple[str, List[Dict]]:
    """Get or create a chat session."""
    if session_id and session_id in session_store:
        return session_id, session_store[session_id]
    
    # Create new session
    new_session_id = session_id or str(uuid.uuid4())
    session_store[new_session_id] = []
    
    # Also save to database
    result = await db.execute(
        select(User).where(User.clerk_id == clerk_id)
    )
    user = result.scalar_one_or_none()
    
    if user:
        db_session = ChatSession(
            user_id=user.id,
            session_id=new_session_id,
            messages=[]
        )
        db.add(db_session)
        await db.commit()
    
    return new_session_id, []


async def get_user_cv_data(db: AsyncSession, clerk_id: str) -> Optional[Dict]:
    """Get user's parsed CV data."""
    result = await db.execute(
        select(User).where(User.clerk_id == clerk_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        return None
    
    result = await db.execute(
        select(CV).where(CV.user_id == user.id, CV.status == "completed")
    )
    cv = result.scalar_one_or_none()
    
    if not cv:
        return None
    
    return {
        "skills": cv.skills or [],
        "experience_years": cv.experience_years,
        "education": cv.education or [],
        "projects": cv.projects or [],
        "summary": "",  # Could add summary field to model
        "raw_text": cv.raw_text[:2000] if cv.raw_text else "",
        "collection_id": cv.collection_id,
    }


@router.post("", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Send a message to the AI assistant.
    
    Supports:
    - General career questions
    - CV-grounded responses
    - Job application assistance
    - Skill gap analysis
    - Cover letter generation
    """
    # Get or create session
    session_id, history = await get_or_create_session(db, clerk_id, request.session_id)
    
    # Add user message to history
    user_message = {
        "role": "user",
        "content": request.message,
        "timestamp": datetime.utcnow().isoformat()
    }
    history.append(user_message)
    session_store[session_id] = history
    
    # Get user's CV data
    cv_data = await get_user_cv_data(db, clerk_id)
    
    # Get collection ID for RAG
    collection_id = cv_data.get("collection_id") if cv_data else None
    
    # Generate response
    response_data = await chat_service.generate_response(
        message=request.message,
        session_history=history,
        user_cv_data=cv_data,
        collection_id=collection_id,
        context_job_id=request.context_job_id
    )
    
    # Add assistant response to history
    assistant_message = {
        "role": "assistant",
        "content": response_data["response"],
        "timestamp": datetime.utcnow().isoformat()
    }
    history.append(assistant_message)
    session_store[session_id] = history
    
    # Save to database
    try:
        result = await db.execute(
            select(ChatSession).where(ChatSession.session_id == session_id)
        )
        db_session = result.scalar_one_or_none()
        if db_session:
            db_session.messages = history
            await db.commit()
    except Exception as e:
        print(f"Failed to save session: {e}")
    
    return ChatResponse(
        response=response_data["response"],
        session_id=session_id,
        sources=response_data.get("sources", []),
        suggested_actions=response_data.get("suggested_actions", [])
    )


@router.post("/cover-letter")
async def generate_cover_letter(
    job_id: str,
    job_title: str,
    job_company: str,
    job_description: str,
    job_requirements: List[str],
    tone: str = "professional",
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Generate a personalized cover letter for a job."""
    cv_data = await get_user_cv_data(db, clerk_id)
    
    if not cv_data:
        raise HTTPException(
            status_code=404,
            detail="No CV found. Please upload your CV first."
        )
    
    job_data = {
        "title": job_title,
        "company": job_company,
        "description": job_description,
        "requirements": job_requirements
    }
    
    cover_letter = await chat_service.generate_cover_letter(
        user_cv_data=cv_data,
        job_data=job_data,
        tone=tone
    )
    
    return {
        "cover_letter": cover_letter,
        "job_id": job_id,
        "tone": tone
    }


@router.post("/skill-gap")
async def analyze_skill_gap(
    target_role: str,
    job_requirements: List[str],
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Analyze skill gap for a target role."""
    cv_data = await get_user_cv_data(db, clerk_id)
    
    if not cv_data:
        raise HTTPException(
            status_code=404,
            detail="No CV found. Please upload your CV first."
        )
    
    analysis = await chat_service.analyze_skill_gap(
        user_skills=cv_data.get("skills", []),
        target_role=target_role,
        job_requirements=job_requirements
    )
    
    return analysis


@router.post("/roadmap")
async def create_learning_roadmap(
    target_skills: List[str],
    timeline_months: int = 3,
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a personalized learning roadmap."""
    cv_data = await get_user_cv_data(db, clerk_id)
    
    roadmap = await chat_service.create_learning_roadmap(
        user_skills=cv_data.get("skills", []) if cv_data else [],
        target_skills=target_skills,
        timeline_months=timeline_months
    )
    
    return {
        "roadmap": roadmap,
        "timeline_months": timeline_months,
        "skills_covered": target_skills
    }


@router.get("/sessions")
async def get_chat_sessions(
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Get all chat sessions for the user."""
    result = await db.execute(
        select(User).where(User.clerk_id == clerk_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        return {"sessions": []}
    
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == user.id)
        .order_by(ChatSession.updated_at.desc())
    )
    sessions = result.scalars().all()
    
    return {
        "sessions": [
            {
                "session_id": s.session_id,
                "title": s.title,
                "created_at": s.created_at.isoformat() if s.created_at else None,
                "updated_at": s.updated_at.isoformat() if s.updated_at else None,
                "message_count": len(s.messages) if s.messages else 0
            }
            for s in sessions
        ]
    }


@router.get("/sessions/{session_id}")
async def get_session_history(
    session_id: str,
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Get message history for a specific session."""
    if session_id in session_store:
        return {
            "session_id": session_id,
            "messages": session_store[session_id]
        }
    
    # Try to get from database
    result = await db.execute(
        select(ChatSession).where(ChatSession.session_id == session_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "messages": session.messages or []
    }


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a chat session."""
    # Remove from memory
    if session_id in session_store:
        del session_store[session_id]
    
    # Remove from database
    result = await db.execute(
        select(ChatSession).where(ChatSession.session_id == session_id)
    )
    session = result.scalar_one_or_none()
    
    if session:
        await db.delete(session)
        await db.commit()
    
    return {"message": "Session deleted"}
