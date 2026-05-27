'use client';

import Image from 'next/image'
import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  FileText,
  Crosshair,
  MessageSquare,
  CheckSquare,
  ArrowRight,
  ArrowUp,
  Zap,
  Cpu,
  ShieldCheck,
  Activity,
  Search,
  Rocket,
  Mail
} from 'lucide-react'

export default function Home() {
  const dotRef = useRef<HTMLDivElement>(null);
  const launchButtonRef = useRef<HTMLAnchorElement>(null);
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number } | null>(null);
  const [isHovering, setIsHovering] = React.useState(false);
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  // High-performance, zero-latency custom cursor tracking with active click states
  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    const mouse = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Instant execution: No delay, no lag interpolation
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    };

    const handleMouseDown = () => {
      dot.classList.add('cursor-active-click');
    };

    const handleMouseUp = () => {
      dot.classList.remove('cursor-active-click');
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"]')) {
        dot.classList.add('cursor-hover-button');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"]')) {
        dot.classList.remove('cursor-hover-button');
      }
    };

    const handleLaunchMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!launchButtonRef.current) return;
      const rect = launchButtonRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleLaunchMouseEnter = () => setIsHovering(true);
    const handleLaunchMouseLeave = () => {
      setIsHovering(false);
      setMousePos(null);
    };

    // Back to top button visibility
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      // Show button when scrolled to last 300px
      setShowBackToTop(scrollTop + clientHeight >= scrollHeight - 300);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // LAUNCH SYSTEM button mouse-tracking effect
  const handleLaunchMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!launchButtonRef.current) return;
    const rect = launchButtonRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleLaunchMouseEnter = () => setIsHovering(true);
  const handleLaunchMouseLeave = () => {
    setIsHovering(false);
    setMousePos(null);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-6">

      {/* Video Background with Glassmorphism */}
      <div className="fixed inset-0 -z-10">
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src="/AERUK-BG-ANIM.webm"
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-3xl" />
      </div>

      {/* AERUKART GENUINE CURSOR EMULATION */}
      <style dangerouslySetInnerHTML={{
        __html: `
        body, a, button, [role="button"] { cursor: none !important; }
        
        /* Transition timing restricted ONLY to size scales to guarantee 0ms movement lag */
        .cursor-node {
          transition: width 0.2s ease, height 0.2s ease, background-color 0.2s ease, border 0.2s ease;
        }
        
        /* Active Expanded State: Translucent ring expansion */
        .cursor-active-click {
          width: 38px !important;
          height: 38px !important;
          background-color: #032d30 !important;
          border: 1px solid rgba(34, 211, 238, 0.5) !important;
          box-shadow: 0 0 20px 2px #06b6d4, inset 0 0 10px rgba(6, 182, 212, 0.5) !important;
        }
        
        /* Hover State: Larger with dark cyan fill, light cyan outline, and Gaussian blur */
        .cursor-hover-button {
          width: 30px !important;
          height: 30px !important;
          background-color: rgba(13, 61, 66, 0.2) !important;
          border: 2px solid #06b6d4 !important;
          box-shadow: 0 0 12px 3px rgba(6, 182, 212, 0.5), 0 0 25px 6px rgba(6, 182, 212, 0.3) !important;
          backdrop-filter: blur(8px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(8px) saturate(180%) !important;
        }
      `}} />

      {/* 1. Single Custom Dot Node */}
      <div
        ref={dotRef}
        className="cursor-node fixed top-0 left-0 w-[15px] h-[15px] bg-cyan-300 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 will-change-transform shadow-[0_0_8px_3px_rgba(6,182,212,0.5),0_0_20px_10px_rgba(6,182,212,0.25),0_0_40px_20px_rgba(6,182,212,0.1)]"
      />

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
          <Link
            href="/sign-up"
            ref={launchButtonRef}
            onMouseMove={handleLaunchMouseMove}
            onMouseEnter={handleLaunchMouseEnter}
            onMouseLeave={handleLaunchMouseLeave}
            className="relative inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full text-sm font-bold text-white tracking-wider uppercase border border-cyan-400/40 overflow-hidden group transition-all duration-300 hover:scale-105"
            style={{
              background: '#064e5a',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.35), 0 0 30px rgba(6, 182, 212, 0.15)',
            }}
          >
            {/* Full button glow overlay on hover */}
            {isHovering && (
              <span
                className="absolute inset-0 pointer-events-none transition-all duration-300"
                style={{
                  background: 'rgba(6, 182, 212, 0.8)',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.6), 0 0 40px rgba(6, 182, 212, 0.3)',
                }}
              />
            )}
            {/* Mouse-tracking bright spot */}
            {isHovering && mousePos && (
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(100px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.5), transparent 70%)`,
                }}
              />
            )}
            <span className="relative z-10">LAUNCH SYSTEM</span>
            <ArrowRight className="relative z-10 w-4 h-4" />
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-950/80 border border-cyan-500/10 text-sm font-bold font-mono text-white hover:text-cyan-400 hover:border-cyan-500/30 hover:scale-105 transition-all duration-300 backdrop-blur-md tracking-wider">
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
            <div className="text-4xl md:text-5xl font-black text-cyan-400 tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.25)] font-['Bebas_Neue']" style={{ letterSpacing: '0.1em' }}>95%+</div>
            <div className="text-[10px] text-cyan-500/50 font-bold">STATUS [OPTIMAL]</div>
          </div>

          <div className="p-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500 tracking-widest">
              <Cpu className="w-3.5 h-3.5 text-purple-500/60" /> LATENCY RATIO
            </div>
            <div className="text-4xl md:text-5xl font-black text-purple-400 tracking-tight drop-shadow-[0_0_15px_rgba(168,85,247,0.25)] font-['Bebas_Neue']" style={{ letterSpacing: '0.1em' }}>&lt;5ms</div>
            <div className="text-[10px] text-purple-500/50 font-bold">NODE RESPONSE TIME</div>
          </div>

          <div className="p-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500 tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500/60" /> VECTOR MATCHING multiplier
            </div>
            <div className="text-4xl md:text-5xl font-black text-indigo-400 tracking-tight drop-shadow-[0_0_15px_rgba(99,102,241,0.25)] font-['Bebas_Neue']" style={{ letterSpacing: '0.1em' }}>10x</div>
            <div className="text-[10px] text-indigo-500/50 font-bold">DATA EXPANSION RATIO</div>
          </div>

        </div>
      </section>

      {/* TRUSTED BY PROFESSIONALS SECTION - Full Width */}
      <div className="w-screen relative left-1/2 -translate-x-1/2">
        <section className="py-12 relative overflow-hidden">
          <div className="text-center mb-8 px-4">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3 font-['Bebas_Neue']" style={{ letterSpacing: '0.05em' }}>
              Trusted by Professionals at Leading Companies
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto font-medium">
              Join thousands of job seekers who have landed roles at top organizations with CareerPilot
            </p>
          </div>

          {/* Infinite Scroll Logo Carousel - Full Width */}
          <div className="relative w-full overflow-hidden">
            {/* Gradient masks for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-slate-950 via-slate-950/95 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-slate-950 via-slate-950/95 to-transparent z-10 pointer-events-none" />

            <div className="flex gap-16 animate-[scroll_40s_linear_infinite]">
              {/* First set of logos */}
              {[
                { name: 'Google', slug: 'google' },
                { name: 'Microsoft', slug: 'microsoft' },
                { name: 'Amazon', slug: 'amazon' },
                { name: 'Apple', slug: 'apple' },
                { name: 'Meta', slug: 'meta' },
                { name: 'Netflix', slug: 'netflix' },
                { name: 'Tesla', slug: 'tesla' },
                { name: 'IBM', slug: 'IBM' },
                { name: 'Adobe', slug: 'Adobe' },
                { name: 'Salesforce', slug: 'salesforce' },
                { name: 'Oracle', slug: 'Oracle' },
                { name: 'Shopify', slug: 'shopify' },
                { name: 'NVIDIA', slug: 'nvidia' },
                { name: 'Intel', slug: 'intel' },
                { name: 'Coca-Cola', slug: 'cocacola' },
                { name: 'Delta', slug: 'delta' },
                { name: 'Walmart', slug: 'walmart' },
                { name: 'JP Morgan', slug: 'jpmorgan' },
                { name: 'Deloitte', slug: 'deloitte' },
              ].map((company, i) => (
                <div key={`first-${i}`} className="flex-shrink-0 flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-opacity duration-300">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <Image src={`/logos/${company.slug}.png`} alt={company.name} width={64} height={64} className="w-auto h-auto max-w-16 max-h-16 object-contain" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 tracking-wide">{company.name}</span>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {[
                { name: 'Google', slug: 'google' },
                { name: 'Microsoft', slug: 'microsoft' },
                { name: 'Amazon', slug: 'amazon' },
                { name: 'Apple', slug: 'apple' },
                { name: 'Meta', slug: 'meta' },
                { name: 'Netflix', slug: 'netflix' },
                { name: 'Tesla', slug: 'tesla' },
                { name: 'IBM', slug: 'IBM' },
                { name: 'Adobe', slug: 'Adobe' },
                { name: 'Salesforce', slug: 'salesforce' },
                { name: 'Oracle', slug: 'Oracle' },
                { name: 'Shopify', slug: 'shopify' },
                { name: 'NVIDIA', slug: 'nvidia' },
                { name: 'Intel', slug: 'intel' },
                { name: 'Coca-Cola', slug: 'cocacola' },
                { name: 'Delta', slug: 'delta' },
                { name: 'Walmart', slug: 'walmart' },
                { name: 'JP Morgan', slug: 'jpmorgan' },
                { name: 'Deloitte', slug: 'deloitte' },
              ].map((company, i) => (
                <div key={`second-${i}`} className="flex-shrink-0 flex flex-col items-center gap-3 opacity-80 hover:opacity-100 transition-opacity duration-300">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <Image src={`/logos/${company.slug}.png`} alt={company.name} width={64} height={64} className="w-auto h-auto max-w-16 max-h-16 object-contain" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 tracking-wide">{company.name}</span>
                </div>
              ))}
            </div>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}} />
        </section>
      </div>
      {/* AUTOPILOT PROTOCOL SECTION */}
      <section className="py-20 relative">

        {/* Header and Dashboard Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-16">

          {/* Left Column - Header Content */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-500/20 backdrop-blur-md text-[10px] font-mono font-bold text-cyan-400 tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(6,182,212,0.08)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                AUTOPILOT PROTOCOL
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-4 font-sans">
                PUT YOUR JOB SEARCH<br />
                ON{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(6,182,212,0.35)]">
                  AUTOPILOT.
                </span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto lg:mx-0 text-base md:text-lg">
                Stop spending hours searching, editing, and applying. CareerPilot runs the entire mission pipeline in the background.
              </p>
            </div>

            {/* Feature List - Text Only */}
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0"></span>
                Finds high-match jobs automatically
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0"></span>
                Tailors every application to the role
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0"></span>
                Tracks every reply in real-time
              </li>
            </ul>

            {/* Result Banner - Spans Full Width */}
            <div className="mt-12 text-center lg:text-left">
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-200">
                You wake up to{' '}
                <span className="text-cyan-400 font-black">applied jobs</span>
                {' '}&mdash; not a to-do list.
              </p>
            </div>
          </div>

          {/* Right Column - Autopilot Dashboard Visual */}
          <div className="relative rounded-[28px] bg-[#090d16]/60 backdrop-blur-md border border-cyan-500/10 p-7 shadow-[0_28px_64px_-14px_rgba(0,0,0,0.4),0_10px_26px_-8px_rgba(6,182,212,0.05)] overflow-hidden min-h-[480px]">

            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-inter), "Inter", sans-serif' }}>
                  Autopilot Dashboard
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Running
              </span>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0f1623] rounded-xl p-4 border border-slate-700/50">
                <div className="text-3xl font-black text-white tracking-tight">142</div>
                <div className="text-xs font-medium text-slate-400 mt-1">Applied this week</div>
              </div>
              <div className="bg-[#0f1623] rounded-xl p-4 border border-slate-700/50">
                <div className="text-3xl font-black text-white tracking-tight">89%</div>
                <div className="text-xs font-medium text-slate-400 mt-1">ATS Match</div>
              </div>
              <div className="bg-[#0f1623] rounded-xl p-4 border border-slate-700/50">
                <div className="text-3xl font-black text-white tracking-tight">17</div>
                <div className="text-xs font-medium text-slate-400 mt-1">Replies</div>
              </div>

            </div>

            {/* Activity Feed */}
            <div className="space-y-3">
              {/* Senior Frontend Engineer - Microsoft */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#0f1623] border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center bg-[#0a0f1a] overflow-hidden flex-shrink-0">
                  <Image src="/logos/microsoft.png" alt="Microsoft" width={24} height={24} className="w-5 h-5 object-contain" />
                </div>
                <span className="flex-1 text-sm font-medium text-slate-200">Senior Frontend Engineer · MICROSOFT</span>
                <span className="text-xs text-slate-400">Just now</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Matched</span>
              </div>

              {/* Product Designer - Adobe */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#0f1623] border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center bg-[#0a0f1a] overflow-hidden flex-shrink-0">
                  <Image src="/logos/adobe.png" alt="Adobe" width={24} height={24} className="w-5 h-5 object-contain" />
                </div>
                <span className="flex-1 text-sm font-medium text-slate-200">Product Designer · ADOBE</span>
                <span className="text-xs text-slate-400">2m ago</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">Tailored</span>
              </div>

              {/* Full-Stack Engineer - Google */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#0f1623] border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center bg-[#0a0f1a] overflow-hidden flex-shrink-0">
                  <Image src="/logos/google.png" alt="Google" width={24} height={24} className="w-5 h-5 object-contain" />
                </div>
                <span className="flex-1 text-sm font-medium text-slate-200">Full-Stack Engineer · GOOGLE</span>
                <span className="text-xs text-slate-400">4m ago</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">Applied</span>

              </div>

              {/* Recruiter reply - Delta */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-[#0f1623] border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                <div className="w-8 h-8 rounded-lg border border-slate-700 flex items-center justify-center bg-[#0a0f1a] overflow-hidden flex-shrink-0">
                  <Image src="/logos/delta.png" alt="Delta" width={24} height={24} className="w-5 h-5 object-contain" />
                </div>
                <span className="flex-1 text-sm font-medium text-slate-200">Recruiter reply · DELTA</span>
                <span className="text-xs text-slate-400">12m ago</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Inbox</span>
              </div>
            </div>

          </div>

        </div>


      </section>

      {/* BENCHMARK HUD FEATURES MODULE MATRIX */}
      <section className="py-16 relative">
        <div className="text-center mb-20 space-y-3">
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
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors font-['Bebas_Neue']" style={{ letterSpacing: '0.05em' }}>Smart CV Analysis</h3>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
              Parse raw unstructured data points into organized structured JSON manifests, highlighting optimal skill keywords for automated applicant sorting algorithms.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-2xl bg-[#090d16]/40 border border-cyan-500/10 p-8 md:p-10 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.05)] hover:-translate-y-1 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <Crosshair className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-400 transition-colors font-['Bebas_Neue']" style={{ letterSpacing: '0.05em' }}>Intelligent Job Matching</h3>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
              Run continuous spatial classification scoring across thousands of changing vacancies to deliver real-time, context-aware semantic pipeline recommendations.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-2xl bg-[#090d16]/40 border border-cyan-500/10 p-8 md:p-10 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] hover:-translate-y-1 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors font-['Bebas_Neue']" style={{ letterSpacing: '0.05em' }}>AI Career Chat</h3>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
              Interact with custom fine-tuned conversational engines designed to simulate challenging behavioral review models and instantly generate precise cover letters.
            </p>
          </div>

          {/* Card 4 */}
          <div className="group relative rounded-2xl bg-[#090d16]/40 border border-emerald-500/30 p-8 md:p-10 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] hover:-translate-y-1 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors font-['Bebas_Neue']" style={{ letterSpacing: '0.05em' }}>Task Tracker</h3>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
              Keep critical communication checkpoints under active automated review. Manage interview schedules and optimize follow-up triggers without leaving the terminal.
            </p>
          </div>

        </div>
      </section>

      {/* CORE SYNC CALL TO ACTION ACCELERATOR */}
      <section className="py-16 relative">
        <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />

        {/* Main Panel Surface Container */}
        <div className="relative rounded-2xl border border-cyan-500/10 bg-[#090d16]/40 backdrop-blur-md p-12 text-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">

          {/* Accent lighting dots inside the container panel */}
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-[0.06em] mb-4" style={{ letterSpacing: '0.06em' }}>
            Initialize Your Autonomous Career Node
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto mb-8 font-medium">
            Connect to the primary CareerPilot environment network grid to map and scale your industry trajectory with high-precision AI modules.
          </p>

          {/* Aerukart Pill Shape & External Glow Setup */}
          <div className="relative z-20">
            <Link
              href="/sign-up"
              className="
                inline-flex 
                items-center 
                gap-2.5 
                px-10 
                py-4 
                rounded-full 
                text-white 
                text-xs
                font-mono
                font-bold
                tracking-widest 
                uppercase 
                bg-[#005a60]/80
                backdrop-blur-sm
                border 
                border-cyan-400/40
                transition-all 
                duration-300
                
                /* Aerukart Soft Neon External Glow */
                shadow-[0_0_25px_rgba(6,182,212,0.45)]
                
                /* Hover Adjustments */
                hover:bg-[#00686f]
                hover:border-cyan-300/60
                hover:shadow-[0_0_35px_rgba(6,182,212,0.65)]
                hover:scale-[1.02]
                active:scale-[0.98]
              "
            >
              <span>ESTABLISH CONNECTION</span>
              <Zap className="w-3.5 h-3.5 fill-cyan-400/20" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT HAPPENS NEXT SECTION */}
      <section className="py-20 relative">
        <div className="text-center mb-16 space-y-3">
          <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-950/30 border border-purple-500/20 backdrop-blur-md text-[10px] font-mono font-bold text-purple-400 tracking-widest uppercase">
            After You Start
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            What happens <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">next</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base md:text-lg">
            The moment you upload your resume, Autopilot starts working. Here's roughly what the first week looks like.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Rail */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-emerald-500/50" />

          {/* Timeline Items */}
          <div className="space-y-12">
            {/* Item 1 - In minutes */}
            <div className="relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-8" style={{ animationDelay: '0s' }}>
              <div className="md:text-right md:pr-12">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">In minutes</span>
                <h3 className="text-xl font-bold text-white mt-1 mb-2">Jobs start appearing</h3>
                <p className="text-slate-400 text-sm">Autopilot sources fresh roles that actually match how you describe your experience — not keyword guesses.</p>
              </div>
              <div className="absolute left-0 md:left-1/2 top-0 md:top-auto -translate-y-1/2 md:translate-y-0 md:translate-x-[-50%]">
                <div className="w-14 h-14 rounded-full bg-cyan-500 border-2 border-cyan-300 flex items-center justify-center">
                  <Search className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Item 2 - Within hours */}
            <div className="relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-8" style={{ animationDelay: '0.12s' }}>
              <div className="md:text-right md:pr-12 md:order-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Within hours</span>
                <h3 className="text-xl font-bold text-white mt-1 mb-2">Applications start going out</h3>
                <p className="text-slate-400 text-sm">Tailored resume, cover letter, and form answers for every role. Submitted on your behalf in the background.</p>
              </div>
              <div className="absolute left-0 md:left-1/2 top-0 md:top-auto -translate-y-1/2 md:translate-y-0 md:translate-x-[-50%] md:order-1">
                <div className="w-14 h-14 rounded-full bg-amber-500 border-2 border-amber-300 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Item 3 - In days */}
            <div className="relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-8" style={{ animationDelay: '0.24s' }}>
              <div className="md:text-right md:pr-12">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">In days</span>
                <h3 className="text-xl font-bold text-white mt-1 mb-2">Responses start coming in</h3>
                <p className="text-slate-400 text-sm">Recruiter replies and interview requests land in your inbox. The loop compounds every day you stay on.</p>
              </div>
              <div className="absolute left-0 md:left-1/2 top-0 md:top-auto -translate-y-1/2 md:translate-y-0 md:translate-x-[-50%]">
                <div className="w-14 h-14 rounded-full bg-emerald-500 border-2 border-emerald-300 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center mt-16 text-slate-400 text-base">
          Most users <strong className="text-white">begin getting responses within days</strong> — because applications keep going out every single day.
        </p>
      </section>

      {/* Back to Top Button - Only visible when scrolled to last section */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:w-14 hover:h-14 group"
        style={{
          background: '#0a0a0a',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.2), 0 0 30px rgba(6, 182, 212, 0.1)',
          opacity: showBackToTop ? 1 : 0,
          transform: showBackToTop ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: showBackToTop ? 'auto' : 'none',
        }}
        aria-label="Scroll to top"
      >
        {/* Hover glow overlay */}
        <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-300" style={{ background: 'rgba(6, 182, 212, 0.4)' }} />
        {/* Top arrow icon */}
        <ArrowUp className="relative z-10 w-5 h-5 text-cyan-300 group-hover:text-cyan-100 group-hover:w-6 group-hover:h-6 transition-all duration-300" />
      </button>

    </div>
  )
} 