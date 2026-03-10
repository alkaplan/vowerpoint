'use client';

import React, { useState } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import { ColorPicker } from './ColorPicker';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { themes } from '@/lib/themes';
import { layoutDefinitions } from '@/lib/layouts';

function AccordionSection({ title, children, defaultOpen = true }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gs-border">
      <button
        className="accordion-header w-full flex items-center gap-1 px-3 py-2 text-xs font-medium text-gs-text hover:bg-gs-hover"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {title}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max, step = 1 }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gs-text-secondary">{label}</span>
      <input
        type="number"
        value={Math.round(value * 100) / 100}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 text-xs border border-gs-border rounded px-1 py-0.5 outline-none text-right"
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

function SlideProperties() {
  const store = usePresentationStore();
  const slide = store.getCurrentSlide();
  const [showBgColor, setShowBgColor] = useState(false);

  if (!slide) return null;

  return (
    <>
      <AccordionSection title="Slide">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gs-text-secondary">Background</span>
            <div className="relative">
              <button
                className="w-6 h-6 border border-gs-border rounded cursor-pointer"
                style={{ backgroundColor: slide.background.color || '#ffffff' }}
                onClick={() => setShowBgColor(!showBgColor)}
              />
              {showBgColor && (
                <div className="absolute right-0 top-full z-50">
                  <ColorPicker
                    color={slide.background.color || '#ffffff'}
                    onChange={(color) => store.setSlideBackground(slide.id, { ...slide.background, color })}
                    onClose={() => setShowBgColor(false)}
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <span className="text-xs text-gs-text-secondary block mb-1">Layout</span>
            <div className="grid grid-cols-3 gap-1">
              {layoutDefinitions.map((l) => (
                <button
                  key={l.type}
                  className={`text-[10px] px-1 py-1 border rounded text-center hover:bg-gs-hover ${
                    slide.layout === l.type ? 'border-gs-blue bg-blue-50' : 'border-gs-border'
                  }`}
                  onClick={() => store.setSlideLayout(slide.id, l.type)}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-gs-text-secondary block mb-1">Transition</span>
            <select
              value={slide.transition.type}
              onChange={(e) => store.setSlideTransition(slide.id, { ...slide.transition, type: e.target.value as 'none' | 'fade' | 'slide' })}
              className="w-full text-xs border border-gs-border rounded px-1 py-1 outline-none"
            >
              <option value="none">None</option>
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
            </select>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection title="Theme">
        <div className="grid grid-cols-2 gap-1">
          {themes.map((t) => (
            <button
              key={t.id}
              className={`text-[10px] px-2 py-2 border rounded text-left hover:bg-gs-hover ${
                store.presentation.theme.id === t.id ? 'border-gs-blue bg-blue-50' : 'border-gs-border'
              }`}
              onClick={() => store.setTheme(t)}
            >
              <div className="flex gap-0.5 mb-1">
                {[t.colors.primary, t.colors.accent1, t.colors.accent2, t.colors.accent3].map((c, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </AccordionSection>
    </>
  );
}

function ElementProperties() {
  const store = usePresentationStore();
  const elements = store.getSelectedElements();
  if (elements.length === 0) return null;
  const el = elements[0];
  const style = el.style;

  const [showFill, setShowFill] = useState(false);
  const [showStroke, setShowStroke] = useState(false);
  const [showShadow, setShowShadow] = useState(false);
  const [showFontColor, setShowFontColor] = useState(false);

  const updateStyle = (updates: Record<string, unknown>) => {
    store.updateElement(el.id, { style: { ...el.style, ...updates } });
  };

  const isTextLike = el.type === 'text' || el.shapeType;

  return (
    <>
      {/* Size & Position */}
      <AccordionSection title="Size & Position">
        <div className="space-y-1.5">
          <NumberInput label="X" value={el.x} onChange={(v) => store.updateElement(el.id, { x: v })} />
          <NumberInput label="Y" value={el.y} onChange={(v) => store.updateElement(el.id, { y: v })} />
          <NumberInput label="Width" value={el.width} onChange={(v) => store.updateElement(el.id, { width: Math.max(1, v) })} min={1} />
          <NumberInput label="Height" value={el.height} onChange={(v) => store.updateElement(el.id, { height: Math.max(1, v) })} min={1} />
          <NumberInput label="Rotation" value={el.rotation} onChange={(v) => store.updateElement(el.id, { rotation: v })} min={-360} max={360} />
          <NumberInput label="Opacity" value={el.opacity * 100} onChange={(v) => store.updateElement(el.id, { opacity: Math.max(0, Math.min(100, v)) / 100 })} min={0} max={100} />
        </div>
      </AccordionSection>

      {/* Text formatting */}
      {isTextLike && (
        <AccordionSection title="Text">
          <div className="space-y-2">
            <div>
              <span className="text-xs text-gs-text-secondary block mb-1">Font</span>
              <select
                value={style.fontFamily || 'Arial'}
                onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                className="w-full text-xs border border-gs-border rounded px-1 py-1 outline-none"
              >
                {['Arial', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Georgia', 'Times New Roman', 'Courier New', 'Comic Sans MS'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <NumberInput label="Size" value={style.fontSize || 18} onChange={(v) => updateStyle({ fontSize: v })} min={8} max={96} />
            <div className="flex gap-1">
              <button
                className={`toolbar-btn ${style.fontWeight === 'bold' ? 'active' : ''}`}
                onClick={() => updateStyle({ fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold' })}
              >
                <strong>B</strong>
              </button>
              <button
                className={`toolbar-btn ${style.fontStyle === 'italic' ? 'active' : ''}`}
                onClick={() => updateStyle({ fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' })}
              >
                <em>I</em>
              </button>
              <button
                className={`toolbar-btn ${style.textDecoration?.includes('underline') ? 'active' : ''}`}
                onClick={() => updateStyle({ textDecoration: style.textDecoration?.includes('underline') ? '' : 'underline' })}
              >
                <u>U</u>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gs-text-secondary">Color</span>
              <div className="relative">
                <button
                  className="w-6 h-6 border border-gs-border rounded cursor-pointer"
                  style={{ backgroundColor: style.color || '#000000' }}
                  onClick={() => setShowFontColor(!showFontColor)}
                />
                {showFontColor && (
                  <div className="absolute right-0 top-full z-50">
                    <ColorPicker
                      color={style.color || '#000000'}
                      onChange={(c) => { updateStyle({ color: c }); store.addRecentColor(c); }}
                      onClose={() => setShowFontColor(false)}
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <span className="text-xs text-gs-text-secondary block mb-1">Align</span>
              <div className="flex gap-1">
                {['left', 'center', 'right', 'justify'].map(a => (
                  <button
                    key={a}
                    className={`toolbar-btn text-[10px] ${style.textAlign === a ? 'active' : ''}`}
                    onClick={() => updateStyle({ textAlign: a })}
                  >
                    {a[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-gs-text-secondary block mb-1">Line spacing</span>
              <select
                value={style.lineHeight || 1.4}
                onChange={(e) => updateStyle({ lineHeight: Number(e.target.value) })}
                className="w-full text-xs border border-gs-border rounded px-1 py-1 outline-none"
              >
                <option value={1}>1.0</option>
                <option value={1.15}>1.15</option>
                <option value={1.4}>1.4</option>
                <option value={1.5}>1.5</option>
                <option value={2}>2.0</option>
              </select>
            </div>
            <div>
              <span className="text-xs text-gs-text-secondary block mb-1">Vertical align</span>
              <select
                value={style.verticalAlign || 'top'}
                onChange={(e) => updateStyle({ verticalAlign: e.target.value })}
                className="w-full text-xs border border-gs-border rounded px-1 py-1 outline-none"
              >
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
          </div>
        </AccordionSection>
      )}

      {/* Fill */}
      <AccordionSection title="Fill">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gs-text-secondary">Color</span>
          <div className="relative">
            <button
              className="w-6 h-6 border border-gs-border rounded cursor-pointer"
              style={{ backgroundColor: style.fill === 'transparent' ? '#fff' : (style.fill || '#ffffff') }}
              onClick={() => setShowFill(!showFill)}
            />
            {showFill && (
              <div className="absolute right-0 top-full z-50">
                <ColorPicker
                  color={style.fill || '#ffffff'}
                  onChange={(c) => { updateStyle({ fill: c }); if (c !== 'transparent') store.addRecentColor(c); }}
                  onClose={() => setShowFill(false)}
                  showTransparent
                />
              </div>
            )}
          </div>
        </div>
      </AccordionSection>

      {/* Border */}
      <AccordionSection title="Border">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gs-text-secondary">Color</span>
            <div className="relative">
              <button
                className="w-6 h-6 border-2 rounded cursor-pointer"
                style={{ borderColor: style.stroke || '#000000' }}
                onClick={() => setShowStroke(!showStroke)}
              />
              {showStroke && (
                <div className="absolute right-0 top-full z-50">
                  <ColorPicker
                    color={style.stroke || '#000000'}
                    onChange={(c) => { updateStyle({ stroke: c, strokeWidth: Math.max(1, style.strokeWidth || 0) }); store.addRecentColor(c); }}
                    onClose={() => setShowStroke(false)}
                  />
                </div>
              )}
            </div>
          </div>
          <NumberInput label="Weight" value={style.strokeWidth || 0} onChange={(v) => updateStyle({ strokeWidth: v })} min={0} max={24} />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gs-text-secondary">Style</span>
            <select
              value={style.strokeDasharray || ''}
              onChange={(e) => updateStyle({ strokeDasharray: e.target.value })}
              className="w-24 text-xs border border-gs-border rounded px-1 py-0.5 outline-none"
            >
              <option value="">Solid</option>
              <option value="5,5">Dashed</option>
              <option value="2,2">Dotted</option>
            </select>
          </div>
          {el.type !== 'line' && (
            <NumberInput label="Radius" value={style.borderRadius || 0} onChange={(v) => updateStyle({ borderRadius: v })} min={0} max={100} />
          )}
        </div>
      </AccordionSection>

      {/* Shadow */}
      <AccordionSection title="Shadow" defaultOpen={false}>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gs-text-secondary">Color</span>
            <div className="relative">
              <button
                className="w-6 h-6 border border-gs-border rounded cursor-pointer"
                style={{ backgroundColor: style.shadow || 'transparent' }}
                onClick={() => setShowShadow(!showShadow)}
              />
              {showShadow && (
                <div className="absolute right-0 top-full z-50">
                  <ColorPicker
                    color={style.shadow || 'rgba(0,0,0,0.3)'}
                    onChange={(c) => updateStyle({ shadow: c })}
                    onClose={() => setShowShadow(false)}
                    showTransparent
                  />
                </div>
              )}
            </div>
          </div>
          <NumberInput label="Blur" value={style.shadowBlur || 0} onChange={(v) => updateStyle({ shadowBlur: v })} min={0} max={50} />
          <NumberInput label="Offset X" value={style.shadowOffsetX || 0} onChange={(v) => updateStyle({ shadowOffsetX: v })} min={-50} max={50} />
          <NumberInput label="Offset Y" value={style.shadowOffsetY || 0} onChange={(v) => updateStyle({ shadowOffsetY: v })} min={-50} max={50} />
        </div>
      </AccordionSection>

      {/* Line-specific */}
      {el.type === 'line' && (
        <AccordionSection title="Line ends">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gs-text-secondary">Start arrow</span>
              <select
                value={style.arrowStart || 'none'}
                onChange={(e) => updateStyle({ arrowStart: e.target.value })}
                className="w-24 text-xs border border-gs-border rounded px-1 py-0.5 outline-none"
              >
                <option value="none">None</option>
                <option value="arrow">Arrow</option>
                <option value="circle">Circle</option>
                <option value="square">Square</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gs-text-secondary">End arrow</span>
              <select
                value={style.arrowEnd || 'none'}
                onChange={(e) => updateStyle({ arrowEnd: e.target.value })}
                className="w-24 text-xs border border-gs-border rounded px-1 py-0.5 outline-none"
              >
                <option value="none">None</option>
                <option value="arrow">Arrow</option>
                <option value="circle">Circle</option>
                <option value="square">Square</option>
              </select>
            </div>
          </div>
        </AccordionSection>
      )}
    </>
  );
}

export function FormatPanel() {
  const store = usePresentationStore();
  const hasSelection = store.selectedElementIds.length > 0;

  return (
    <div className="w-72 border-l border-gs-border bg-white overflow-y-auto shrink-0">
      <div className="px-3 py-2 border-b border-gs-border">
        <span className="text-xs font-medium text-gs-text">
          {hasSelection ? 'Format options' : 'Slide properties'}
        </span>
      </div>
      {hasSelection ? <ElementProperties /> : <SlideProperties />}
    </div>
  );
}
