/**
 * URL normalization and validation utilities
 */

/**
 * Normalize URL - add https:// if no protocol
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  try {
    // If no protocol, add https://
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

/**
 * Validate URL format - must be valid URL
 */
export function isValidUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const normalized = normalizeUrl(trimmed);
    const parsed = new URL(normalized);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
}

/**
 * Truncate title for display - prevent extremely long titles
 */
const MAX_TITLE_LENGTH = 200;

export function truncateTitle(title: string, maxLength = MAX_TITLE_LENGTH): string {
  const trimmed = title.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength) + "...";
}
