"""Task management routes."""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.auth import get_current_clerk_id
from app.models import Task, User
from app.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse

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


@router.get("", response_model=TaskListResponse)
async def get_tasks(
    category: Optional[str] = None,
    completed: Optional[bool] = None,
    priority: Optional[str] = None,
    limit: int = Query(default=50, ge=1, le=100),
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Get all tasks for the current user."""
    user = await get_or_create_user(db, clerk_id)
    
    # Build query
    query = select(Task).where(Task.user_id == user.id)
    
    if category:
        query = query.where(Task.category == category)
    if completed is not None:
        query = query.where(Task.completed == completed)
    if priority:
        query = query.where(Task.priority == priority)
    
    query = query.order_by(Task.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    tasks = result.scalars().all()
    
    # Calculate stats
    total = len(tasks)
    pending = sum(1 for t in tasks if not t.completed)
    completed_count = sum(1 for t in tasks if t.completed)
    
    return TaskListResponse(
        tasks=[TaskResponse.model_validate(t) for t in tasks],
        total=total,
        pending=pending,
        completed=completed_count
    )


@router.post("", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Create a new task."""
    user = await get_or_create_user(db, clerk_id)
    
    task = Task(
        user_id=user.id,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority.value,
        category=task_data.category,
        due_date=task_data.due_date,
        completed=task_data.completed
    )
    
    db.add(task)
    await db.commit()
    await db.refresh(task)
    
    return TaskResponse.model_validate(task)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific task."""
    user = await get_or_create_user(db, clerk_id)
    
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user.id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return TaskResponse.model_validate(task)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing task."""
    user = await get_or_create_user(db, clerk_id)
    
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user.id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update fields
    update_data = task_data.model_dump(exclude_unset=True)
    
    # Convert priority enum to string
    if "priority" in update_data and update_data["priority"]:
        update_data["priority"] = update_data["priority"].value
    
    # Track completion
    if update_data.get("completed") and not task.completed:
        update_data["completed_at"] = datetime.utcnow()
    elif not update_data.get("completed", task.completed):
        update_data["completed_at"] = None
    
    for key, value in update_data.items():
        setattr(task, key, value)
    
    await db.commit()
    await db.refresh(task)
    
    return TaskResponse.model_validate(task)


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Delete a task."""
    user = await get_or_create_user(db, clerk_id)
    
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user.id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.delete(task)
    await db.commit()
    
    return {"message": "Task deleted successfully"}


@router.post("/{task_id}/toggle")
async def toggle_task_completion(
    task_id: int,
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Toggle task completion status."""
    user = await get_or_create_user(db, clerk_id)
    
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user.id)
    )
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.completed = not task.completed
    task.completed_at = datetime.utcnow() if task.completed else None
    
    await db.commit()
    await db.refresh(task)
    
    return {
        "task_id": task.id,
        "completed": task.completed,
        "message": "Task marked as completed" if task.completed else "Task marked as pending"
    }


@router.get("/stats/summary")
async def get_task_stats(
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Get task statistics for dashboard."""
    user = await get_or_create_user(db, clerk_id)
    
    # Get all tasks
    result = await db.execute(
        select(Task).where(Task.user_id == user.id)
    )
    tasks = result.scalars().all()
    
    # Calculate stats
    by_category = {}
    by_priority = {}
    overdue = 0
    
    today = datetime.utcnow().date()
    
    for task in tasks:
        # By category
        cat = task.category or "general"
        by_category[cat] = by_category.get(cat, 0) + 1
        
        # By priority
        pri = task.priority or "medium"
        by_priority[pri] = by_priority.get(pri, 0) + 1
        
        # Overdue check
        if task.due_date and not task.completed:
            if task.due_date.date() < today:
                overdue += 1
    
    return {
        "total": len(tasks),
        "completed": sum(1 for t in tasks if t.completed),
        "pending": sum(1 for t in tasks if not t.completed),
        "overdue": overdue,
        "by_category": by_category,
        "by_priority": by_priority
    }


@router.post("/bulk")
async def create_bulk_tasks(
    tasks_data: List[TaskCreate],
    clerk_id: str = Depends(get_current_clerk_id),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple tasks at once."""
    user = await get_or_create_user(db, clerk_id)
    
    created_tasks = []
    
    for task_data in tasks_data:
        task = Task(
            user_id=user.id,
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority.value,
            category=task_data.category,
            due_date=task_data.due_date,
            completed=task_data.completed
        )
        db.add(task)
        created_tasks.append(task)
    
    await db.commit()
    
    # Refresh all tasks
    for task in created_tasks:
        await db.refresh(task)
    
    return {
        "created": len(created_tasks),
        "tasks": [TaskResponse.model_validate(t) for t in created_tasks]
    }
