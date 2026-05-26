import Link from 'next/link'
import { 
  FileText, 
  Crosshair, 
  MessageSquare, 
  CheckSquare, 
  ArrowRight,
  Zap,
  Cpu,
  ShieldCheck,
  Activity
} from 'lucide-react'

export default function Home() {
  return (
    <div className="relative max-w-7xl mx-auto px-6">
      
      {/* INTRO SPECTRUM / HERO GRID HERO */}
      <section className="pt-24 pb-16 text-center relative max-w-4xl mx-auto">
        
        {/* Glow Anchors */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 -z-10 w-72 h-72 bg-indigo-500/10 blur-[100px] rounded-full" />

        {/* Cyber Pill Notification */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-500/20 backdrop-blur-md text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <Cpu className="w-3.5 h-3.5 animate-pulse text-cyan-400" /> SYSTEM CORE INTEL v2.06
        </div>
        
        {/* Futuristic H1 Header Block */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-8 font-sans">
          LAND YOUR <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]">DREAM JOB</span> <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(6,182,212,0.35)]">
            10X FASTER.
          </span>
        </h1>
        
        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed mb-12 tracking-wide">
          CareerPilot coordinates neural matching nodes with target enterprise frameworks to optimize vectors, compile interactive resume variants, and process full interview modeling.
        </p>
        
        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href="/sign-up" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-sm font-bold text-white tracking-wider uppercase shadow-[0_4px_30px_rgba(6,182,212,0.3)] transition-all duration-300 hover:shadow-[0_4px_45px_rgba(6,182,212,0.55)] hover:scale-[1.01] border border-cyan-300/20">
            LAUNCH SYSTEM <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-950/80 border border-cyan-500/10 text-sm font-bold font-mono text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all backdrop-blur-md tracking-wider">
            RUN DEMO
          </Link>
        </div>
      </section>

      {/* ISOMETRIC HORACTIVE SYSTEM INTERFACE MATRICES */}
      <section className="relative my-16 rounded-2xl border border-cyan-500/10 bg-gradient-to-b from-slate-950/60 to-black/80 backdrop-blur-xl p-1 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* Subtle Ambient Scanner Line effect */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-40 shadow-[0_0_12px_rgba(6,182,212,0.8)]" />

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-cyan-500/10 text-center font-mono py-8 bg-slate-950/20">
          
          <div className="p-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500 tracking-widest">
              <Activity className="w-3.5 h-3.5 text-cyan-500/60" /> CV PARSE EFFICIENCY
            </div>
            <div className="text-4xl md:text-5xl font-black text-cyan-400 tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.25)]">95%+</div>
            <div className="text-[10px] text-cyan-500/50 font-bold">STATUS [OPTIMAL]</div>
          </div>

          <div className="p-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500 tracking-widest">
              <Cpu className="w-3.5 h-3.5 text-purple-500/60" /> LATENCY RATIO
            </div>
            <div className="text-4xl md:text-5xl font-black text-purple-400 tracking-tight drop-shadow-[0_0_15px_rgba(168,85,247,0.25)]">&lt;5ms</div>
            <div className="text-[10px] text-purple-500/50 font-bold">NODE RESPONSE TIME</div>
          </div>

          <div className="p-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500 tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500/60" /> VECTOR MATCHING multiplier
            </div>
            <div className="text-4xl md:text-5xl font-black text-indigo-400 tracking-tight drop-shadow-[0_0_15px_rgba(99,102,241,0.25)]">10x</div>
            <div className="text-[10px] text-indigo-500/50 font-bold">DATA EXPANSION RATIO</div>
          </div>

        </div>
      </section>

      {/* BENCHMARK HUD FEATURES MODULE MATRIX */}
      <section className="py-16 relative">
        <div className="text-center mb-20 space-y-3">
          <div className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase">
          
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            AI Core Architecture
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Simultaneous multi-threaded sub-routines optimizing your employment data vector paths
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1 */}
          <div className="group relative rounded-2xl bg-[#090d16]/40 border border-cyan-500/10 p-8 md:p-10 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.05)] hover:-translate-y-1 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors font-mono tracking-tight">Smart CV Analysis</h3>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
              Parse raw unstructured data points into organized structured JSON manifests, highlighting optimal skill keywords for automated applicant sorting algorithms.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-2xl bg-[#090d16]/40 border border-cyan-500/10 p-8 md:p-10 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.05)] hover:-translate-y-1 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <Crosshair className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-400 transition-colors font-mono tracking-tight">Intelligent Job Matching</h3>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
              Run continuous spatial classification scoring across thousands of changing vacancies to deliver real-time, context-aware semantic pipeline recommendations.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-2xl bg-[#090d16]/40 border border-cyan-500/10 p-8 md:p-10 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] hover:-translate-y-1 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors font-mono tracking-tight">AI Career Chat</h3>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
              Interact with custom fine-tuned conversational engines designed to simulate challenging behavioral review models and instantly generate precise cover letters.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group relative rounded-2xl bg-[#090d16]/40 border border-cyan-500/10 p-8 md:p-10 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] hover:-translate-y-1 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors font-mono tracking-tight">Task Tracker</h3>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
              Keep critical communication checkpoints under active automated review. Manage interview schedules and optimize follow-up triggers without leaving the terminal.
            </p>
          </div>

        </div>
      </section>

      {/* CORE SYNC CALL TO ACTION ACCELERATOR */}
      <section className="py-16 relative">
        <div className="relative rounded-2xl border border-cyan-500/10 bg-gradient-to-b from-[#060b13]/90 to-black p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {/* Accent lighting dots inside the container panel */}
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            Initialize Your Autonomous Career Node
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto mb-8 font-medium">
            Connect to the primary CareerPilot environment network grid to map and scale your industry trajectory with high-precision AI modules.
          </p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-cyan-400/40 bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 text-xs font-bold font-mono tracking-widest uppercase text-cyan-400 shadow-[0_4px_25px_rgba(6,182,212,0.15)] hover:border-cyan-400/80 hover:scale-[1.01] transition-transform">
            ESTABLISH CONNECTION <Zap className="w-3.5 h-3.5 fill-cyan-400/20" />
          </Link>
        </div>
      </section>

    </div>
  )
}