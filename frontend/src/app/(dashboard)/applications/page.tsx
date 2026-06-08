'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
  Plus,
  Star,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Edit3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Briefcase,
  Loader2
} from 'lucide-react'
import apiClient from '@/lib/api'

type ApplicationStatus = 'applied' | 'interviewing' | 'offer' | 'rejected'

interface Application {
  id: number
  job_id: string
  position: string
  company: string
  location?: string
  salary?: string
  applied_date?: string
  status: ApplicationStatus
  notes?: string
  link?: string
  interview_date?: string
  offer_details?: string
  created_at: string
  updated_at: string
}

interface KanbanData {
  applied: Application[]
  interviewing: Application[]
  offer: Application[]
  rejected: Application[]
}

const statusConfig = {
  applied: { label: 'Applied', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', icon: Clock },
  interviewing: { label: 'Interview', color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700', icon: AlertCircle },
  offer: { label: 'Offer', color: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-50 border-red-200', textColor: 'text-red-700', icon: XCircle }
}

const ApplicationCard = ({ app, onStatusChange, onDelete }: { 
  app: Application
  onStatusChange: (id: number, status: ApplicationStatus) => void
  onDelete: (id: number) => void
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const config = statusConfig[app.status]

  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-md transition-all relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900">{app.position}</h4>
          <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
            <Building2 className="w-4 h-4" />
            {app.company}
          </p>
        </div>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 text-slate-400 hover:text-slate-600 rounded opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {app.salary && (
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {app.salary}
          </span>
        </div>
      )}

      {app.notes && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 mb-3">
          {app.notes}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Applied {app.applied_date ? new Date(app.applied_date).toLocaleDateString() : '—'}
        </span>
        {app.link && (
          <a 
            href={app.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {showMenu && (
        <div className="absolute right-4 top-12 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10 min-w-[160px]">
          {(Object.keys(statusConfig) as ApplicationStatus[])
            .filter(s => s !== app.status)
            .map(status => (
              <button
                key={status}
                onClick={() => { onStatusChange(app.id, status); setShowMenu(false) }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                Move to {statusConfig[status].label}
              </button>
            ))
          }
          <hr className="my-1" />
          <button 
            onClick={() => { onDelete(app.id); setShowMenu(false) }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-red-600"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

const KanbanColumn = ({ 
  status, 
  applications,
  onStatusChange,
  onDelete
}: { 
  status: ApplicationStatus
  applications: Application[]
  onStatusChange: (id: number, status: ApplicationStatus) => void
  onDelete: (id: number) => void
}) => {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={`rounded-xl border ${config.color} p-4 min-h-[500px]`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${config.textColor}`} />
        <h3 className={`font-semibold ${config.textColor}`}>{config.label}</h3>
        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-medium ${config.textColor} bg-white/50`}>
          {applications.length}
        </span>
      </div>
      
      <div className="space-y-3 relative">
        {applications.map((app) => (
          <ApplicationCard 
            key={app.id} 
            app={app} 
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}
        {applications.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">No applications</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ApplicationsPage() {
  const [kanban, setKanban] = useState<KanbanData>({ applied: [], interviewing: [], offer: [], rejected: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newApp, setNewApp] = useState({
    position: '',
    company: '',
    location: '',
    salary: '',
    link: ''
  })

  const allApplications = Object.values(kanban).flat()

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/api/applications')
      setKanban(res.data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchApplications() }, [fetchApplications])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newApp.position.trim() || !newApp.company.trim()) return
    try {
      setSaving(true)
      await apiClient.post('/api/applications', {
        job_id: `manual_${Date.now()}`,
        position: newApp.position,
        company: newApp.company,
        salary: newApp.salary || undefined,
        link: newApp.link || undefined,
        status: 'applied',
      })
      setShowAddForm(false)
      setNewApp({ position: '', company: '', location: '', salary: '', link: '' })
      await fetchApplications()
    } catch (err: any) {
      setError(err.message || 'Failed to add application')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (id: number, status: ApplicationStatus) => {
    try {
      await apiClient.patch(`/api/applications/${id}`, { status })
      await fetchApplications()
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/applications/${id}`)
      await fetchApplications()
    } catch (err: any) {
      setError(err.message || 'Failed to delete')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Applications</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Dashboard
            </Link>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Application
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Applied', value: allApplications.length, color: 'text-blue-600' },
                { label: 'Interviews', value: kanban.interviewing.length, color: 'text-amber-600' },
                { label: 'Offers', value: kanban.offer.length, color: 'text-emerald-600' },
                { label: 'Rejected', value: kanban.rejected.length, color: 'text-red-600' }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-4 gap-4">
              {(Object.keys(statusConfig) as ApplicationStatus[]).map((status) => (
                <KanbanColumn 
                  key={status}
                  status={status}
                  applications={kanban[status]}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Application Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Add New Application</h2>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                <input
                  type="text"
                  value={newApp.position}
                  onChange={(e) => setNewApp({ ...newApp, position: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Senior Developer"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  value={newApp.company}
                  onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="TechCorp"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newApp.location}
                    onChange={(e) => setNewApp({ ...newApp, location: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Remote"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                  <input
                    type="text"
                    value={newApp.salary}
                    onChange={(e) => setNewApp({ ...newApp, salary: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="$2000/mo"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job URL</label>
                <input
                  type="url"
                  value={newApp.link}
                  onChange={(e) => setNewApp({ ...newApp, link: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Add Application'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}