import { dedupeOverlaps } from './matchUtils.js'

/**
 * Stop-list of capitalised words that look like names but usually aren't —
 * months, weekdays, legal/organisation words, document headings, roles, and
 * common sentence-initial words. Used two ways:
 *   • if EVERY word of a candidate is in the list → drop it (e.g. "Employment
 *     Agreement", "Northgate Holdings Ltd").
 *   • if SOME but not all words are in the list → keep it but mark it
 *     low-confidence (e.g. "Northgate Holdings" — likely an org, not a person).
 * This is how false positives are handled gracefully per the brief.
 */
const STOP = new Set([
  // months + abbreviations
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december',
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec',
  // weekdays
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  // legal / organisation
  'ltd', 'limited', 'inc', 'llc', 'plc', 'co', 'corp', 'corporation', 'company',
  'holdings', 'group', 'partners', 'associates', 'trust', 'bank',
  // document headings / boilerplate
  'agreement', 'employment', 'contract', 'confidential', 'section', 'article',
  'schedule', 'appendix', 'exhibit', 'clause', 'party', 'parties', 'whereas',
  'witness', 'page', 'date', 'name', 'terms', 'conditions', 'notice', 'recitals',
  // roles
  'employee', 'employer', 'head', 'operations', 'director', 'manager', 'officer',
  'chief', 'president', 'secretary', 'treasurer', 'chairman',
  // places / nationalities
  'united', 'states', 'kingdom', 'england', 'wales', 'scotland', 'ireland',
  'america', 'european', 'union',
  // common sentence-initial / function words
  'the', 'this', 'that', 'these', 'those', 'either', 'neither', 'all', 'any',
  'each', 'both', 'such', 'no', 'either',
])

// A name "word": a capitalised token, allowing O'Brien / D'Angelo style prefixes
// and hyphenated/apostrophed forms like Anne-Marie.
const WORD = "(?:[A-Z]['’])?[A-Z][a-z]+(?:[-'’][A-Za-z]+)*"
// Two or three such words separated by a SINGLE whitespace. Using \s (not \s+)
// means a wide gap ends one candidate and starts another, so "University     Jack
// Ma" yields "Jack Ma" (the real name) rather than bridging the gap or matching
// nothing. The list and the on-page highlights stay consistent as a result.
const NAME_RE = new RegExp(`\\b${WORD}(?:\\s${WORD}){1,2}\\b`, 'g')

/**
 * extractNames(text) → [{ start, end, text, confidence }]
 * Heuristic Title-Case detection with stop-list filtering and a confidence tier.
 */
export function extractNames(text) {
  const found = []
  NAME_RE.lastIndex = 0
  let m
  while ((m = NAME_RE.exec(text)) !== null) {
    const matchText = m[0]
    const words = matchText.split(/\s+/)
    const stopCount = words.filter((w) => STOP.has(w.toLowerCase())).length

    // Every word is a stop word → not a person's name; drop it.
    if (stopCount === words.length) continue

    // Some stop words present (e.g. an org suffix) → keep but flag as uncertain.
    const confidence = stopCount > 0 ? 'low' : 'high'

    found.push({ start: m.index, end: m.index + matchText.length, text: matchText, confidence })
    if (m.index === NAME_RE.lastIndex) NAME_RE.lastIndex++
  }
  return dedupeOverlaps(found)
}
