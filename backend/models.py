from datetime import date, datetime
from enum import Enum
from typing import List, Optional

from sqlalchemy import Index
from sqlmodel import Field, Relationship, SQLModel


class Priority(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class Status(str, Enum):
    todo = "To Do"
    in_progress = "In Progress"
    done = "Done"


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    tasks: List["Task"] = Relationship(
        back_populates="project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id", ondelete="CASCADE")
    title: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=1000)
    due_date: Optional[date] = Field(default=None)
    priority: Priority
    status: Status = Field(default=Status.todo)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )

    project: Optional[Project] = Relationship(back_populates="tasks")

    __table_args__ = (
        Index("ix_task_project_id", "project_id"),
        Index("ix_task_status", "status"),
        Index("ix_task_priority", "priority"),
        Index("ix_task_project_status", "project_id", "status"),
    )
