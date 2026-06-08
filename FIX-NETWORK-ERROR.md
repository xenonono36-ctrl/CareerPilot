# 🚨 Fix "Network Error" on Live (Vercel + Railway) — Runbook

> **⚠️ SUPERSEDED — see [`RUNBOOK.md`](./RUNBOOK.md)** for the current version.
> The original 4-fix list below is still accurate as background reading, but the
> canonical runbook (with the Vercel rewrite strategy, GitHub Action, deploy
> helper script, and the corrected CORS regex for preview URLs) is in
> `RUNBOOK.md`. Keep this file around for history only.
>
> **Date of supersession:** post-deployment hardening pass. Key new info:
> - The headline fix is now `vercel.json` rewrites (no CORS on the hot path)
> - CORS now uses `allow_origin_regex` (the previous `*.vercel.app` literal was a no-op)
> - 2 boot-time bugs in `main.py` were fixed (`uploads/` mkdir + ASCII prints)

---

This is the single-source-of-truth for resolving **`AxiosError: Network Error`** (or `ERR_NETWORK`) when the app works locally but breaks on `careerpilot.vercel.app`.

## 1. The root cause (in one sentence)

> The production build of the frontend inlined `http://localhost:8000` as the API base URL because **`NEXT_PUBLIC_API_URL` was not set in the Vercel project**, and the backend's CORS allow-list did not include the live Vercel origin.

That's it. Two env vars, one missing and one too narrow.

---

## 2. The 4 fixes that are already applied in this commit

| File | Change |
|---|---|
| `frontend/src/lib/api.ts` | Logs `[CareerPilot] API base URL:` to the browser console on every page load so the live URL is visible. Network errors now print the actual base URL + remediation hint instead of a generic "Network Error". Added a 20s request timeout. |
| `backend/app/main.py` (CORS) | Default allow-list now includes `https://careerpilot-*.vercel.app` (all Vercel previews). Wildcard `*` supported via `FRONTEND_URL=*` for incident response. Exposes `Content-Disposition` for file downloads. |
| `backend/app/main.py` (routes) | Added `/api/v1/health` alias for `/api/health` so the Railway/Render healthcheck path matches. |
| `backend/app/core/config.py` | Comment now makes the `FRONTEND_URL` multi-origin behaviour explicit. |

✅ **Frontend build verified**: `next build` succeeds, all 9 routes generated.
✅ **Backend syntax verified**: `ast.parse` on both files → `OK`.

---

## 3. What YOU need to do (3 minutes)

### Step 1 — Vercel: set `NEXT_PUBLIC_API_URL`

1. Open **https://vercel.com/dashboard** → your `careerpilot` project.
2. **Settings → Environment Variables**.
3. Add (or update) for **Production, Preview, and Development**:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://<your-railway-domain>.up.railway.app` |

   Replace `<your-railway-domain>` with the real one (e.g. `careerpilot-backend-production.up.railway.app`). **No trailing slash.**

4. Click **Save** → **Deployments → ⋯ → Redeploy** on the latest build. ⚠️ **Env vars only take effect after a rebuild** because `NEXT_PUBLIC_*` is inlined at build time.

### Step 2 — Railway: set `FRONTEND_URL`

1. Open your Railway **backend** service → **Variables**.
2. Add (or update):

   | Name | Value |
   |---|---|
   | `FRONTEND_URL` | `https://careerpilot.vercel.app` |

   You can list multiple origins comma-separated:
   ```
   FRONTEND_URL=https://careerpilot.vercel.app,https://careerpilot-git-master-xenonono36-ctrl.vercel.app
   ```

3. **No rebuild needed** — FastAPI picks it up on the next process start. If the service is already running, click **Redeploy** in Railway.

### Step 3 — Verify (30 seconds)

In your terminal, run:

```powershell
# 1. Backend health
curl https://<your-railway-domain>.up.railway.app/api/health
# expected: {"status":"healthy","app":"CareerPilot"}

# 2. CORS preflight from the Vercel origin
curl -I -X OPTIONS https://<your-railway-domain>.up.railway.app/api/applications `
  -H "Origin: https://careerpilot.vercel.app" `
  -H "Access-Control-Request-Method: GET"
# expected: HTTP/1.1 200 OK  (and access-control-allow-origin header present)
```

Then open `https://careerpilot.vercel.app/dashboard` in a real browser:

1. Open **DevTools → Console**. You should see:
   ```
   [CareerPilot] API base URL: https://<your-railway-domain>.up.railway.app
   ```
   If it says `http://localhost:8000`, the Vercel env var didn't take — go back to Step 1 and redeploy.
2. Sign in. The dashboard should load real data (no "Network Error" toast).
3. Open **DevTools → Network** → the first request to `/api/applications` should return **200 OK** (after Clerk sets the bearer token).

---

## 4. What it looks like when something is still wrong

| Console / Network | Probable cause | Fix |
|---|---|---|
| `[CareerPilot] API base URL: http://localhost:8000` | `NEXT_PUBLIC_API_URL` not set / not redeployed | Vercel → Env vars → add → **Redeploy** |
| `CORS policy: No 'Access-Control-Allow-Origin' header` | `FRONTEND_URL` on backend doesn't match | Railway → set `FRONTEND_URL=https://careerpilot.vercel.app` → restart |
| `Cannot reach CareerPilot backend at ...` | Backend service is asleep / crashed | Railway → check logs, hit `/api/health` |
| `503 Auth provider unavailable` | `CLERK_JWT_ISSUER` wrong on backend | Railway → set to your Clerk Frontend API URL |
| `401 Missing bearer token` | Clerk session not attached | Make sure `ApiClientBootstrap` is mounted in `layout.tsx` (it is) and the user is signed in |
| `404 Not Found` on `/api/v1/health` | Old Railway healthcheck path | Already aliased in this commit |

---

## 5. Local dev still works

Nothing about the local flow changed. Your `frontend/.env.local` should still have:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

…and the backend `.env` should have:

```
FRONTEND_URL=http://localhost:3000
```

The new defaults in `main.py` cover those automatically even if the env var is missing.

---

## 6. If you want to test without Vercel

Point your local frontend at the Railway backend:

```powershell
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://<your-railway-domain>.up.railway.app

& "C:\Program Files\nodejs\npm.cmd" run dev
```

Open `http://localhost:3000`. You'll see the live backend URL in the console and real data from Railway Postgres.
