import { usePresentationStore } from './presentationStore';
import { SlideElement } from '@/types/presentation';

// Helper to reset store between tests
const resetStore = () => {
  usePresentationStore.setState(usePresentationStore.getInitialState());
};

describe('presentationStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Initial State', () => {
    it('should have a default presentation with one slide', () => {
      const state = usePresentationStore.getState();
      expect(state.presentation).toBeDefined();
      expect(state.presentation.title).toBe('Untitled presentation');
      expect(state.presentation.slides.length).toBeGreaterThanOrEqual(1);
    });

    it('should start with select tool active', () => {
      const state = usePresentationStore.getState();
      expect(state.activeTool).toBe('select');
    });

    it('should start with zoom at 100', () => {
      const state = usePresentationStore.getState();
      expect(state.zoom).toBe(100);
    });

    it('should not be in presentation mode', () => {
      const state = usePresentationStore.getState();
      expect(state.isPresentationMode).toBe(false);
    });
  });

  describe('Presentation Actions', () => {
    it('should update title', () => {
      const store = usePresentationStore.getState();
      store.setTitle('My Presentation');
      expect(usePresentationStore.getState().presentation.title).toBe('My Presentation');
      expect(usePresentationStore.getState().saveStatus).toBe('unsaved');
    });

    it('should set presentation', () => {
      const store = usePresentationStore.getState();
      const newPresentation = {
        ...store.presentation,
        title: 'Test',
        id: 'test-id',
      };
      store.setPresentation(newPresentation);
      expect(usePresentationStore.getState().presentation.id).toBe('test-id');
    });
  });

  describe('Slide Management', () => {
    it('should add a slide after current', () => {
      const store = usePresentationStore.getState();
      const initialCount = store.presentation.slides.length;
      store.addSlide('blank');
      const newState = usePresentationStore.getState();
      expect(newState.presentation.slides.length).toBe(initialCount + 1);
      expect(newState.currentSlideIndex).toBe(1);
    });

    it('should duplicate a slide', () => {
      const store = usePresentationStore.getState();
      const initialCount = store.presentation.slides.length;
      store.duplicateSlide(0);
      const newState = usePresentationStore.getState();
      expect(newState.presentation.slides.length).toBe(initialCount + 1);
      expect(newState.currentSlideIndex).toBe(1);
      // Duplicated slide should have different id
      expect(newState.presentation.slides[0].id).not.toBe(newState.presentation.slides[1].id);
    });

    it('should delete a slide (but not the last one)', () => {
      const store = usePresentationStore.getState();
      store.addSlide('blank');
      expect(usePresentationStore.getState().presentation.slides.length).toBe(2);
      store.deleteSlide(1);
      expect(usePresentationStore.getState().presentation.slides.length).toBe(1);
    });

    it('should prevent deleting the last slide', () => {
      const store = usePresentationStore.getState();
      expect(store.presentation.slides.length).toBe(1);
      store.deleteSlide(0);
      expect(usePresentationStore.getState().presentation.slides.length).toBe(1);
    });

    it('should reorder slides', () => {
      const store = usePresentationStore.getState();
      store.addSlide('blank');
      store.addSlide('blank');
      const slide0Id = usePresentationStore.getState().presentation.slides[0].id;
      store.reorderSlides(0, 2);
      expect(usePresentationStore.getState().presentation.slides[2].id).toBe(slide0Id);
    });

    it('should toggle skip slide', () => {
      const store = usePresentationStore.getState();
      expect(store.presentation.slides[0].skipped).toBe(false);
      store.toggleSkipSlide(0);
      expect(usePresentationStore.getState().presentation.slides[0].skipped).toBe(true);
      store.toggleSkipSlide(0);
      expect(usePresentationStore.getState().presentation.slides[0].skipped).toBe(false);
    });

    it('should set slide background', () => {
      const store = usePresentationStore.getState();
      const slideId = store.presentation.slides[0].id;
      store.setSlideBackground(slideId, { type: 'solid', color: '#ff0000' });
      expect(usePresentationStore.getState().presentation.slides[0].background.color).toBe('#ff0000');
    });

    it('should set speaker notes', () => {
      const store = usePresentationStore.getState();
      const slideId = store.presentation.slides[0].id;
      store.setSpeakerNotes(slideId, 'Test notes');
      expect(usePresentationStore.getState().presentation.slides[0].speakerNotes).toBe('Test notes');
    });

    it('should set slide transition', () => {
      const store = usePresentationStore.getState();
      const slideId = store.presentation.slides[0].id;
      store.setSlideTransition(slideId, { type: 'fade', duration: 500 });
      expect(usePresentationStore.getState().presentation.slides[0].transition.type).toBe('fade');
    });
  });

  describe('Element Management', () => {
    const createTestElement = (overrides: Partial<SlideElement> = {}): SlideElement => ({
      id: 'test-el-' + Math.random().toString(36).slice(2),
      type: 'text',
      x: 100, y: 100,
      width: 200, height: 100,
      rotation: 0, zIndex: 1,
      locked: false, opacity: 1, visible: true,
      content: { text: 'Hello' },
      style: { fontSize: 18, fontFamily: 'Arial' },
      ...overrides,
    });

    it('should add an element to current slide', () => {
      const store = usePresentationStore.getState();
      const el = createTestElement();
      store.addElement(el);
      const slide = usePresentationStore.getState().presentation.slides[0];
      const found = slide.elements.find(e => e.id === el.id);
      expect(found).toBeDefined();
      expect(usePresentationStore.getState().selectedElementIds).toContain(el.id);
    });

    it('should update an element', () => {
      const store = usePresentationStore.getState();
      const el = createTestElement();
      store.addElement(el);
      store.updateElement(el.id, { x: 300, y: 200 });
      const slide = usePresentationStore.getState().presentation.slides[0];
      const updated = slide.elements.find(e => e.id === el.id);
      expect(updated?.x).toBe(300);
      expect(updated?.y).toBe(200);
    });

    it('should delete elements', () => {
      const store = usePresentationStore.getState();
      const el1 = createTestElement();
      const el2 = createTestElement();
      store.addElement(el1);
      store.addElement(el2);
      const beforeCount = usePresentationStore.getState().presentation.slides[0].elements.length;
      store.deleteElements([el1.id]);
      const afterCount = usePresentationStore.getState().presentation.slides[0].elements.length;
      expect(afterCount).toBe(beforeCount - 1);
      expect(usePresentationStore.getState().selectedElementIds).not.toContain(el1.id);
    });

    it('should duplicate elements with offset', () => {
      const store = usePresentationStore.getState();
      const el = createTestElement({ x: 100, y: 100 });
      store.addElement(el);
      const beforeCount = usePresentationStore.getState().presentation.slides[0].elements.length;
      store.duplicateElements([el.id]);
      const slide = usePresentationStore.getState().presentation.slides[0];
      expect(slide.elements.length).toBe(beforeCount + 1);
      // Find the duplicated element (new element with offset)
      const original = slide.elements.find(e => e.id === el.id);
      const duplicated = slide.elements.find(e => e.id !== el.id && e.x === original!.x + 20 && e.y === original!.y + 20);
      expect(duplicated).toBeDefined();
      expect(duplicated?.x).toBe(120); // 100 + 20 offset
      expect(duplicated?.y).toBe(120);
    });

    it('should move elements', () => {
      const store = usePresentationStore.getState();
      const el = createTestElement({ x: 100, y: 100 });
      store.addElement(el);
      store.moveElements([el.id], 50, -30);
      const slide = usePresentationStore.getState().presentation.slides[0];
      const moved = slide.elements.find(e => e.id === el.id);
      expect(moved?.x).toBe(150);
      expect(moved?.y).toBe(70);
    });

    it('should not move locked elements', () => {
      const store = usePresentationStore.getState();
      const el = createTestElement({ x: 100, y: 100, locked: true });
      store.addElement(el);
      store.moveElements([el.id], 50, 50);
      const slide = usePresentationStore.getState().presentation.slides[0];
      const moved = slide.elements.find(e => e.id === el.id);
      expect(moved?.x).toBe(100);
      expect(moved?.y).toBe(100);
    });

    it('should toggle lock element', () => {
      const store = usePresentationStore.getState();
      const el = createTestElement({ locked: false });
      store.addElement(el);
      store.toggleLockElement(el.id);
      const slide = usePresentationStore.getState().presentation.slides[0];
      expect(slide.elements.find(e => e.id === el.id)?.locked).toBe(true);
      store.toggleLockElement(el.id);
      const slide2 = usePresentationStore.getState().presentation.slides[0];
      expect(slide2.elements.find(e => e.id === el.id)?.locked).toBe(false);
    });

    it('should bring element to front', () => {
      const store = usePresentationStore.getState();
      const el1 = createTestElement({ id: 'el1' });
      const el2 = createTestElement({ id: 'el2' });
      store.addElement(el1);
      store.addElement(el2);
      store.bringToFront('el1');
      const slide = usePresentationStore.getState().presentation.slides[0];
      const e1 = slide.elements.find(e => e.id === 'el1');
      const e2 = slide.elements.find(e => e.id === 'el2');
      expect(e1!.zIndex).toBeGreaterThan(e2!.zIndex);
    });

    it('should send element to back', () => {
      const store = usePresentationStore.getState();
      const el1 = createTestElement({ id: 'back1' });
      const el2 = createTestElement({ id: 'back2' });
      store.addElement(el1);
      store.addElement(el2);
      store.sendToBack('back2');
      const slide = usePresentationStore.getState().presentation.slides[0];
      const e1 = slide.elements.find(e => e.id === 'back1');
      const e2 = slide.elements.find(e => e.id === 'back2');
      expect(e2!.zIndex).toBeLessThan(e1!.zIndex);
    });

    it('should group elements', () => {
      const store = usePresentationStore.getState();
      const el1 = createTestElement({ id: 'g1' });
      const el2 = createTestElement({ id: 'g2' });
      store.addElement(el1);
      store.addElement(el2);
      store.groupElements(['g1', 'g2']);
      const slide = usePresentationStore.getState().presentation.slides[0];
      const grouped1 = slide.elements.find(e => e.id === 'g1');
      const grouped2 = slide.elements.find(e => e.id === 'g2');
      expect(grouped1?.groupId).toBeDefined();
      expect(grouped1?.groupId).toBe(grouped2?.groupId);
    });

    it('should ungroup elements', () => {
      const store = usePresentationStore.getState();
      const el1 = createTestElement({ id: 'ug1' });
      const el2 = createTestElement({ id: 'ug2' });
      store.addElement(el1);
      store.addElement(el2);
      store.groupElements(['ug1', 'ug2']);
      const groupId = usePresentationStore.getState().presentation.slides[0].elements.find(e => e.id === 'ug1')?.groupId;
      expect(groupId).toBeDefined();
      store.ungroupElements(groupId!);
      const slide = usePresentationStore.getState().presentation.slides[0];
      expect(slide.elements.find(e => e.id === 'ug1')?.groupId).toBeNull();
    });
  });

  describe('Clipboard Operations', () => {
    it('should copy and paste elements', () => {
      const store = usePresentationStore.getState();
      store.addElement({
        id: 'copy-el', type: 'text', x: 100, y: 100,
        width: 200, height: 100, rotation: 0, zIndex: 1,
        locked: false, opacity: 1, visible: true,
        content: { text: 'Copy me' }, style: {},
      });
      store.setSelectedElementIds(['copy-el']);
      store.copyElements();
      expect(usePresentationStore.getState().clipboard).toHaveLength(1);
      store.pasteElements();
      const slide = usePresentationStore.getState().presentation.slides[0];
      // Should have original + pasted element
      const textElements = slide.elements.filter(e => e.type === 'text');
      expect(textElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should cut elements', () => {
      const store = usePresentationStore.getState();
      store.addElement({
        id: 'cut-el', type: 'text', x: 100, y: 100,
        width: 200, height: 100, rotation: 0, zIndex: 1,
        locked: false, opacity: 1, visible: true,
        content: { text: 'Cut me' }, style: {},
      });
      store.setSelectedElementIds(['cut-el']);
      store.cutElements();
      expect(usePresentationStore.getState().clipboard).toHaveLength(1);
      // Element should be removed from slide
      const slide = usePresentationStore.getState().presentation.slides[0];
      expect(slide.elements.find(e => e.id === 'cut-el')).toBeUndefined();
    });
  });

  describe('Tools and UI', () => {
    it('should set active tool', () => {
      const store = usePresentationStore.getState();
      store.setActiveTool('text');
      expect(usePresentationStore.getState().activeTool).toBe('text');
    });

    it('should set zoom with min/max clamping', () => {
      const store = usePresentationStore.getState();
      store.setZoom(500);
      expect(usePresentationStore.getState().zoom).toBe(400);
      store.setZoom(10);
      expect(usePresentationStore.getState().zoom).toBe(25);
    });

    it('should toggle panels', () => {
      const store = usePresentationStore.getState();
      expect(store.showLeftPanel).toBe(true);
      store.toggleLeftPanel();
      expect(usePresentationStore.getState().showLeftPanel).toBe(false);
      store.toggleRightPanel();
      expect(usePresentationStore.getState().showRightPanel).toBe(false);
    });

    it('should toggle rulers, grid, guides', () => {
      const store = usePresentationStore.getState();
      store.toggleRulers();
      expect(usePresentationStore.getState().showRulers).toBe(true);
      store.toggleGrid();
      expect(usePresentationStore.getState().showGrid).toBe(true);
      store.toggleGuides();
      expect(usePresentationStore.getState().showGuides).toBe(false); // starts true
    });
  });

  describe('Presentation Mode', () => {
    it('should enter and exit presentation mode', () => {
      const store = usePresentationStore.getState();
      store.startPresentation(0);
      expect(usePresentationStore.getState().isPresentationMode).toBe(true);
      expect(usePresentationStore.getState().presentationSlideIndex).toBe(0);
      store.exitPresentation();
      expect(usePresentationStore.getState().isPresentationMode).toBe(false);
    });

    it('should navigate slides in presentation mode', () => {
      const store = usePresentationStore.getState();
      store.addSlide('blank');
      store.addSlide('blank');
      store.startPresentation(0);
      store.nextPresentationSlide();
      expect(usePresentationStore.getState().presentationSlideIndex).toBe(1);
      store.prevPresentationSlide();
      expect(usePresentationStore.getState().presentationSlideIndex).toBe(0);
      // Should not go below 0
      store.prevPresentationSlide();
      expect(usePresentationStore.getState().presentationSlideIndex).toBe(0);
    });
  });

  describe('Format Painter', () => {
    it('should pick and apply format', () => {
      const store = usePresentationStore.getState();
      store.addElement({
        id: 'src-el', type: 'text', x: 100, y: 100,
        width: 200, height: 100, rotation: 0, zIndex: 1,
        locked: false, opacity: 1, visible: true,
        content: { text: 'Source' },
        style: { fontFamily: 'Georgia', fontSize: 24, color: '#ff0000' },
      });
      store.addElement({
        id: 'dst-el', type: 'text', x: 400, y: 100,
        width: 200, height: 100, rotation: 0, zIndex: 2,
        locked: false, opacity: 1, visible: true,
        content: { text: 'Destination' },
        style: { fontFamily: 'Arial', fontSize: 12 },
      });
      store.setSelectedElementIds(['src-el']);
      store.pickFormat();
      expect(usePresentationStore.getState().formatPainterStyle).toBeDefined();
      expect(usePresentationStore.getState().activeTool).toBe('formatPainter');
      store.applyFormat('dst-el');
      const slide = usePresentationStore.getState().presentation.slides[0];
      const dst = slide.elements.find(e => e.id === 'dst-el');
      expect(dst?.style.fontFamily).toBe('Georgia');
      expect(dst?.style.fontSize).toBe(24);
      expect(dst?.style.color).toBe('#ff0000');
    });
  });

  describe('Recent Colors', () => {
    it('should add recent colors (max 10)', () => {
      const store = usePresentationStore.getState();
      store.addRecentColor('#ff0000');
      store.addRecentColor('#00ff00');
      expect(usePresentationStore.getState().recentColors).toEqual(['#00ff00', '#ff0000']);
      // Duplicate should move to front
      store.addRecentColor('#ff0000');
      expect(usePresentationStore.getState().recentColors[0]).toBe('#ff0000');
    });
  });

  describe('Helpers', () => {
    it('getCurrentSlide should return current slide', () => {
      const store = usePresentationStore.getState();
      const slide = store.getCurrentSlide();
      expect(slide).toBeDefined();
      expect(slide?.id).toBe(store.presentation.slides[0].id);
    });

    it('getSelectedElements should return selected elements', () => {
      const store = usePresentationStore.getState();
      store.addElement({
        id: 'sel-el', type: 'text', x: 0, y: 0,
        width: 100, height: 50, rotation: 0, zIndex: 1,
        locked: false, opacity: 1, visible: true,
        content: { text: '' }, style: {},
      });
      store.setSelectedElementIds(['sel-el']);
      const selected = usePresentationStore.getState().getSelectedElements();
      expect(selected).toHaveLength(1);
      expect(selected[0].id).toBe('sel-el');
    });
  });

  describe('Serialization', () => {
    it('should roundtrip presentation through JSON', () => {
      const store = usePresentationStore.getState();
      store.setTitle('Roundtrip Test');
      store.addElement({
        id: 'rt-el', type: 'shape', x: 50, y: 50,
        width: 150, height: 150, rotation: 45, zIndex: 1,
        locked: false, opacity: 0.8, visible: true,
        content: { text: 'In shape' },
        style: { fill: '#4285F4', stroke: '#000', strokeWidth: 2 },
        shapeType: 'rectangle',
      });
      const presentation = usePresentationStore.getState().presentation;
      const json = JSON.stringify(presentation);
      const parsed = JSON.parse(json);
      expect(parsed.title).toBe('Roundtrip Test');
      expect(parsed.slides[0].elements.length).toBeGreaterThanOrEqual(1);
      const el = parsed.slides[0].elements.find((e: { id: string }) => e.id === 'rt-el');
      expect(el).toBeDefined();
      expect(el.rotation).toBe(45);
      expect(el.style.fill).toBe('#4285F4');
      expect(el.shapeType).toBe('rectangle');
    });
  });
});
