// SECURITY: never trust a network response's shape just because the
// request succeeded. A compromised backend, a misconfigured proxy, or a
// man-in-the-middle on a misconfigured (non-TLS) connection could return
// something unexpected. We validate structure and coerce types before
// anything from this payload reaches React state or the DOM. React
// escapes text content by default (no dangerouslySetInnerHTML is used
// anywhere in this app), so this is defense in depth against malformed
// or malicious data, not a substitute for that escaping.
const MAX_JOBS_RENDERED = 100;

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateMatchResponse(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Unexpected response from server.");
  }

  if (!Array.isArray(data.jobs)) {
    throw new Error("Unexpected response shape from server.");
  }

  const jobs = data.jobs.slice(0, MAX_JOBS_RENDERED).map((job, i) => {
    if (!job || typeof job !== "object") {
      throw new Error(`Malformed job entry at index ${i}.`);
    }

    const id = String(job.id ?? "");
    const title = String(job.title ?? "Untitled role");
    const score = Number(job.score);
    const matchPercentage = String(job.match_percentage ?? "");
    const applyLink = String(job.apply_link ?? "");

    return {
      id,
      title,
      score: Number.isFinite(score) ? score : 0,
      match_percentage: matchPercentage,
      // Reject anything that isn't a plain http(s) URL — guards against
      // a "javascript:" or "data:" URL ending up in an href.
      apply_link: isSafeHttpUrl(applyLink) ? applyLink : "",
    };
  });

  const totalJobs = Number.isFinite(Number(data.total_jobs)) ? Number(data.total_jobs) : jobs.length;

  return { total_jobs: totalJobs, jobs };
}
