import json
import os

from dotenv import load_dotenv
from langchain_ollama import ChatOllama

load_dotenv()

client = ChatOllama(
    model=os.getenv("OLLAMA_MODEL"),
    temperature=0
)


def extract_job_skills(description: str) -> list[str]:

    prompt = f"""
Extract the technical skills from this job description.

Return ONLY valid JSON in this exact format:

{{
    "skills": ["Java", "Spring Boot", "React"]
}}

Rules:
- Include programming languages
- Include frameworks and libraries
- Include databases
- Include cloud technologies
- Include DevOps tools
- Include relevant software technologies
- Do not include soft skills
- Do not include job titles
- Do not include company names
- Remove duplicates

Job description:

{description}
"""

    response = client.invoke(prompt)

    content = response.content

    print("LLM RESPONSE:")
    print(content)

    data = json.loads(content)

    return data["skills"]