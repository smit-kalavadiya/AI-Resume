import html
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import os
import pandas as pd
from pathlib import Path

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = BASE_DIR / "dataset" / "job_descriptions.csv"

app_id = os.getenv("ADZUNA_APP_ID")
app_key = os.getenv("ADZUNA_APP_KEY")


def clean_job_content(content: str) -> str:

    # 1. Decode HTML entities
    content = html.unescape(content)
    # 2. Parse HTML
    soup = BeautifulSoup(content, "html.parser")

    # 3. Remove unnecessary tags
    for tag in soup(["script", "style"]):
        tag.decompose()

    # 4. Convert HTML to plain text
    text = soup.get_text(separator="\n")

    # 5. Clean whitespace
    lines = []

    for line in text.splitlines():

        line = line.strip()

        if line:
            lines.append(line)

    # 6. Join everything
    cleaned = "\n".join(lines)

    return cleaned


def fetch_adzuna_jobs(city: str | None = None, role: str | None = None) -> list[dict]:

    all_jobs = {}
    results_per_page = 50
    page = 1

    while True:

        url = f"https://api.adzuna.com/v1/api/jobs/ca/search/{page}"

        params = {
            "app_id": app_id,
            "app_key": app_key,
            "results_per_page": results_per_page,
            "content-type": "application/json",
        }

        if role:
            params["what"] = role

        if city:
            params["where"] = city

        response = requests.get(
            url,
            params=params,
            timeout=30,
        )

        response.raise_for_status()

        data = response.json()

        jobs = data.get("results", [])

        if not jobs:
            print(f"No jobs returned on page {page}.")
            break

        new_jobs = 0

        for job in jobs:

            job_id = job.get("id")

            if not job_id:
                continue

            job_id = str(job_id)

            if job_id not in all_jobs:

                all_jobs[job_id] = job
                new_jobs += 1

        print(
            f"Page {page}: "
            f"{len(jobs)} jobs | "
            f"New: {new_jobs} | "
            f"Unique total: {len(all_jobs)}"
        )

        # Adzuna is returning results,
        # but none of them are new.
        if new_jobs == 0:

            print(f"No new jobs found on page {page}. " f"Stopping.")

            break

        page += 1

    print(f"Total unique jobs: {len(all_jobs)}")

    return list(all_jobs.values())


    all_jobs = []

    print(f"Loading dataset from: {DATASET_PATH}")

    for chunk in pd.read_csv(
        DATASET_PATH,
        chunksize=5000
    ):
        chunk = chunk.fillna("")

        jobs = chunk.rename(columns={
            "Job Id": "job_id",
            "Job Title": "job_title",
            "Company": "company_name",
            "location": "location",
            "Country": "country",
            "latitude": "latitude",
            "longitude": "longitude",
            "Work Type": "work_type",
            "Company Size": "company_size",
            "Job Posting Date": "posting_date",
            "Contact Person": "contact_person",
            "Contact": "contact",
            "Role": "role",
            "Job Portal": "job_portal",
            "Job Description": "description",
            "Benefits": "benefits",
            "skills": "skills",
            "Responsibilities": "responsibilities",
            "Company Profile": "company_profile",
        })

        all_jobs.extend(jobs.to_dict("records"))

    print(f"Total dataset jobs: {len(all_jobs)}")

    return all_jobs
