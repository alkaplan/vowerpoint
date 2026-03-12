'use client';

import React, { useRef, useEffect } from 'react';
import { getShapesByCategory } from '@/lib/shapes';
import { ShapeType } from '@/types/presentation';

interface ShapePaletteProps {
  onSelect: (shape: ShapeType) => void;
  onClose: () => void;
}

export function ShapePalette({ onSelect, onClose }: ShapePaletteProps) {
  const ref = useRef<HTMLDivElement>(null);
  const categories = getShapesByCategory();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="dropdown-menu p-3 w-80 max-h-96 overflow-y-auto">
      {Object.entries(categories).map(([category, shapes]) => (
        <div key={category} className="mb-3">
          <div className="text-xs text-gs-text-secondary mb-1 font-medium">{category}</div>
          <div className="grid grid-cols-8 gap-1">
            {shapes.map((shape) => (
              <button
                key={shape.type}
                className="w-8 h-8 border border-gs-border rounded hover:bg-gs-hover flex items-center justify-center p-1"
                onClick={() => onSelect(shape.type as ShapeType)}
                title={shape.name}
              >
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <path
                    d={shape.getSvgPath(28, 28)}
                    transform="translate(2, 2)"
                    fill="none"
                    stroke="#3C4043"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
