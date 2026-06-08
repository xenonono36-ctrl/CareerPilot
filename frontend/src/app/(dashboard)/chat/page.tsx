'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  Send, 
  Sparkles,
  Briefcase,
  FileText,
  MessageSquare,
  Lightbulb,
  Copy,
  CheckCheck,
  AlertCircle
} from 'lucide-react'
import { useChatStore, type ChatMessage } from '@/store/chatStore'
import apiClient from '@/lib/api'

const suggestedPrompts = [
  { icon: FileText, text: 'Help me improve my CV' },
  { icon: Briefcase, text: 'Find jobs matching my skills' },
  { icon: Lightbulb, text: 'What skills should I learn?' },
  { icon: MessageSquare, text: 'Prepare for a tech interview' }
]

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-6 py-4 ${
        message.role === 'user' 
          ? 'bg-blue-600 text-white' 
          : 'bg-white border border-slate-200'
      }`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
        
        <div className="flex items-center gap-2 mt-3">
          {message.role === 'assistant' && (
            <button 
              onClick={handleCopy}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
              title="Copy response"
            >
              {copied ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
          <span className={`text-xs ${message.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        {message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.suggestedActions.map((action, i) => (
              <button 
                key={i}
                className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                  message.role === 'user' 
                    ? 'bg-blue-500 hover:bg-blue-400' 
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { messages, setMessages, loading, setLoading, setCurrentSession, currentSessionId, setError, error } = useChatStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (prompt?: string) => {
    const text = prompt || input.trim()
    if (!text) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    const messagesAtSend = [...messages, userMessage]
    setMessages(messagesAtSend)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await apiClient.post('/api/chat', {
        message: text,
        session_id: currentSessionId,
      })
      
      setCurrentSession(res.data.session_id)
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date(),
        suggestedActions: res.data.suggested_actions,
        sources: res.data.sources,
      }
      setMessages([...messagesAtSend, aiMessage])
    } catch (err: any) {
      setError(err.message || 'Failed to get AI response')
      setMessages(messagesAtSend)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">AI Career Assistant</h1>
              <p className="text-sm text-slate-500">Powered by your CV insights</p>
            </div>
          </div>
          <Link 
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">How can I help you today?</h2>
              <p className="text-slate-500 mb-8">Ask me anything about your career, job search, or interview prep</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt.text)}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
                  >
                    <prompt.icon className="w-5 h-5 text-purple-600 mb-2" />
                    <p className="text-sm font-medium text-slate-700">{prompt.text}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-3">
            <input
              type="text"
              placeholder="Ask me anything about your career..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-6 py-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-xs text-slate-400 text-center mt-3">
            AI responses are based on your uploaded CV and general knowledge.
          </p>
        </div>
      </div>
    </div>
  )
}