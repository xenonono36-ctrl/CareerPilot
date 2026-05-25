'use client'

import { useState } from 'react'
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
  GripVertical
} from 'lucide-react'

type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected'

interface Application {
  id: string
  position: string
  company: string
  location: string
  salary?: string
  appliedDate: string
  status: ApplicationStatus
  notes?: string
  url?: string
}

const mockApplications: Application[] = [
  { id: '1', position: 'Senior React Developer', company: 'TechCorp BD', location: 'Dhaka', salary: '$2500/mo', appliedDate: '2024-01-15', status: 'applied' },
  { id: '2', position: 'Full Stack Engineer', company: 'StartupXYZ', location: 'Remote', appliedDate: '2024-01-14', status: 'interview', notes: 'Technical round on Friday' },
  { id: '3', position: 'ML Engineer', company: 'AI Solutions', location: 'Chittagong', salary: '$3000/mo', appliedDate: '2024-01-10', status: 'applied' },
  { id: '4', position: 'DevOps Engineer', company: 'CloudTech', location: 'Remote', appliedDate: '2024-01-08', status: 'offer', salary: '$2800/mo', notes: 'Pending response' },
  { id: '5', position: 'Junior Backend Dev', company: 'WebAgency', location: 'Dhaka', appliedDate: '2024-01-05', status: 'rejected', notes: 'Not enough experience' },
]

const statusConfig = {
  applied: { label: 'Applied', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700', icon: Clock },
  interview: { label: 'Interview', color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700', icon: AlertCircle },
  offer: { label: 'Offer', color: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-50 border-red-200', textColor: 'text-red-700', icon: XCircle }
}

const ApplicationCard = ({ app }: { app: Application }) => {
  const [showMenu, setShowMenu] = useState(false)
  const config = statusConfig[app.status]

  return (
    <div className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-md transition-all">
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

      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {app.location}
        </span>
        {app.salary && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {app.salary}
          </span>
        )}
      </div>

      {app.notes && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 mb-3">
          {app.notes}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Applied {app.appliedDate}
        </span>
        {app.url && (
          <a 
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {showMenu && (
        <div className="absolute right-4 mt-2 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
            <Edit3 className="w-4 h-4" /> Edit
          </button>
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-red-600">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

const KanbanColumn = ({ 
  status, 
  applications 
}: { 
  status: ApplicationStatus
  applications: Application[]
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
          <ApplicationCard key={app.id} app={app} />
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
  const [showAddForm, setShowAddForm] = useState(false)
  const [newApp, setNewApp] = useState({
    position: '',
    company: '',
    location: '',
    salary: '',
    url: ''
  })

  const applications = mockApplications

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
              href="/dashboard"
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

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applied', value: applications.length, color: 'text-blue-600' },
            { label: 'Interviews', value: applications.filter(a => a.status === 'interview').length, color: 'text-amber-600' },
            { label: 'Offers', value: applications.filter(a => a.status === 'offer').length, color: 'text-emerald-600' },
            { label: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: 'text-red-600' }
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
              applications={applications.filter(a => a.status === status)}
            />
          ))}
        </div>
      </div>

      {/* Add Application Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Add New Application</h2>
            
            <form onSubmit={(e) => { e.preventDefault(); setShowAddForm(false) }} className="space-y-4">
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
                    placeholder="Dhaka"
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
                  value={newApp.url}
                  onChange={(e) => setNewApp({ ...newApp, url: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Add Application
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