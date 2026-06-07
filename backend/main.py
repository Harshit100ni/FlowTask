import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

import models  # noqa: F401 — registers table metadata with SQLModel before create_all
from database import engine

try:
    from routes.projects import router as projects_router
    _projects_available = True
except ImportError:
    _projects_available = False

try:
    from routes.tasks import router as tasks_router
    _tasks_available = True
except ImportError:
    _tasks_available = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield


app = FastAPI(title="FlowTask API", lifespan=lifespan)

_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
allowed_origins = [o.strip() for o in _frontend_url.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

if _projects_available:
    app.include_router(projects_router, prefix="/api/v1")
if _tasks_available:
    app.include_router(tasks_router, prefix="/api/v1")
