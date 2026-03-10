'use client';

import React, { useCallback } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { SlideElement } from '@/types/presentation';

function SlideThumbnail({ slide, index, isActive }: {
  slide: { id: string; elements: SlideElement[]; background: { color?: string; gradient?: string; imageUrl?: string }; skipped: boolean };
  index: number;
  isActive: boolean;
}) {
  const store = usePresentationStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const bgStyle: React.CSSProperties = {};
  if (slide.background.imageUrl) {
    bgStyle.backgroundImage = `url(${slide.background.imageUrl})`;
    bgStyle.backgroundSize = 'cover';
  } else if (slide.background.gradient) {
    bgStyle.background = slide.background.gradient;
  } else {
    bgStyle.backgroundColor = slide.background.color || '#ffffff';
  }

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const menu = document.createElement('div');
    menu.className = 'fixed z-[100] dropdown-menu';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    const items = [
      { label: 'New slide', action: () => store.addSlide('blank', index) },
      { label: 'Duplicate slide', action: () => store.duplicateSlide(index) },
      { label: 'Delete slide', action: () => store.deleteSlide(index) },
      { label: slide.skipped ? 'Unskip slide' : 'Skip slide', action: () => store.toggleSkipSlide(index) },
    ];

    items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'menu-item w-full text-left';
      btn.textContent = item.label;
      btn.onclick = () => { item.action(); document.body.removeChild(menu); };
      menu.appendChild(btn);
    });

    document.body.appendChild(menu);
    const closeMenu = (ev: MouseEvent) => {
      if (!menu.contains(ev.target as Node)) {
        if (document.body.contains(menu)) document.body.removeChild(menu);
        document.removeEventListener('mousedown', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', closeMenu), 0);
  }, [store, index, slide.skipped]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-start gap-1 px-2 py-1 cursor-pointer group ${isActive ? '' : ''}`}
      onClick={() => store.setCurrentSlideIndex(index)}
      onContextMenu={handleContextMenu}
    >
      <span className={`text-xs text-gs-text-secondary w-5 text-right shrink-0 mt-1 ${slide.skipped ? 'line-through' : ''}`}>
        {index + 1}
      </span>
      <div
        className={`slide-thumbnail w-full aspect-video rounded-sm border-2 overflow-hidden relative ${
          isActive ? 'border-gs-blue selected' : 'border-transparent hover:border-gray-300'
        } ${slide.skipped ? 'opacity-50' : ''}`}
        style={bgStyle}
      >
        {/* Mini render of elements */}
        <div className="absolute inset-0" style={{ transform: 'scale(0.175)', transformOrigin: 'top left', width: '960px', height: '540px' }}>
          {slide.elements.map((el) => (
            <SlideElementMini key={el.id} element={el} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideElementMini({ element }: { element: SlideElement }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    opacity: element.opacity,
    overflow: 'hidden',
  };

  if (element.type === 'text') {
    const textContent = element.content as { text?: string; html?: string };
    return (
      <div style={{
        ...style,
        fontSize: element.style.fontSize || 18,
        fontFamily: element.style.fontFamily || 'Arial',
        fontWeight: element.style.fontWeight || 'normal',
        fontStyle: element.style.fontStyle || 'normal',
        color: element.style.color || '#000',
        textAlign: (element.style.textAlign as React.CSSProperties['textAlign']) || 'left',
        backgroundColor: element.style.fill || 'transparent',
      }}>
        {textContent?.text || ''}
      </div>
    );
  }

  if (element.type === 'shape') {
    return (
      <div style={{
        ...style,
        backgroundColor: element.style.fill || '#CFE2FF',
        border: element.style.stroke ? `${element.style.strokeWidth || 1}px ${element.style.strokeDasharray ? 'dashed' : 'solid'} ${element.style.stroke}` : 'none',
        borderRadius: element.shapeType === 'ellipse' ? '50%' : element.style.borderRadius || 0,
      }} />
    );
  }

  if (element.type === 'image') {
    const imgContent = element.content as { src?: string };
    return (
      <div style={style}>
        {imgContent?.src && (
          <img src={imgContent.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
    );
  }

  return <div style={style} />;
}

export function SlidePanel() {
  const store = usePresentationStore();
  const slides = store.presentation.slides;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = slides.findIndex(s => s.id === active.id);
    const newIndex = slides.findIndex(s => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      store.reorderSlides(oldIndex, newIndex);
    }
  };

  return (
    <div className="w-48 border-r border-gs-border bg-white flex flex-col shrink-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto py-1">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {slides.map((slide, i) => (
              <SlideThumbnail
                key={slide.id}
                slide={slide}
                index={i}
                isActive={i === store.currentSlideIndex}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
      <div className="border-t border-gs-border p-1">
        <button
          className="w-full flex items-center justify-center gap-1 py-1 text-xs text-gs-text-secondary hover:bg-gs-hover rounded"
          onClick={() => store.addSlide('blank')}
        >
          <Plus size={14} />
          New slide
        </button>
      </div>
    </div>
  );
}
