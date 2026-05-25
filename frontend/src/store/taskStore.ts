import { create } from 'zustand'

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskCategory = 'job_search' | 'interview_prep' | 'networking' | 'skill_development' | 'general'

export interface Task {
  id: number
  title: string
  description?: string
  priority: TaskPriority
  category: TaskCategory
  completed: boolean
  dueDate?: string
  createdAt: string
  completedAt?: string
}

export interface TaskStats {
  total: number
  pending: number
  completed: number
  overdue: number
  byCategory: Record<string, number>
  byPriority: Record<string, number>
}

export interface TaskState {
  tasks: Task[]
  stats: TaskStats
  filter: {
    category: TaskCategory | null
    priority: TaskPriority | null
    showCompleted: boolean
  }
  loading: boolean
  error: string | null
  
  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: number, updates: Partial<Task>) => void
  deleteTask: (id: number) => void
  toggleTask: (id: number) => void
  setStats: (stats: TaskStats) => void
  setFilter: (filter: Partial<TaskState['filter']>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  stats: {
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    byCategory: {},
    byPriority: {},
  },
  filter: {
    category: null,
    priority: null,
    showCompleted: true,
  },
  loading: false,
  error: null,
  
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({
    tasks: [task, ...state.tasks]
  })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => 
      t.id === id ? { ...t, ...updates } : t
    )
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  })),
  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === id ? { 
        ...t, 
        completed: !t.completed,
        completedAt: !t.completed ? new Date().toISOString() : undefined
      } : t
    )
  })),
  setStats: (stats) => set({ stats }),
  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter }
  })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))