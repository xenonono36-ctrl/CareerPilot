import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

/**
 * Base URL for the FastAPI backend.
 *
 * Production strategy (in order of preference):
 *   1. Same-origin ("")  — relies on Vercel `rewrites` in vercel.json to
 *      proxy /api/* → backend. Zero CORS surface, no env var needed.
 *   2. NEXT_PUBLIC_API_URL env var — used when rewrites are disabled or in
 *      local dev. MUST be set at build time; it's inlined into the bundle.
 *   3. Fallback to http://localhost:8000 for local dev.
 *
 * The "use rewrites" mode is auto-detected by checking NEXT_PUBLIC_USE_REWRITES
 * (defaults to "true" on Vercel). Set it to "false" to force the direct path.
 */
function resolveApiUrl(): string {
  const useRewrites = (process.env.NEXT_PUBLIC_USE_REWRITES ?? 'true').toLowerCase() !== 'false'
  // Vercel injects NEXT_PUBLIC_VERCEL_URL on every build (production + previews).
  // Examples: "careerpilot.vercel.app", "careerpilot-git-main-user.vercel.app".
  // It's the canonical "this bundle was built on Vercel" signal.
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  const isVercel = !!vercelUrl && vercelUrl.length > 0

  if (useRewrites && isVercel) {
    return '' // same-origin → Vercel rewrite handles /api/*
  }

  const raw = process.env.NEXT_PUBLIC_API_URL?.trim()
  return raw && raw.length > 0 ? raw.replace(/\/+$/, '') : 'http://localhost:8000'
}

export const API_URL = resolveApiUrl()

// Log once on the client so misconfiguration is obvious in the browser console
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info(
    '[CareerPilot] API mode:',
    API_URL === '' ? 'same-origin (Vercel rewrites → backend)' : `direct: ${API_URL}`
  )
}

/**
 * Token getter — set by ClerkProvider via setApiTokenGetter().
 * Returns the current Clerk session JWT (or null when signed out).
 */
let tokenGetter: (() => Promise<string | null>) | null = null

export function setApiTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  // 20s is generous for a cold-start AI call but won't hang the UI forever
  timeout: 20_000,
})

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Attach Clerk session token if available
  if (tokenGetter) {
    try {
      const token = await tokenGetter()
      if (token) {
        config.headers = config.headers ?? ({} as any)
        ;(config.headers as any).Authorization = `Bearer ${token}`
      }
    } catch {
      // Signed out — fall through without token
    }
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Surface the real reason for "Network Error" instead of a generic message
    const status = error.response?.status
    const backendMessage =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      null

    const where =
      API_URL === ''
        ? 'Vercel rewrite proxy (/api/* → backend)'
        : `backend at ${API_URL}`

    let message: string
    if (backendMessage) {
      message = backendMessage
    } else if (error.code === 'ERR_NETWORK' || !status) {
      message = `Cannot reach CareerPilot ${where}. ` +
        `Check that the backend is up, the Vercel rewrite in vercel.json points to a live URL, ` +
        `and (if not using rewrites) that NEXT_PUBLIC_API_URL is set.`
    } else if (status === 401) {
      message = 'Session expired. Please sign in again.'
    } else if (status === 403) {
      message = 'You do not have access to that resource.'
    } else if (status >= 500) {
      message = 'The CareerPilot backend hit an error. Please try again in a moment.'
    } else {
      message = error.message || 'Request failed'
    }
    return Promise.reject(new Error(message))
  }
)

export default apiClient