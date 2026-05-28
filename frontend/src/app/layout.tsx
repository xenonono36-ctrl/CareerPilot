import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import Link from 'next/link'
import { Compass } from 'lucide-react'
import './globals.css'

export const metadata: Metadata = {
  title: 'CareerPilot - AI-Powered Career Assistant',
  description: 'Your AI-powered career assistant for job search, CV optimization, and interview preparation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth" style={{ fontSize: '18px' }}>
        <head>
          {/* Bebas Neue Font */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Basenji&display=swap" rel="stylesheet" />
          
          {/* Orbitron Font - Google Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap" rel="stylesheet" />
          <style>{`
            .font-moonhouse {
              font-family: 'Orbitron', sans-serif !important;
              font-weight: 700;
            }
          `}</style>
          
          {/* Custom injection layer for advanced sci-fi scanning & smooth rotation mechanics */}
          <style>{`
            @keyframes smooth-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes pulse-scan {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.02); }
            }
            .animate-spin-slow {
              animation: smooth-spin 25s linear infinite !important;
            }
            .animate-pulse-scan {
              animation: pulse-scan 8s ease-in-out infinite;
            }
            .cyber-grid {
              background-image: 
                linear-gradient(to right, rgba(6, 182, 212, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(6, 182, 212, 0.04) 1px, transparent 1px);
              background-size: 40px 40px;
            }
          `}</style>
        </head>
        <body className="bg-[#030712] text-slate-100 font-['Bebas_Neue'] selection:bg-cyan-500/30 selection:text-white overflow-x-hidden min-h-screen antialiased relative" style={{ letterSpacing: '0.05em' }}>
          
          {/* Background Cyber Grid Matrix & Radial Plasma Glow */}
          <div className="absolute inset-0 cyber-grid pointer-events-none -z-20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] bg-[radial-gradient(circle_at_50%_-10%,rgba(6,182,212,0.15)_0%,rgba(139,92,246,0.05)_45%,transparent 70%)] pointer-events-none -z-10 animate-pulse-scan" />

          {/* STICKY SCI-FI HEADER */}
          <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#030712]/60 border-b border-cyan-500/10 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              
              {/* Brand Core */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="p-2 bg-gradient-to-br from-cyan-500 via-cyan-400 to-indigo-500 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center border border-cyan-400/20">
                  <Compass className="w-6 h-6 text-white animate-spin-slow" />
                </div>
                <span className="text-xl font-bold tracking-widest text-white font-['Bebas_Neue']">
                  CareerPilot
                </span>
              </Link>
              
              {/* Actions / Terminal Controls */}
              <div className="flex items-center gap-6">
                <Link href="/sign-in" className="text-sm font-semibold text-white hover:text-cyan-400 transition-all duration-300 hover:scale-110">
                  SIGN IN
                </Link>
                <Link href="/sign-up" className="relative group overflow-hidden px-5 py-2.5 rounded-lg border border-cyan-400/30 bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 text-sm font-bold text-cyan-400 tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:border-cyan-400/60 hover:scale-[1.02]">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Get Started
                </Link>
              </div>

            </div>
          </header>

          {/* APP INTERACTIVE SURFACE */}
          <main>
            {children}
          </main>
          {/* MATRIX COMPLIANT FOOTER
          <footer className="relative z-10 border-t border-cyan-500/5 bg-[#010409]/80 text-slate-600 mt-24">
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono tracking-widest">
              <div className="flex items-center gap-2 text-slate-400">
                <Compass className="w-4 h-4 text-cyan-500/60 animate-pulse" />
                <span>CAREERPILOT</span>
              </div>
              <div>
                &copy; 2026 CAREERPILOT.
              </div>
            </div>
          </footer> */}

          <Toaster position="top-right" richColors />
          
        </body>
      </html>
    </ClerkProvider>
  )
}