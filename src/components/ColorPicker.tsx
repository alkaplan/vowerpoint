'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePresentationStore } from '@/store/presentationStore';

const THEME_COLORS = [
  ['#4285F4', '#5C9CFF', '#8AB4FF', '#B8CDFF', '#E8F0FE'],
  ['#EA4335', '#EF6B5E', '#F49A90', '#F9C6C0', '#FCE8E6'],
  ['#FBBC04', '#FDD663', '#FEE48E', '#FFF0B8', '#FEF7E0'],
  ['#34A853', '#5CB876', '#87CDA0', '#B7E1C5', '#E6F4EA'],
  ['#FF6D01', '#FF8A3D', '#FFA970', '#FFC9A3', '#FFE8D6'],
  ['#46BDC6', '#6DCDD4', '#97DDE2', '#C1EDF0', '#E4F7F9'],
  ['#7B1FA2', '#9C47C3', '#BD78DD', '#D9ACF0', '#F3E0FF'],
  ['#795548', '#977969', '#B59D91', '#D3C1B8', '#F1E5DF'],
];

const STANDARD_COLORS = [
  '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF',
  '#0000FF', '#9900FF', '#FF00FF', '#000000', '#FFFFFF',
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  onClose: () => void;
  showTransparent?: boolean;
}

export function ColorPicker({ color, onChange, onClose, showTransparent = true }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(color);
  const [showCustom, setShowCustom] = useState(false);
  const { recentColors } = usePresentationStore();
  const ref = useRef<HTMLDivElement>(null);

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
    <div ref={ref} className="dropdown-menu p-3 w-64">
      {/* Transparent option */}
      {showTransparent && (
        <button
          className="w-full text-left text-xs text-gs-text mb-2 px-1 py-0.5 hover:bg-gs-hover rounded"
          onClick={() => { onChange('transparent'); onClose(); }}
        >
          Transparent
        </button>
      )}

      {/* Theme colors */}
      <div className="mb-2">
        <div className="text-xs text-gs-text-secondary mb-1">Theme colors</div>
        <div className="flex flex-col gap-0.5">
          {THEME_COLORS.map((row, i) => (
            <div key={i} className="flex gap-0.5">
              {row.map((c) => (
                <button
                  key={c}
                  className={`w-5 h-5 rounded-sm border hover:scale-110 transition-transform ${c === color ? 'border-gs-blue border-2' : 'border-gray-200'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => { onChange(c); onClose(); }}
                  title={c}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Standard colors */}
      <div className="mb-2">
        <div className="text-xs text-gs-text-secondary mb-1">Standard colors</div>
        <div className="flex gap-0.5">
          {STANDARD_COLORS.map((c) => (
            <button
              key={c}
              className={`w-5 h-5 rounded-sm border hover:scale-110 transition-transform ${c === color ? 'border-gs-blue border-2' : 'border-gray-200'}`}
              style={{ backgroundColor: c }}
              onClick={() => { onChange(c); onClose(); }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Recent colors */}
      {recentColors.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-gs-text-secondary mb-1">Recent</div>
          <div className="flex gap-0.5">
            {recentColors.map((c, i) => (
              <button
                key={`${c}-${i}`}
                className={`w-5 h-5 rounded-sm border hover:scale-110 transition-transform ${c === color ? 'border-gs-blue border-2' : 'border-gray-200'}`}
                style={{ backgroundColor: c }}
                onClick={() => { onChange(c); onClose(); }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom color */}
      <div className="border-t border-gs-border pt-2 mt-2">
        {showCustom ? (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-8 h-8 cursor-pointer border-0 p-0"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="flex-1 text-xs border border-gs-border rounded px-2 py-1 outline-none font-mono"
              placeholder="#000000"
            />
            <button
              className="text-xs bg-gs-blue text-white px-2 py-1 rounded hover:bg-blue-600"
              onClick={() => { onChange(customColor); onClose(); }}
            >
              OK
            </button>
          </div>
        ) : (
          <button
            className="text-xs text-gs-blue hover:underline"
            onClick={() => setShowCustom(true)}
          >
            Custom color...
          </button>
        )}
      </div>
    </div>
  );
}
