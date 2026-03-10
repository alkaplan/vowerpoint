'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function PresentationMode() {
  const store = usePresentationStore();
  const [showControls, setShowControls] = useState(false);
  const [laserActive, setLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [transitioning, setTransitioning] = useState(false);
  const [transDirection, setTransDirection] = useState<'next' | 'prev'>('next');
  const containerRef = useRef<HTMLDivElement>(null);

  const presentableSlides = store.presentation.slides.filter(s => !s.skipped);
  const currentSlide = presentableSlides[store.presentationSlideIndex];
  const totalSlides = presentableSlides.length;

  // Enter fullscreen
  useEffect(() => {
    const el = containerRef.current;
    if (el && document.fullscreenElement !== el) {
      el.requestFullscreen?.().catch(() => {});
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  const goNext = useCallback(() => {
    if (transitioning) return;
    if (store.presentationSlideIndex < totalSlides - 1) {
      const transition = currentSlide?.transition?.type || 'none';
      if (transition !== 'none') {
        setTransDirection('next');
        setTransitioning(true);
        setTimeout(() => {
          store.nextPresentationSlide();
          setTimeout(() => setTransitioning(false), 300);
        }, 50);
      } else {
        store.nextPresentationSlide();
      }
    }
  }, [store, totalSlides, currentSlide, transitioning]);

  const goPrev = useCallback(() => {
    if (transitioning) return;
    if (store.presentationSlideIndex > 0) {
      const transition = currentSlide?.transition?.type || 'none';
      if (transition !== 'none') {
        setTransDirection('prev');
        setTransitioning(true);
        setTimeout(() => {
          store.prevPresentationSlide();
          setTimeout(() => setTransitioning(false), 300);
        }, 50);
      } else {
        store.prevPresentationSlide();
      }
    }
  }, [store, currentSlide, transitioning]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'Backspace':
          e.preventDefault();
          goPrev();
          break;
        case 'Escape':
          e.preventDefault();
          store.exitPresentation();
          break;
        case 'Home':
          e.preventDefault();
          store.goToPresentationSlide(0);
          break;
        case 'End':
          e.preventDefault();
          store.goToPresentationSlide(totalSlides - 1);
          break;
        case 'l':
        case 'L':
          setLaserActive(prev => !prev);
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, store, totalSlides, laserActive]);

  // Mouse move for laser and controls
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (laserActive) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
    // Show controls when mouse near bottom
    setShowControls(e.clientY > window.innerHeight - 80);
  }, [laserActive]);

  // Exit presentation if no valid slide (moved to useEffect to avoid render-time state update)
  useEffect(() => {
    if (!currentSlide) {
      store.exitPresentation();
    }
  }, [currentSlide, store]);

  if (!currentSlide) {
    return null;
  }

  const bgStyle: React.CSSProperties = {};
  if (currentSlide.background.imageUrl) {
    bgStyle.backgroundImage = `url(${currentSlide.background.imageUrl})`;
    bgStyle.backgroundSize = 'cover';
  } else if (currentSlide.background.gradient) {
    bgStyle.background = currentSlide.background.gradient;
  } else {
    bgStyle.backgroundColor = currentSlide.background.color || '#ffffff';
  }

  // Calculate slide dimensions to fit viewport
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const slideAspect = 960 / 540;
  const viewportAspect = viewportW / viewportH;
  let displayW: number, displayH: number;
  if (viewportAspect > slideAspect) {
    displayH = viewportH;
    displayW = displayH * slideAspect;
  } else {
    displayW = viewportW;
    displayH = displayW / slideAspect;
  }
  const presentScale = displayW / 960;

  const transitionType = currentSlide.transition?.type || 'none';
  let slideStyle: React.CSSProperties = {};
  if (transitioning) {
    if (transitionType === 'fade') {
      slideStyle = { opacity: 0, transition: 'opacity 0.3s ease-in-out' };
    } else if (transitionType === 'slide') {
      slideStyle = {
        transform: transDirection === 'next' ? 'translateX(-100%)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
      };
    }
  } else {
    if (transitionType === 'fade') {
      slideStyle = { opacity: 1, transition: 'opacity 0.3s ease-in-out' };
    } else if (transitionType === 'slide') {
      slideStyle = { transform: 'translateX(0)', transition: 'transform 0.3s ease-in-out' };
    }
  }

  const sortedElements = [...currentSlide.elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-[9999] flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
      onClick={goNext}
      style={{ cursor: laserActive ? 'none' : 'default' }}
    >
      <div
        style={{
          width: displayW,
          height: displayH,
          position: 'relative',
          overflow: 'hidden',
          ...bgStyle,
          ...slideStyle,
        }}
      >
        <div
          style={{
            width: 960,
            height: 540,
            transform: `scale(${presentScale})`,
            transformOrigin: 'top left',
            position: 'relative',
          }}
        >
          {sortedElements.map((el) => {
            const textContent = el.content as { text?: string; html?: string; src?: string };
            const elStyle: React.CSSProperties = {
              position: 'absolute',
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
              opacity: el.opacity,
            };

            if (el.type === 'text') {
              return (
                <div key={el.id} style={{
                  ...elStyle,
                  fontSize: el.style.fontSize || 18,
                  fontFamily: el.style.fontFamily || 'Arial',
                  fontWeight: el.style.fontWeight as React.CSSProperties['fontWeight'] || 'normal',
                  fontStyle: el.style.fontStyle || 'normal',
                  color: el.style.color || '#000',
                  textAlign: (el.style.textAlign as React.CSSProperties['textAlign']) || 'left',
                  textDecoration: el.style.textDecoration || 'none',
                  lineHeight: el.style.lineHeight ? String(el.style.lineHeight) : '1.4',
                  backgroundColor: el.style.fill || 'transparent',
                  padding: el.style.padding || '8px',
                  display: 'flex',
                  alignItems: el.style.verticalAlign === 'middle' ? 'center' : el.style.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
                }}>
                  <div dangerouslySetInnerHTML={{ __html: textContent?.html || textContent?.text || '' }} />
                </div>
              );
            }

            if (el.type === 'shape') {
              return (
                <div key={el.id} style={{
                  ...elStyle,
                  backgroundColor: el.style.fill || '#CFE2FF',
                  border: el.style.stroke ? `${el.style.strokeWidth || 1}px solid ${el.style.stroke}` : 'none',
                  borderRadius: el.shapeType === 'ellipse' ? '50%' : el.style.borderRadius || 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: el.style.fontSize || 14,
                  fontFamily: el.style.fontFamily || 'Arial',
                  color: el.style.color || '#000',
                }}>
                  {textContent?.text || ''}
                </div>
              );
            }

            if (el.type === 'image') {
              return (
                <img key={el.id} src={textContent?.src || ''} alt="" style={{
                  ...elStyle,
                  objectFit: 'cover',
                }} draggable={false} />
              );
            }

            if (el.type === 'line') {
              return (
                <svg key={el.id} style={elStyle} viewBox={`0 0 ${el.width} ${el.height}`}>
                  <line x1={0} y1={el.height / 2} x2={el.width} y2={el.height / 2}
                    stroke={el.style.stroke || '#000'} strokeWidth={el.style.strokeWidth || 2} />
                </svg>
              );
            }

            return <div key={el.id} style={elStyle} />;
          })}
        </div>
      </div>

      {/* Laser pointer */}
      {laserActive && (
        <div
          className="laser-pointer"
          style={{ left: laserPos.x, top: laserPos.y }}
        />
      )}

      {/* Controls */}
      <div className={`presentation-controls ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          className="p-1 hover:bg-white/20 rounded"
          disabled={store.presentationSlideIndex <= 0}
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm">
          {store.presentationSlideIndex + 1} / {totalSlides}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          className="p-1 hover:bg-white/20 rounded"
          disabled={store.presentationSlideIndex >= totalSlides - 1}
        >
          <ChevronRight size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); store.exitPresentation(); }}
          className="p-1 hover:bg-white/20 rounded ml-2"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
