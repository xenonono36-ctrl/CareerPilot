# PRD.md — CareerPilot

**Your Agentic Career Co-pilot**
Hackathon Project PRD based on the official Codesprint problem statement 

---

# Product Requirements Document (PRD)

## 1. Product Overview

### Product Name

**CareerPilot**

### Tagline

*An AI-powered career co-pilot that understands users, hunts opportunities, tracks progress, and guides career growth.*

### Problem Statement

Job seekers currently struggle with:

* Scattered job platforms
* Generic AI tools without user context
* Poor visibility into skill gaps
* No centralized application tracking
* Lack of personalized career guidance

CareerPilot solves this by creating a unified AI-driven platform grounded in the user's actual CV using a Retrieval-Augmented Generation (RAG) architecture. 

---

# 2. Vision

Build an intelligent career operating system that:

* Understands the user's professional background
* Finds relevant jobs automatically
* Computes real fit scores
* Drafts personalized applications
* Creates learning roadmaps
* Tracks progress and accountability

---

# 3. Goals & Objectives

## Primary Goals

1. Create a working AI career assistant
2. Implement CV-grounded RAG architecture
3. Enable intelligent job matching
4. Improve user productivity during job search
5. Deliver an end-to-end career workflow

## Success Metrics

| Metric                     | Target               |
| -------------------------- | -------------------- |
| CV Processing Success Rate | >95%                 |
| Fit Score Accuracy         | Meaningful relevance |
| Job Search Response Time   | <10 sec              |
| Chat Response Time         | <5 sec               |
| Task Completion Tracking   | Functional           |
| Demo Flow Completion       | 100%                 |

---

# 4. Target Users

## Primary Users

* University students
* Fresh graduates
* Internship seekers
* Junior software engineers
* Career switchers

## User Personas

### Persona 1 — CS Student

Needs internships, roadmap guidance, and CV improvement.

### Persona 2 — Fresh Graduate

Needs job matching and application tracking.

### Persona 3 — Career Switcher

Needs skill-gap analysis and learning plans.

---

# 5. Core Features (The Four Pillars)

---

# Pillar 1 — Job Hunter Agent

## Description

AI agent that actively searches and recommends jobs based on the user's CV and intent. 

## Features

* Natural language job search
* Live job fetching
* Structured job cards
* Match explanations
* Fit score generation

## Example Input

> “Find me ML internships in Dhaka open this month”

## Example Output

* Role
* Company
* Salary
* Deadline
* Location
* Fit Score
* Match Reasoning

## Functional Requirements

* Integrate at least one external job source API/scraper
* Parse job descriptions
* Match CV skills with job requirements
* Rank opportunities

## Suggested APIs

* LinkedIn scraping
* RapidAPI job APIs
* Adzuna API
* JSearch API

---

# Pillar 2 — Resume Intelligence (RAG Core)

## Description

Central intelligence layer powered by user CV embeddings. 

## Features

* PDF/DOCX upload
* CV parsing
* Semantic chunking
* Embedding generation
* Vector search retrieval

## Processing Pipeline

```text
Upload CV
   ↓
Extract Text
   ↓
Chunk by Sections
   ↓
Generate Embeddings
   ↓
Store in Vector DB
   ↓
Use in RAG Queries
```

## Functional Requirements

* Support PDF and DOCX
* Extract sections:

  * Skills
  * Experience
  * Education
  * Projects
* Store embeddings in vector database
* Enable semantic retrieval

## Suggested Stack

| Layer      | Recommendation                          |
| ---------- | --------------------------------------- |
| Parsing    | PyMuPDF / pdfplumber                    |
| Embeddings | OpenAI / Gemini / Sentence Transformers |
| Vector DB  | Pinecone / ChromaDB / FAISS             |
| Backend    | FastAPI / Node.js                       |

---

# Pillar 3 — Personal AI Assistant

## Description

Conversational AI assistant with persistent session memory and CV awareness. 

## Supported Queries

* Job readiness analysis
* Skill gap analysis
* Learning roadmap generation
* Cover letter drafting
* Interview preparation

## Example Use Cases

### Readiness Query

> “Am I ready for this Data Engineer role?”

### Skill Gap Query

> “What skills am I missing for a Google internship?”

### Roadmap Query

> “Create a 3-month roadmap to become job-ready.”

### Cover Letter Query

> “Draft a cover letter for this posting.”

## Functional Requirements

* Session memory
* RAG-grounded answers
* Context-aware conversation
* Personalized responses
* Tool calling support

## AI Capabilities

| Capability              | Required |
| ----------------------- | -------- |
| Conversational Memory   | Yes      |
| RAG Retrieval           | Yes      |
| Cover Letter Generation | Yes      |
| Skill Analysis          | Yes      |
| Roadmap Planning        | Yes      |

---

# Pillar 4 — Productivity & Progress Tracker

## Description

Career accountability and productivity management system. 

## Features

### Calendar

* Deadlines
* Interview reminders
* Goal schedules

### To-Do System

* Daily tasks
* Weekly goals
* Goal completion

### Kanban Tracker

Columns:

* Applied
* Interviewing
* Offer
* Rejected

### Dashboard

Metrics:

* Applications submitted
* Skills learned
* Progress %
* Activity streak

### AI Nudges

Examples:

* “You haven’t applied this week.”
* “3 matching openings found.”

## Functional Requirements

* Calendar UI
* Task CRUD
* Kanban drag/drop
* Persistent progress tracking

---

# 6. System Architecture

## High-Level Architecture

```text
Frontend (Next.js/React)
        ↓
Backend API (FastAPI/Node)
        ↓
RAG Service Layer
 ├── CV Parser
 ├── Embedding Service
 ├── Vector Database
 └── LLM Orchestrator
        ↓
External Services
 ├── Job APIs
 ├── LLM APIs
 └── Notification Services
```

---

# 7. Fit Score Algorithm

## Objective

Programmatically compute compatibility between CV and job posting. 

## Scoring Factors

| Factor             | Weight |
| ------------------ | ------ |
| Skill Match        | 40%    |
| Experience Match   | 25%    |
| Education Match    | 15%    |
| Project Relevance  | 10%    |
| Keyword Similarity | 10%    |

## Example Formula

\text{Fit Score}=0.4(S)+0.25(E)+0.15(Ed)+0.1(P)+0.1(K)

Where:

* S = Skill Match
* E = Experience Match
* Ed = Education Match
* P = Project Relevance
* K = Keyword Similarity

---

# 8. User Flow

## Primary Flow

```text
User Signup
   ↓
Upload CV
   ↓
CV Processed into Vector DB
   ↓
Search Jobs
   ↓
Receive Recommendations
   ↓
Check Fit Score
   ↓
Ask AI Assistant
   ↓
Generate Cover Letter
   ↓
Track Applications
   ↓
Monitor Progress Dashboard
```

---

# 9. Technical Requirements

## Frontend

* Responsive UI
* Authentication
* Dashboard
* Chat Interface
* Kanban Board

## Backend

* REST API
* File Upload Service
* Vector Search
* Job Search Integration
* AI Orchestration

## Database

| Data Type    | Storage    |
| ------------ | ---------- |
| Users        | PostgreSQL |
| Tasks        | PostgreSQL |
| Applications | PostgreSQL |
| Embeddings   | Vector DB  |

---

# 10. Non-Functional Requirements

| Requirement  | Target               |
| ------------ | -------------------- |
| Scalability  | 10k+ users           |
| Availability | 99%                  |
| Security     | Secure file handling |
| Performance  | Fast retrieval       |
| UX           | Clean and intuitive  |

---

# 11. Recommended Tech Stack

| Layer            | Tech               |
| ---------------- | ------------------ |
| Frontend         | Next.js + Tailwind |
| Backend          | FastAPI            |
| AI Orchestration | LangChain          |
| Vector DB        | Pinecone / Chroma  |
| LLM              | OpenAI / Gemini    |
| Database         | PostgreSQL         |
| Deployment       | Vercel + Railway   |

---

# 12. MVP Scope (Hackathon Build)

## Must Have

* CV upload
* RAG pipeline
* Job search
* Fit scoring
* AI chat
* Cover letter generation
* Calendar
* Kanban tracker
* Dashboard

## Nice To Have

* Notifications
* Email reminders
* Browser extension
* Resume builder
* AI interview simulation

---

# 13. Deliverables Checklist

## Required

* Working application
* Public GitHub repo
* README.md
* Architecture diagram
* 5-minute demo video

## Bonus

* Live deployment
* System design document
* Evaluation suite

---

# 14. Risks & Challenges

| Risk                      | Mitigation                      |
| ------------------------- | ------------------------------- |
| Poor CV parsing           | Use robust extraction libraries |
| Hallucinated AI responses | Strict RAG grounding            |
| Slow search               | Caching + async APIs            |
| Weak job data             | Multiple APIs/scrapers          |
| Vector search latency     | Efficient indexing              |

---

# 15. Future Enhancements

* AI mock interviews
* LinkedIn integration
* Resume auto-optimization
* Company culture matching
* Salary prediction
* Multi-agent orchestration
* Email automation

---

# 16. Demo Scenario

## Required Demo Flow 

1. Upload CV
2. Process embeddings
3. Search jobs
4. View fit score
5. Ask AI assistant
6. Generate cover letter
7. Add application to tracker
8. Show progress dashboard

---

# 17. Final Product Statement

CareerPilot is not just another chatbot — it is an intelligent, proactive career operating system that deeply understands the user and actively helps them become job-ready.

It combines:

* AI agents
* RAG architecture
* Productivity tooling
* Career planning
* Real-world job intelligence

into one unified platform.
