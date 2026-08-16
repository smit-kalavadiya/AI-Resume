from fastapi import APIRouter, UploadFile, File, HTTPException
from app.ai.embeddings import create_embedding
from app.services.resume_services import extract_text_from_pdf
from app.services.qdrant_service import search_jobs

resume_router = APIRouter(prefix="/resume", tags=["Resume"])


@resume_router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    # 1. Extract resume text
    resume_text = extract_text_from_pdf(await file.read())

    # 4. Resume → embedding
    resume_vector = create_embedding(resume_text)

    matched_jobs = search_jobs(resume_vector, 50)

    # 8. Return ranked jobs
    return {"total_jobs": len(matched_jobs), "jobs": matched_jobs}
