'use client';

import React from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import { TitleBar } from './TitleBar';
import { MenuBar } from './MenuBar';
import { Toolbar } from './Toolbar';
import { SlidePanel } from './SlidePanel';
import { CanvasWorkspace } from './CanvasWorkspace';
import { FormatPanel } from './FormatPanel';
import { SpeakerNotes } from './SpeakerNotes';
import { PresentationMode } from './PresentationMode';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { useAutoSave } from '@/hooks/useAutoSave';

export function EditorLayout() {
  const {
    showLeftPanel,
    showRightPanel,
    isPresentationMode,
  } = usePresentationStore();

  // Enable auto-save (localStorage + Supabase when configured)
  useAutoSave();

  if (isPresentationMode) {
    return <PresentationMode />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <KeyboardShortcuts />
      <TitleBar />
      <MenuBar />
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        {showLeftPanel && <SlidePanel />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CanvasWorkspace />
          <SpeakerNotes />
        </div>
        {showRightPanel && <FormatPanel />}
      </div>
    </div>
  );
}
