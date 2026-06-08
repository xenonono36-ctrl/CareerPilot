'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  CheckSquare,
  Settings,
  LogOut,
  Upload,
  Sparkles,
  TrendingUp,
  Calendar,
  ChevronRight,
  FileText,
  X,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import apiClient from '@/lib/api'

interface KanbanData {
  applied: any[]
  interviewing: any[]
  offer: any[]
  rejected: any[]
}

interface TaskStats {
  total: number
  pending: number
  completed: number
}

interface CVSummary {
  cv_id: string
  filename: string
  status: string
  skills: string[]
  experience_years: number | null
}
const StatCard = ({ label, value, icon: Icon, trend }: any) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        {trend && (
          <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> {trend}
          </p>
        )}
      </div>
      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
    </div>
  </div>
)

export default function DashboardClient() {
  const { user } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const [kanban, setKanban] = useState<KanbanData | null>(null)
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [cv, setCv] = useState<CVSummary | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const userName = user?.firstName || 'there'
  const initials = user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0] || 'U'

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const [appsRes, tasksRes, cvRes] = await Promise.allSettled([
        apiClient.get<KanbanData>('/api/applications'),
        apiClient.get<TaskStats & { tasks: any[] }>('/api/tasks'),
        apiClient.get<CVSummary>('/api/cv/status'),
      ])

      if (appsRes.status === 'fulfilled') setKanban(appsRes.value.data)
      if (tasksRes.status === 'fulfilled') {
        const d = tasksRes.value.data
        setTaskStats({ total: d.total, pending: d.pending, completed: d.completed })
      }
      if (cvRes.status === 'fulfilled') setCv(cvRes.value.data)
    } catch (err) {
      // Leave state empty on error
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const totalApps = kanban
    ? kanban.applied.length + kanban.interviewing.length + kanban.offer.length + kanban.rejected.length
    : 0
  const interviewCount = kanban ? kanban.interviewing.length : 0
  const offerCount = kanban ? kanban.offer.length : 0
  const completedTasks = taskStats?.completed ?? 0
  const pendingTasks = taskStats?.pending ?? 0
  const skillCount = cv?.skills?.length ?? 0
  const profileComplete = skillCount > 0 ? Math.min(100, Math.round((skillCount / 15) * 100)) : 0
  const experienceYears = cv?.experience_years ?? 0

  // Build recent activity from real data
  const recentApps = kanban
    ? [...kanban.applied, ...kanban.interviewing, ...kanban.offer]
        .slice(-3)
        .reverse()
        .map((a) => ({
          title: `${a.role || a.title || 'Application'} at ${a.company || 'Company'}`,
          time: a.applied_date ? new Date(a.applied_date).toLocaleDateString() : 'Recent',
          type: 'application' as const,
        }))
    : []

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CareerPilot
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview', href: '/' },
            { id: 'jobs', icon: Briefcase, label: 'Job Search', href: '/jobs' },
            { id: 'chat', icon: MessageSquare, label: 'AI Assistant', href: '/chat' },
            { id: 'tasks', icon: CheckSquare, label: 'Tasks', href: '/tasks' },
          ].map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {initials.toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userName}!</h1>
              <p className="text-slate-500">Here's what's happening with your career today.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/cv"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload CV
              </Link>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="p-8">
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              label="Applications" 
              value={statsLoading ? '—' : totalApps}
              icon={Briefcase}
              trend={offerCount > 0 ? `${offerCount} offer${offerCount === 1 ? '' : 's'}` : undefined}
            />
            <StatCard
              label="Tasks Complete"
              value={statsLoading ? '—' : completedTasks}
              icon={CheckSquare}
              trend={pendingTasks > 0 ? `${pendingTasks} pending` : 'All done'}
            />
            <StatCard
              label="Interviews"
              value={statsLoading ? '—' : interviewCount}
              icon={Calendar}
            />
            <StatCard
              label="Profile"
              value={statsLoading ? '—' : `${profileComplete}%`}
              icon={TrendingUp}
            />
          </div>

          {/* Quick actions and recent activity */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href="/jobs/search"
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-slate-700">Search Jobs</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                </Link>
                <Link
                  href="/chat"
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-slate-700">AI Assistant</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600" />
                </Link>
                <Link
                  href="/tasks"
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-5 h-5 text-amber-600" />
                    <span className="font-medium text-slate-700">View Tasks</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600" />
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
              {recentApps.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  {statsLoading ? 'Loading...' : 'No applications yet. Start by searching for jobs.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApps.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        item.type === 'application' ? 'bg-blue-500' :
                        item.type === 'task' ? 'bg-emerald-500' : 'bg-purple-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CV Status Card */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5" />
                  <span className="font-semibold">Your CV Status</span>
                </div>
                {cv ? (
                  <p className="text-blue-100 mb-4">
                    {cv.status === 'completed'
                      ? `Your CV is analyzed. ${skillCount} skills detected${experienceYears ? `, ${experienceYears} years of experience` : ''}.`
                      : cv.status === 'processing' || cv.status === 'pending'
                      ? 'Your CV is being processed...'
                      : 'Your CV needs to be re-uploaded.'}
                  </p>
                ) : (
                  <p className="text-blue-100 mb-4">
                    Upload your CV to unlock AI-powered job matching and insights.
                  </p>
                )}
                <Link
                  href="/cv"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  {cv ? 'View Details' : 'Upload CV'}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{profileComplete}%</div>
                <p className="text-blue-100 text-sm">Profile Completeness</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}