'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { 
  Plus, 
  Check, 
  Circle, 
  Star,
  Calendar,
  Tag,
  Trash2,
  Filter,
  LayoutGrid,
  List
} from 'lucide-react'
import { useTaskStore, type Task, type TaskPriority, type TaskCategory } from '@/store/taskStore'

const priorityColors = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700'
}

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
}

const categoryLabels: Record<string, string> = {
  job_search: 'Job Search',
  interview_prep: 'Interview Prep',
  networking: 'Networking',
  skill_development: 'Skill Development',
  general: 'General'
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
        
        <div className="flex items-center gap-3 mt-2">
          <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
            {priorityLabels[task.priority]}
          </span>
          <span className="text-xs text-slate-500">
            {categoryLabels[task.category]}
          </span>
          {task.dueDate && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {task.dueDate}
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
  const { user } = useUser()
  const { tasks, setTasks, toggleTask, deleteTask, addTask, stats, setStats } = useTaskStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium')
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('general')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Mock data
  const mockTasks: Task[] = [
    { id: 1, title: 'Review job applications', priority: 'high', category: 'job_search', completed: false, createdAt: new Date().toISOString() },
    { id: 2, title: 'Update LinkedIn profile', priority: 'medium', category: 'networking', completed: true, createdAt: new Date().toISOString() },
    { id: 3, title: 'Practice coding interview', priority: 'high', category: 'interview_prep', completed: false, createdAt: new Date().toISOString(), dueDate: 'Tomorrow' },
    { id: 4, title: 'Learn Docker basics', priority: 'medium', category: 'skill_development', completed: false, createdAt: new Date().toISOString() },
    { id: 5, title: 'Send follow-up email', priority: 'low', category: 'job_search', completed: false, createdAt: new Date().toISOString() },
  ]

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const task: Task = {
      id: Date.now(),
      title: newTaskTitle,
      priority: newTaskPriority,
      category: newTaskCategory,
      completed: false,
      createdAt: new Date().toISOString()
    }

    addTask(task)
    setNewTaskTitle('')
    setShowAddForm(false)
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
            href="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending', value: mockTasks.filter(t => !t.completed).length, color: 'text-amber-600' },
            { label: 'Completed', value: mockTasks.filter(t => t.completed).length, color: 'text-emerald-600' },
            { label: 'Total', value: mockTasks.length, color: 'text-blue-600' }
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
            
            <div className="flex gap-4 mb-4">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg bg-white"
              >
                <option value="general">General</option>
                <option value="job_search">Job Search</option>
                <option value="interview_prep">Interview Prep</option>
                <option value="networking">Networking</option>
                <option value="skill_development">Skill Development</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Task
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
          {mockTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </div>

        {mockTasks.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No tasks yet</h3>
            <p className="text-slate-500">Create your first task to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}