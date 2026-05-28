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

// ============================================
// IMAGE PRELOADING
// ============================================

const preloadImages = (paths: string[]): Promise<void> => {
  return new Promise((resolve) => {
    let loaded = 0;
    if (paths.length === 0) return resolve();
    
    paths.forEach((path) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (++loaded === paths.length) resolve();
      };
      img.src = path;
    });
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

  // Preload images
  useEffect(() => {
    preloadImages(FRAME_PATHS).then(() => {
      setIsLoaded(true);
      if (imageRef.current) imageRef.current.src = FRAME_PATHS[0];
    });
  }, []);

  // Calculate target frame from scroll
  const updateTargetFrame = useCallback(() => {
    if (!containerRef.current || !isLoaded) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const progress = clamp(-rect.top / (rect.height - vh), 0, 1);
    targetFrameRef.current = clamp(Math.floor(progress * TOTAL_FRAMES) + 1, 1, TOTAL_FRAMES);
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

    // Update image
    const frameIdx = clamp(Math.round(currentFrameRef.current) - 1, 0, TOTAL_FRAMES - 1);
    const expectedSrc = FRAME_PATHS[frameIdx];
    if (imageRef.current.src !== expectedSrc) {
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
      </div>
    </div>
  );
}
