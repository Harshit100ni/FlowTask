from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from database import get_session
from models import Project
from schemas import ProjectCreate, ProjectRead

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectRead])
async def list_projects(session: AsyncSession = Depends(get_session)) -> list[ProjectRead]:
    result = await session.execute(select(Project))
    return result.scalars().all()


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(
    data: ProjectCreate, session: AsyncSession = Depends(get_session)
) -> ProjectRead:
    project = Project.model_validate(data)
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project
