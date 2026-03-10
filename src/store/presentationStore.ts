import { create } from 'zustand';
import { temporal } from 'zundo';
import { v4 as uuidv4 } from 'uuid';
import {
  Presentation, Slide, SlideElement, EditorState, ToolType, ShapeType,
  ElementStyle, SlideBackground, LayoutType, Theme, SlideTransition,
  TextContent
} from '@/types/presentation';
import { getDefaultTheme } from '@/lib/themes';
import { getLayoutDefinition } from '@/lib/layouts';

const createDefaultSlide = (orderIndex: number, layout: LayoutType = 'title', theme?: Theme): Slide => {
  const t = theme || getDefaultTheme();
  const layoutDef = getLayoutDefinition(layout);
  return {
    id: uuidv4(),
    orderIndex,
    background: { ...t.backgroundDefault },
    layout,
    transition: { type: 'none', duration: 300 },
    skipped: false,
    speakerNotes: '',
    elements: layoutDef.createElements(t.fontBody),
  };
};

const createDefaultPresentation = (): Presentation => {
  const theme = getDefaultTheme();
  return {
    id: uuidv4(),
    title: 'Untitled presentation',
    theme,
    slides: [createDefaultSlide(0, 'title', theme)],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

interface PresentationActions {
  // Presentation
  setPresentation: (p: Presentation) => void;
  setTitle: (title: string) => void;
  setTheme: (theme: Theme) => void;

  // Slide management
  setCurrentSlideIndex: (index: number) => void;
  addSlide: (layout?: LayoutType, afterIndex?: number) => void;
  duplicateSlide: (index: number) => void;
  deleteSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  toggleSkipSlide: (index: number) => void;
  setSlideBackground: (slideId: string, bg: SlideBackground) => void;
  setSlideTransition: (slideId: string, transition: SlideTransition) => void;
  setSlideLayout: (slideId: string, layout: LayoutType) => void;
  setSpeakerNotes: (slideId: string, notes: string) => void;

  // Element management
  addElement: (element: SlideElement) => void;
  updateElement: (elementId: string, updates: Partial<SlideElement>) => void;
  deleteElements: (elementIds: string[]) => void;
  duplicateElements: (elementIds: string[]) => void;
  setSelectedElementIds: (ids: string[]) => void;
  moveElements: (elementIds: string[], dx: number, dy: number) => void;
  bringForward: (elementId: string) => void;
  sendBackward: (elementId: string) => void;
  bringToFront: (elementId: string) => void;
  sendToBack: (elementId: string) => void;
  toggleLockElement: (elementId: string) => void;
  groupElements: (elementIds: string[]) => void;
  ungroupElements: (groupId: string) => void;

  // Tools and UI
  setActiveTool: (tool: ToolType) => void;
  setActiveShapeType: (shape: ShapeType) => void;
  setZoom: (zoom: number) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleRulers: () => void;
  toggleGrid: () => void;
  toggleGuides: () => void;
  setIsTextEditing: (editing: boolean) => void;

  // Presentation mode
  startPresentation: (fromSlide?: number) => void;
  exitPresentation: () => void;
  nextPresentationSlide: () => void;
  prevPresentationSlide: () => void;
  goToPresentationSlide: (index: number) => void;

  // Clipboard
  copyElements: () => void;
  cutElements: () => void;
  pasteElements: () => void;

  // Format painter
  pickFormat: () => void;
  applyFormat: (elementId: string) => void;

  // Save status
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void;

  // Colors
  addRecentColor: (color: string) => void;

  // Helpers
  getCurrentSlide: () => Slide | undefined;
  getSelectedElements: () => SlideElement[];
}

type StoreState = EditorState & PresentationActions;

export const usePresentationStore = create<StoreState>()(
  temporal(
    (set, get) => ({
      // Initial state
      presentation: createDefaultPresentation(),
      currentSlideIndex: 0,
      selectedElementIds: [],
      activeTool: 'select' as ToolType,
      activeShapeType: 'rectangle' as ShapeType,
      zoom: 100,
      showLeftPanel: true,
      showRightPanel: true,
      showRulers: false,
      showGrid: false,
      showGuides: true,
      isPresentationMode: false,
      presentationSlideIndex: 0,
      isTextEditing: false,
      clipboard: null,
      formatPainterStyle: null,
      saveStatus: 'saved' as const,
      recentColors: [] as string[],

      // Presentation actions
      setPresentation: (p) => set({ presentation: p }),
      setTitle: (title) => set((state) => ({
        presentation: { ...state.presentation, title, updatedAt: new Date().toISOString() },
        saveStatus: 'unsaved',
      })),
      setTheme: (theme) => set((state) => {
        const slides = state.presentation.slides.map(slide => ({
          ...slide,
          background: { ...theme.backgroundDefault },
        }));
        return {
          presentation: { ...state.presentation, theme, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),

      // Slide management
      setCurrentSlideIndex: (index) => set({ currentSlideIndex: index, selectedElementIds: [] }),
      addSlide: (layout = 'blank', afterIndex) => set((state) => {
        const idx = afterIndex !== undefined ? afterIndex : state.currentSlideIndex;
        const newSlide = createDefaultSlide(idx + 1, layout, state.presentation.theme);
        const slides = [...state.presentation.slides];
        slides.splice(idx + 1, 0, newSlide);
        const reindexed = slides.map((s, i) => ({ ...s, orderIndex: i }));
        return {
          presentation: { ...state.presentation, slides: reindexed, updatedAt: new Date().toISOString() },
          currentSlideIndex: idx + 1,
          selectedElementIds: [],
          saveStatus: 'unsaved',
        };
      }),
      duplicateSlide: (index) => set((state) => {
        const source = state.presentation.slides[index];
        if (!source) return state;
        const newSlide: Slide = {
          ...JSON.parse(JSON.stringify(source)),
          id: uuidv4(),
          elements: source.elements.map(el => ({ ...JSON.parse(JSON.stringify(el)), id: uuidv4() })),
        };
        const slides = [...state.presentation.slides];
        slides.splice(index + 1, 0, newSlide);
        const reindexed = slides.map((s, i) => ({ ...s, orderIndex: i }));
        return {
          presentation: { ...state.presentation, slides: reindexed, updatedAt: new Date().toISOString() },
          currentSlideIndex: index + 1,
          saveStatus: 'unsaved',
        };
      }),
      deleteSlide: (index) => set((state) => {
        if (state.presentation.slides.length <= 1) return state;
        const slides = state.presentation.slides.filter((_, i) => i !== index);
        const reindexed = slides.map((s, i) => ({ ...s, orderIndex: i }));
        const newIndex = Math.min(index, reindexed.length - 1);
        return {
          presentation: { ...state.presentation, slides: reindexed, updatedAt: new Date().toISOString() },
          currentSlideIndex: newIndex,
          selectedElementIds: [],
          saveStatus: 'unsaved',
        };
      }),
      reorderSlides: (fromIndex, toIndex) => set((state) => {
        const slides = [...state.presentation.slides];
        const [moved] = slides.splice(fromIndex, 1);
        slides.splice(toIndex, 0, moved);
        const reindexed = slides.map((s, i) => ({ ...s, orderIndex: i }));
        return {
          presentation: { ...state.presentation, slides: reindexed, updatedAt: new Date().toISOString() },
          currentSlideIndex: toIndex,
          saveStatus: 'unsaved',
        };
      }),
      toggleSkipSlide: (index) => set((state) => {
        const slides = [...state.presentation.slides];
        slides[index] = { ...slides[index], skipped: !slides[index].skipped };
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),
      setSlideBackground: (slideId, bg) => set((state) => {
        const slides = state.presentation.slides.map(s =>
          s.id === slideId ? { ...s, background: bg } : s
        );
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),
      setSlideTransition: (slideId, transition) => set((state) => {
        const slides = state.presentation.slides.map(s =>
          s.id === slideId ? { ...s, transition } : s
        );
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),
      setSlideLayout: (slideId, layout) => set((state) => {
        const layoutDef = getLayoutDefinition(layout);
        const newElements = layoutDef.createElements(state.presentation.theme.fontBody);
        const slides = state.presentation.slides.map(s =>
          s.id === slideId ? { ...s, layout, elements: newElements } : s
        );
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),
      setSpeakerNotes: (slideId, notes) => set((state) => {
        const slides = state.presentation.slides.map(s =>
          s.id === slideId ? { ...s, speakerNotes: notes } : s
        );
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),

      // Element management
      addElement: (element) => set((state) => {
        const slide = state.presentation.slides[state.currentSlideIndex];
        if (!slide) return state;
        const maxZ = slide.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
        const newElement = { ...element, zIndex: maxZ + 1 };
        const slides = state.presentation.slides.map((s, i) =>
          i === state.currentSlideIndex ? { ...s, elements: [...s.elements, newElement] } : s
        );
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          selectedElementIds: [newElement.id],
          activeTool: 'select',
          saveStatus: 'unsaved',
        };
      }),
      updateElement: (elementId, updates) => set((state) => {
        const slides = state.presentation.slides.map((s, i) => {
          if (i !== state.currentSlideIndex) return s;
          return {
            ...s,
            elements: s.elements.map(el =>
              el.id === elementId ? { ...el, ...updates } : el
            ),
          };
        });
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),
      deleteElements: (elementIds) => set((state) => {
        const slides = state.presentation.slides.map((s, i) => {
          if (i !== state.currentSlideIndex) return s;
          return {
            ...s,
            elements: s.elements.filter(el => !elementIds.includes(el.id)),
          };
        });
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          selectedElementIds: [],
          saveStatus: 'unsaved',
        };
      }),
      duplicateElements: (elementIds) => set((state) => {
        const slide = state.presentation.slides[state.currentSlideIndex];
        if (!slide) return state;
        const toDuplicate = slide.elements.filter(el => elementIds.includes(el.id));
        const newElements = toDuplicate.map(el => ({
          ...JSON.parse(JSON.stringify(el)),
          id: uuidv4(),
          x: el.x + 20,
          y: el.y + 20,
        }));
        const slides = state.presentation.slides.map((s, i) =>
          i === state.currentSlideIndex ? { ...s, elements: [...s.elements, ...newElements] } : s
        );
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          selectedElementIds: newElements.map(el => el.id),
          saveStatus: 'unsaved',
        };
      }),
      setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),
      moveElements: (elementIds, dx, dy) => set((state) => {
        const slides = state.presentation.slides.map((s, i) => {
          if (i !== state.currentSlideIndex) return s;
          return {
            ...s,
            elements: s.elements.map(el =>
              elementIds.includes(el.id) && !el.locked
                ? { ...el, x: el.x + dx, y: el.y + dy }
                : el
            ),
          };
        });
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),
      bringForward: (elementId) => set((state) => {
        const slide = state.presentation.slides[state.currentSlideIndex];
        if (!slide) return state;
        const el = slide.elements.find(e => e.id === elementId);
        if (!el) return state;
        const above = slide.elements.filter(e => e.zIndex > el.zIndex).sort((a, b) => a.zIndex - b.zIndex);
        if (above.length === 0) return state;
        const swapWith = above[0];
        const slides = state.presentation.slides.map((s, i) => {
          if (i !== state.currentSlideIndex) return s;
          return {
            ...s,
            elements: s.elements.map(e => {
              if (e.id === elementId) return { ...e, zIndex: swapWith.zIndex };
              if (e.id === swapWith.id) return { ...e, zIndex: el.zIndex };
              return e;
            }),
          };
        });
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),
      sendBackward: (elementId) => set((state) => {
        const slide = state.presentation.slides[state.currentSlideIndex];
        if (!slide) return state;
        const el = slide.elements.find(e => e.id === elementId);
        if (!el) return state;
        const below = slide.elements.filter(e => e.zIndex < el.zIndex).sort((a, b) => b.zIndex - a.zIndex);
        if (below.length === 0) return state;
        const swapWith = below[0];
        const slides = state.presentation.slides.map((s, i) => {
          if (i !== state.currentSlideIndex) return s;
          return {
            ...s,
            elements: s.elements.map(e => {
              if (e.id === elementId) return { ...e, zIndex: swapWith.zIndex };
              if (e.id === swapWith.id) return { ...e, zIndex: el.zIndex };
              return e;
            }),
          };
        });
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),
      bringToFront: (elementId) => set((state) => {
        const slide = state.presentation.slides[state.currentSlideIndex];
        if (!slide || slide.elements.length === 0) return state;
        const maxZ = slide.elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
        const slides = state.presentation.slides.map((s, i) => {
          if (i !== state.currentSlideIndex) return s;
          return {
            ...s,
            elements: s.elements.map(e =>
              e.id === elementId ? { ...e, zIndex: maxZ + 1 } : e
            ),
          };
        });
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),
      sendToBack: (elementId) => set((state) => {
        const slide = state.presentation.slides[state.currentSlideIndex];
        if (!slide || slide.elements.length === 0) return state;
        const minZ = slide.elements.reduce((min, e) => Math.min(min, e.zIndex), Infinity);
        const slides = state.presentation.slides.map((s, i) => {
          if (i !== state.currentSlideIndex) return s;
          return {
            ...s,
            elements: s.elements.map(e =>
              e.id === elementId ? { ...e, zIndex: minZ - 1 } : e
            ),
          };
        });
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),
      toggleLockElement: (elementId) => set((state) => {
        const slides = state.presentation.slides.map((s, i) => {
          if (i !== state.currentSlideIndex) return s;
          return {
            ...s,
            elements: s.elements.map(el =>
              el.id === elementId ? { ...el, locked: !el.locked } : el
            ),
          };
        });
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),
      groupElements: (elementIds) => set((state) => {
        if (elementIds.length < 2) return state;
        const groupId = uuidv4();
        const slides = state.presentation.slides.map((s, i) => {
          if (i !== state.currentSlideIndex) return s;
          return {
            ...s,
            elements: s.elements.map(el =>
              elementIds.includes(el.id) ? { ...el, groupId } : el
            ),
          };
        });
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),
      ungroupElements: (groupId) => set((state) => {
        const slides = state.presentation.slides.map((s, i) => {
          if (i !== state.currentSlideIndex) return s;
          return {
            ...s,
            elements: s.elements.map(el =>
              el.groupId === groupId ? { ...el, groupId: null } : el
            ),
          };
        });
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          saveStatus: 'unsaved',
        };
      }),

      // Tools and UI
      setActiveTool: (tool) => set({ activeTool: tool }),
      setActiveShapeType: (shape) => set({ activeShapeType: shape }),
      setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(400, zoom)) }),
      toggleLeftPanel: () => set((state) => ({ showLeftPanel: !state.showLeftPanel })),
      toggleRightPanel: () => set((state) => ({ showRightPanel: !state.showRightPanel })),
      toggleRulers: () => set((state) => ({ showRulers: !state.showRulers })),
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),
      setIsTextEditing: (editing) => set({ isTextEditing: editing }),

      // Presentation mode
      startPresentation: (fromSlide = 0) => set({
        isPresentationMode: true,
        presentationSlideIndex: fromSlide,
      }),
      exitPresentation: () => set({ isPresentationMode: false }),
      nextPresentationSlide: () => set((state) => {
        const slides = state.presentation.slides.filter(s => !s.skipped);
        const currentActualIndex = slides.findIndex(
          s => s.id === state.presentation.slides.filter(sl => !sl.skipped)[state.presentationSlideIndex]?.id
        );
        if (currentActualIndex < slides.length - 1) {
          return { presentationSlideIndex: state.presentationSlideIndex + 1 };
        }
        return state;
      }),
      prevPresentationSlide: () => set((state) => {
        if (state.presentationSlideIndex > 0) {
          return { presentationSlideIndex: state.presentationSlideIndex - 1 };
        }
        return state;
      }),
      goToPresentationSlide: (index) => set({ presentationSlideIndex: index }),

      // Clipboard
      copyElements: () => set((state) => {
        const slide = state.presentation.slides[state.currentSlideIndex];
        if (!slide) return state;
        const selected = slide.elements.filter(el => state.selectedElementIds.includes(el.id));
        return { clipboard: JSON.parse(JSON.stringify(selected)) };
      }),
      cutElements: () => {
        const state = get();
        const slide = state.presentation.slides[state.currentSlideIndex];
        if (!slide) return;
        const selected = slide.elements.filter(el => state.selectedElementIds.includes(el.id));
        set({ clipboard: JSON.parse(JSON.stringify(selected)) });
        get().deleteElements(state.selectedElementIds);
      },
      pasteElements: () => {
        const state = get();
        if (!state.clipboard || state.clipboard.length === 0) return;
        const newElements = state.clipboard.map(el => ({
          ...JSON.parse(JSON.stringify(el)),
          id: uuidv4(),
          x: el.x + 20,
          y: el.y + 20,
        }));
        const slide = state.presentation.slides[state.currentSlideIndex];
        if (!slide) return;
        const maxZ = slide.elements.reduce((max, el) => Math.max(max, el.zIndex), 0);
        newElements.forEach((el, i) => { el.zIndex = maxZ + i + 1; });
        const slides = state.presentation.slides.map((s, i) =>
          i === state.currentSlideIndex ? { ...s, elements: [...s.elements, ...newElements] } : s
        );
        set({
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          selectedElementIds: newElements.map(el => el.id),
          saveStatus: 'unsaved',
        });
      },

      // Format painter
      pickFormat: () => set((state) => {
        const slide = state.presentation.slides[state.currentSlideIndex];
        if (!slide || state.selectedElementIds.length !== 1) return state;
        const el = slide.elements.find(e => e.id === state.selectedElementIds[0]);
        if (!el) return state;
        return { formatPainterStyle: { ...el.style }, activeTool: 'formatPainter' };
      }),
      applyFormat: (elementId) => set((state) => {
        if (!state.formatPainterStyle) return state;
        const slides = state.presentation.slides.map((s, i) => {
          if (i !== state.currentSlideIndex) return s;
          return {
            ...s,
            elements: s.elements.map(el =>
              el.id === elementId ? { ...el, style: { ...el.style, ...state.formatPainterStyle } } : el
            ),
          };
        });
        return {
          presentation: { ...state.presentation, slides, updatedAt: new Date().toISOString() },
          formatPainterStyle: null,
          activeTool: 'select',
          saveStatus: 'unsaved',
        };
      }),

      // Save status
      setSaveStatus: (status) => set({ saveStatus: status }),

      // Colors
      addRecentColor: (color) => set((state) => {
        const colors = [color, ...state.recentColors.filter(c => c !== color)].slice(0, 10);
        return { recentColors: colors };
      }),

      // Helpers
      getCurrentSlide: () => {
        const state = get();
        return state.presentation.slides[state.currentSlideIndex];
      },
      getSelectedElements: () => {
        const state = get();
        const slide = state.presentation.slides[state.currentSlideIndex];
        if (!slide) return [];
        return slide.elements.filter(el => state.selectedElementIds.includes(el.id));
      },
    }),
    {
      limit: 100,
      partialize: (state) => {
        const { presentation, currentSlideIndex, selectedElementIds } = state;
        return { presentation, currentSlideIndex, selectedElementIds } as StoreState;
      },
    }
  )
);
