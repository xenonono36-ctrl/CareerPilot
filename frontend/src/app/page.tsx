import Link from 'next/link'
import { 
  FileText, 
  Briefcase, 
  MessageSquare, 
  CheckSquare, 
  BarChart3,
  Sparkles,
  ArrowRight,
  Zap
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CareerPilot
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/sign-in"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered Career Assistant
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              Land Your Dream Job{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                10x Faster
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-10">
              CareerPilot uses AI to match your skills with perfect opportunities, 
              optimize your CV, and prepare you for interviews — all in one intelligent workspace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25"
              >
                Start Free Today
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-700 hover:border-slate-300 transition-all"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-200/30 rounded-full blur-3xl -z-10" />
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Four powerful pillars working together to accelerate your career journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FileText,
                title: 'Smart CV Analysis',
                description: 'Upload your CV and get AI-powered skill extraction, insights, and optimization suggestions.',
                color: 'bg-blue-500'
              },
              {
                icon: Briefcase,
                title: 'Intelligent Job Matching',
                description: 'Find opportunities that match your unique profile with our semantic fit score algorithm.',
                color: 'bg-emerald-500'
              },
              {
                icon: MessageSquare,
                title: 'AI Career Chat',
                description: 'Get personalized career advice, cover letters, and interview prep powered by your CV.',
                color: 'bg-purple-500'
              },
              {
                icon: CheckSquare,
                title: 'Task Tracker',
                description: 'Stay organized with smart task management and AI-generated reminders.',
                color: 'bg-amber-500'
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="group relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            {[
              { value: '95%+', label: 'CV Processing Success' },
              { value: '<5s', label: 'Chat Response Time' },
              { value: '10x', label: 'Faster Job Discovery' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take Control of Your Career?
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Join thousands of professionals who have accelerated their job search with CareerPilot.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-slate-900 px-8 py-4 text-lg font-semibold hover:bg-slate-100 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">CareerPilot</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2024 CareerPilot. AI-powered career success.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}