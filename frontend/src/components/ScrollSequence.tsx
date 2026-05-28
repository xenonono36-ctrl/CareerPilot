'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================
// CONFIGURATION
// ============================================

const FRAME_PATHS: string[] = Array.from({ length: 46 }, (_, i) => 
  `/frames/frame-${String(i + 1).padStart(3, '0')}.webp`
);

const TOTAL_FRAMES = FRAME_PATHS.length;
const SCROLL_DURATION_VH = 250;

/** LERP factor - lower = smoother/slower, higher = snappier (0.02-0.15) */
const LERP_SPEED = 0.08;

/** Preload queue size - load this many frames ahead */
const PRELOAD_AHEAD = 5;

/** Batch preload size */
const PRELOAD_BATCH = 3;

// ============================================
// IMAGE PRELOADING - Lazy loading
// ============================================

const imageCache = new Set<string>();
let preloadQueue: string[] = [];
let isPreloading = false;

const preloadImage = (path: string): Promise<void> => {
  return new Promise((resolve) => {
    if (imageCache.has(path)) {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = img.onerror = () => {
      imageCache.add(path);
      resolve();
    };
    img.src = path;
  });
};

const preloadBatch = async (paths: string[]): Promise<void> => {
  const unloaded = paths.filter(p => !imageCache.has(p));
  if (unloaded.length === 0) return;
  
  const batch = unloaded.slice(0, PRELOAD_BATCH);
  await Promise.all(batch.map(preloadImage));
  
  // Continue with next batch if more pending
  if (unloaded.length > PRELOAD_BATCH) {
    setTimeout(() => preloadBatch(unloaded.slice(PRELOAD_BATCH)), 16);
  }
};

const queuePreload = (targetFrame: number): void => {
  if (isPreloading) return;
  
  const startIdx = Math.max(0, targetFrame - 1);
  const endIdx = Math.min(TOTAL_FRAMES, targetFrame + PRELOAD_AHEAD);
  const needed = FRAME_PATHS.slice(startIdx, endIdx);
  
  const unloaded = needed.filter(p => !imageCache.has(p));
  if (unloaded.length === 0) return;
  
  isPreloading = true;
  preloadBatch(unloaded).then(() => {
    isPreloading = false;
    // Check if more frames needed
    const stillNeeded = FRAME_PATHS.slice(startIdx, endIdx).filter(p => !imageCache.has(p));
    if (stillNeeded.length > 0) {
      queuePreload(targetFrame);
    }
  });
};

// ============================================
// LERP UTILITY
// ============================================

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

// ============================================
// COMPONENT
// ============================================

export default function ScrollSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Animation state (refs for avoiding re-renders)
  const targetFrameRef = useRef(1);
  const currentFrameRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const isActiveRef = useRef(false);

  // Initialize with first frame and start lazy loading
  useEffect(() => {
    if (imageRef.current) imageRef.current.src = FRAME_PATHS[0];
    // Start preloading immediately
    queuePreload(0);
    // Preload frame 2 onwards in batches
    preloadBatch(FRAME_PATHS.slice(1)).then(() => setIsLoaded(true));
  }, []);

  // Calculate target frame from scroll and trigger lazy loading
  const updateTargetFrame = useCallback(() => {
    if (!containerRef.current || !isLoaded) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = clamp(-rect.top / (rect.height - vh), 0, 1);
    targetFrameRef.current = clamp(Math.floor(progress * TOTAL_FRAMES) + 1, 1, TOTAL_FRAMES);
    
    // Trigger lazy preload of upcoming frames
    queuePreload(targetFrameRef.current);
  }, [isLoaded]);

  // Smooth RAF animation loop (always running)
  const animate = useCallback(() => {
    if (!imageRef.current || !isLoaded) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    // Lerp toward target
    const target = targetFrameRef.current;
    currentFrameRef.current = lerp(currentFrameRef.current, target, LERP_SPEED);
    
    // Snap when close
    if (Math.abs(currentFrameRef.current - target) < 0.05) {
      currentFrameRef.current = target;
    }

    // Update image (with caching to avoid unnecessary DOM updates)
    const frameIdx = clamp(Math.round(currentFrameRef.current) - 1, 0, TOTAL_FRAMES - 1);
    const expectedSrc = FRAME_PATHS[frameIdx];
    if (imageRef.current && imageRef.current.src !== expectedSrc && imageCache.has(expectedSrc)) {
      imageRef.current.src = expectedSrc;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [isLoaded]);

  // Start everything
  useEffect(() => {
    updateTargetFrame();
    
    // Continuous RAF loop for buttery smoothness
    rafRef.current = requestAnimationFrame(animate);

    const handleScroll = () => updateTargetFrame();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateTargetFrame, animate]);

  return (
    <div
      ref={containerRef}
      style={{ height: `${SCROLL_DURATION_VH}vh`, width: '100%', position: 'relative' }}
    >
      <div style={{
        position: 'sticky', top: 0, width: '100%', height: '100vh',
        overflow: 'hidden', backgroundColor: '#030712', zIndex: 1,
      }}>
        {!isLoaded && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: '#030712', color: '#06b6d4',
            fontFamily: 'monospace', fontSize: '14px', zIndex: 10,
          }}>
            Loading...
          </div>
        )}
        
        <img
          ref={imageRef}
          alt=""
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: isLoaded ? 1 : 0, transition: 'opacity 0.4s ease',
            willChange: 'contents', transform: 'translateZ(0)',
          }}
        />

        {/* Glass effect footer bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-between px-8 z-20"
          style={{
            background: 'rgba(3,7,18,0.6)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(6,182,212,0.2)',
          }}
        >
          <span
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              fontSize: '14px',
              color: 'rgba(6,182,212,0.9)',
              letterSpacing: '0.15em',
            }}
          >
            CAREERPILOT
          </span>
          <span
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 400,
              fontSize: '12px',
              color: 'rgba(100,116,139,0.8)',
              letterSpacing: '0.1em',
            }}
          >
           &copy; CareerPilot 2026
          </span>
        </div>
      </div>
    </div>
  );
}
