import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  // User profile
  cvId: string | null
  cvStatus: 'none' | 'uploading' | 'processing' | 'completed' | 'failed'
  skills: string[]
  experienceYears: number | null
  education: string[]
  projects: string[]
  
  // Actions
  setCVData: (data: Partial<UserState>) => void
  clearCVData: () => void
  setCVStatus: (status: UserState['cvStatus']) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      cvId: null,
      cvStatus: 'none',
      skills: [],
      experienceYears: null,
      education: [],
      projects: [],
      
      setCVData: (data) => set((state) => ({ ...state, ...data })),
      clearCVData: () => set({
        cvId: null,
        cvStatus: 'none',
        skills: [],
        experienceYears: null,
        education: [],
        projects: []
      }),
      setCVStatus: (status) => set({ cvStatus: status }),
    }),
    {
      name: 'careerpilot-user',
    }
  )
)