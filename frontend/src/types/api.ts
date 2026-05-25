export interface CVUploadResponse {
  success: boolean
  message: string
  cv_id: string
  sections_found: string[]
}

export interface CVStatusResponse {
  cv_id: string
  filename: string
  status: string
  skills: string[]
  experience_years: number | null
  education: string[]
  sections: {
    skills: string[]
    education: string[]
    experience: string[]
    projects: string[]
  }
  processed_at: string | null
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  description: string
  requirements: string[]
  salary?: string
  posted_date: string
  url: string
  fit_score?: number
}

export interface JobSearchResponse {
  jobs: Job[]
  total: number
  query: string
}

export interface FitScoreResponse {
  fit_score: number
  breakdown: {
    skills: number
    experience: number
    education: number
    projects: number
    keywords: number
  }
  matched_skills: string[]
  missing_skills: string[]
  recommendations: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: string[]
  suggested_actions?: string[]
}

export interface ChatResponse {
  response: string
  session_id: string
  sources: string[]
  suggested_actions: string[]
}

export interface Task {
  id: number
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  category: string
  completed: boolean
  due_date?: string
  created_at: string
  completed_at?: string
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
  pending: number
  completed: number
}

export interface Application {
  id: number
  job_id?: string
  company: string
  position: string
  status: 'applied' | 'interviewing' | 'offer' | 'rejected'
  applied_date: string
  notes?: string
  link?: string
  salary?: string
  created_at: string
}

export interface ApplicationKanbanResponse {
  applied: Application[]
  interviewing: Application[]
  offer: Application[]
  rejected: Application[]
}

export interface DashboardStats {
  total_applications: number
  applications_by_status: Record<string, number>
  tasks_pending: number
  tasks_completed_today: number
  streak_days: number
  skills_identified: string[]
  recent_activity: Array<{
    type: string
    title: string
    date: string
  }>
}