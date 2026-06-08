# CareerPilot — Production Deployment Guide

This guide walks you through deploying the **Next.js frontend** to **Vercel** and the **FastAPI backend** to **Railway** (or Render), with **Clerk** for auth and **PostgreSQL + ChromaDB** for data.

> ✅ The codebase is already production-ready: no `demo_user` fallbacks, all frontend pages wired to real `/api/*` endpoints, Clerk JWT verification via JWKS, and a complete set of deployment configs (`vercel.json`, `railway.json`, `render.yaml`, `docker-compose.yml`).

---

## 0. Prerequisites

| Service | Free tier | What you need |
|---|---|---|
| [Clerk](https://dashboard.clerk.com) | ✅ | Publishable key + Secret key + Production instance |
| [Google AI Studio](https://aistudio.google.com/app/apikey) | ✅ | Gemini API key (`GEMINI_API_KEY`) |
| [RapidAPI JSearch](https://rapidapi.com/letscrape/api/jsearch) | ✅ (limited) | `X-RapidAPI-Key` for live job search |
| [Vercel](https://vercel.com) | ✅ | GitHub-connected account |
| [Railway](https://railway.app) **or** [Render](https://render.com) | ✅ ($5/mo credit) | GitHub-connected account |
| GitHub repo | ✅ | Push the project to a private/public repo |

---

## 1. Clerk Setup (Production instance)

1. Go to **dashboard.clerk.com → Create application → Production**.
2. Enable the auth methods you want (Email, Google, GitHub, etc.).
3. In **API Keys**, copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_live_…`)
   - `CLERK_SECRET_KEY` (starts with `sk_live_…`)
4. In **JWT Templates**, note the **Frontend API URL** (e.g. `https://career-pilot-12.clerk.accounts.dev`). You'll use this as `CLERK_JWT_ISSUER` on the backend.
5. *(Optional but recommended)* Set up a webhook → backend endpoint to keep user records in sync.

---

## 2. Backend → Railway

### 2.1 Create the project

1. Go to [railway.app/new](https://railway.app/new) → **Deploy from GitHub repo**.
2. Select the `CareerPilot` repo.
3. Railway auto-detects `railway.json` and uses the **Nixpacks Python 3.11** builder.

### 2.2 Add a PostgreSQL database

1. In the same project → **+ New → Database → PostgreSQL**.
2. Click the database service → **Variables** tab → copy `DATABASE_URL`.

### 2.3 Add a ChromaDB service

ChromaDB is **stateful** (stores CV embeddings). Two options:

- **Option A — Hosted Chroma** (easiest): sign up at [trychroma.com](https://www.trychroma.com/), copy the URL into `CHROMA_HOST`.
- **Option B — Run Chroma on Railway**:
  1. **+ New → GitHub Repo** → point to `chroma-core/chroma` Docker image (`https://github.com/chroma-core/chroma`).
  2. Expose port `8000`. Set `IS_PERSISTENT=TRUE` and mount a volume at `/chroma`.
  3. Use the Railway-generated URL as `CHROMA_HOST` (e.g. `http://chroma.railway.internal:8000`).

### 2.4 Configure environment variables

On the **backend** service → **Variables**, set:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `${Postgres.DATABASE_URL}` (reference) — Railway auto-converts the `postgresql://` URL to `postgresql+asyncpg://` if you add `?sslmode=require`. Otherwise set it manually using the **Internal** connection string with asyncpg. |
| `GEMINI_API_KEY` | `AIza…` (from Google AI Studio) |
| `CLERK_PUBLISHABLE_KEY` | `pk_live_…` |
| `CLERK_SECRET_KEY` | `sk_live_…` |
| `CLERK_JWT_ISSUER` | `https://<your-clerk-frontend-api>` (e.g. `https://career-pilot-12.clerk.accounts.dev`) |
| `JSEARCH_API_KEY` | `…` (from RapidAPI) |
| `JSEARCH_HOST` | `jsearch.p.rapidapi.com` |
| `CHROMA_HOST` | `http://chroma.railway.internal:8000` (or your hosted URL) |
| `FRONTEND_URL` | `https://<your-app>.vercel.app` (set this in step 3) |
| `ENVIRONMENT` | `production` |
| `DEBUG` | `false` |
| `PORT` | *Railway sets this automatically — leave blank.* |

> **Tip:** use Railway's **Reference Variables** to pull `DATABASE_URL` from the Postgres service. The Python `Settings` class reads `DATABASE_URL` directly, so for **asyncpg** you need the `postgresql+asyncpg://` scheme. If Railway's `DATABASE_URL` is plain `postgresql://`, just set `DATABASE_URL` manually to the internal connection string with the asyncpg driver prepended.

### 2.5 Verify the deploy

1. Wait for the build → service should show **Deployed**.
2. Click **Open in browser** on the Railway service. You should see:
   ```
   {"message":"CareerPilot API","version":"1.0.0","status":"healthy"}
   ```
3. Test auth: `curl https://<railway-url>/api/v1/health` → `{"status":"healthy"}`.

---

## 3. Frontend → Vercel

### 3.1 Import the project

1. Go to [vercel.com/new](https://vercel.com/new) → **Import** the `CareerPilot` repo.
2. Set **Root Directory** to `frontend` (Vercel auto-detects Next.js, but make sure it points at the `frontend/` folder).
3. Framework preset: **Next.js** (auto).

### 3.2 Environment variables

In **Settings → Environment Variables** (Production, Preview, Development), add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_…` |
| `CLERK_SECRET_KEY` | `sk_live_…` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `NEXT_PUBLIC_API_URL` | `https://<your-railway-service>.up.railway.app` (no trailing slash) |

### 3.3 Deploy

1. Click **Deploy**. Build takes ~1–2 min.
2. After success, Vercel gives you `https://careerpilot-xxx.vercel.app`.

### 3.4 Wire Clerk to your Vercel domain

1. In Clerk dashboard → **Domains** → add `careerpilot-xxx.vercel.app` (and your custom domain if you have one).
2. Copy the **Frontend API URL** (e.g. `clerk.careerpilot.com` or `career-pilot-12.clerk.accounts.dev`).
3. Go back to **Railway backend → Variables** and update:
   - `CLERK_JWT_ISSUER` = that Frontend API URL
   - `FRONTEND_URL` = `https://careerpilot-xxx.vercel.app`
4. **Redeploy** the backend service (Railway → service → Deployments → ⋯ → Redeploy).

### 3.5 CORS check

The backend reads `FRONTEND_URL` to allow CORS. If you see CORS errors in the browser console, double-check:
- `FRONTEND_URL` matches the **exact** origin (no trailing slash, includes `https://`).
- Backend was redeployed after the change.

---

## 4. Local development

For local dev with the same envs, just copy the example files and point at localhost:

```powershell
# Backend
cd backend
Copy-Item .env.example .env
# edit .env: DATABASE_URL stays as localhost, GEMINI_API_KEY/CLERK keys = your test keys

# Frontend
cd ../frontend
Copy-Item .env.example .env.local
# edit .env.local: NEXT_PUBLIC_API_URL=http://localhost:8000, Clerk test keys

# Run everything with Docker (Postgres + Chroma + Backend)
cd ..
docker-compose up
# In a second terminal:
cd frontend
npm install --legacy-peer-deps
npm run dev
```

App will be at `http://localhost:3000`, API at `http://localhost:8000`.

---

## 5. Render alternative (instead of Railway)

The repo already has a `render.yaml` "Infrastructure as Code" file. To use it:

1. Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints) → **New Blueprint Instance**.
2. Point at the `CareerPilot` repo.
3. Render auto-creates:
   - `careerpilot-postgres` (PostgreSQL)
   - `careerpilot-backend` (FastAPI web service, root `backend/`)
4. Fill in the **sync: false** env vars manually (`DATABASE_URL`, `GEMINI_API_KEY`, `CLERK_SECRET_KEY`, etc.).
5. For ChromaDB on Render, use the **Render Docker** service type pointing at `chromadb/chroma:latest`, or use [trychroma.com](https://www.trychroma.com) and set `CHROMA_HOST` accordingly.

The Vercel steps above are identical when using Render for the backend.

---

## 6. Post-deploy verification checklist

- [ ] `https://<backend>.up.railway.app/api/v1/health` returns `{"status":"healthy"}`
- [ ] Vercel build succeeds (check `vercel.json` headers applied)
- [ ] Clerk sign-up works on the live URL → user is created
- [ ] CV upload parses + creates embeddings (check ChromaDB logs / collection count)
- [ ] Job search returns results (JSearch quota not exhausted)
- [ ] Chat endpoint responds with streaming/non-streaming reply
- [ ] All 9 routes in the Vercel build output load (`, `/dashboard`, `/applications`, `/chat`, `/cv`, `/jobs/search`, `/tasks`, `/sign-in/*`, `/sign-up/*`)

---

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| `401 Missing bearer token` on every API call | Frontend can't read Clerk session — check `CLERK_SECRET_KEY` in Vercel env, then redeploy. |
| `401 Invalid or expired session` | `CLERK_JWT_ISSUER` on backend doesn't match Clerk Frontend API URL. Copy it from Clerk → API Keys → Advanced → "Show URLs". |
| `503 Auth provider unavailable` on backend | Backend can't reach Clerk's JWKS endpoint. Check `CLERK_JWT_ISSUER` value and that the service has outbound network. |
| CORS error in browser console | `FRONTEND_URL` on backend must match the **exact** Vercel origin (no trailing slash, `https://`). |
| CV upload returns 500 | ChromaDB unreachable. Check `CHROMA_HOST` and that the Chroma service is running. |
| `pg_isready` fails on Postgres healthcheck | Use Railway/Render's **Internal** connection string for `DATABASE_URL`, not the public one. |
| Build fails on Vercel with Tailwind/PostCSS errors | `npm install --legacy-peer-deps` is set in `vercel.json` already — clear the build cache and retry. |

---

## 8. Going further

- **Custom domain** → Vercel Domains + Clerk Domains (CNAME `clerk.<your-domain>.com` → `frontend-api.clerk.accounts.dev`).
- **Monitoring** → plug [Sentry](https://sentry.io) into both apps (`@sentry/nextjs` + `sentry-sdk[fastapi]`).
- **Background tasks** → long CV parsing could move to a worker (Celery + Redis) if processing exceeds request timeouts.
- **Rate limiting** → add `slowapi` to FastAPI + Clerk's per-user rate limit metadata.
- **Backups** → schedule a nightly `pg_dump` of the Railway Postgres volume.
