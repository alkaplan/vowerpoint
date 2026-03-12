'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePresentationStore, createNewPresentation } from '@/store/presentationStore';
import { exportToJSON, importFromJSON, exportToPNG, exportToPDFAllSlides } from '@/lib/export';

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  separator?: boolean;
  disabled?: boolean;
  submenu?: MenuItem[];
}

function MenuDropdown({ items, onClose }: { items: MenuItem[]; onClose: () => void }) {
  return (
    <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
      {items.map((item, i) => {
        if (item.separator) return <div key={i} className="menu-separator" />;
        return (
          <div
            key={i}
            className={`menu-item ${item.disabled ? 'disabled' : ''}`}
            onClick={() => {
              if (!item.disabled && item.action) {
                item.action();
                onClose();
              }
            }}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-gs-text-secondary ml-8">{item.shortcut}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const store = usePresentationStore();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const data = await importFromJSON(file);
          store.setPresentation(data);
          } catch {
            alert('Failed to import: invalid file');
        }
      }
    };
    input.click();
  }, [store]);

  const menus: Record<string, MenuItem[]> = {
    File: [
      { label: 'New', shortcut: '', action: () => { store.setPresentation(createNewPresentation()); } },
      { label: 'Open', shortcut: 'Ctrl+O', action: handleImport },
      { label: 'Make a copy', action: () => { const copy = JSON.parse(JSON.stringify(store.presentation)); copy.title = store.presentation.title + ' (copy)'; exportToJSON(copy); } },
      { label: '', separator: true },
      { label: 'Download as PDF', action: () => { exportToPDFAllSlides(store, store.presentation.title); } },
      { label: 'Download as PNG (current slide)', action: () => { const el = document.querySelector('[data-slide-render].current') as HTMLElement; if (el) exportToPNG(el, `slide-${store.currentSlideIndex + 1}.png`); } },
      { label: 'Download as JSON', action: () => exportToJSON(store.presentation) },
      { label: '', separator: true },
      { label: 'Import from JSON', action: handleImport },
      { label: '', separator: true },
      { label: 'Print', shortcut: 'Ctrl+P', action: () => window.print() },
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', action: () => usePresentationStore.temporal.getState().undo() },
      { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => usePresentationStore.temporal.getState().redo() },
      { label: '', separator: true },
      { label: 'Cut', shortcut: 'Ctrl+X', action: () => store.cutElements() },
      { label: 'Copy', shortcut: 'Ctrl+C', action: () => store.copyElements() },
      { label: 'Paste', shortcut: 'Ctrl+V', action: () => store.pasteElements() },
      { label: 'Delete', shortcut: 'Del', action: () => store.deleteElements(store.selectedElementIds) },
      { label: '', separator: true },
      { label: 'Duplicate', shortcut: 'Ctrl+D', action: () => store.duplicateElements(store.selectedElementIds) },
      { label: 'Select all', shortcut: 'Ctrl+A', action: () => { const slide = store.getCurrentSlide(); if (slide) store.setSelectedElementIds(slide.elements.map(e => e.id)); } },
    ],
    View: [
      { label: `${store.showLeftPanel ? 'Hide' : 'Show'} slide panel`, action: () => store.toggleLeftPanel() },
      { label: `${store.showRightPanel ? 'Hide' : 'Show'} format panel`, action: () => store.toggleRightPanel() },
      { label: '', separator: true },
      { label: `${store.showGrid ? 'Hide' : 'Show'} grid`, action: () => store.toggleGrid() },
      { label: `${store.showGuides ? 'Hide' : 'Show'} guides`, action: () => store.toggleGuides() },
      { label: `${store.showRulers ? 'Hide' : 'Show'} rulers`, action: () => store.toggleRulers() },
      { label: '', separator: true },
      { label: 'Zoom in', shortcut: 'Ctrl+=', action: () => store.setZoom(store.zoom + 25) },
      { label: 'Zoom out', shortcut: 'Ctrl+-', action: () => store.setZoom(store.zoom - 25) },
      { label: 'Fit to screen', shortcut: 'Ctrl+0', action: () => store.setZoom(100) },
    ],
    Insert: [
      { label: 'Text box', shortcut: 'T', action: () => store.setActiveTool('text') },
      { label: 'Image', action: () => store.setActiveTool('image') },
      { label: 'Shape', action: () => store.setActiveTool('shape') },
      { label: 'Line', action: () => store.setActiveTool('line') },
      { label: 'Table', action: () => store.setActiveTool('table') },
    ],
    Format: [
      { label: 'Bold', shortcut: 'Ctrl+B', disabled: store.selectedElementIds.length === 0 },
      { label: 'Italic', shortcut: 'Ctrl+I', disabled: store.selectedElementIds.length === 0 },
      { label: 'Underline', shortcut: 'Ctrl+U', disabled: store.selectedElementIds.length === 0 },
      { label: '', separator: true },
      { label: 'Align left', shortcut: 'Ctrl+Shift+L' },
      { label: 'Align center', shortcut: 'Ctrl+Shift+E' },
      { label: 'Align right', shortcut: 'Ctrl+Shift+R' },
    ],
    Slide: [
      { label: 'New slide', shortcut: 'Ctrl+M', action: () => store.addSlide('blank') },
      { label: 'Duplicate slide', action: () => store.duplicateSlide(store.currentSlideIndex) },
      { label: 'Delete slide', action: () => store.deleteSlide(store.currentSlideIndex) },
      { label: '', separator: true },
      { label: 'Skip slide', action: () => store.toggleSkipSlide(store.currentSlideIndex) },
      { label: '', separator: true },
      { label: 'Change background...', action: () => {} },
    ],
    Arrange: [
      { label: 'Bring to front', shortcut: 'Ctrl+Shift+↑', action: () => { if (store.selectedElementIds[0]) store.bringToFront(store.selectedElementIds[0]); }, disabled: store.selectedElementIds.length === 0 },
      { label: 'Bring forward', action: () => { if (store.selectedElementIds[0]) store.bringForward(store.selectedElementIds[0]); }, disabled: store.selectedElementIds.length === 0 },
      { label: 'Send backward', action: () => { if (store.selectedElementIds[0]) store.sendBackward(store.selectedElementIds[0]); }, disabled: store.selectedElementIds.length === 0 },
      { label: 'Send to back', shortcut: 'Ctrl+Shift+↓', action: () => { if (store.selectedElementIds[0]) store.sendToBack(store.selectedElementIds[0]); }, disabled: store.selectedElementIds.length === 0 },
      { label: '', separator: true },
      { label: 'Group', shortcut: 'Ctrl+G', action: () => store.groupElements(store.selectedElementIds), disabled: store.selectedElementIds.length < 2 },
      { label: 'Ungroup', shortcut: 'Ctrl+Shift+G', action: () => { const el = store.getSelectedElements()[0]; if (el?.groupId) store.ungroupElements(el.groupId); }, disabled: store.selectedElementIds.length === 0 },
    ],
    Tools: [
      { label: 'Preferences', disabled: true },
    ],
    Help: [
      { label: 'Keyboard shortcuts', shortcut: 'Ctrl+/', action: () => alert('Keyboard shortcuts:\nCtrl+Z: Undo\nCtrl+Shift+Z: Redo\nCtrl+C: Copy\nCtrl+V: Paste\nCtrl+X: Cut\nCtrl+D: Duplicate\nCtrl+A: Select All\nCtrl+M: New Slide\nDelete: Delete\nArrow Keys: Nudge\nShift+Arrow: Nudge 10px\nF5: Present\nEsc: Deselect') },
    ],
  };

  return (
    <div ref={menuRef} className="h-7 flex items-center px-2 border-b border-gs-border bg-white shrink-0 relative">
      {Object.entries(menus).map(([name, items]) => (
        <div key={name} className="relative">
          <button
            className={`px-2 py-0.5 text-menu rounded hover:bg-gs-hover ${openMenu === name ? 'bg-gs-hover' : ''}`}
            onClick={() => setOpenMenu(openMenu === name ? null : name)}
            onMouseEnter={() => openMenu && setOpenMenu(name)}
          >
            {name}
          </button>
          {openMenu === name && (
            <div className="absolute left-0 top-full z-50">
              <MenuDropdown items={items} onClose={() => setOpenMenu(null)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
