import { dedupeOverlaps } from './matchUtils.js'

// Month names for the word-based formats.
const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December'
const MON = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec'

/**
 * Each pattern targets one of the formats the brief requires. We run them all
 * and merge the results, so a date written in any supported style is caught.
 * Ranges (start/end) are character offsets into the page string.
 */
const PATTERNS = [
  // ISO 8601 — 2024-01-12
  /\b\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])\b/g,
  // DD/MM/YYYY or DD-MM-YYYY — 12/01/2024, 03-02-2024
  /\b(?:0?[1-9]|[12]\d|3[01])[/-](?:0?[1-9]|1[0-2])[/-]\d{4}\b/g,
  // DD-Mon-YYYY — 03-Feb-2024
  new RegExp(`\\b\\d{1,2}-(?:${MON})-\\d{4}\\b`, 'gi'),
  // Month DD, YYYY — January 12, 2024
  new RegExp(`\\b(?:${MONTHS})\\s+\\d{1,2},?\\s+\\d{4}\\b`, 'gi'),
  // DD Month YYYY — 12 January 2024
  new RegExp(`\\b\\d{1,2}\\s+(?:${MONTHS})\\s+\\d{4}\\b`, 'gi'),
]

/**
 * extractDates(text) → [{ start, end, text }]
 * Finds every supported date format in the page string. Wrapped so a malformed
 * pattern run can never crash extraction of the rest of the document.
 */
export function extractDates(text) {
  const found = []
  for (const re of PATTERNS) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(text)) !== null) {
      // Skip matches spanning a wide gap (2+ whitespace) — not a contiguous date.
      if (!/\s{2,}/.test(m[0])) {
        found.push({ start: m.index, end: m.index + m[0].length, text: m[0] })
      }
      if (m.index === re.lastIndex) re.lastIndex++ // guard against zero-length loops
    }
  }
  return dedupeOverlaps(found)
}
