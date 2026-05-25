# CareerPilot

An AI-powered career co-pilot that understands users, hunts opportunities, tracks progress, and guides career growth.

## Tech Stack

- **Frontend**: Next.js 15, TailwindCSS, shadcn/ui, Zustand, Clerk Auth
- **Backend**: FastAPI, LangChain, Gemini API, ChromaDB, PostgreSQL
- **Deployment**: Vercel (frontend), Railway (backend)

## Project Structure

```
CareerPilot/
├── frontend/          # Next.js 15 App Router frontend
├── backend/           # FastAPI backend with RAG pipeline
└── docker-compose.yml # Local development setup
```

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL (or use Railway)
- Clerk account for auth
- Gemini API key

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Create .env
cp .env.example .env
# Fill in your API keys

uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

npm run dev
```

## Features

### Pillar 1 — Job Hunter Agent
- Natural language job search
- Live job fetching via JSearch API
- Fit score generation

### Pillar 2 — Resume Intelligence (RAG Core)
- PDF/DOCX upload and parsing
- Semantic chunking and embeddings
- ChromaDB vector storage

### Pillar 3 — Personal AI Assistant
- CV-grounded conversational AI
- Cover letter generation
- Skill gap analysis

### Pillar 4 — Productivity Tracker
- Kanban board for applications
- Calendar with deadlines
- Progress dashboard

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cv/upload` | Upload and process CV |
| GET | `/api/cv/status` | Check CV processing status |
| POST | `/api/jobs/search` | Search jobs with natural language |
| GET | `/api/jobs/{id}/score` | Get fit score for job |
| POST | `/api/chat` | Send message to AI assistant |
| GET | `/api/tasks` | Get user's tasks |
| POST | `/api/tasks` | Create new task |
| PATCH | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| GET | `/api/applications` | Get application tracker |
| POST | `/api/applications` | Add application to tracker |
| PATCH | `/api/applications/{id}` | Update application status |

## Environment Variables

### Backend (.env)
```
GEMINI_API_KEY=your_gemini_key
DATABASE_URL=postgresql://user:pass@host:5432/careerpilot
CLERK_SECRET_KEY=your_clerk_secret
JSEARCH_API_KEY=your_jsearch_key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## License

MIT

---

## Fit Score Algorithm

The fit score is calculated using weighted factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| Skills Match | 40% | Skills extracted from CV vs job requirements |
| Experience | 25% | Years of experience match |
| Education | 15% | Educational background fit |
| Projects | 10% | Project relevance |
| Keywords | 10% | Keyword frequency matching |

## Docker Setup

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- ChromaDB: http://localhost:8001