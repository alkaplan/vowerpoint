'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Presentation } from '@/types/presentation';
import { sanitizePresentation } from '@/lib/export';

const LOCAL_STORAGE_KEY = 'vowerpoint_presentation';
const AUTO_SAVE_DELAY = 3000; // 3 seconds debounce

// Save to localStorage as fallback
const saveToLocalStorage = (presentation: Presentation) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(presentation));
  } catch {
    console.warn('Failed to save to localStorage');
  }
};

// Load from localStorage
const loadFromLocalStorage = (): Presentation | null => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as Presentation;
    }
  } catch {
    console.warn('Failed to load from localStorage');
  }
  return null;
};

// Save to Supabase
const saveToSupabase = async (presentation: Presentation): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('presentations')
      .upsert({
        id: presentation.id,
        title: presentation.title,
        theme: presentation.theme,
        slides: presentation.slides,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase save error:', error.message);
      return false;
    }
    return true;
  } catch {
    console.warn('Failed to save to Supabase');
    return false;
  }
};

// Load from Supabase
const loadFromSupabase = async (id?: string): Promise<Presentation | null> => {
  if (!supabase) return null;
  try {
    let query = supabase.from('presentations').select('*');
    if (id) {
      query = query.eq('id', id);
    } else {
      query = query.order('updated_at', { ascending: false }).limit(1);
    }
    const { data, error } = await query.single();
    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      theme: data.theme,
      slides: data.slides,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Presentation;
  } catch {
    return null;
  }
};

export function useAutoSave() {
  const store = usePresentationStore();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');
  const isInitialLoadDone = useRef(false);

  // Debounced save function
  const debouncedSave = useCallback(async (presentation: Presentation) => {
    const serialized = JSON.stringify(presentation);
    if (serialized === lastSavedRef.current) {
      if (usePresentationStore.getState().saveStatus === 'unsaved') {
        store.setSaveStatus('saved');
      }
      return;
    }

    store.setSaveStatus('saving');

    // Always save to localStorage
    saveToLocalStorage(presentation);

    // Try Supabase if configured
    if (isSupabaseConfigured()) {
      const success = await saveToSupabase(presentation);
      if (!success) {
        // Fallback already saved to localStorage
        console.warn('Supabase save failed, data saved to localStorage');
      }
    }

    lastSavedRef.current = serialized;
    // Only set 'saved' if no new changes occurred during the async save
    if (usePresentationStore.getState().saveStatus === 'saving') {
      store.setSaveStatus('saved');
    }
  }, [store]);

  // Watch for changes and auto-save
  useEffect(() => {
    if (!isInitialLoadDone.current) return;

    if (store.saveStatus === 'unsaved') {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        debouncedSave(store.presentation);
      }, AUTO_SAVE_DELAY);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [store.saveStatus, store.presentation, debouncedSave]);

  // Initial load on mount
  useEffect(() => {
    const loadPresentation = async () => {
      // Try Supabase first
      if (isSupabaseConfigured()) {
        const supabaseData = await loadFromSupabase();
          if (supabaseData) {
            sanitizePresentation(supabaseData);
            store.setPresentation(supabaseData);
            lastSavedRef.current = JSON.stringify(supabaseData);
          isInitialLoadDone.current = true;
          return;
        }
      }

      // Fall back to localStorage
      const localData = loadFromLocalStorage();
      if (localData) {
        sanitizePresentation(localData);
        store.setPresentation(localData);
        lastSavedRef.current = JSON.stringify(localData);
      }
      isInitialLoadDone.current = true;
    };

    loadPresentation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToLocalStorage(store.presentation);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [store.presentation]);

  return {
    saveNow: () => debouncedSave(store.presentation),
    isSupabaseEnabled: isSupabaseConfigured(),
  };
}
