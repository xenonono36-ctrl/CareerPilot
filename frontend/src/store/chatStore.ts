import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: string[]
  suggestedActions?: string[]
}

export interface ChatSession {
  sessionId: string
  messages: ChatMessage[]
  createdAt: Date
}

export interface ChatState {
  currentSessionId: string | null
  messages: ChatMessage[]
  sessions: ChatSession[]
  loading: boolean
  error: string | null
  
  // Actions
  setCurrentSession: (sessionId: string | null) => void
  addMessage: (message: ChatMessage) => void
  setMessages: (messages: ChatMessage[]) => void
  setSessions: (sessions: ChatSession[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearCurrentSession: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  currentSessionId: null,
  messages: [],
  sessions: [],
  loading: false,
  error: null,
  
  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  setMessages: (messages) => set({ messages }),
  setSessions: (sessions) => set({ sessions }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearCurrentSession: () => set({
    currentSessionId: null,
    messages: [],
    error: null
  }),
}))