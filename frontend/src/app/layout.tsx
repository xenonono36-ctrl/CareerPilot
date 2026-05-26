import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import Link from 'next/link'
import { Compass } from 'lucide-react'
import './globals.css'

export const metadata: Metadata = {
  title: 'CareerPilot - AI Career Co-Pilot',
  description: 'Your AI-powered career assistant for job search, CV optimization, and interview preparation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className="min-h-screen bg-obsidian text-slate-100 font-sans antialiased overflow-x-hidden glow-bg-1">
          
          {/* STICKY HEADER */}
          <header className="sticky top-0 z-50 backdrop-blur-md bg-obsidian/70 border-b border-slate-800/60 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              
              {/* Logo / Brand */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="p-2 bg-gradient-to-br from-neonCyan to-neonIndigo rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  <Compass className="w-6 h-6 text-white animate-spin-slow" />
                </div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  CareerPilot
                </span>
              </Link>
              
              {/* Actions */}
              <div className="flex items-center gap-6">
                <Link href="/sign-in" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/sign-up" className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-neonCyan to-neonIndigo text-sm font-semibold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-[1.02]">
                  Get Started
                </Link>
              </div>

            </div>
          </header>

          {/* PAGE INNER CONTENT */}
          <main>
            {children}
          </main>

          {/* FOOTER */}
          <footer className="border-t border-slate-900 bg-black/30 text-slate-500 mt-20">
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-slate-400" />
                <span className="font-bold text-slate-300 tracking-tight">CareerPilot</span>
              </div>
              <div>
                &copy; 2026 CareerPilot. AI-powered career success.
              </div>
            </div>
          </footer>

          {/* NOTIFICATIONS CONTAINER */}
          <Toaster position="top-right" richColors />
          
        </body>
      </html>
    </ClerkProvider>
  )
}