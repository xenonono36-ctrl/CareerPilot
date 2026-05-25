'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { 
  Upload, 
  FileText, 
  Star,
  CheckCircle,
  Loader2,
  AlertCircle,
  X,
  Download,
  Trash2,
  Eye
} from 'lucide-react'

const mockCV = {
  name: 'Resume_Ahmed_Khan.pdf',
  uploadDate: '2024-01-15',
  status: 'processed',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Docker'],
  summary: 'Full-stack developer with 3 years of experience building web applications...'
}

export default function CVPage() {
  const { user } = useUser()
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [cvData, setCvData] = useState(mockCV)

  const handleDrag = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragActive) setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    // Handle file drop
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    // Simulate upload
    setTimeout(() => {
      setUploading(false)
      setUploadSuccess(true)
      setCvData({
        ...cvData,
        name: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'processing'
      })
      
      setTimeout(() => {
        setCvData(prev => ({ ...prev, status: 'processed' }))
      }, 2000)
    }, 2000)
  }

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
          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
              <p className="text-lg font-medium text-slate-900">Uploading your CV...</p>
              <p className="text-sm text-slate-500">Processing with AI...</p>
            </div>
          ) : uploadSuccess ? (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
              <p className="text-lg font-medium text-emerald-700">CV uploaded successfully!</p>
              <p className="text-sm text-slate-500">AI is analyzing your skills...</p>
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
                  accept=".pdf,.doc,.docx" 
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0])
                    }
                  }}
                />
              </label>
              <p className="text-xs text-slate-400 mt-4">Supports PDF, DOC, DOCX up to 10MB</p>
            </>
          )}
        </div>

        {/* Current CV */}
        {cvData && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Current CV</h2>
            
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{cvData.name}</h3>
                    <p className="text-sm text-slate-500">
                      Uploaded on {cvData.uploadDate}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {cvData.status === 'processed' ? (
                    <span className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Processed
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
              {cvData.status === 'processed' && (
                <>
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Extracted Skills</h4>
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

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">AI Summary</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4">
                      {cvData.summary}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}