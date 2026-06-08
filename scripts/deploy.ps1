# ============================================================
# CareerPilot — deploy helper
# ============================================================
# This script does NOT deploy for you (no Vercel/Railway tokens
# stored on this machine). It does the next best thing:
#   1. Prompts for / loads your Railway backend URL
#   2. Prints the exact `vercel env add` commands you need to run
#   3. Verifies the rewrite in vercel.json points at a live host
#   4. Runs the live health checks the GitHub Action would run
#   5. Stops with a clear next-step list
#
# Usage (from repo root):
#   powershell -ExecutionPolicy Bypass -File scripts/deploy.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/deploy.ps1 -ApiUrl "https://careerpilot-backend.up.railway.app" -FrontendOrigin "https://careerpilot.vercel.app"
# ============================================================

[CmdletBinding()]
param(
    [string]$ApiUrl = "",
    [string]$FrontendOrigin = ""
)

$ErrorActionPreference = "Stop"

function Step($n, $title) {
    Write-Host ""
    Write-Host "─── Step $n ─── $title" -ForegroundColor Cyan
}

function Ok($msg)   { Write-Host "  ✔ $msg" -ForegroundColor Green }
function Warn($msg)  { Write-Host "  ⚠ $msg" -ForegroundColor Yellow }
function Fail($msg)  { Write-Host "  ✘ $msg" -ForegroundColor Red }

# ─── Step 0: collect inputs ────────────────────────────────────
Step 0 "Gather target URLs"
if (-not $ApiUrl) {
    $ApiUrl = (Read-Host "  Railway backend URL (e.g. https://careerpilot-backend.up.railway.app)").Trim()
}
if (-not $FrontendOrigin) {
    $FrontendOrigin = (Read-Host "  Vercel frontend URL (e.g. https://careerpilot.vercel.app)").Trim()
}
$ApiUrl = $ApiUrl.TrimEnd("/")
$FrontendOrigin = $FrontendOrigin.TrimEnd("/")
if ($ApiUrl -notmatch "^https?://") { Fail "API URL must start with http(s)://"; exit 1 }
if ($FrontendOrigin -notmatch "^https?://") { Fail "Frontend URL must start with http(s)://"; exit 1 }
Ok "API: $ApiUrl"
Ok "Frontend: $FrontendOrigin"

# ─── Step 1: check vercel.json rewrite matches your API ────────
Step 1 "Validate vercel.json rewrite"
$vercelJsonPath = Join-Path $PSScriptRoot "..\vercel.json"
$vercelJsonPath = (Resolve-Path $vercelJsonPath).Path
$vercel = Get-Content $vercelJsonPath -Raw | ConvertFrom-Json
$rewriteDest = $vercel.rewrites[0].destination
if ($rewriteDest -like "$ApiUrl/*") {
    Ok "vercel.json rewrite already points at $ApiUrl"
} else {
    Warn "vercel.json rewrite points at: $rewriteDest"
    Warn "Your live API is at:              $ApiUrl"
    $fix = Read-Host "  Update vercel.json now? (y/N)"
    if ($fix -eq "y") {
        $vercel.rewrites[0].destination = "$ApiUrl/api/:path*"
        $vercel | ConvertTo-Json -Depth 10 | Set-Content $vercelJsonPath
        Ok "vercel.json updated. Commit + push:"
        Write-Host "    git add vercel.json" -ForegroundColor DarkGray
        Write-Host "    git commit -m 'chore: point rewrite at $ApiUrl'" -ForegroundColor DarkGray
        Write-Host "    git push" -ForegroundColor DarkGray
    } else {
        Warn "Skipped. Vercel will proxy /api/* to the OLD URL until you fix this."
    }
}

# ─── Step 2: print the vercel env commands ─────────────────────
Step 2 "Set Vercel env vars (you run these)"
Write-Host "  These MUST be run from the frontend/ folder, after `vercel login`:" -ForegroundColor Gray
Write-Host ""
Write-Host "    cd frontend" -ForegroundColor White
Write-Host "    vercel env add NEXT_PUBLIC_API_URL production" -ForegroundColor White
Write-Host "    # when prompted, paste: $ApiUrl" -ForegroundColor White
Write-Host ""
Write-Host "    vercel env add NEXT_PUBLIC_API_URL preview" -ForegroundColor White
Write-Host "    # paste: $ApiUrl" -ForegroundColor White
Write-Host ""
Write-Host "    vercel env add NEXT_PUBLIC_USE_REWRITES production" -ForegroundColor White
Write-Host "    # paste: true" -ForegroundColor White
Write-Host ""
Write-Host "    vercel env add NEXT_PUBLIC_USE_REWRITES preview" -ForegroundColor White
Write-Host "    # paste: true" -ForegroundColor White
Write-Host ""
Write-Host "  (Or skip NEXT_PUBLIC_API_URL if you trust the rewrite alone.)" -ForegroundColor DarkGray
Write-Host ""
$didVercel = Read-Host "  Done with the Vercel env commands? (y/N)"
if ($didVercel -ne "y") {
    Warn "Paused. Run the commands above, then re-run this script."
    exit 0
}
Ok "Marked complete."

# ─── Step 3: print the Railway env var ─────────────────────────
Step 3 "Set Railway env var (you run this)"
Write-Host "  In the Railway dashboard → your backend service → Variables:" -ForegroundColor Gray
Write-Host ""
Write-Host "    FRONTEND_URL=$FrontendOrigin" -ForegroundColor White
Write-Host ""
Write-Host "  (or comma-separated if you also use preview branches, e.g." -ForegroundColor DarkGray
Write-Host "   FRONTEND_URL=$FrontendOrigin,https://careerpilot-*.vercel.app)" -ForegroundColor DarkGray
Write-Host ""
$didRailway = Read-Host "  Done with the Railway env var? (y/N)"
if ($didRailway -ne "y") {
    Warn "Paused. Set the var in Railway, then re-run this script."
    exit 0
}
Ok "Marked complete."

# ─── Step 4: live verification curls ──────────────────────────
Step 4 "Live verification (this script does this for you)"

function Probe($label, $url) {
    try {
        $r = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing -TimeoutSec 20
        if ($r.StatusCode -eq 200) {
            Ok "$label  →  HTTP 200  ($url)"
        } else {
            Warn "$label  →  HTTP $($r.StatusCode)  ($url)"
        }
    } catch {
        Fail "$label  →  $($_.Exception.Message)  ($url)"
    }
}

function Preflight($label, $url, $origin) {
    try {
        $r = Invoke-WebRequest -Uri $url -Method OPTIONS -UseBasicParsing -TimeoutSec 20 `
            -Headers @{
                "Origin" = $origin
                "Access-Control-Request-Method" = "GET"
                "Access-Control-Request-Headers" = "authorization,content-type"
            }
        $allowOrigin = $r.Headers["Access-Control-Allow-Origin"]
        if ($allowOrigin) {
            Ok "$label  →  CORS allow-origin: $allowOrigin"
        } else {
            Fail "$label  →  NO Access-Control-Allow-Origin header"
        }
    } catch {
        Fail "$label  →  $($_.Exception.Message)"
    }
}

Probe  "Direct /api/health"        "$ApiUrl/api/health"
Probe  "Direct /api/v1/health"     "$ApiUrl/api/v1/health"
Preflight "CORS preflight on $ApiUrl" "$ApiUrl/api/cv/status" $FrontendOrigin
Probe  "Vercel rewrite /api/health" "$FrontendOrigin/api/health"

# ─── Step 5: done ─────────────────────────────────────────────
Step 5 "Next: redeploy & watch"
Write-Host "  1. Vercel → Deployments → ⋯ → Redeploy (latest commit)" -ForegroundColor White
Write-Host "  2. Railway → service → Deployments → ⋯ → Redeploy" -ForegroundColor White
Write-Host "  3. Open https://$($FrontendOrigin -replace '^https?://','')" -ForegroundColor White
Write-Host "     → DevTools console should show: [CareerPilot] API mode: same-origin (Vercel rewrites → backend)" -ForegroundColor DarkGray
Write-Host "  4. Click around. No 'Network Error' = you're done." -ForegroundColor White
Write-Host ""
Write-Host "  Optional: add the GitHub Action secrets" -ForegroundColor Gray
Write-Host "    → repo Settings → Secrets → Actions:" -ForegroundColor Gray
Write-Host "        API_URL          = $ApiUrl" -ForegroundColor Gray
Write-Host "        FRONTEND_ORIGIN  = $FrontendOrigin" -ForegroundColor Gray
Write-Host "    → .github/workflows/status-check.yml will start probing every 6h." -ForegroundColor Gray
Write-Host ""
Ok "All done."
