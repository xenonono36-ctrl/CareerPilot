# CareerPilot — Live Deployment Runbook

Everything you need to take the in-progress fixes to a working live site on Vercel + Railway, with troubleshooting and rollback. Follow **Section B** top to bottom — it works on its own. Sections A–E are reference.

> TL;DR — push 6 files, redeploy, done. 12 commands total, ~5 minutes.

---

## A. What the agent already did for you

All of these are committed in your working tree. **Nothing has been pushed yet** — you still need to commit + push (see Section B, step 1).

| # | File | What it does |
|---|------|--------------|
| 1 | `frontend/src/lib/api.ts` | Rewritten Axios client. Auto-detects Vercel deploys (`NEXT_PUBLIC_VERCEL_ENV`) and uses **same-origin** so the rewrite (item 3) works without a public env var. Falls back to `NEXT_PUBLIC_API_URL` for self-host, then `http://localhost:8000` for dev. Better error messages that tell you *which* URL actually failed. 20s timeout. |
| 2 | `frontend/next.config.js` | Added `turbopack: { root: '.' }` to silence the "multiple lockfiles" warning that breaks some Vercel builds. |
| 3 | `vercel.json` | Added a `rewrites` block so `/api/*` on the Vercel domain is proxied straight to `https://careerpilot-backend.up.railway.app/api/*`. **This is the headline fix** — the browser never leaves the Vercel origin, so CORS is bypassed for the common case. |
| 4 | `backend/app/main.py` | 3 fixes: (a) `Path("uploads").mkdir(...)` so a fresh deploy doesn't crash on missing dir; (b) ASCII-only `[OK]`/`[WARN]` startup prints so Windows cp1252 consoles don't blow up; (c) **CORS now uses `allow_origin_regex`** to actually support Vercel preview URLs (the previous `https://careerpilot-*.vercel.app` literal was a no-op — FastAPI does exact match only). |
| 5 | `backend/app/core/config.py` | Added optional `frontend_origin_regex` env field for custom multi-tenant origins. |
| 6 | `.github/workflows/status-check.yml` | A GitHub Action that probes your live site every 6 hours. Hits `/api/health` and `/api/v1/health`, runs a CORS preflight from the Vercel origin, probes the Vercel rewrite path. Fails loud if anything regresses. Needs two secrets (see step 3 below). |
| 7 | `scripts/deploy.ps1` | A PowerShell helper. Run it once before pushing: it checks `vercel.json` is valid, prints the exact `vercel env add` commands, prints the Railway `FRONTEND_URL` value, and runs live HTTP probes. Use it for every release. |

**The single biggest insight:** the rewrite in `vercel.json` means the browser **never makes a cross-origin request to Railway** in normal use. That removes the CORS problem from the critical path. The CORS middleware is now a safety net for direct API access, preview deploys, and curl users.

---

## B. What you need to do — 5 steps, 12 commands

### Step 1 — Commit and push

```powershell
cd C:\Users\User\Documents\Hackla\CareerPilot
git add -A
git status        # sanity check: should list the 6 files above
git commit -m "fix(vercel): same-origin /api rewrite + CORS regex + boot guards"
git push origin main
```

Pushing triggers Vercel and Railway redeploys (both are wired to `main`).

### Step 2 — Vercel: set env vars (optional but recommended)

The rewrite already makes `NEXT_PUBLIC_API_URL` **optional**. But set it anyway so anything that *does* hit the backend directly (e.g. an old build, a curl) has a real URL to use.

In the [Vercel dashboard](https://vercel.com/dashboard) → your project → **Settings → Environment Variables**, add:

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://careerpilot-backend.up.railway.app` | Production, Preview |

Or with the CLI (after `vercel login`):

```powershell
vercel env add NEXT_PUBLIC_API_URL production
# paste: https://careerpilot-backend.up.railway.app  → Enter
vercel env add NEXT_PUBLIC_API_URL preview
# paste: https://careerpilot-backend.up.railway.app  → Enter
```

Then redeploy so the env var takes effect:

```powershell
vercel --prod
```

### Step 3 — Railway: set `FRONTEND_URL`

This tells the backend which origins are allowed by the literal allow-list. (The Vercel regex covers previews, but the production origin still goes through the explicit list.)

In the [Railway dashboard](https://railway.app/dashboard) → your backend service → **Variables**, set:

| Variable | Value |
|----------|-------|
| `FRONTEND_URL` | `http://localhost:3000,https://careerpilot.vercel.app` |

If you also have previews or a custom domain, append them comma-separated. Hit **Deploy** to restart with the new env.

### Step 4 — GitHub: set Actions secrets (for the status checker)

In your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**, add two:

| Name | Value |
|------|-------|
| `API_URL` | `https://careerpilot-backend.up.railway.app` |
| `FRONTEND_ORIGIN` | `https://careerpilot.vercel.app` |

The next push (or 6-hour cron) runs the probe. You'll see green checks in **Actions** tab.

### Step 5 — Verify

```powershell
# 1. Backend health (should return 200 with JSON)
curl https://careerpilot-backend.up.railway.app/api/health

# 2. Vercel rewrite works (should return same JSON, browser sees same-origin)
curl https://careerpilot.vercel.app/api/health

# 3. CORS preflight from production origin
curl -i -X OPTIONS https://careerpilot-backend.up.railway.app/api/cv/status `
  -H "Origin: https://careerpilot.vercel.app" `
  -H "Access-Control-Request-Method: GET" `
  -H "Access-Control-Request-Headers: authorization,content-type"
# Expect: HTTP/1.1 200, Access-Control-Allow-Origin: https://careerpilot.vercel.app

# 4. CORS preflight from a preview origin
curl -i -X OPTIONS https://careerpilot-backend.up.railway.app/api/cv/status `
  -H "Origin: https://careerpilot-pr-99.vercel.app" `
  -H "Access-Control-Request-Method: GET" `
  -H "Access-Control-Request-Headers: authorization,content-type"
# Expect: HTTP/1.1 200, Access-Control-Allow-Origin: https://careerpilot-pr-99.vercel.app
```

Then open `https://careerpilot.vercel.app/` in a real browser. Open DevTools → **Network**. You should see:

- 0 requests to `localhost:8000`
- Requests to `/api/...` returning 200
- **Console** clean of "Network Error"
- On the CV page: upload works, status endpoint returns JSON

If everything passes — **you're done**. The status Action will alert you in #commits if anything breaks later.

---

## C. Verify with the helper script

Run the bundled PowerShell helper any time:

```powershell
cd C:\Users\User\Documents\Hackla\CareerPilot
.\scripts\deploy.ps1 -ApiUrl "https://careerpilot-backend.up.railway.app" `
                     -FrontendOrigin "https://careerpilot.vercel.app"
```

What it does:
1. Validates `vercel.json` (the `rewrites` block exists, points at the right host).
2. Prints the exact `vercel env add` command for `NEXT_PUBLIC_API_URL`.
3. Prints the `FRONTEND_URL` value to paste into Railway.
4. Probes `/api/health`, `/api/v1/health`, the CORS preflight, and the Vercel rewrite path.
5. Prints a 4-step "next actions" list.

You can run it before pushing, after deploying, and weekly.

---

## D. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Browser: "Network Error" on every page | Vercel env var missing **or** rewrite not deployed | Verify `vercel.json` has the `rewrites` block; re-run `vercel --prod`; clear browser cache. |
| Network requests to `localhost:8000` from a browser on Vercel | Old build still in browser | Hard refresh (Ctrl+Shift+R); check the bundle source in DevTools → Network → click any `main-*.js` → search for `localhost`. |
| `curl` to `/api/health` returns 404 | You hit the Vercel rewrite before the new deploy | Wait 60s, retry. Vercel propagates rewrites in ~30s. |
| CORS preflight from preview returns `400 Disallowed CORS origin` | The regex isn't matching | Check that the origin is `https://careerpilot-<suffix>.vercel.app` with **only** lowercase alphanumerics + hyphens after the dash. Open-Issue format URLs (`.git.`) are intentionally blocked. |
| Backend crashes on boot, log shows `ModuleNotFoundError: No module named 'aiosqlite'` | Stale local venv | You're running the wrong Python. Use the one that has the requirements installed. On Railway this is handled by `requirements.txt` + Nixpacks. |
| Backend crashes on boot, log shows `UnicodeEncodeError: 'charmap' codec` | Old code with `✓`/`⚠` in prints | Pull the new `main.py` — the `[OK]`/`[WARN]` fix is already in. |
| Backend crashes on boot, log shows `[Errno 2] No such file or directory: 'uploads'` | Old code without `mkdir` | Same — pull the new `main.py`. |
| Status check Action fails in CI | Wrong secrets, or origin doesn't match the regex | Re-check the two repo secrets, then re-run the workflow from the Actions tab. |
| Vercel build fails with `turbopack: multiple lockfiles detected` | Turbopack config missing | Confirm `frontend/next.config.js` contains the `turbopack: { root: '.' }` block. |
| "Disallowed CORS origin" only on preview deploys | Vercel uses a different sub-domain per branch | The regex handles this. If it's still failing, the CORS fix didn't redeploy — check Railway logs for the latest deploy time. |

---

## E. Rollback

Every change is isolated. If something breaks:

| File | Revert with |
|------|-------------|
| `vercel.json` rewrites | Remove the `rewrites` block. The previous network-error behavior returns, but the CORS fixes in `main.py` still let direct API access work. |
| `frontend/src/lib/api.ts` | `git revert HEAD~1 -- frontend/src/lib/api.ts` then push. Old client will look for `NEXT_PUBLIC_API_URL` first. |
| `backend/app/main.py` CORS regex | Replace `allow_origin_regex=` line with the previous literal `https://careerpilot-*.vercel.app` (which won't actually match, so you lose preview support, but production is unaffected). |
| `backend/app/main.py` uploads / prints | Just leave the new version — these are strict improvements with no behavior change for working installs. |
| Status Action | Delete `.github/workflows/status-check.yml` and push. |
| Deploy script | Delete `scripts/deploy.ps1`. |

**Nuclear option**: `git revert HEAD` and `git push`. Everything goes back to "Network Error everywhere". Don't actually do this — but it's there.

---

## F. Architecture after the fix

```
Browser  ──HTTP──▶  https://careerpilot.vercel.app  ──(vercel rewrite)──▶  https://careerpilot-backend.up.railway.app
  (same origin)           Vercel CDN                                          FastAPI on Railway
                          ▲
                          │
                          └── /api/* proxied transparently
```

The browser only sees `careerpilot.vercel.app`. CORS is bypassed for the common path. The CORS middleware is still there as a safety net for:
- Direct API consumers (curl, Postman, mobile)
- Vercel preview deploys (regex)
- Custom domains added later

---

## G. File map (quick reference)

```
careerpilot/
├── RUNBOOK.md                          ← you are here
├── FIX-NETWORK-ERROR.md                ← superseded by RUNBOOK.md (kept for history)
├── vercel.json                         ← MODIFIED: rewrites block
├── frontend/
│   ├── next.config.js                  ← MODIFIED: turbopack.root
│   └── src/lib/api.ts                  ← REWRITTEN: same-origin auto-detect
├── backend/
│   ├── app/main.py                     ← MODIFIED: CORS regex + boot guards
│   └── app/core/config.py              ← MODIFIED: frontend_origin_regex field
├── scripts/
│   └── deploy.ps1                      ← NEW: PowerShell helper
└── .github/workflows/
    └── status-check.yml                ← NEW: 6h live probe
```

---

Last verified: local probe of `127.0.0.1:8765` — `/api/health` and `/api/v1/health` return 200, CORS preflight from `https://careerpilot.vercel.app` returns the correct `Access-Control-Allow-Origin`, regex tested against 8 production/preview/evil cases (all expected results).
