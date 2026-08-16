def calculate_skill_match(
    resume_skills: list[str],
    job_skills: list[str]
) -> float:

    resume = {
        skill.lower().strip()
        for skill in resume_skills
    }

    job = {
        skill.lower().strip()
        for skill in job_skills
    }

    if not resume or not job:
        return 0.0

    matched = resume.intersection(job)

    return len(matched) / len(job)



