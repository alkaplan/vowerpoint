export type ElementType = 'text' | 'shape' | 'image' | 'line' | 'table' | 'group';

export type ShapeType =
  | 'rectangle' | 'roundedRectangle' | 'ellipse' | 'triangle' | 'rightTriangle'
  | 'diamond' | 'parallelogram' | 'trapezoid'
  | 'rightArrow' | 'leftArrow' | 'upArrow' | 'downArrow' | 'bidirectionalArrow'
  | 'curvedArrow' | 'bentArrow'
  | 'rectangularCallout' | 'roundedCallout' | 'ovalCallout' | 'cloudCallout'
  | 'star4' | 'star5' | 'star6' | 'explosion' | 'ribbon'
  | 'pentagon' | 'hexagon' | 'octagon'
  | 'process' | 'decision' | 'terminator' | 'document' | 'data'
  | 'heart' | 'lightning' | 'cross' | 'plus' | 'smiley';

export type LineType = 'straight' | 'elbow' | 'curved' | 'freeform';
export type ArrowCap = 'none' | 'arrow' | 'openArrow' | 'stealth' | 'circle' | 'square' | 'diamond';
export type DashPattern = 'solid' | 'dashed' | 'dotted';

export interface ElementStyle {
  // Fill
  fill?: string;
  fillOpacity?: number;
  opacity?: number;
  // Stroke / Border
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  // Border radius
  borderRadius?: number;
  cornerRadius?: number;
  // Shadow (flat properties for easy use)
  shadow?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  // Typography
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  lineHeight?: number;
  color?: string;
  backgroundColor?: string;
  verticalAlign?: 'top' | 'middle' | 'bottom';
  padding?: number | string;
  // Line ends
  arrowStart?: string;
  arrowEnd?: string;
  // Gradient
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    direction?: number;
  };
  // Allow additional properties
  [key: string]: unknown;
}

export interface TextContent {
  text: string;
  html?: string;
}

export interface ImageContent {
  src: string;
  naturalWidth?: number;
  naturalHeight?: number;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
}

export interface LineContent {
  lineType?: LineType;
  startCap?: ArrowCap;
  endCap?: ArrowCap;
  points?: number[][] | { x: number; y: number }[];
}

export interface TableContent {
  rows: number;
  cols: number;
  cells: string[][] | TableCell[][];
  colWidths?: number[];
  rowHeights?: number[];
}

export interface TableCell {
  text: string;
  fill?: string;
  borders?: {
    top?: { color: string; width: number };
    right?: { color: string; width: number };
    bottom?: { color: string; width: number };
    left?: { color: string; width: number };
  };
  style?: ElementStyle;
  colSpan?: number;
  rowSpan?: number;
  merged?: boolean;
}

export interface SlideElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  opacity: number;
  visible: boolean;
  content: TextContent | ImageContent | LineContent | TableContent | Record<string, unknown>;
  style: ElementStyle;
  shapeType?: ShapeType;
  groupId?: string | null;
  name?: string;
}

export interface SlideBackground {
  type?: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: string;
  imageUrl?: string;
}

export interface SlideTransition {
  type: 'none' | 'fade' | 'slide';
  duration: number;
}

export type LayoutType = 'blank' | 'title' | 'titleBody' | 'titleTwoColumns' | 'sectionHeader' | 'titleOnly';

export interface Slide {
  id: string;
  orderIndex: number;
  background: SlideBackground;
  layout: LayoutType;
  transition: SlideTransition;
  skipped: boolean;
  speakerNotes: string;
  elements: SlideElement[];
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent1: string;
  accent2: string;
  accent3: string;
  accent4: string;
  dark1: string;
  dark2: string;
  light1: string;
  light2: string;
  [key: string]: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  fontHeading: string;
  fontBody: string;
  backgroundDefault: SlideBackground;
}

export interface Presentation {
  id: string;
  title: string;
  theme: Theme;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

export type ToolType = 'select' | 'text' | 'shape' | 'image' | 'line' | 'table' | 'comment' | 'formatPainter';

export interface EditorState {
  presentation: Presentation;
  currentSlideIndex: number;
  selectedElementIds: string[];
  activeTool: ToolType;
  activeShapeType: ShapeType;
  zoom: number;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  showRulers: boolean;
  showGrid: boolean;
  showGuides: boolean;
  isPresentationMode: boolean;
  presentationSlideIndex: number;
  isTextEditing: boolean;
  clipboard: SlideElement[] | null;
  formatPainterStyle: ElementStyle | null;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  recentColors: string[];
}
