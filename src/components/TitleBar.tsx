'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import { Star, Play } from 'lucide-react';

export function TitleBar() {
  const { presentation, setTitle, saveStatus, startPresentation, zoom, setZoom } = usePresentationStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(presentation.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const [starred, setStarred] = useState(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setTitle(editValue.trim() || 'Untitled presentation');
    setIsEditing(false);
  };

  const saveLabel = saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Unsaved changes';

  return (
    <div className="h-10 flex items-center px-3 border-b border-gs-border bg-white shrink-0">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-6 h-6 bg-gs-blue rounded flex items-center justify-center text-white text-xs font-bold shrink-0">
          V
        </div>
        <div className="flex items-center gap-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditValue(presentation.title); setIsEditing(false); } }}
              className="text-sm font-medium border border-gs-blue rounded px-1 py-0.5 outline-none min-w-[200px]"
            />
          ) : (
            <button
              onClick={() => { setEditValue(presentation.title); setIsEditing(true); }}
              className="text-sm font-medium truncate hover:bg-gs-hover px-1 py-0.5 rounded cursor-text"
            >
              {presentation.title}
            </button>
          )}
          <button
            onClick={() => setStarred(!starred)}
            className="toolbar-btn w-6 h-6"
            title="Star"
          >
            <Star size={14} fill={starred ? '#FBBC04' : 'none'} color={starred ? '#FBBC04' : '#5F6368'} />
          </button>
        </div>
        <span className={`text-xs ml-2 shrink-0 ${saveStatus === 'saving' ? 'text-gs-blue save-indicator-saving' : 'text-gs-text-secondary'}`}>{saveLabel}</span>
      </div>

      {/* Right: Present + Share + Zoom + Avatar */}
      <div className="flex items-center gap-2 shrink-0">
        <select
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="text-xs border border-gs-border rounded px-1 py-0.5 bg-white cursor-pointer outline-none"
        >
          <option value={50}>50%</option>
          <option value={75}>75%</option>
          <option value={100}>100%</option>
          <option value={125}>125%</option>
          <option value={150}>150%</option>
          <option value={200}>200%</option>
        </select>
        <button className="px-3 py-1 text-xs border border-gs-border rounded hover:bg-gs-hover text-gs-text">
          Share
        </button>
                <button
                  onClick={() => startPresentation(0)}
                  className="present-btn px-3 py-1 text-xs bg-gs-blue text-white rounded hover:bg-blue-600 flex items-center gap-1"
                >
          <Play size={12} fill="white" />
          Present
        </button>
        <div className="w-7 h-7 rounded-full bg-gs-blue text-white flex items-center justify-center text-xs font-medium">
          U
        </div>
      </div>
    </div>
  );
}
