import json
import fitz
from app.ai.llm import llm
import json
import os

from dotenv import load_dotenv
from langchain_ollama import ChatOllama


load_dotenv()

client = ChatOllama(
    model=os.getenv("OLLAMA_MODEL"),
    temperature=0
)


def extract_text_from_pdf(pdf_bytes):
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        text = []

        for page in doc:
            page_text = page.get_text("text")

            if page_text.strip():
                text.append(page_text)

    resume_text = "\n".join(text)
    return resume_text


def extract_resume_titles(resume_text: str) -> list[str]:

    prompt = f"""
Extract the professional job titles/roles from this resume.

Return ONLY valid JSON in this exact format:

{{
    "titles": [
        "Full Stack Developer",
        "Software Developer"
    ]
}}

Rules:
- Include current and previous professional job titles.
- Include relevant technical roles.
- Do not include company names.
- Do not include degree names.
- Do not include certifications.
- Do not include skills.
- Remove duplicates.
- Keep titles concise.

Resume:

{resume_text}
"""

    response = client.invoke(prompt)

    content = response.content.strip()

    print("TITLE LLM RESPONSE:")
    print(content)

    try:
        data = json.loads(content)
        return data.get("titles", [])

    except json.JSONDecodeError:
        return []
