# AI Resume

AI-powered resume matching tool. Upload a résumé (PDF), and the app extracts its content, embeds it, and semantically matches it against a live pool of job listings pulled from Adzuna — returning a ranked list of the best-fit roles.

> 🚧 **Status: Under Construction** — core pipeline works end-to-end, but the project is still evolving (see [Roadmap](#roadmap)).

## How It Works

```text
Resume PDF
    ↓
Text Extraction (PyMuPDF)
    ↓
Embedding (Ollama — nomic-embed-text)
    ↓
Semantic Search (Qdrant vector DB)
    ↓
Ranked, Scored Job Matches
```

Job listings are pulled from the [Adzuna](https://developer.adzuna.com/) API, cleaned, embedded, and stored in Qdrant. When a résumé is uploaded, its embedding is compared against every stored job vector using cosine similarity, and the top matches (score ≥ 60%) are returned.

## Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) (Python) — REST API
- [PyMuPDF (`fitz`)](https://pymupdf.readthedocs.io/) — PDF text extraction
- [LangChain](https://python.langchain.com/) + [Ollama](https://ollama.com/) — local LLM for skill/title extraction (`qwen3:8b`) and embeddings (`nomic-embed-text`)
- [Qdrant](https://qdrant.tech/) — vector database for semantic job search
- Adzuna API — job listing source
- BeautifulSoup — HTML cleanup of job descriptions

**Frontend**
- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Framer Motion](https://www.framer.com/motion/) — animated intake/scanning/results flow

## Project Structure

```
AI-Resume/
├── backend/
│   ├── main.py                     # FastAPI app entrypoint
│   └── app/
│       ├── router/
│       │   ├── resume_router.py    # POST /resume/upload
│       │   └── jobs_router.py      # GET /jobs/search
│       ├── services/
│       │   ├── resume_services.py  # PDF text extraction, title extraction
│       │   ├── jobs_services.py    # Adzuna fetch + HTML cleaning
│       │   └── qdrant_service.py   # Qdrant collection, insert, search
│       ├── ai/
│       │   ├── llm.py              # Ollama chat model
│       │   ├── embeddings.py       # Ollama embeddings
│       │   └── skill_extractor.py  # LLM-based skill extraction from job descriptions
│       └── tools/
│           └── utility.py          # Skill-match scoring helper
└── frontend/
    └── src/
        ├── App.jsx                 # App shell / stage flow (intake → scanning → results)
        └── components/
            ├── FileIntake.jsx      # Résumé upload UI
            ├── ScanningStage.jsx   # Processing animation
            ├── ResultsBoard.jsx    # Ranked job results
            ├── JobCard.jsx         # Individual job result card
            └── StampBadge.jsx      # Match-score badge
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.com/) running locally, with the models pulled:
  ```bash
  ollama pull qwen3:8b
  ollama pull nomic-embed-text
  ```
- A [Qdrant](https://qdrant.tech/) instance (cloud or self-hosted)
- An [Adzuna API](https://developer.adzuna.com/) app ID/key

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install fastapi uvicorn python-multipart python-dotenv pymupdf \
            langchain langchain-ollama qdrant-client requests beautifulsoup4 pandas
```

Create `backend/.env`:

```
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
OLLAMA_MODEL=qwen3:8b
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
QDRANT_COLLECTION=jobs
```

Run the API:

```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```
VITE_API_ENDPOINT=http://127.0.0.1:8000/resume/upload
```

Run the dev server:

```bash
npm run dev
```

## API

| Method | Endpoint          | Description                                                                                    |
|--------|-------------------|--------------------------------------------------------------------------------------------------|
| `POST` | `/resume/upload`  | Upload a PDF résumé; returns ranked, scored job matches.                                        |
| `GET`  | `/jobs/search`     | Fetches jobs from Adzuna, embeds and stores them in Qdrant (optional `city`, `role` filters).   |

> Populate the job index by hitting `/jobs/search` before uploading a résumé — otherwise there's nothing to match against yet.

## Roadmap

- [ ] Add screenshots / demo once UI is finalized
- [ ] Skill-level match breakdown (backend has a `calculate_skill_match` helper not yet wired into the API)
- [ ] Resume title/skill extraction (`extract_resume_titles`) isn't yet used in the upload flow
- [ ] Error handling / validation polish
- [ ] Deployment instructions

## Notes

- Uploaded résumés are processed in-memory for matching only and are not stored.
- `backend/.env` holds live API keys — it's already gitignored; never commit it.

## License

*(Add a license, e.g. MIT)*