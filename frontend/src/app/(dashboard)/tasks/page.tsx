'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Check, 
  Calendar,
  Star,
  Trash2,
  Loader2
} from 'lucide-react'
import apiClient from '@/lib/api'

type TaskPriority = 'low' | 'medium' | 'high'
type TaskCategory = 'general' | 'job_search' | 'interview' | 'learning'

interface Task {
  id: number
  title: string
  description?: string
  priority: TaskPriority
  category: string
  completed: boolean
  due_date?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700'
}

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
}

const categoryLabels: Record<string, string> = {
  general: 'General',
  job_search: 'Job Search',
  interview: 'Interview Prep',
  learning: 'Skill Development',
  skill_development: 'Skill Development',
  networking: 'Networking',
  interview_prep: 'Interview Prep',
}

const TaskCard = ({ task, onToggle, onDelete }: { 
  task: Task
  onToggle: () => void
  onDelete: () => void 
}) => (
  <div className={`group bg-white rounded-xl border p-4 hover:border-blue-200 transition-all ${
    task.completed ? 'opacity-60' : ''
  }`}>
    <div className="flex items-start gap-3">
      <button 
        onClick={onToggle}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.completed 
            ? 'bg-emerald-500 border-emerald-500' 
            : 'border-slate-300 hover:border-blue-500'
        }`}
      >
        {task.completed && <Check className="w-3 h-3 text-white" />}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
          {task.title}
        </p>
        
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority] || priorityColors.medium}`}>
            {priorityLabels[task.priority] || 'Medium'}
          </span>
          <span className="text-xs text-slate-500">
            {categoryLabels[task.category] || task.category}
          </span>
          {task.due_date && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      <button 
        onClick={onDelete}
        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
)

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium')
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('general')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/api/tasks')
      setTasks(res.data.tasks)
      setStats({
        total: res.data.total,
        pending: res.data.pending,
        completed: res.data.completed,
      })
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    try {
      setSaving(true)
      await apiClient.post('/api/tasks', {
        title: newTaskTitle,
        priority: newTaskPriority,
        category: newTaskCategory,
        due_date: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
      })
      setNewTaskTitle('')
      setNewTaskDueDate('')
      setShowAddForm(false)
      await fetchTasks()
    } catch (err: any) {
      setError(err.message || 'Failed to add task')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: number) => {
    try {
      await apiClient.post(`/api/tasks/${id}/toggle`)
      await fetchTasks()
    } catch (err: any) {
      setError(err.message || 'Failed to toggle task')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/tasks/${id}`)
      await fetchTasks()
    } catch (err: any) {
      setError(err.message || 'Failed to delete task')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Tasks</span>
          </div>
          <Link 
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {error && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
                { label: 'Completed', value: stats.completed, color: 'text-emerald-600' },
                { label: 'Total', value: stats.total, color: 'text-blue-600' }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Add Task Button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full mb-6 p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New Task
            </button>

            {/* Add Task Form */}
            {showAddForm && (
              <form onSubmit={handleAddTask} className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="px-4 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                    className="px-4 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="general">General</option>
                    <option value="job_search">Job Search</option>
                    <option value="interview">Interview Prep</option>
                    <option value="learning">Skill Development</option>
                  </select>

                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-lg bg-white"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Add Task'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Task List */}
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => handleToggle(task.id)}
                  onDelete={() => handleDelete(task.id)}
                />
              ))}
            </div>

            {tasks.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No tasks yet</h3>
                <p className="text-slate-500">Create your first task to get started!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}