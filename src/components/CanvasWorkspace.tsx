'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import { v4 as uuidv4 } from 'uuid';
import { SlideElement, ShapeType } from '@/types/presentation';
import { getShapeDefinition } from '@/lib/shapes';

// ========== Element Renderer ==========
function ElementRenderer({
  element,
  isSelected,
  onSelect,
  onDoubleClick,
  scale,
}: {
  element: SlideElement;
  isSelected: boolean;
  onSelect: (id: string, additive: boolean) => void;
  onDoubleClick: (id: string) => void;
  scale: number;
}) {
  const store = usePresentationStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, elX: 0, elY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, elX: 0, elY: 0 });
  const rotateStart = useRef({ angle: 0, startAngle: 0 });
  const [editingText, setEditingText] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.locked) {
      onSelect(element.id, e.shiftKey);
      return;
    }
    onSelect(element.id, e.shiftKey);
    if (editingText) return;

    setIsDragging(true);
    dragStart.current = {
      x: e.clientX, y: e.clientY,
      elX: element.x, elY: element.y,
    };

    const handleMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - dragStart.current.x) / scale;
      const dy = (ev.clientY - dragStart.current.y) / scale;
      store.updateElement(element.id, {
        x: dragStart.current.elX + dx,
        y: dragStart.current.elY + dy,
      });
    };
    const handleUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [element, onSelect, scale, store, editingText]);

  const handleResizeStart = useCallback((handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(handle);
    resizeStart.current = {
      x: e.clientX, y: e.clientY,
      w: element.width, h: element.height,
      elX: element.x, elY: element.y,
    };

    const handleMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - resizeStart.current.x) / scale;
      const dy = (ev.clientY - resizeStart.current.y) / scale;
      const maintainAspect = ev.shiftKey;
      const aspect = resizeStart.current.w / resizeStart.current.h;

      let newW = resizeStart.current.w;
      let newH = resizeStart.current.h;
      let newX = resizeStart.current.elX;
      let newY = resizeStart.current.elY;

      if (handle.includes('e')) newW = Math.max(20, resizeStart.current.w + dx);
      if (handle.includes('w')) { newW = Math.max(20, resizeStart.current.w - dx); newX = resizeStart.current.elX + dx; }
      if (handle.includes('s')) newH = Math.max(20, resizeStart.current.h + dy);
      if (handle.includes('n')) { newH = Math.max(20, resizeStart.current.h - dy); newY = resizeStart.current.elY + dy; }

      if (maintainAspect) {
        if (handle === 'e' || handle === 'w') newH = newW / aspect;
        else if (handle === 'n' || handle === 's') newW = newH * aspect;
        else { newH = newW / aspect; }
      }

      store.updateElement(element.id, { x: newX, y: newY, width: newW, height: newH });
    };
    const handleUp = () => {
      setIsResizing(null);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [element, scale, store]);

  const handleRotateStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);
    const rect = (e.target as HTMLElement).closest('[data-element-wrapper]')!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    rotateStart.current = { angle: element.rotation, startAngle };

    const handleMove = (ev: MouseEvent) => {
      const currentAngle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI);
      let newRotation = rotateStart.current.angle + (currentAngle - rotateStart.current.startAngle);
      if (ev.shiftKey) newRotation = Math.round(newRotation / 15) * 15;
      store.updateElement(element.id, { rotation: newRotation });
    };
    const handleUp = () => {
      setIsRotating(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [element, store]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (element.type === 'text' || element.shapeType) {
      setEditingText(true);
      store.setIsTextEditing(true);
      onDoubleClick(element.id);
    }
  }, [element, onDoubleClick, store]);

  const handleTextBlur = useCallback(() => {
    setEditingText(false);
    store.setIsTextEditing(false);
  }, [store]);

  const handleTextInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const text = (e.target as HTMLDivElement).innerText;
    const html = (e.target as HTMLDivElement).innerHTML;
    store.updateElement(element.id, {
      content: { ...element.content, text, html },
    });
  }, [element, store]);

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    opacity: element.opacity,
    cursor: element.locked ? 'default' : isDragging ? 'grabbing' : 'move',
    zIndex: element.zIndex,
    outline: isSelected ? '2px solid #4285F4' : 'none',
    outlineOffset: '1px',
  };

  // Render handles
  const handles = isSelected && !element.locked ? (
    <>
      {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map(h => {
        const pos: React.CSSProperties = {};
        if (h.includes('n')) pos.top = -4;
        if (h.includes('s')) pos.bottom = -4;
        if (h.includes('w')) pos.left = -4;
        if (h.includes('e')) pos.right = -4;
        if (h === 'n' || h === 's') { pos.left = '50%'; pos.marginLeft = -4; }
        if (h === 'e' || h === 'w') { pos.top = '50%'; pos.marginTop = -4; }
        const cursors: Record<string, string> = { nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize', e: 'e-resize', se: 'se-resize', s: 's-resize', sw: 'sw-resize', w: 'w-resize' };
        return (
          <div
            key={h}
            className="absolute w-2 h-2 bg-white border-2 border-gs-blue rounded-sm"
            style={{ ...pos, cursor: cursors[h], zIndex: 10 }}
            onMouseDown={(e) => handleResizeStart(h, e)}
          />
        );
      })}
      {/* Rotation handle */}
      <div
        className="absolute -top-7 left-1/2 -ml-3 w-6 h-6 flex items-center justify-center cursor-grab"
        onMouseDown={handleRotateStart}
        style={{ zIndex: 10 }}
      >
        <div className="w-3 h-3 rounded-full border-2 border-gs-blue bg-white" />
      </div>
      {/* Lock indicator */}
      {element.locked && (
        <div className="absolute -top-5 -right-1 text-xs text-gs-text-secondary">🔒</div>
      )}
    </>
  ) : null;

  // Render element content based on type
  const renderContent = () => {
    const textContent = element.content as { text?: string; html?: string };

    if (element.type === 'text') {
      const textStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        fontSize: element.style.fontSize || 18,
        fontFamily: element.style.fontFamily || 'Arial',
        fontWeight: element.style.fontWeight as React.CSSProperties['fontWeight'] || 'normal',
        fontStyle: element.style.fontStyle || 'normal',
        color: element.style.color || '#000000',
        textAlign: (element.style.textAlign as React.CSSProperties['textAlign']) || 'left',
        textDecoration: element.style.textDecoration || 'none',
        lineHeight: element.style.lineHeight ? String(element.style.lineHeight) : '1.4',
        backgroundColor: element.style.fill || 'transparent',
        padding: element.style.padding || '8px',
        border: element.style.stroke ? `${element.style.strokeWidth || 1}px solid ${element.style.stroke}` : 'none',
        borderRadius: element.style.borderRadius || 0,
        overflow: 'hidden',
        outline: 'none',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        display: 'flex',
        alignItems: element.style.verticalAlign === 'middle' ? 'center' : element.style.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
      };

      if (editingText) {
        return (
          <div
            contentEditable
            suppressContentEditableWarning
            style={textStyle}
            onInput={handleTextInput}
            onBlur={handleTextBlur}
            dangerouslySetInnerHTML={{ __html: textContent?.html || textContent?.text || '' }}
            className="cursor-text"
          />
        );
      }

      return (
        <div style={textStyle}>
          <div dangerouslySetInnerHTML={{ __html: textContent?.html || textContent?.text || '' }} />
        </div>
      );
    }

    if (element.type === 'shape') {
      const shapeDef = element.shapeType ? getShapeDefinition(element.shapeType) : null;
      const isEllipse = element.shapeType === 'ellipse';

      return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {shapeDef ? (
            <svg
              viewBox={`0 0 ${element.width} ${element.height}`}
              style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
            >
              <path
                d={shapeDef.getSvgPath(element.width, element.height)}
                fill={element.style.fill || '#CFE2FF'}
                stroke={element.style.stroke || 'none'}
                strokeWidth={element.style.strokeWidth || 0}
                strokeDasharray={element.style.strokeDasharray || 'none'}
                opacity={element.style.opacity ?? 1}
              />
            </svg>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: element.style.fill || '#CFE2FF',
                border: element.style.stroke ? `${element.style.strokeWidth || 1}px solid ${element.style.stroke}` : 'none',
                borderRadius: isEllipse ? '50%' : element.style.borderRadius || 0,
                boxShadow: element.style.shadow ? `${element.style.shadowOffsetX || 2}px ${element.style.shadowOffsetY || 2}px ${element.style.shadowBlur || 4}px ${element.style.shadow}` : 'none',
              }}
            />
          )}
          {/* Text inside shape */}
          {textContent?.text && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: element.style.fontSize || 14,
                fontFamily: element.style.fontFamily || 'Arial',
                color: element.style.color || '#000',
                textAlign: 'center',
                padding: '8px',
                overflow: 'hidden',
              }}
            >
              {editingText ? (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleTextInput}
                  onBlur={handleTextBlur}
                  className="outline-none cursor-text w-full"
                  dangerouslySetInnerHTML={{ __html: textContent?.html || textContent?.text || '' }}
                />
              ) : (
                <span>{textContent.text}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    if (element.type === 'image') {
      const imgContent = element.content as { src?: string };
      return (
        <img
          src={imgContent?.src || ''}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: element.style.borderRadius || 0,
            border: element.style.stroke ? `${element.style.strokeWidth || 1}px solid ${element.style.stroke}` : 'none',
          }}
          draggable={false}
        />
      );
    }

    if (element.type === 'line') {
      const lineContent = element.content as { points?: number[][] };
      const points = lineContent?.points || [[0, element.height / 2], [element.width, element.height / 2]];
      return (
        <svg
          viewBox={`0 0 ${element.width} ${element.height}`}
          style={{ width: '100%', height: '100%' }}
        >
          <line
            x1={points[0][0]}
            y1={points[0][1]}
            x2={points[1]?.[0] ?? element.width}
            y2={points[1]?.[1] ?? element.height / 2}
            stroke={element.style.stroke || '#000000'}
            strokeWidth={element.style.strokeWidth || 2}
            strokeDasharray={element.style.strokeDasharray || 'none'}
            markerEnd={element.style.arrowEnd ? 'url(#arrowhead)' : undefined}
          />
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={element.style.stroke || '#000000'} />
            </marker>
          </defs>
        </svg>
      );
    }

    if (element.type === 'table') {
      const tableContent = element.content as { rows?: number; cols?: number; cells?: string[][] };
      const rows = tableContent?.rows || 3;
      const cols = tableContent?.cols || 3;
      const cells = tableContent?.cells || Array(rows).fill(null).map(() => Array(cols).fill(''));
      const cellW = element.width / cols;
      const cellH = element.height / rows;

      return (
        <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <tbody>
            {cells.map((row: string[], ri: number) => (
              <tr key={ri}>
                {row.map((cell: string, ci: number) => (
                  <td
                    key={ci}
                    style={{
                      border: '1px solid #DADCE0',
                      padding: '4px',
                      fontSize: 12,
                      fontFamily: 'Arial',
                      verticalAlign: 'top',
                      overflow: 'hidden',
                      width: cellW,
                      height: cellH,
                    }}
                    contentEditable={editingText}
                    suppressContentEditableWarning
                    onInput={(e) => {
                      const newCells = cells.map((r: string[], i: number) =>
                        r.map((c: string, j: number) => (i === ri && j === ci ? (e.target as HTMLElement).innerText : c))
                      );
                      store.updateElement(element.id, { content: { ...tableContent, cells: newCells } });
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return null;
  };

  return (
    <div
      data-element-wrapper
      data-element-id={element.id}
      style={containerStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {renderContent()}
      {handles}
    </div>
  );
}

// ========== Canvas Workspace ==========
export function CanvasWorkspace() {
  const store = usePresentationStore();
  const slide = store.getCurrentSlide();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawStart = useRef({ x: 0, y: 0 });
  const [drawRect, setDrawRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const scale = store.zoom / 100;
  const slideW = 960;
  const slideH = 540;

  const getSlideCoords = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const slideEl = canvasRef.current.querySelector('[data-slide-area]');
    if (!slideEl) return { x: 0, y: 0 };
    const rect = slideEl.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  }, [scale]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-element-wrapper]')) return;

    const coords = getSlideCoords(e);
    const tool = store.activeTool;

    if (tool === 'select') {
      store.setSelectedElementIds([]);
      // Start marquee selection
      setIsDrawing(true);
      drawStart.current = { x: e.clientX, y: e.clientY };
      const slideEl = canvasRef.current?.querySelector('[data-slide-area]');
      if (!slideEl) return;
      const rect = slideEl.getBoundingClientRect();
      const startX = (e.clientX - rect.left) / scale;
      const startY = (e.clientY - rect.top) / scale;

      const handleMove = (ev: MouseEvent) => {
        const curX = (ev.clientX - rect.left) / scale;
        const curY = (ev.clientY - rect.top) / scale;
        const mx = Math.min(startX, curX);
        const my = Math.min(startY, curY);
        const mw = Math.abs(curX - startX);
        const mh = Math.abs(curY - startY);
        if (mw > 5 || mh > 5) {
          setMarquee({ x: mx, y: my, w: mw, h: mh });
        }
      };
      const handleUp = (ev: MouseEvent) => {
        setIsDrawing(false);
        if (marquee) {
          // Select elements within marquee
          const currentSlide = store.getCurrentSlide();
          if (currentSlide) {
            const selected = currentSlide.elements.filter(el => {
              return el.x < (marquee.x + marquee.w) && (el.x + el.width) > marquee.x &&
                     el.y < (marquee.y + marquee.h) && (el.y + el.height) > marquee.y;
            });
            store.setSelectedElementIds(selected.map(el => el.id));
          }
        }
        setMarquee(null);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      return;
    }

    if (tool === 'text' || tool === 'shape' || tool === 'line' || tool === 'table') {
      setIsDrawing(true);
      drawStart.current = coords;
      setDrawRect({ x: coords.x, y: coords.y, w: 0, h: 0 });

      const slideEl = canvasRef.current?.querySelector('[data-slide-area]');
      if (!slideEl) return;
      const rect = slideEl.getBoundingClientRect();

      const handleMove = (ev: MouseEvent) => {
        const curX = (ev.clientX - rect.left) / scale;
        const curY = (ev.clientY - rect.top) / scale;
        const x = Math.min(drawStart.current.x, curX);
        const y = Math.min(drawStart.current.y, curY);
        const w = Math.abs(curX - drawStart.current.x);
        const h = Math.abs(curY - drawStart.current.y);
        setDrawRect({ x, y, w, h });
      };
      const handleUp = (ev: MouseEvent) => {
        setIsDrawing(false);
        const curX = (ev.clientX - rect.left) / scale;
        const curY = (ev.clientY - rect.top) / scale;
        const x = Math.min(drawStart.current.x, curX);
        const y = Math.min(drawStart.current.y, curY);
        let w = Math.abs(curX - drawStart.current.x);
        let h = Math.abs(curY - drawStart.current.y);

        // Minimum size defaults
        if (w < 20) w = tool === 'text' ? 200 : tool === 'table' ? 300 : 100;
        if (h < 20) h = tool === 'text' ? 40 : tool === 'table' ? 150 : 100;

        if (tool === 'text') {
          store.addElement({
            id: uuidv4(), type: 'text',
            x, y, width: w, height: h,
            rotation: 0, zIndex: 1, locked: false, opacity: 1, visible: true,
            content: { text: '', html: '' },
            style: {
              fontSize: 18, fontFamily: 'Arial', color: '#000000',
              textAlign: 'left', fontWeight: 'normal', fontStyle: 'normal',
              fill: 'transparent', padding: '8px',
            },
          });
        } else if (tool === 'shape') {
          store.addElement({
            id: uuidv4(), type: 'shape', shapeType: store.activeShapeType,
            x, y, width: w, height: h,
            rotation: 0, zIndex: 1, locked: false, opacity: 1, visible: true,
            content: { text: '' },
            style: {
              fill: '#CFE2FF', stroke: '#4285F4', strokeWidth: 2,
              fontSize: 14, fontFamily: 'Arial', color: '#000000', textAlign: 'center',
            },
          });
        } else if (tool === 'line') {
          store.addElement({
            id: uuidv4(), type: 'line',
            x, y, width: w || 200, height: h || 4,
            rotation: 0, zIndex: 1, locked: false, opacity: 1, visible: true,
            content: { points: [[0, (h || 4) / 2], [w || 200, (h || 4) / 2]] },
            style: { stroke: '#000000', strokeWidth: 2 },
          });
        } else if (tool === 'table') {
          store.addElement({
            id: uuidv4(), type: 'table',
            x, y, width: w, height: h,
            rotation: 0, zIndex: 1, locked: false, opacity: 1, visible: true,
            content: { rows: 3, cols: 3, cells: Array(3).fill(null).map(() => Array(3).fill('')) },
            style: { stroke: '#DADCE0', strokeWidth: 1 },
          });
        }

        setDrawRect(null);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      return;
    }
  }, [store, scale, getSlideCoords, marquee]);

  const handleElementSelect = useCallback((id: string, additive: boolean) => {
    if (store.activeTool === 'formatPainter') {
      store.applyFormat(id);
      return;
    }
    if (additive) {
      const ids = store.selectedElementIds.includes(id)
        ? store.selectedElementIds.filter(i => i !== id)
        : [...store.selectedElementIds, id];
      store.setSelectedElementIds(ids);
    } else {
      store.setSelectedElementIds([id]);
    }
  }, [store]);

  const handleElementDoubleClick = useCallback((id: string) => {
    // Enter text editing mode - handled in ElementRenderer
  }, []);

  if (!slide) return <div className="flex-1 bg-gs-bg" />;

  const bgStyle: React.CSSProperties = {};
  if (slide.background.imageUrl) {
    bgStyle.backgroundImage = `url(${slide.background.imageUrl})`;
    bgStyle.backgroundSize = 'cover';
  } else if (slide.background.gradient) {
    bgStyle.background = slide.background.gradient;
  } else {
    bgStyle.backgroundColor = slide.background.color || '#ffffff';
  }

  // Sort elements by z-index
  const sortedElements = [...slide.elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div ref={canvasRef} className="flex-1 bg-gs-bg overflow-auto flex items-center justify-center p-8">
      {/* Grid pattern if enabled */}
      {store.showGrid && (
        <style>{`
          [data-slide-area] {
            background-image: linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
            background-size: 20px 20px;
          }
        `}</style>
      )}

      <div
        data-slide-area
        data-slide-render
        className={`relative shadow-lg ${store.currentSlideIndex === store.currentSlideIndex ? 'current' : ''}`}
        style={{
          width: slideW * scale,
          height: slideH * scale,
          ...bgStyle,
          overflow: 'hidden',
          flexShrink: 0,
        }}
        onMouseDown={handleCanvasMouseDown}
      >
        {/* Scaled content container */}
        <div
          style={{
            width: slideW,
            height: slideH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'relative',
          }}
        >
          {sortedElements.map((el) => (
            <ElementRenderer
              key={el.id}
              element={el}
              isSelected={store.selectedElementIds.includes(el.id)}
              onSelect={handleElementSelect}
              onDoubleClick={handleElementDoubleClick}
              scale={scale}
            />
          ))}

          {/* Draw preview */}
          {drawRect && drawRect.w > 5 && drawRect.h > 5 && (
            <div
              className="absolute border-2 border-dashed border-gs-blue bg-blue-50 bg-opacity-20 pointer-events-none"
              style={{
                left: drawRect.x,
                top: drawRect.y,
                width: drawRect.w,
                height: drawRect.h,
              }}
            />
          )}

          {/* Marquee selection */}
          {marquee && (
            <div
              className="absolute border border-gs-blue bg-blue-100 bg-opacity-20 pointer-events-none"
              style={{
                left: marquee.x,
                top: marquee.y,
                width: marquee.w,
                height: marquee.h,
              }}
            />
          )}
        </div>

        {/* Rulers */}
        {store.showRulers && (
          <>
            <div className="absolute top-0 left-0 right-0 h-5 bg-white border-b border-gs-border z-20 flex items-end"
              style={{ width: slideW * scale }}>
              {Array.from({ length: Math.ceil(slideW / 100) + 1 }).map((_, i) => (
                <div key={i} className="absolute text-[9px] text-gs-text-secondary" style={{ left: i * 100 * scale }}>
                  <div className="h-2 border-l border-gs-border" />
                  <span className="ml-0.5">{i}</span>
                </div>
              ))}
            </div>
            <div className="absolute top-0 left-0 bottom-0 w-5 bg-white border-r border-gs-border z-20"
              style={{ height: slideH * scale }}>
              {Array.from({ length: Math.ceil(slideH / 100) + 1 }).map((_, i) => (
                <div key={i} className="absolute text-[9px] text-gs-text-secondary" style={{ top: i * 100 * scale }}>
                  <div className="w-2 border-t border-gs-border" />
                  <span className="ml-0.5">{i}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
