from fastapi import APIRouter
from app.services.qdrant_service import insert_job
from app.services.jobs_services import fetch_adzuna_jobs
from app.ai.embeddings import create_embedding

jobs_router = APIRouter(prefix="/jobs", tags=["Jobs"])


@jobs_router.get("/search")
async def search_jobs(city: str | None = None, role: str | None = None):
    jobs = fetch_adzuna_jobs()

    for job in jobs:
        description = job.get("description")
        embeddings = create_embedding(description)
        insert_job(job, embeddings)

    return {"jobs": len(jobs)}

