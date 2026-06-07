from datetime import date, datetime
from typing import Optional

from sqlmodel import Field, SQLModel

from models import Priority, Status


class ProjectCreate(SQLModel):
    name: str = Field(min_length=1)
    description: Optional[str] = None


class ProjectUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectRead(SQLModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime


class TaskCreate(SQLModel):
    project_id: int
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: Priority
    status: Status = Status.todo


class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None


class TaskRead(SQLModel):
    id: int
    project_id: int
    title: str
    description: Optional[str]
    due_date: Optional[date]
    priority: Priority
    status: Status
    created_at: datetime
    updated_at: datetime
