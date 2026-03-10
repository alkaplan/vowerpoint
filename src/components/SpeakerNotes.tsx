'use client';

import React, { useState, useRef } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import { GripHorizontal } from 'lucide-react';

export function SpeakerNotes() {
  const store = usePresentationStore();
  const slide = store.getCurrentSlide();
  const [height, setHeight] = useState(80);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startHeight.current = height;
    const handleMouseMove = (ev: MouseEvent) => {
      const delta = startY.current - ev.clientY;
      setHeight(Math.max(40, Math.min(300, startHeight.current + delta)));
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!slide) return null;

  return (
    <div className="border-t border-gs-border bg-white shrink-0" style={{ height }}>
      <div
        className="h-4 flex items-center justify-center cursor-row-resize hover:bg-gs-hover"
        onMouseDown={handleMouseDown}
      >
        <GripHorizontal size={12} className="text-gs-text-secondary" />
      </div>
      <textarea
        value={slide.speakerNotes}
        onChange={(e) => store.setSpeakerNotes(slide.id, e.target.value)}
        placeholder="Click to add speaker notes"
        className="w-full px-3 text-xs text-gs-text resize-none outline-none bg-white"
        style={{ height: height - 16 }}
      />
    </div>
  );
}
