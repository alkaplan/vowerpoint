'use client';

import { useEffect } from 'react';
import { usePresentationStore } from '@/store/presentationStore';

export function KeyboardShortcuts() {
  const store = usePresentationStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when in text editing mode
      if (store.isTextEditing) {
        // Only handle formatting shortcuts during text editing
        if (e.ctrlKey || e.metaKey) {
          switch (e.key.toLowerCase()) {
            case 'b': {
              e.preventDefault();
              const elements = store.getSelectedElements();
              if (elements.length > 0) {
                const el = elements[0];
                store.updateElement(el.id, {
                  style: { ...el.style, fontWeight: el.style.fontWeight === 'bold' ? 'normal' : 'bold' },
                });
              }
              return;
            }
            case 'i': {
              e.preventDefault();
              const elements = store.getSelectedElements();
              if (elements.length > 0) {
                const el = elements[0];
                store.updateElement(el.id, {
                  style: { ...el.style, fontStyle: el.style.fontStyle === 'italic' ? 'normal' : 'italic' },
                });
              }
              return;
            }
            case 'u': {
              e.preventDefault();
              const elements = store.getSelectedElements();
              if (elements.length > 0) {
                const el = elements[0];
                store.updateElement(el.id, {
                  style: { ...el.style, textDecoration: el.style.textDecoration?.includes('underline') ? '' : 'underline' },
                });
              }
              return;
            }
            case 'z': {
              e.preventDefault();
              if (e.shiftKey) {
                usePresentationStore.temporal.getState().redo();
              } else {
                usePresentationStore.temporal.getState().undo();
              }
              return;
            }
          }
        }
        // Let other keys pass through to contentEditable
        return;
      }

      // Presentation mode is handled in PresentationMode component
      if (store.isPresentationMode) return;

      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd shortcuts
      if (ctrlOrMeta) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              usePresentationStore.temporal.getState().redo();
            } else {
              usePresentationStore.temporal.getState().undo();
            }
            return;
          case 'c':
            e.preventDefault();
            store.copyElements();
            return;
          case 'v':
            e.preventDefault();
            store.pasteElements();
            return;
          case 'x':
            e.preventDefault();
            store.cutElements();
            return;
          case 'd':
            e.preventDefault();
            if (store.selectedElementIds.length > 0) {
              store.duplicateElements(store.selectedElementIds);
            } else {
              store.duplicateSlide(store.currentSlideIndex);
            }
            return;
          case 'a':
            e.preventDefault();
            const slide = store.getCurrentSlide();
            if (slide) {
              store.setSelectedElementIds(slide.elements.map(el => el.id));
            }
            return;
          case 'm':
            e.preventDefault();
            store.addSlide('blank');
            return;
          case 'b':
            e.preventDefault();
            const bElements = store.getSelectedElements();
            if (bElements.length > 0) {
              const el = bElements[0];
              store.updateElement(el.id, {
                style: { ...el.style, fontWeight: el.style.fontWeight === 'bold' ? 'normal' : 'bold' },
              });
            }
            return;
          case 'i':
            e.preventDefault();
            const iElements = store.getSelectedElements();
            if (iElements.length > 0) {
              const el = iElements[0];
              store.updateElement(el.id, {
                style: { ...el.style, fontStyle: el.style.fontStyle === 'italic' ? 'normal' : 'italic' },
              });
            }
            return;
          case 'u':
            e.preventDefault();
            const uElements = store.getSelectedElements();
            if (uElements.length > 0) {
              const el = uElements[0];
              store.updateElement(el.id, {
                style: { ...el.style, textDecoration: el.style.textDecoration?.includes('underline') ? '' : 'underline' },
              });
            }
            return;
          case 'k':
            e.preventDefault();
            // Insert link - placeholder
            return;
          case 'g':
            e.preventDefault();
            if (e.shiftKey) {
              // Ungroup
              const el = store.getSelectedElements()[0];
              if (el?.groupId) store.ungroupElements(el.groupId);
            } else {
              // Group
              store.groupElements(store.selectedElementIds);
            }
            return;
          case '=':
          case '+':
            e.preventDefault();
            store.setZoom(store.zoom + 25);
            return;
          case '-':
            e.preventDefault();
            store.setZoom(store.zoom - 25);
            return;
          case '0':
            e.preventDefault();
            store.setZoom(100);
            return;
        }

        // Ctrl+Shift+Up/Down for z-order
        if (e.shiftKey) {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (store.selectedElementIds[0]) store.bringToFront(store.selectedElementIds[0]);
            return;
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (store.selectedElementIds[0]) store.sendToBack(store.selectedElementIds[0]);
            return;
          }
        }
        return;
      }

      // Don't handle non-modifier shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Non-modifier shortcuts
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (store.selectedElementIds.length > 0) {
            e.preventDefault();
            store.deleteElements(store.selectedElementIds);
          }
          return;
        case 'Escape':
          e.preventDefault();
          store.setSelectedElementIds([]);
          store.setActiveTool('select');
          return;
        case 'ArrowUp':
          if (store.selectedElementIds.length > 0) {
            e.preventDefault();
            store.moveElements(store.selectedElementIds, 0, e.shiftKey ? -10 : -1);
          }
          return;
        case 'ArrowDown':
          if (store.selectedElementIds.length > 0) {
            e.preventDefault();
            store.moveElements(store.selectedElementIds, 0, e.shiftKey ? 10 : 1);
          }
          return;
        case 'ArrowLeft':
          if (store.selectedElementIds.length > 0) {
            e.preventDefault();
            store.moveElements(store.selectedElementIds, e.shiftKey ? -10 : -1, 0);
          }
          return;
        case 'ArrowRight':
          if (store.selectedElementIds.length > 0) {
            e.preventDefault();
            store.moveElements(store.selectedElementIds, e.shiftKey ? 10 : 1, 0);
          }
          return;
        case 'F5':
          e.preventDefault();
          store.startPresentation(0);
          return;
        case 'Tab':
          if (store.selectedElementIds.length > 0) {
            e.preventDefault();
            const currentSlide = store.getCurrentSlide();
            if (!currentSlide || currentSlide.elements.length === 0) return;
            const currentIdx = currentSlide.elements.findIndex(
              el => el.id === store.selectedElementIds[0]
            );
            const nextIdx = (currentIdx + 1) % currentSlide.elements.length;
            store.setSelectedElementIds([currentSlide.elements[nextIdx].id]);
          }
          return;
        case 'v':
        case 'V':
          store.setActiveTool('select');
          return;
        case 't':
        case 'T':
          store.setActiveTool('text');
          return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  return null;
}
