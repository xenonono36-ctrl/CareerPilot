import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Request failed'
    return Promise.reject(new Error(message))
  }
)

export default apiClient