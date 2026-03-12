import DOMPurify from 'dompurify';

/**
 * Safely sanitize HTML strings. Returns the input unchanged during SSR
 * (where DOMPurify is unavailable), and sanitizes in the browser.
 */
export function sanitizeHTML(html: string): string {
  if (typeof window === 'undefined') return html;
  return DOMPurify.sanitize(html);
}
