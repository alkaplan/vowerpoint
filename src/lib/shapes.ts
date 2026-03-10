import { ShapeType } from '@/types/presentation';

export interface ShapeDefinition {
  type: ShapeType;
  name: string;
  category: string;
  getSvgPath: (w: number, h: number) => string;
}

const shapeDefs: ShapeDefinition[] = [
  // Basic shapes
  { type: 'rectangle', name: 'Rectangle', category: 'Basic', getSvgPath: (w, h) => `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z` },
  { type: 'roundedRectangle', name: 'Rounded Rectangle', category: 'Basic', getSvgPath: (w, h) => { const r = Math.min(w, h) * 0.15; return `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h} L ${r} ${h} Q 0 ${h} 0 ${h - r} L 0 ${r} Q 0 0 ${r} 0 Z`; } },
  { type: 'ellipse', name: 'Ellipse', category: 'Basic', getSvgPath: (w, h) => { const rx = w / 2; const ry = h / 2; return `M ${rx} 0 A ${rx} ${ry} 0 1 1 ${rx} ${h} A ${rx} ${ry} 0 1 1 ${rx} 0 Z`; } },
  { type: 'triangle', name: 'Triangle', category: 'Basic', getSvgPath: (w, h) => `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z` },
  { type: 'rightTriangle', name: 'Right Triangle', category: 'Basic', getSvgPath: (w, h) => `M 0 0 L ${w} ${h} L 0 ${h} Z` },
  { type: 'diamond', name: 'Diamond', category: 'Basic', getSvgPath: (w, h) => `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z` },
  { type: 'parallelogram', name: 'Parallelogram', category: 'Basic', getSvgPath: (w, h) => { const off = w * 0.2; return `M ${off} 0 L ${w} 0 L ${w - off} ${h} L 0 ${h} Z`; } },
  { type: 'trapezoid', name: 'Trapezoid', category: 'Basic', getSvgPath: (w, h) => { const off = w * 0.15; return `M ${off} 0 L ${w - off} 0 L ${w} ${h} L 0 ${h} Z`; } },
  // Arrows
  { type: 'rightArrow', name: 'Right Arrow', category: 'Arrows', getSvgPath: (w, h) => { const aw = w * 0.3; const ah = h * 0.25; return `M 0 ${ah} L ${w - aw} ${ah} L ${w - aw} 0 L ${w} ${h / 2} L ${w - aw} ${h} L ${w - aw} ${h - ah} L 0 ${h - ah} Z`; } },
  { type: 'leftArrow', name: 'Left Arrow', category: 'Arrows', getSvgPath: (w, h) => { const aw = w * 0.3; const ah = h * 0.25; return `M ${w} ${ah} L ${aw} ${ah} L ${aw} 0 L 0 ${h / 2} L ${aw} ${h} L ${aw} ${h - ah} L ${w} ${h - ah} Z`; } },
  { type: 'upArrow', name: 'Up Arrow', category: 'Arrows', getSvgPath: (w, h) => { const ah = h * 0.3; const aw = w * 0.25; return `M ${aw} ${h} L ${aw} ${ah} L 0 ${ah} L ${w / 2} 0 L ${w} ${ah} L ${w - aw} ${ah} L ${w - aw} ${h} Z`; } },
  { type: 'downArrow', name: 'Down Arrow', category: 'Arrows', getSvgPath: (w, h) => { const ah = h * 0.3; const aw = w * 0.25; return `M ${aw} 0 L ${aw} ${h - ah} L 0 ${h - ah} L ${w / 2} ${h} L ${w} ${h - ah} L ${w - aw} ${h - ah} L ${w - aw} 0 Z`; } },
  { type: 'bidirectionalArrow', name: 'Bidirectional Arrow', category: 'Arrows', getSvgPath: (w, h) => { const aw = w * 0.2; const ah = h * 0.25; return `M 0 ${h / 2} L ${aw} 0 L ${aw} ${ah} L ${w - aw} ${ah} L ${w - aw} 0 L ${w} ${h / 2} L ${w - aw} ${h} L ${w - aw} ${h - ah} L ${aw} ${h - ah} L ${aw} ${h} Z`; } },
  { type: 'curvedArrow', name: 'Curved Arrow', category: 'Arrows', getSvgPath: (w, h) => `M 0 ${h} Q 0 0 ${w * 0.7} 0 L ${w * 0.6} ${h * 0.15} L ${w} 0 L ${w * 0.7} ${h * 0.3} Q ${w * 0.15} ${h * 0.15} ${w * 0.15} ${h} Z` },
  { type: 'bentArrow', name: 'Bent Arrow', category: 'Arrows', getSvgPath: (w, h) => { const ah = h * 0.25; return `M 0 ${h} L 0 ${ah} L ${w * 0.6} ${ah} L ${w * 0.6} 0 L ${w} ${h * 0.3} L ${w * 0.6} ${h * 0.6} L ${w * 0.6} ${h - ah + ah * 0.4} L ${w * 0.15} ${h - ah + ah * 0.4} L ${w * 0.15} ${h} Z`; } },
  // Callouts
  { type: 'rectangularCallout', name: 'Rectangular Callout', category: 'Callouts', getSvgPath: (w, h) => { const bh = h * 0.75; return `M 0 0 L ${w} 0 L ${w} ${bh} L ${w * 0.45} ${bh} L ${w * 0.25} ${h} L ${w * 0.35} ${bh} L 0 ${bh} Z`; } },
  { type: 'roundedCallout', name: 'Rounded Callout', category: 'Callouts', getSvgPath: (w, h) => { const bh = h * 0.75; const r = Math.min(w, bh) * 0.1; return `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${bh - r} Q ${w} ${bh} ${w - r} ${bh} L ${w * 0.45} ${bh} L ${w * 0.25} ${h} L ${w * 0.35} ${bh} L ${r} ${bh} Q 0 ${bh} 0 ${bh - r} L 0 ${r} Q 0 0 ${r} 0 Z`; } },
  { type: 'ovalCallout', name: 'Oval Callout', category: 'Callouts', getSvgPath: (w, h) => { const bh = h * 0.7; const rx = w / 2; const ry = bh / 2; return `M ${rx} 0 A ${rx} ${ry} 0 1 1 ${rx} ${bh} L ${w * 0.25} ${h} L ${w * 0.4} ${bh * 0.85} A ${rx} ${ry} 0 1 1 ${rx} 0 Z`; } },
  { type: 'cloudCallout', name: 'Cloud Callout', category: 'Callouts', getSvgPath: (w, h) => `M ${w * 0.15} ${h * 0.55} Q 0 ${h * 0.5} ${w * 0.05} ${h * 0.35} Q 0 ${h * 0.15} ${w * 0.2} ${h * 0.12} Q ${w * 0.25} 0 ${w * 0.45} ${h * 0.08} Q ${w * 0.55} 0 ${w * 0.7} ${h * 0.1} Q ${w * 0.9} ${h * 0.05} ${w * 0.92} ${h * 0.25} Q ${w} ${h * 0.35} ${w * 0.95} ${h * 0.5} Q ${w} ${h * 0.65} ${w * 0.85} ${h * 0.7} Q ${w * 0.9} ${h * 0.85} ${w * 0.7} ${h * 0.78} L ${w * 0.35} ${h} L ${w * 0.4} ${h * 0.78} Q ${w * 0.15} ${h * 0.82} ${w * 0.1} ${h * 0.7} Q 0 ${h * 0.65} ${w * 0.15} ${h * 0.55} Z` },
  // Stars & Banners
  { type: 'star4', name: '4-Point Star', category: 'Stars & Banners', getSvgPath: (w, h) => { const cx = w / 2; const cy = h / 2; const ir = Math.min(w, h) * 0.2; return `M ${cx} 0 L ${cx + ir} ${cy - ir} L ${w} ${cy} L ${cx + ir} ${cy + ir} L ${cx} ${h} L ${cx - ir} ${cy + ir} L 0 ${cy} L ${cx - ir} ${cy - ir} Z`; } },
  { type: 'star5', name: '5-Point Star', category: 'Stars & Banners', getSvgPath: (w, h) => { const cx = w / 2; const cy = h / 2; const or2 = Math.min(w, h) / 2; const ir = or2 * 0.38; const pts: string[] = []; for (let i = 0; i < 5; i++) { const oa = (Math.PI * 2 * i) / 5 - Math.PI / 2; const ia = oa + Math.PI / 5; pts.push(`${cx + or2 * Math.cos(oa)} ${cy + or2 * Math.sin(oa)}`); pts.push(`${cx + ir * Math.cos(ia)} ${cy + ir * Math.sin(ia)}`); } return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`; } },
  { type: 'star6', name: '6-Point Star', category: 'Stars & Banners', getSvgPath: (w, h) => { const cx = w / 2; const cy = h / 2; const or2 = Math.min(w, h) / 2; const ir = or2 * 0.5; const pts: string[] = []; for (let i = 0; i < 6; i++) { const oa = (Math.PI * 2 * i) / 6 - Math.PI / 2; const ia = oa + Math.PI / 6; pts.push(`${cx + or2 * Math.cos(oa)} ${cy + or2 * Math.sin(oa)}`); pts.push(`${cx + ir * Math.cos(ia)} ${cy + ir * Math.sin(ia)}`); } return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`; } },
  { type: 'explosion', name: 'Explosion', category: 'Stars & Banners', getSvgPath: (w, h) => { const cx = w / 2; const cy = h / 2; const pts: string[] = []; const n = 12; for (let i = 0; i < n; i++) { const a = (Math.PI * 2 * i) / n - Math.PI / 2; const r = i % 2 === 0 ? Math.min(w, h) / 2 : Math.min(w, h) * 0.3; pts.push(`${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`); } return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`; } },
  { type: 'pentagon', name: 'Pentagon', category: 'Stars & Banners', getSvgPath: (w, h) => { const cx = w / 2; const cy = h / 2; const r = Math.min(w, h) / 2; const pts: string[] = []; for (let i = 0; i < 5; i++) { const a = (Math.PI * 2 * i) / 5 - Math.PI / 2; pts.push(`${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`); } return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`; } },
  { type: 'hexagon', name: 'Hexagon', category: 'Stars & Banners', getSvgPath: (w, h) => { const cx = w / 2; const cy = h / 2; const r = Math.min(w, h) / 2; const pts: string[] = []; for (let i = 0; i < 6; i++) { const a = (Math.PI * 2 * i) / 6 - Math.PI / 2; pts.push(`${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`); } return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`; } },
  { type: 'octagon', name: 'Octagon', category: 'Stars & Banners', getSvgPath: (w, h) => { const cx = w / 2; const cy = h / 2; const r = Math.min(w, h) / 2; const pts: string[] = []; for (let i = 0; i < 8; i++) { const a = (Math.PI * 2 * i) / 8 - Math.PI / 2; pts.push(`${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`); } return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`; } },
  // Flowchart
  { type: 'process', name: 'Process', category: 'Flowchart', getSvgPath: (w, h) => `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z` },
  { type: 'decision', name: 'Decision', category: 'Flowchart', getSvgPath: (w, h) => `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z` },
  { type: 'terminator', name: 'Terminator', category: 'Flowchart', getSvgPath: (w, h) => { const r = h / 2; return `M ${r} 0 L ${w - r} 0 A ${r} ${r} 0 0 1 ${w - r} ${h} L ${r} ${h} A ${r} ${r} 0 0 1 ${r} 0 Z`; } },
  { type: 'document', name: 'Document', category: 'Flowchart', getSvgPath: (w, h) => `M 0 0 L ${w} 0 L ${w} ${h * 0.85} Q ${w * 0.75} ${h * 0.7} ${w * 0.5} ${h * 0.85} Q ${w * 0.25} ${h} 0 ${h * 0.85} Z` },
  { type: 'data', name: 'Data', category: 'Flowchart', getSvgPath: (w, h) => { const off = w * 0.15; return `M ${off} 0 L ${w} 0 L ${w - off} ${h} L 0 ${h} Z`; } },
  // Special
  { type: 'heart', name: 'Heart', category: 'Special', getSvgPath: (w, h) => `M ${w / 2} ${h * 0.3} C ${w / 2} ${h * 0.1} ${w * 0.75} 0 ${w} ${h * 0.2} C ${w} ${h * 0.5} ${w / 2} ${h * 0.7} ${w / 2} ${h} C ${w / 2} ${h * 0.7} 0 ${h * 0.5} 0 ${h * 0.2} C 0 0 ${w * 0.25} ${h * 0.1} ${w / 2} ${h * 0.3} Z` },
  { type: 'lightning', name: 'Lightning Bolt', category: 'Special', getSvgPath: (w, h) => `M ${w * 0.55} 0 L ${w * 0.2} ${h * 0.45} L ${w * 0.45} ${h * 0.42} L ${w * 0.3} ${h} L ${w * 0.8} ${h * 0.45} L ${w * 0.55} ${h * 0.48} L ${w * 0.75} 0 Z` },
  { type: 'cross', name: 'Cross', category: 'Special', getSvgPath: (w, h) => { const t = Math.min(w, h) * 0.3; const cx = w / 2; const cy = h / 2; return `M ${cx - t / 2} 0 L ${cx + t / 2} 0 L ${cx + t / 2} ${cy - t / 2} L ${w} ${cy - t / 2} L ${w} ${cy + t / 2} L ${cx + t / 2} ${cy + t / 2} L ${cx + t / 2} ${h} L ${cx - t / 2} ${h} L ${cx - t / 2} ${cy + t / 2} L 0 ${cy + t / 2} L 0 ${cy - t / 2} L ${cx - t / 2} ${cy - t / 2} Z`; } },
  { type: 'plus', name: 'Plus', category: 'Special', getSvgPath: (w, h) => { const t = Math.min(w, h) * 0.3; const cx = w / 2; const cy = h / 2; return `M ${cx - t / 2} 0 L ${cx + t / 2} 0 L ${cx + t / 2} ${cy - t / 2} L ${w} ${cy - t / 2} L ${w} ${cy + t / 2} L ${cx + t / 2} ${cy + t / 2} L ${cx + t / 2} ${h} L ${cx - t / 2} ${h} L ${cx - t / 2} ${cy + t / 2} L 0 ${cy + t / 2} L 0 ${cy - t / 2} L ${cx - t / 2} ${cy - t / 2} Z`; } },
  { type: 'smiley', name: 'Smiley Face', category: 'Special', getSvgPath: (w, h) => { const rx = w / 2; const ry = h / 2; return `M ${rx} 0 A ${rx} ${ry} 0 1 1 ${rx} ${h} A ${rx} ${ry} 0 1 1 ${rx} 0 Z`; } },
  { type: 'ribbon', name: 'Ribbon', category: 'Stars & Banners', getSvgPath: (w, h) => `M 0 ${h * 0.2} L ${w * 0.1} ${h * 0.35} L ${w * 0.1} ${h * 0.2} L ${w * 0.9} ${h * 0.2} L ${w * 0.9} ${h * 0.35} L ${w} ${h * 0.2} L ${w} ${h * 0.8} L ${w * 0.9} ${h * 0.65} L ${w * 0.9} ${h * 0.8} L ${w * 0.1} ${h * 0.8} L ${w * 0.1} ${h * 0.65} L 0 ${h * 0.8} Z` },
];

export const getShapeDefinition = (type: ShapeType): ShapeDefinition | undefined => {
  return shapeDefs.find(s => s.type === type);
};

export const getShapesByCategory = (): Record<string, ShapeDefinition[]> => {
  const categories: Record<string, ShapeDefinition[]> = {};
  for (const def of shapeDefs) {
    if (!categories[def.category]) categories[def.category] = [];
    categories[def.category].push(def);
  }
  return categories;
};

export const allShapes = shapeDefs;
