import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add Clerk user ID to requests
apiClient.interceptors.request.use((config) => {
  // In a real app, get this from Clerk
  const clerkId = typeof window !== 'undefined' 
    ? localStorage.getItem('clerk_id') || 'demo_user'
    : 'demo_user'
  config.params = { ...config.params, clerk_id: clerkId }
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message
    return Promise.reject(new Error(message))
  }
)

export default apiClient