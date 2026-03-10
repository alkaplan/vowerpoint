'use client';

import React, { useState } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import {
  Undo2, Redo2, Printer, PaintBucket, MousePointer2, Type, Image, Square,
  Minus, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, List, ListOrdered, IndentDecrease, IndentIncrease,
  Link, Pipette, ChevronDown, Palette, Table, Lock
} from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { ShapePalette } from './ShapePalette';

export function Toolbar() {
  const store = usePresentationStore();
  const [showShapePalette, setShowShapePalette] = useState(false);
  const [showFillColor, setShowFillColor] = useState(false);
  const [showStrokeColor, setShowStrokeColor] = useState(false);
  const [showFontColor, setShowFontColor] = useState(false);

  const selectedElements = store.getSelectedElements();
  const hasSelection = selectedElements.length > 0;
  const selectedStyle = hasSelection ? selectedElements[0].style : null;
  const isTextElement = hasSelection && (selectedElements[0].type === 'text' || selectedElements[0].shapeType);

  const handleUndo = () => usePresentationStore.temporal.getState().undo();
  const handleRedo = () => usePresentationStore.temporal.getState().redo();

  const updateSelectedStyle = (updates: Record<string, unknown>) => {
    selectedElements.forEach(el => {
      store.updateElement(el.id, { style: { ...el.style, ...updates } });
    });
  };

  return (
    <div className="h-11 flex items-center px-2 gap-0.5 border-b border-gs-border bg-gs-toolbar shrink-0 overflow-x-auto">
      {/* Group 1: Undo/Redo */}
      <button className="toolbar-btn" onClick={handleUndo} title="Undo (Ctrl+Z)">
        <Undo2 size={16} />
      </button>
      <button className="toolbar-btn" onClick={handleRedo} title="Redo (Ctrl+Shift+Z)">
        <Redo2 size={16} />
      </button>
      <div className="toolbar-separator" />

      {/* Group 2: Print, Format Painter */}
      <button className="toolbar-btn" onClick={() => window.print()} title="Print (Ctrl+P)">
        <Printer size={16} />
      </button>
      <button
        className={`toolbar-btn ${store.activeTool === 'formatPainter' ? 'active' : ''}`}
        onClick={() => store.pickFormat()}
        title="Paint format"
      >
        <Pipette size={16} />
      </button>
      <div className="toolbar-separator" />

      {/* Group 3: Zoom */}
      <select
        value={store.zoom}
        onChange={(e) => store.setZoom(Number(e.target.value))}
        className="text-xs border border-gs-border rounded px-1 py-1 bg-white cursor-pointer outline-none h-7 w-16"
        title="Zoom"
      >
        <option value={50}>50%</option>
        <option value={75}>75%</option>
        <option value={100}>100%</option>
        <option value={125}>125%</option>
        <option value={150}>150%</option>
        <option value={200}>200%</option>
      </select>
      <div className="toolbar-separator" />

      {/* Group 4: Tools */}
      <button
        className={`toolbar-btn ${store.activeTool === 'select' ? 'active' : ''}`}
        onClick={() => store.setActiveTool('select')}
        title="Select (V)"
      >
        <MousePointer2 size={16} />
      </button>
      <button
        className={`toolbar-btn ${store.activeTool === 'text' ? 'active' : ''}`}
        onClick={() => store.setActiveTool('text')}
        title="Text box (T)"
      >
        <Type size={16} />
      </button>
      <button
        className={`toolbar-btn ${store.activeTool === 'image' ? 'active' : ''}`}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => {
                const img = new window.Image();
                img.onload = () => {
                  const aspect = img.width / img.height;
                  const maxW = 400;
                  const w = Math.min(img.width, maxW);
                  const h = w / aspect;
                  store.addElement({
                    id: crypto.randomUUID(),
                    type: 'image',
                    x: 280, y: 120,
                    width: w, height: h,
                    rotation: 0, zIndex: 1,
                    locked: false, opacity: 1, visible: true,
                    content: { src: ev.target?.result as string, naturalWidth: img.width, naturalHeight: img.height },
                    style: {},
                  });
                };
                img.src = ev.target?.result as string;
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        }}
        title="Insert image"
      >
        <Image size={16} />
      </button>
      <div className="relative">
        <button
          className={`toolbar-btn ${store.activeTool === 'shape' ? 'active' : ''}`}
          onClick={() => setShowShapePalette(!showShapePalette)}
          title="Shape"
        >
          <Square size={16} />
          <ChevronDown size={10} className="ml-0.5" />
        </button>
        {showShapePalette && (
          <div className="absolute top-full left-0 z-50">
            <ShapePalette onSelect={(shape) => {
              store.setActiveShapeType(shape);
              store.setActiveTool('shape');
              setShowShapePalette(false);
            }} onClose={() => setShowShapePalette(false)} />
          </div>
        )}
      </div>
      <button
        className={`toolbar-btn ${store.activeTool === 'line' ? 'active' : ''}`}
        onClick={() => store.setActiveTool('line')}
        title="Line"
      >
        <Minus size={16} />
      </button>
      <button
        className={`toolbar-btn ${store.activeTool === 'table' ? 'active' : ''}`}
        onClick={() => store.setActiveTool('table')}
        title="Table"
      >
        <Table size={16} />
      </button>
      <div className="toolbar-separator" />

      {/* Group 5: Fill & Stroke */}
      <div className="relative">
        <button className="toolbar-btn" onClick={() => setShowFillColor(!showFillColor)} title="Fill color">
          <div className="w-4 h-4 border border-gray-300 rounded" style={{ backgroundColor: selectedStyle?.fill || '#ffffff' }} />
          <ChevronDown size={10} className="ml-0.5" />
        </button>
        {showFillColor && (
          <div className="absolute top-full left-0 z-50">
            <ColorPicker
              color={selectedStyle?.fill || '#ffffff'}
              onChange={(color) => { updateSelectedStyle({ fill: color }); store.addRecentColor(color); }}
              onClose={() => setShowFillColor(false)}
            />
          </div>
        )}
      </div>
      <div className="relative">
        <button className="toolbar-btn" onClick={() => setShowStrokeColor(!showStrokeColor)} title="Border color">
          <div className="w-4 h-4 border-2 rounded" style={{ borderColor: selectedStyle?.stroke || '#000000' }} />
          <ChevronDown size={10} className="ml-0.5" />
        </button>
        {showStrokeColor && (
          <div className="absolute top-full left-0 z-50">
            <ColorPicker
              color={selectedStyle?.stroke || '#000000'}
              onChange={(color) => { updateSelectedStyle({ stroke: color, strokeWidth: (selectedStyle?.strokeWidth || 0) < 1 ? 1 : selectedStyle?.strokeWidth }); store.addRecentColor(color); }}
              onClose={() => setShowStrokeColor(false)}
            />
          </div>
        )}
      </div>
      <div className="toolbar-separator" />

      {/* Group 6: Text formatting (shown when text selected) */}
      {isTextElement && (
        <>
          <select
            value={selectedStyle?.fontFamily || 'Arial'}
            onChange={(e) => updateSelectedStyle({ fontFamily: e.target.value })}
            className="text-xs border border-gs-border rounded px-1 py-1 bg-white cursor-pointer outline-none h-7 w-28"
            title="Font family"
          >
            {['Arial', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Georgia', 'Times New Roman', 'Courier New', 'Comic Sans MS'].map(f => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </select>
          <div className="flex items-center">
            <button className="toolbar-btn w-5 h-7" onClick={() => updateSelectedStyle({ fontSize: Math.max(8, (selectedStyle?.fontSize || 18) - 2) })}>-</button>
            <input
              type="number"
              value={selectedStyle?.fontSize || 18}
              onChange={(e) => updateSelectedStyle({ fontSize: Math.max(8, parseInt(e.target.value) || 18) })}
              className="w-10 h-7 text-center text-xs border border-gs-border rounded outline-none"
              min={8}
              max={96}
            />
            <button className="toolbar-btn w-5 h-7" onClick={() => updateSelectedStyle({ fontSize: Math.min(96, (selectedStyle?.fontSize || 18) + 2) })}>+</button>
          </div>
          <div className="toolbar-separator" />
          <button
            className={`toolbar-btn ${selectedStyle?.fontWeight === 'bold' ? 'active' : ''}`}
            onClick={() => updateSelectedStyle({ fontWeight: selectedStyle?.fontWeight === 'bold' ? 'normal' : 'bold' })}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button
            className={`toolbar-btn ${selectedStyle?.fontStyle === 'italic' ? 'active' : ''}`}
            onClick={() => updateSelectedStyle({ fontStyle: selectedStyle?.fontStyle === 'italic' ? 'normal' : 'italic' })}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button
            className={`toolbar-btn ${selectedStyle?.textDecoration?.includes('underline') ? 'active' : ''}`}
            onClick={() => updateSelectedStyle({ textDecoration: selectedStyle?.textDecoration?.includes('underline') ? '' : 'underline' })}
            title="Underline (Ctrl+U)"
          >
            <Underline size={16} />
          </button>
          <button
            className={`toolbar-btn ${selectedStyle?.textDecoration?.includes('line-through') ? 'active' : ''}`}
            onClick={() => updateSelectedStyle({ textDecoration: selectedStyle?.textDecoration?.includes('line-through') ? '' : 'line-through' })}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>
          <div className="relative">
            <button className="toolbar-btn" onClick={() => setShowFontColor(!showFontColor)} title="Font color">
              <span className="text-sm font-bold" style={{ color: selectedStyle?.color || '#000000' }}>A</span>
              <div className="w-4 h-0.5 mt-0.5" style={{ backgroundColor: selectedStyle?.color || '#000000' }} />
            </button>
            {showFontColor && (
              <div className="absolute top-full left-0 z-50">
                <ColorPicker
                  color={selectedStyle?.color || '#000000'}
                  onChange={(color) => { updateSelectedStyle({ color }); store.addRecentColor(color); }}
                  onClose={() => setShowFontColor(false)}
                />
              </div>
            )}
          </div>
          <div className="toolbar-separator" />
          <button
            className={`toolbar-btn ${selectedStyle?.textAlign === 'left' ? 'active' : ''}`}
            onClick={() => updateSelectedStyle({ textAlign: 'left' })}
            title="Align left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            className={`toolbar-btn ${selectedStyle?.textAlign === 'center' ? 'active' : ''}`}
            onClick={() => updateSelectedStyle({ textAlign: 'center' })}
            title="Align center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            className={`toolbar-btn ${selectedStyle?.textAlign === 'right' ? 'active' : ''}`}
            onClick={() => updateSelectedStyle({ textAlign: 'right' })}
            title="Align right"
          >
            <AlignRight size={16} />
          </button>
          <button
            className={`toolbar-btn ${selectedStyle?.textAlign === 'justify' ? 'active' : ''}`}
            onClick={() => updateSelectedStyle({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify size={16} />
          </button>
        </>
      )}

      {/* Lock button when something is selected */}
      {hasSelection && (
        <>
          <div className="toolbar-separator" />
          <button
            className={`toolbar-btn ${selectedElements[0].locked ? 'active' : ''}`}
            onClick={() => store.toggleLockElement(selectedElements[0].id)}
            title={selectedElements[0].locked ? 'Unlock element' : 'Lock element'}
          >
            <Lock size={16} />
          </button>
        </>
      )}
    </div>
  );
}
