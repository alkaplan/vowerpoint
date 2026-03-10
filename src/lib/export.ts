import { Presentation } from '@/types/presentation';
import DOMPurify from 'dompurify';

export const exportToJSON = (presentation: Presentation): void => {
  const data = JSON.stringify(presentation, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${presentation.title || 'presentation'}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Sanitize all HTML content in a presentation to prevent XSS
export const sanitizePresentation = (presentation: Presentation): Presentation => {
  if (presentation.slides && Array.isArray(presentation.slides)) {
    for (const slide of presentation.slides) {
      if (slide.elements && Array.isArray(slide.elements)) {
        for (const element of slide.elements) {
          const content = element.content as Record<string, unknown>;
          if (content && typeof content.html === 'string') {
            content.html = DOMPurify.sanitize(content.html);
          }
        }
      }
    }
  }
  return presentation;
};

export const importFromJSON = (file: File): Promise<Presentation> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        sanitizePresentation(data);
        resolve(data as Presentation);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const exportToPNG = async (slideElement: HTMLElement, filename: string): Promise<void> => {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(slideElement, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
  });
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};

export const exportToPDF = async (slideElements: HTMLElement[], title: string): Promise<void> => {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');
  
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [960, 540],
  });

  for (let i = 0; i < slideElements.length; i++) {
    if (i > 0) pdf.addPage([960, 540], 'landscape');
    const canvas = await html2canvas(slideElements[i], {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 960, 540);
  }

  pdf.save(`${title || 'presentation'}.pdf`);
};

// Export all slides to PDF by iterating through each slide index
export const exportToPDFAllSlides = async (
  store: { currentSlideIndex: number; presentation: Presentation; setCurrentSlideIndex: (i: number) => void },
  title: string
): Promise<void> => {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [960, 540],
  });

  const originalIndex = store.currentSlideIndex;
  const slideCount = store.presentation.slides.length;

  for (let i = 0; i < slideCount; i++) {
    store.setCurrentSlideIndex(i);
    // Wait for React to render the new slide
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const el = document.querySelector('[data-slide-render]') as HTMLElement;
    if (!el) continue;

    if (i > 0) pdf.addPage([960, 540], 'landscape');
    const canvas = await html2canvas(el, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 960, 540);
  }

  // Restore original slide
  store.setCurrentSlideIndex(originalIndex);
  pdf.save(`${title || 'presentation'}.pdf`);
};
