/**
 * dedupeOverlaps(matches)
 *
 * Given match objects shaped { start, end, ... }, returns a list with no
 * overlapping ranges. When two matches overlap we keep the one that starts
 * earlier (and, on a tie, the longer one). Used because we run several date
 * regexes over the same text and don't want, e.g., a partial match nested
 * inside a fuller one to be reported twice.
 */
export function dedupeOverlaps(matches) {
  const sorted = [...matches].sort((a, b) => a.start - b.start || b.end - a.end)
  const out = []
  let lastEnd = -1
  for (const m of sorted) {
    if (m.start >= lastEnd) {
      out.push(m)
      lastEnd = m.end
    }
  }
  return out
}
