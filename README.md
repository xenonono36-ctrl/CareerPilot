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
├── railway.json       # Railway deployment config
├── docker-compose.yml # Local development setup (optional)
└── PRD.MD             # Product requirements document
```

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL (Railway hosted for production, local for dev)
- Clerk account for auth
- Gemini API key
- JSearch API key (RapidAPI)

### Backend Setup

```bash
cd backend

# Create and activate virtual environment (optional)
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate    # Linux/Mac

pip install -r requirements.txt

# Create .env file with your API keys (see Environment Variables below)

# Run the server
python -m uvicorn app.main:app --reload --port 8000
```

**Note:** The backend will start even without a database connection (for local dev without Railway access).

### Frontend Setup

```bash
cd frontend
npm install

# Create .env.local with your keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=http://localhost:8000

npm run dev
```

**Access Points:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

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
Create this file in the `backend/` directory:
```env
# AI Services
GEMINI_API_KEY=your_gemini_api_key

# Authentication (Clerk)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Job Search API
JSEARCH_API_KEY=your_jsearch_api_key
JSEARCH_HOST=jsearch.p.rapidapi.com

# Database (Railway PostgreSQL - asyncpg driver required)
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database
```

### Frontend (.env.local)
Create this file in the `frontend/` directory:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
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

## Docker Setup (Optional)

For local development with all services:

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Note:** The backend uses Railways hosted PostgreSQL by default. For local development:
1. Update `DATABASE_URL` in `backend/.env` to your local PostgreSQL connection string
2. Ensure the URL uses `postgresql+asyncpg://` format for async support

## ChromaDB Setup (Optional)

For CV vector search locally:

```bash
# Run ChromaDB in Docker
docker run -d -p 8001:8000 chromadb/chroma

# Or use the embedded ChromaDB (no server needed)
# This is enabled by default in embedding_service.py
```

**Access:** http://localhost:8001 (if using Docker)