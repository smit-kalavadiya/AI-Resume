from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct
from uuid import uuid5, NAMESPACE_URL
from dotenv import load_dotenv
import os

load_dotenv()

client = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))

COLLECTION_NAME = os.getenv("QDRANT_COLLECTION")


from qdrant_client.models import Distance, VectorParams


def create_jobs_collection(vector_size: int):

    collections = client.get_collections().collections

    collection_names = [collection.name for collection in collections]

    if COLLECTION_NAME in collection_names:
        print(f"Collection '{COLLECTION_NAME}' already exists.")
        return

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )

    print(f"Created collection: {COLLECTION_NAME}")


def insert_job(job: dict, embedding: list[float]):

    job_id = job["job_id"]

    point_id = str(uuid5(NAMESPACE_URL, f"adzuna:{job_id}"))

    # Check if point already exists
    existing = client.retrieve(
        collection_name=COLLECTION_NAME,
        ids=[point_id],
        with_payload=False,
        with_vectors=False,
    )

    # Job already exists
    if existing:
        print(f"Skipping existing job: {job_id}")
        return False

    # New job
    point = PointStruct(
        id=point_id,
        vector=embedding,
        payload={
            "source": "adzuna",
            "job_id": job_id,
            **job,
        },
    )

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[point],
    )

    print(f"Inserted job: {job_id}")

    return True


def search_jobs(resume_vector: list[float], limit: int = 50):

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=resume_vector,
        limit=limit,
        score_threshold=0.60,
        with_payload=True,
    )

    jobs = []

    for result in results.points:

        job = result.payload.copy()

        job["match_score"] = round(result.score * 100, 2)

        jobs.append(job)

    return jobs
