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
  const [scrollY, setScrollY] = React.useState(0);
  const [isHeroVisible, setIsHeroVisible] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // Mark as loaded after hydration to prevent initial flash
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Scroll-triggered animations with IntersectionObserver
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -80px 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-inview');
        } else {
          entry.target.classList.remove('is-inview');
        }
      });
    }, observerOptions);

    // Observe all elements with data-scroll or data-scroll-group attributes
    const animatedElements = document.querySelectorAll('[data-scroll], [data-scroll-group]');
    animatedElements.forEach(el => observer.observe(el));

    // Hero visibility observer
    const heroObserver = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (heroRef.current) heroObserver.observe(heroRef.current);

    return () => {
      observer.disconnect();
      heroObserver.disconnect();
    };
  }, []);

  // Smooth scroll-triggered parallax state management
  useEffect(() => {
    let rafId: number;
    
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        setShowBackToTop(window.scrollY > 600);
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

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
      <section 
        ref={heroRef}
        className="pt-24 pb-16 text-center relative max-w-4xl mx-auto"
        style={{
          transform: `translate3d(0, ${scrollY * 0.12}px, 0)`,
          opacity: Math.max(0, 1 - scrollY * 0.0015),
          willChange: 'transform, opacity'
        }}
      >

        {/* Depth Layer 1 - Far background glow */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 -z-20 w-[500px] h-[500px] bg-indigo-500/5 blur-[150px] rounded-full"
          style={{ transform: `translate3d(-50%, ${scrollY * 0.4}px, 0)` }}
        />

        {/* Depth Layer 2 - Mid background glow */}
        <div 
          className="absolute -top-12 left-1/2 -translate-x-1/2 -z-10 w-72 h-72 bg-cyan-500/10 blur-[100px] rounded-full"
          style={{ transform: `translate3d(-50%, ${scrollY * 0.25}px, 0)` }}
        />

        {/* Depth Layer 3 - Near accent */}
        <div 
          className="absolute -top-6 left-1/4 -z-10 w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full"
          style={{ transform: `translate3d(0, ${scrollY * 0.18}px, 0)` }}
        />

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
      <section data-scroll-group className="relative my-16 rounded-xl border border-cyan-500/10 bg-gradient-to-b from-slate-950/60 to-black/80 backdrop-blur-xl p-1 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
        
        <div className="text-center py-1">
          <span className="text-sm font-mono font-bold uppercase text-cyan-500/60 tracking-[0.3em]">METRICS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-cyan-500/10 text-center font-mono py-2 px-4">

          <div data-scroll className="px-8 pt-4 pb-10 flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 tracking-widest">
              <Activity className="w-4 h-4 text-cyan-500/60" />
              <span>CV PARSE EFFICIENCY</span>
            </div>
            <div className="text-5xl md:text-6xl font-black text-cyan-400">95%+</div>
            <div className="text-[11px] text-cyan-500/50 font-bold tracking-wider">STATUS [OPTIMAL]</div>
          </div>

          <div data-scroll className="px-8 pt-4 pb-10 flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 tracking-widest">
              <Cpu className="w-4 h-4 text-purple-500/60" />
              <span>LATENCY RATIO</span>
            </div>
            <div className="text-5xl md:text-6xl font-black text-purple-400">&lt;5ms</div>
            <div className="text-[11px] text-purple-500/50 font-bold tracking-wider">NODE RESPONSE TIME</div>
          </div>

          <div data-scroll className="px-8 pt-4 pb-10 flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 tracking-widest">
              <ShieldCheck className="w-4 h-4 text-indigo-500/60" />
              <span>VECTOR MATCHING MULTIPLIER</span>
            </div>
            <div className="text-5xl md:text-6xl font-black text-indigo-400">10x</div>
            <div className="text-[11px] text-indigo-500/50 font-bold tracking-wider">SEARCH ACCELERATION</div>
          </div>
<div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-cyan-500/10 text-center font-mono py-8 px-4"></div>
        </div>
      </section>

      {/* TRUSTED BY PROFESSIONALS SECTION - Full Width */}
      <div className="w-screen relative left-1/2 -translate-x-1/2">
        <section data-scroll className="py-12 relative overflow-hidden">
          {/* Parallax background accent */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[800px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"
            style={{ transform: `translate3d(-50%, -50%, 0)` }}
          />

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
      <section 
        data-scroll
        className="py-20 relative"
        style={{
          transform: `translate3d(0, ${scrollY * 0.03}px, 0)`,
          willChange: 'transform'
        }}
      >

        {/* Subtle background accent */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[600px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"
          style={{ transform: `translate3d(-50%, calc(-50% + ${scrollY * 0.06}px), 0)` }}
        />

        {/* Header and Dashboard Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-16">

          {/* Left Column - Header Content */}
          <div className="space-y-8">
            <div data-scroll className="text-center lg:text-left">
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
            <ul data-scroll-group className="space-y-4">
              <li data-scroll className="flex items-center gap-3 text-sm font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0"></span>
                Finds high-match jobs automatically
              </li>
              <li data-scroll className="flex items-center gap-3 text-sm font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0"></span>
                Tailors every application to the role
              </li>
              <li data-scroll className="flex items-center gap-3 text-sm font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0"></span>
                Tracks every reply in real-time
              </li>
            </ul>

            {/* Result Banner - Spans Full Width */}
            <div data-scroll className="mt-12 text-center lg:text-left">
              <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-200">
                You wake up to{' '}
                <span className="text-cyan-400 font-black">applied jobs</span>
                {' '}&mdash; not a to-do list.
              </p>
            </div>
          </div>

          {/* Right Column - Autopilot Dashboard Visual */}
          <div data-scroll className="relative rounded-[28px] bg-[#090d16]/60 backdrop-blur-md border border-cyan-500/10 p-7 shadow-[0_28px_64px_-14px_rgba(0,0,0,0.4),0_10px_26px_-8px_rgba(6,182,212,0.05)] overflow-hidden min-h-[480px]">

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
      <section data-scroll-group className="py-16 relative">
        {/* Parallax background accent */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[600px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"
          style={{ transform: `translate3d(-50%, -50%, ${scrollY * 0.05}px)` }}
        />
        <div data-scroll className="text-center mb-20 space-y-3">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            AI Core Architecture
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Simultaneous multi-threaded sub-routines optimizing your employment data vector paths
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Card 1 */}
          <div data-scroll className="group relative rounded-2xl bg-[#090d16]/40 border border-cyan-500/10 p-8 md:p-10 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.05)] hover:-translate-y-1 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors font-['Bebas_Neue']" style={{ letterSpacing: '0.05em' }}>Smart CV Analysis</h3>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
              Parse raw unstructured data points into organized structured JSON manifests, highlighting optimal skill keywords for automated applicant sorting algorithms.
            </p>
          </div>

          {/* Card 2 */}
          <div data-scroll className="group relative rounded-2xl bg-[#090d16]/40 border border-cyan-500/10 p-8 md:p-10 transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.05)] hover:-translate-y-1 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <Crosshair className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-purple-400 transition-colors font-['Bebas_Neue']" style={{ letterSpacing: '0.05em' }}>Intelligent Job Matching</h3>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
              Run continuous spatial classification scoring across thousands of changing vacancies to deliver real-time, context-aware semantic pipeline recommendations.
            </p>
          </div>

          {/* Card 3 */}
          <div data-scroll className="group relative rounded-2xl bg-[#090d16]/40 border border-cyan-500/10 p-8 md:p-10 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] hover:-translate-y-1 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors font-['Bebas_Neue']" style={{ letterSpacing: '0.05em' }}>AI Career Chat</h3>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
              Interact with custom fine-tuned conversational engines designed to simulate challenging behavioral review models and instantly generate precise cover letters.
            </p>
          </div>

          {/* Card 4 */}
          <div data-scroll className="group relative rounded-2xl bg-[#090d16]/40 border border-emerald-500/30 p-8 md:p-10 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] hover:-translate-y-1 backdrop-blur-md">
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
      <section data-scroll className="py-16 relative">
        {/* Parallax background accent */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[700px] h-[400px] bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full"
          style={{ transform: `translate3d(-50%, -50%, ${scrollY * 0.045}px)` }}
        />

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
      <section 
        data-scroll
        className="py-20 relative"
        style={{
          transform: `translate3d(0, ${scrollY * 0.025}px, 0)`,
          willChange: 'transform'
        }}
      >

        {/* Subtle background accent */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[500px] h-[500px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"
          style={{ transform: `translate3d(-50%, calc(-50% + ${scrollY * 0.05}px), 0)` }}
        />
        <div data-scroll className="text-center mb-16 space-y-3">
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
        <div className="relative max-w-4xl mx-auto" data-scroll-group>
          {/* Vertical Rail */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-emerald-500/50" />

          {/* Timeline Items */}
          <div className="space-y-12">
            {/* Item 1 - In minutes */}
            <div data-scroll className="relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-8" style={{ animationDelay: '0s' }}>
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
            <div data-scroll className="relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-8" style={{ animationDelay: '0.12s' }}>
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
          Most users <strong className="text-cyan-400">begin getting responses within days</strong> — because applications keep going out every single day.
        </p>
      </section>

      {/* AUTO-APPLY SECTION */}
      <section data-scroll-group className="py-20 md:py-28 relative overflow-hidden">
        {/* Parallax background accents */}
        <div 
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 -z-10 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"
          style={{ transform: `translate3d(50%, ${scrollY * 0.04}px, 0)` }}
        />
        <div 
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 -z-10 w-[400px] h-[400px] bg-purple-500/5 blur-[80px] rounded-full pointer-events-none"
          style={{ transform: `translate3d(-50%, ${-scrollY * 0.03}px, 0)` }}
        />
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Copy */}
            <div data-scroll className="space-y-6">
              <span className="relative inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/20 backdrop-blur-md text-[10px] font-mono font-bold text-blue-400 tracking-widest uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                Real Auto-Apply
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Not autofill.<br />
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Actual execution.</span>
              </h2>
              <p className="text-slate-400 text-base md:text-lg max-w-lg">
                Most "auto-apply" tools just suggest jobs or click one button. CareerPilot runs the full flow — server-side and in the browser — handling real forms, file uploads, and email verifications.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {/* Server-side engine */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-cyan-500/40 transition-colors duration-300">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Server-side engine</h4>
                  <p className="text-sm text-slate-400">Runs 24/7 against every ATS we integrate with. No laptop needed — it keeps applying while you sleep.</p>
                </div>

                {/* Chrome extension */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-purple-500/40 transition-colors duration-300">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Chrome extension</h4>
                  <p className="text-sm text-slate-400">For complex or JS-heavy forms, the extension pairs with your session and completes submissions natively.</p>
                </div>

                {/* Email verification handled */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-emerald-500/40 transition-colors duration-300">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Email verification handled</h4>
                  <p className="text-sm text-slate-400">Per-user inbox catches verification emails and completes the loop automatically — no manual clicking.</p>
                </div>
              </div>

              {/* Full-width Feature Tile */}
              <div className="mt-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 rounded-xl p-7 hover:border-amber-500/40 transition-colors duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                  {/* Content */}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">Smart Job Matching</h4>
                    <p className="text-base text-slate-400">AI-powered fit score rates every posting against your resume and preferences. Filter by match threshold to only apply where you have a real shot.</p>
                  </div>
                  {/* Visual */}
                  <div className="flex-shrink-0 flex items-center gap-4 bg-[#0b1220]/60 rounded-lg px-5 py-4 border border-slate-700/50">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-amber-400">87%</div>
                      <div className="text-sm text-slate-500">match</div>
                    </div>
                    <div className="w-3 h-14 bg-slate-700 rounded-full overflow-hidden">
                      <div className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-full" style={{height: '87%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Terminal */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl" />
              <div className="relative bg-[#0b1220] rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
                {/* Terminal Header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-[#0f172a] border-b border-slate-700/50">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">autopilot · live</span>
                  <span className="ml-auto flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    RUNNING
                  </span>
                </div>

                {/* Terminal Body */}
                <div className="p-4 font-mono text-sm space-y-1">
                  <div className="text-cyan-400">[06:12] Autopilot engine starting…</div>
                  <div className="text-cyan-400">[06:12] Loaded profile · 8 preferences</div>
                  <div className="text-cyan-400">[06:13] Scanning Greenhouse, Lever, Workday, Ashby…</div>
                  <div className="text-emerald-400">[06:14] Found 2,341 new postings · matching…</div>
                  <div className="text-emerald-400">[06:14] Matched 38 roles above threshold</div>
                  <div className="text-cyan-400">[06:15] Generating tailored resumes…</div>
                  <div className="text-emerald-400">[06:18] 12 packs ready for submission</div>
                  <div className="text-cyan-400">[06:19] Submitting to Greenhouse · Linear…</div>
                  <div className="text-emerald-400 pl-4">→ submitted · confirmation #L-48213</div>
                  <div className="text-cyan-400">[06:20] Submitting to Lever · Vercel…</div>
                  <div className="text-emerald-400 pl-4">→ submitted · confirmation #V-91187</div>
                  <div className="text-cyan-400">[06:21] Opening complex form · Stripe (browser)</div>
                  <div className="text-emerald-400 pl-4">→ extension filled 14 fields + uploaded resume</div>
                  <div className="text-emerald-400 pl-4">→ submitted · confirmation #ST-22109</div>
                  <div className="text-cyan-400">[06:23] Handling verification email · inbox…</div>
                  <div className="text-emerald-400 pl-4">→ verified automatically</div>
                  <div className="text-cyan-400">[06:24] Submitting to Ashby · Notion…</div>
                  <div className="text-emerald-400 pl-4">→ submitted · confirmation #NT-77451</div>
                  <div className="text-cyan-400">[06:25] Cover letter generated · Figma</div>
                  <div className="text-emerald-400 pl-4">→ submitted · confirmation #FG-20418</div>
                  <div className="text-emerald-400">[09:41] Recruiter reply received · Acme Corp</div>
                  <div className="text-cyan-400 mt-4 pt-2 border-t border-slate-700/50">[13:10] Cycle complete · 16 submitted · 0 errors</div>
                  <div className="text-cyan-400">[13:18] Scanning Workday batch · 840 postings</div>
                  <div className="text-emerald-400">[13:21] Matched 9 roles · generating packs…</div>
                  <div className="text-cyan-400">[13:24] Submitting to Workday · Datadog…</div>
                  <div className="text-emerald-400 pl-4">→ submitted · confirmation #DD-88302</div>
                  <div className="text-cyan-400">[13:26] Submitting to SmartRecruiters · MongoDB…</div>
                  <div className="text-emerald-400 pl-4">→ PDF upload + 6 custom fields filled</div>
                  <div className="text-emerald-400 pl-4">→ submitted · confirmation #MG-44021</div>
                  <div className="flex items-center gap-1 text-emerald-400 mt-2">
                    <span className="animate-pulse">_</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRANSFORMATION SECTION */}
      <section data-scroll-group className="py-20 md:py-28 relative overflow-hidden">
        {/* Parallax background accents */}
        <div 
          className="absolute top-0 left-1/4 -z-10 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"
          style={{ transform: `translate3d(-50%, ${scrollY * 0.035}px, 0)` }}
        />
        <div 
          className="absolute bottom-0 right-1/4 -z-10 w-[350px] h-[350px] bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none"
          style={{ transform: `translate3d(50%, ${-scrollY * 0.025}px, 0)` }}
        />
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div data-scroll className="text-center mb-16 space-y-3">
            <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-500/20 backdrop-blur-md text-[10px] font-mono font-bold text-purple-400 tracking-widest uppercase">
              The Transformation
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              From Manual Grind to<br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Automated Flow</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base md:text-lg">
              Here's exactly what changes the moment Autopilot takes over.
            </p>
          </div>

          {/* Comparison */}
          <div data-scroll-group className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Without */}
            <div data-scroll className="flex-1 min-h-[300px] bg-red-500/5 border border-red-500/20 rounded-2xl p-6 md:p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
                <span className="text-xs font-mono font-bold text-red-400 tracking-wide">Without CareerPilot</span>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-6">The manual grind</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"></path>
                  </svg>
                  <span className="text-slate-300">Search jobs manually</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"></path>
                  </svg>
                  <span className="text-slate-300">Edit resume every time</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"></path>
                  </svg>
                  <span className="text-slate-300">Fill forms repeatedly</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"></path>
                  </svg>
                  <span className="text-slate-300">Lose track of applications</span>
                </li>
              </ul>
            </div>

            {/* Arrow */}
            <div className="flex md:flex-col items-center justify-center -mt-16">
              <button className="group w-14 h-14 rounded-full border border-cyan-500/40 flex items-center justify-center bg-cyan-500/10 backdrop-blur-sm hover:bg-cyan-500/20 hover:border-cyan-400/60 hover:scale-110 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <svg className="w-7 h-7 text-cyan-400 group-hover:text-cyan-300 group-hover:w-8 group-hover:h-8 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>

            {/* With */}
            <div className="flex-1 min-h-[300px] bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 md:p-8 -mt-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
                <span className="text-xs font-mono font-bold text-emerald-400 tracking-wide">With CareerPilot</span>
              </div>
              <p className="text-sm font-medium text-slate-400 mb-6">Autopilot takes over</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  <span className="text-slate-300">Jobs come to you</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  <span className="text-slate-300">Resume tailored instantly</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  <span className="text-slate-300">Applications handled automatically</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  <span className="text-slate-300">Everything tracked in one place</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEEDBACK LOOP SECTION */}
      <section data-scroll-group className="py-20 md:py-28 relative overflow-hidden">
        {/* Parallax background accents */}
        <div 
          className="absolute top-1/3 left-1/3 -z-10 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none"
          style={{ transform: `translate3d(-50%, ${scrollY * 0.04}px, 0)` }}
        />
        <div 
          className="absolute bottom-1/3 right-1/3 -z-10 w-[450px] h-[450px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"
          style={{ transform: `translate3d(50%, ${-scrollY * 0.03}px, 0)` }}
        />
        <div className="max-w-7xl mx-auto px-4 relative">
          {/* Header */}
          <div data-scroll className="text-center mb-16 space-y-3">
            <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-900/30 border border-purple-500/20 backdrop-blur-md text-[10px] font-mono font-bold text-purple-400 tracking-widest uppercase">
              The Feedback Loop
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Insights nobody else can give you.<br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">Because nobody else runs the whole loop.</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base md:text-lg">
              CareerPilot runs discovery, tailoring, applying, and inbox tracking — all in one system. Every step feeds back in, so your results compound over time.
            </p>
          </div>

          {/* Engine Diagram - Matching reference styling */}
          <div data-scroll className="relative max-w-4xl mx-auto mb-16">
            {/* AI Engine - Responsive sizing matching reference */}
            <div className="ap-insights__engine" style={{ '--ap-insights-total': 8 } as React.CSSProperties}>
              {/* SVG Rings */}
              <svg className="ap-insights__ring" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="apInsightsArc" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="50%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                <circle cx="300" cy="300" r="228" className="ap-insights__ring-current" stroke="url(#apInsightsArc)" />
              </svg>

              {/* Central Core */}
              <div className="ap-insights__core">
                <strong className="ap-insights__core-title">CareerPilot AI</strong>
                <span className="ap-insights__core-sub">Always learning</span>
              </div>

              {/* Node 1: Discover - Top (0°) */}
              <div className="ap-insights__node ap-insights__node--blue" style={{ '--i': 0, '--ap-insights-stagger': '0s' } as React.CSSProperties}>
                <span className="ap-insights__node-step">#01</span>
                <div className="ap-insights__node-disc">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </div>
                <div className="ap-insights__node-body">
                  <div className="ap-insights__node-label">Discover</div>
                  <div className="ap-insights__node-desc">Sourcing roles</div>
                </div>
              </div>

              {/* Node 2: Match - Top Right (45°) */}
              <div className="ap-insights__node ap-insights__node--cyan" style={{ '--i': 1, '--ap-insights-stagger': '0.14s' } as React.CSSProperties}>
                <span className="ap-insights__node-step">#02</span>
                <div className="ap-insights__node-disc">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                  </svg>
                </div>
                <div className="ap-insights__node-body">
                  <div className="ap-insights__node-label">Match</div>
                  <div className="ap-insights__node-desc">AI scoring</div>
                </div>
              </div>

              {/* Node 3: Tailor - Right (90°) */}
              <div className="ap-insights__node ap-insights__node--purple" style={{ '--i': 2, '--ap-insights-stagger': '0.28s' } as React.CSSProperties}>
                <span className="ap-insights__node-step">#03</span>
                <div className="ap-insights__node-disc">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M15 9h.01M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5"></path>
                  </svg>
                </div>
                <div className="ap-insights__node-body">
                  <div className="ap-insights__node-label">Tailor</div>
                  <div className="ap-insights__node-desc">Per-role pack</div>
                </div>
              </div>

              {/* Node 4: Apply - Bottom Right (135°) */}
              <div className="ap-insights__node ap-insights__node--pink" style={{ '--i': 3, '--ap-insights-stagger': '0.42s' } as React.CSSProperties}>
                <span className="ap-insights__node-step">#04</span>
                <div className="ap-insights__node-disc">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z"></path>
                    <path d="M22 2 11 13"></path>
                  </svg>
                </div>
                <div className="ap-insights__node-body">
                  <div className="ap-insights__node-label">Apply</div>
                  <div className="ap-insights__node-desc">Auto-submit</div>
                </div>
              </div>

              {/* Node 5: Track - Bottom (180°) */}
              <div className="ap-insights__node ap-insights__node--amber" style={{ '--i': 4, '--ap-insights-stagger': '0.56s' } as React.CSSProperties}>
                <span className="ap-insights__node-step">#05</span>
                <div className="ap-insights__node-disc">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                    <path d="m3 7 9 6 9-6"></path>
                  </svg>
                </div>
                <div className="ap-insights__node-body">
                  <div className="ap-insights__node-label">Track</div>
                  <div className="ap-insights__node-desc">Inbox + status</div>
                </div>
              </div>

              {/* Node 6: Learn - Bottom Left (225°) */}
              <div className="ap-insights__node ap-insights__node--emerald" style={{ '--i': 5, '--ap-insights-stagger': '0.70s' } as React.CSSProperties}>
                <span className="ap-insights__node-step">#06</span>
                <div className="ap-insights__node-disc">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
                  </svg>
                </div>
                <div className="ap-insights__node-body">
                  <div className="ap-insights__node-label">Learn</div>
                  <div className="ap-insights__node-desc">Improve outcomes</div>
                </div>
              </div>

              {/* Node 7: Send - Left (270°) */}
              <div className="ap-insights__node ap-insights__node--rose" style={{ '--i': 6, '--ap-insights-stagger': '0.84s' } as React.CSSProperties}>
                <span className="ap-insights__node-step">#07</span>
                <div className="ap-insights__node-disc">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
                    <path d="m13 13 6 6"></path>
                  </svg>
                </div>
                <div className="ap-insights__node-body">
                  <div className="ap-insights__node-label">Send</div>
                  <div className="ap-insights__node-desc">Auto-reply</div>
                </div>
              </div>

              {/* Node 8: Read - Top Left (315°) */}
              <div className="ap-insights__node ap-insights__node--indigo" style={{ '--i': 7, '--ap-insights-stagger': '0.98s' } as React.CSSProperties}>
                <span className="ap-insights__node-step">#08</span>
                <div className="ap-insights__node-disc">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <div className="ap-insights__node-body">
                  <div className="ap-insights__node-label">Read</div>
                  <div className="ap-insights__node-desc">Inbox scan</div>
                </div>
              </div>
            </div>
          </div>

          {/* Insight Cards */}
          <div data-scroll-group className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
            {/* Card 1 */}
            <div data-scroll className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 hover:border-blue-500/40 transition-colors duration-300">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-xs font-mono font-bold text-blue-400 tracking-wide mb-4">
                Pattern detected
              </span>
              <h3 className="text-lg font-semibold text-white mb-2">Design-systems phrasing improves replies 2.3×</h3>
              <p className="text-sm text-slate-400">Applications highlighting your design-systems work outperform others. Autopilot is prioritizing this angle.</p>
            </div>

            {/* Card 2 */}
            <div data-scroll className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-colors duration-300">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-xs font-mono font-bold text-purple-400 tracking-wide mb-4">
                Best fit
              </span>
              <h3 className="text-lg font-semibold text-white mb-2">Dev-tools companies reply 3× faster to you</h3>
              <p className="text-sm text-slate-400">Vercel, Linear, Warp, Replit. Autopilot is expanding sourcing in this vertical.</p>
            </div>

            {/* Card 3 */}
            <div data-scroll className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-colors duration-300">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-mono font-bold text-emerald-400 tracking-wide mb-4">
                Timing
              </span>
              <h3 className="text-lg font-semibold text-white mb-2">Tuesday 8–10am submissions get best response</h3>
              <p className="text-sm text-slate-400">Autopilot is scheduling more submissions inside your best window.</p>
            </div>
          </div>

          {/* Moat Tagline */}
          <p data-scroll className="text-center text-slate-400 text-base md:text-lg font-medium">
            This is the advantage no tool can match — because no tool owns the full loop.
          </p>
        </div>
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