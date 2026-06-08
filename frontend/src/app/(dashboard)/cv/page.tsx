'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { 
  Upload, 
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  Download,
  Trash2,
  Eye,
  Briefcase,
  GraduationCap,
  FolderKanban
} from 'lucide-react'
import apiClient from '@/lib/api'

interface CVStatus {
  cv_id: string
  filename: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  skills: string[]
  experience_years: number | null
  education: string[]
  sections: {
    skills: string[]
    education: any[]
    experience: any[]
    projects: any[]
  }
  processed_at: string | null
}

export default function CVPage() {
  const { user } = useUser()
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [cvData, setCvData] = useState<CVStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiClient.get<CVStatus>('/api/cv/status')
      setCvData(res.data)
      setUploadError(null)
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setUploadError(err.response?.data?.detail || err.message || 'Failed to load CV')
      }
      setCvData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Poll for processing status when CV is in-flight
  useEffect(() => {
    if (!cvData || cvData.status !== 'processing') return
    const interval = setInterval(() => {
      fetchStatus().catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [cvData?.status, fetchStatus])

  const handleDrag = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post('/api/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      // Optimistic placeholder; status poll will fill in real data
      setCvData({
        cv_id: res.data.cv_id,
        filename: file.name,
        status: 'processing',
        skills: [],
        experience_years: null,
        education: [],
        sections: { skills: [], education: [], experience: [], projects: [] },
        processed_at: null,
      })
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete your CV? This cannot be undone.')) return
    setActionLoading(true)
    try {
      await apiClient.delete('/api/cv/')
      setCvData(null)
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || err.message || 'Delete failed')
    } finally {
      setActionLoading(false)
    }
  }

  const isProcessing = uploading || cvData?.status === 'processing' || cvData?.status === 'pending'
  const uploadDate = cvData?.processed_at
    ? new Date(cvData.processed_at).toISOString().split('T')[0]
    : null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">My CV</span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {uploadError && (
          <div className="mb-6 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Upload Section */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 hover:border-blue-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
              <p className="text-lg font-medium text-slate-900">
                {uploading ? 'Uploading your CV...' : 'AI is analyzing your CV...'}
              </p>
              <p className="text-sm text-slate-500">
                {uploading ? 'Sending to server' : 'Extracting skills, experience, and education'}
              </p>
            </div>
          ) : (
            <>
              <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-900 mb-2">
                Drag and drop your CV here
              </p>
              <p className="text-sm text-slate-500 mb-4">or</p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
                <FileText className="w-5 h-5" />
                Browse Files
                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0])
                    }
                  }}
                />
              </label>
              <p className="text-xs text-slate-400 mt-4">Supports PDF, DOCX up to 10MB</p>
            </>
          )}
        </div>

        {/* Current CV */}
        {loading && !cvData ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : cvData && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Current CV</h2>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{cvData.filename}</h3>
                    <p className="text-sm text-slate-500">
                      {uploadDate ? `Processed on ${uploadDate}` : 'Processing...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cvData.status === 'completed' ? (
                    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Processed
                    </span>
                  ) : cvData.status === 'failed' ? (
                    <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Failed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing
                    </span>
                  )}
                </div>
              </div>

              {/* Skills */}
              {cvData.status === 'completed' && cvData.skills.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-slate-700 mb-3">
                    Extracted Skills ({cvData.skills.length})
                    {cvData.experience_years != null && (
                      <span className="ml-2 text-xs text-slate-500 font-normal">
                        · {cvData.experience_years} years experience
                      </span>
                    )}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cvData.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sections summary */}
              {cvData.status === 'completed' && (
                <div className="mb-6 grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-xs font-medium">Experience</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {cvData.sections.experience?.length || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-xs font-medium">Education</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {cvData.sections.education?.length || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <FolderKanban className="w-4 h-4" />
                      <span className="text-xs font-medium">Projects</span>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {cvData.sections.projects?.length || 0}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}