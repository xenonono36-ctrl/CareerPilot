"""CV upload and processing routes."""
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.config import settings
from app.core.auth import get_current_clerk_id
from app.models import CV, User
from app.schemas import CVUploadResponse, CVStatusResponse
from app.services import cv_parser, embedding_service

router = APIRouter()

ALLOWED_EXTENSIONS = {"pdf", "docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


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


@router.post("/upload", response_model=CVUploadResponse)
async def upload_cv(
    file: UploadFile = File(...),
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload and process a CV/resume file.
    
    - Extract text from PDF or DOCX
    - Parse sections (skills, education, experience, projects)
    - Generate embeddings and store in ChromaDB
    """
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB")
    
    # Get or create user
    user = await get_or_create_user(db, clerk_id)
    
    # Check if user already has CV
    existing_cv = await db.execute(
        select(CV).where(CV.user_id == user.id)
    )
    existing_cv = existing_cv.scalar_one_or_none()
    
    if existing_cv:
        # Delete old collection from ChromaDB
        if existing_cv.collection_id:
            await embedding_service.delete_collection(existing_cv.collection_id)
        # Delete old file
        old_path = Path(existing_cv.file_path)
        if old_path.exists():
            old_path.unlink()
    
    # Save uploaded file
    file_ext = file.filename.rsplit(".", 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
    upload_dir = Path(settings.chroma_db_path).parent / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / unique_filename
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Create CV record
    cv_record = CV(
        user_id=user.id,
        filename=file.filename,
        file_path=str(file_path),
        file_type=file_ext,
        status="processing",
    )
    db.add(cv_record)
    await db.commit()
    await db.refresh(cv_record)
    
    try:
        # Parse CV
        parsed_data = await cv_parser.parse_file(str(file_path), file_ext)
        
        # Create ChromaDB collection for this CV
        collection_id = embedding_service.create_collection(str(user.id))
        
        # Add to vector store
        chunks_count = await embedding_service.add_cv_to_vector_store(
            user_id=str(user.id),
            collection_id=collection_id,
            cv_data=parsed_data,
            raw_text=parsed_data.get("raw_text", "")
        )
        
        # Update CV record with parsed data
        cv_record.raw_text = parsed_data.get("raw_text", "")
        cv_record.skills = parsed_data.get("skills", [])
        cv_record.experience_years = parsed_data.get("experience_years")
        cv_record.education = parsed_data.get("education", [])
        cv_record.projects = parsed_data.get("projects", [])
        cv_record.work_history = parsed_data.get("experience", [])
        cv_record.status = "completed"
        cv_record.chunks_count = chunks_count
        cv_record.collection_id = collection_id
        cv_record.processed_at = datetime.utcnow()
        
        await db.commit()
        
        return CVUploadResponse(
            success=True,
            message="CV uploaded and processed successfully",
            cv_id=str(cv_record.id),
            sections_found=list(parsed_data.keys())
        )
        
    except Exception as e:
        cv_record.status = "failed"
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to process CV: {str(e)}")


@router.get("/status", response_model=CVStatusResponse)
async def get_cv_status(
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Get the processing status and parsed content of user's CV."""
    user = await get_or_create_user(db, clerk_id)
    
    result = await db.execute(select(CV).where(CV.user_id == user.id))
    cv_record = result.scalar_one_or_none()
    
    if not cv_record:
        raise HTTPException(status_code=404, detail="No CV found. Please upload a CV first.")
    
    return CVStatusResponse(
        cv_id=str(cv_record.id),
        filename=cv_record.filename,
        status=cv_record.status,
        skills=cv_record.skills or [],
        experience_years=cv_record.experience_years,
        education=[e.get("raw", "") for e in (cv_record.education or [])],
        sections={
            "skills": cv_record.skills or [],
            "education": cv_record.education or [],
            "experience": cv_record.work_history or [],
            "projects": cv_record.projects or [],
        },
        processed_at=cv_record.processed_at,
    )


@router.delete("/")
async def delete_cv(
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete user's CV and associated vector data."""
    user = await get_or_create_user(db, clerk_id)
    
    result = await db.execute(select(CV).where(CV.user_id == user.id))
    cv_record = result.scalar_one_or_none()
    
    if not cv_record:
        raise HTTPException(status_code=404, detail="No CV found")
    
    # Delete from ChromaDB
    if cv_record.collection_id:
        await embedding_service.delete_collection(cv_record.collection_id)
    
    # Delete file
    file_path = Path(cv_record.file_path)
    if file_path.exists():
        file_path.unlink()
    
    # Delete record
    await db.delete(cv_record)
    await db.commit()
    
    return {"message": "CV deleted successfully"}


@router.get("/search")
async def search_cv_content(
    query: str,
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """
    Search within user's CV using semantic similarity.
    
    Useful for finding specific experiences, skills, or projects.
    """
    user = await get_or_create_user(db, clerk_id)
    
    result = await db.execute(select(CV).where(CV.user_id == user.id))
    cv_record = result.scalar_one_or_none()
    
    if not cv_record:
        raise HTTPException(status_code=404, detail="No CV found")
    
    if cv_record.status != "completed" or not cv_record.collection_id:
        raise HTTPException(status_code=400, detail="CV not yet processed")
    
    # Search in vector store
    results = await embedding_service.similarity_search(
        collection_id=cv_record.collection_id,
        query=query,
        k=5
    )
    
    return {
        "query": query,
        "results": results,
        "total": len(results)
    }
