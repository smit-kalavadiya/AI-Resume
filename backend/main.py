from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.router.resume_router import resume_router
from app.router.jobs_router import jobs_router
from app.services.qdrant_service import create_jobs_collection


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Initializing Qdrant...")

    create_jobs_collection(
        vector_size=768
    )

    print("Qdrant initialization complete.")

    yield


app = FastAPI(
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(resume_router)
app.include_router(jobs_router)