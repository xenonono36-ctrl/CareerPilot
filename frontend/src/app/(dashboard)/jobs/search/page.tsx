'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Filter, 
  ChevronDown,
  Building2,
  Clock,
  DollarSign,
  ExternalLink,
  Bookmark,
  Star
} from 'lucide-react'
import { useJobSearchStore, type Job } from '@/store/jobStore'

const JobCard = ({ job }: { job: Job }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-200">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{job.title}</h3>
        <p className="text-slate-600 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          {job.company}
        </p>
      </div>
      {job.fitScore && (
        <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold">
          <Star className="w-4 h-4" />
          {job.fitScore}%
        </div>
      )}
    </div>
    
    <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
      <span className="flex items-center gap-1">
        <MapPin className="w-4 h-4" />
        {job.location}
      </span>
      <span className="flex items-center gap-1">
        <Briefcase className="w-4 h-4" />
        {job.type}
      </span>
      {job.salary && (
        <span className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          {job.salary}
        </span>
      )}
      <span className="flex items-center gap-1">
        <Clock className="w-4 h-4" />
        {job.postedDate}
      </span>
    </div>
    
    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{job.description}</p>
    
    {job.requirements.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {job.requirements.slice(0, 4).map((req, i) => (
          <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
            {req}
          </span>
        ))}
        {job.requirements.length > 4 && (
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
            +{job.requirements.length - 4} more
          </span>
        )}
      </div>
    )}
    
    <div className="flex gap-2">
      <a 
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Apply Now
        <ExternalLink className="w-4 h-4" />
      </a>
      <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
        <Bookmark className="w-5 h-5 text-slate-400" />
      </button>
    </div>
  </div>
)

export default function JobsSearchPage() {
  const { user } = useUser()
  const { searchQuery, setSearchQuery, results, setResults, loading, setLoading } = useJobSearchStore()
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Mock search for demo
    setTimeout(() => {
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Senior Full Stack Developer',
          company: 'TechCorp Bangladesh',
          location: 'Dhaka, Bangladesh',
          type: 'Full-time',
          description: 'Join our engineering team to build scalable web applications serving millions of users worldwide.',
          requirements: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
          salary: '$2,000 - $3,000',
          postedDate: '2 days ago',
          url: 'https://example.com/job/1',
          fitScore: 87
        },
        {
          id: '2',
          title: 'Machine Learning Engineer',
          company: 'DataFlow Inc',
          location: 'Remote',
          type: 'Full-time',
          description: 'Build and deploy ML models for our recommendation systems and data analytics platform.',
          requirements: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Docker'],
          salary: '$3,000 - $5,000',
          postedDate: '1 week ago',
          url: 'https://example.com/job/2',
          fitScore: 72
        },
        {
          id: '3',
          title: 'Junior Web Developer',
          company: 'StartupXYZ',
          location: 'Chittagong, Bangladesh',
          type: 'Contract',
          description: 'Help build our MVP and grow with our startup. Great opportunity for fresh graduates.',
          requirements: ['HTML', 'CSS', 'JavaScript', 'React Basics'],
          salary: '$800 - $1,200',
          postedDate: '3 days ago',
          url: 'https://example.com/job/3',
          fitScore: 65
        }
      ]
      setResults(mockJobs)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CareerPilot
              </span>
            </Link>
            <Link 
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Find Your Dream Job</h1>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search jobs... (e.g., 'ML internships in Dhaka')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="w-full md:w-48">
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Job Type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search Jobs'}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div>
            <p className="text-slate-600 mb-4">{results.length} jobs found</p>
            <div className="grid md:grid-cols-2 gap-6">
              {results.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No jobs found</h3>
            <p className="text-slate-500">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}