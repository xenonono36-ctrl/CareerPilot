import { create } from 'zustand'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  description: string
  requirements: string[]
  salary?: string
  postedDate: string
  url: string
  fitScore?: number
}

export interface JobSearchState {
  searchQuery: string
  filters: {
    location: string
    jobType: string
    experienceLevel: string
  }
  results: Job[]
  loading: boolean
  error: string | null
  
  // Actions
  setSearchQuery: (query: string) => void
  setFilters: (filters: Partial<JobSearchState['filters']>) => void
  setResults: (results: Job[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearResults: () => void
}

export const useJobSearchStore = create<JobSearchState>((set) => ({
  searchQuery: '',
  filters: {
    location: '',
    jobType: '',
    experienceLevel: '',
  },
  results: [],
  loading: false,
  error: null,
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  setResults: (results) => set({ results, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  clearResults: () => set({ results: [], searchQuery: '' }),
}))