import { pdfjsLib } from './pdfjs.js'

// A reused offscreen canvas for measuring sub-string widths within a fragment.
let measureCtx = null
function getMeasureCtx() {
  if (measureCtx === null && typeof document !== 'undefined') {
    measureCtx = document.createElement('canvas').getContext('2d')
  }
  return measureCtx
}

// Extra vertical coverage so boxes include glyph descenders (g, y, p), which a
// box exactly the font's em-height would clip below the baseline.
const V_PAD = 1.15

// Measure the device x-offset and width of str[a:b] within a fragment of known
// device width. PDF fonts are proportional, so we measure with a real font and
// normalise to the fragment's width rather than assuming uniform characters.
function measureSlice(ctx, str, a, b, fragWidth) {
  if (ctx && str && fragWidth > 0) {
    ctx.font = '32px sans-serif'
    const full = ctx.measureText(str).width || 1
    const norm = fragWidth / full
    return {
      xOffset: ctx.measureText(str.slice(0, a)).width * norm,
      width: ctx.measureText(str.slice(a, b)).width * norm,
    }
  }
  const len = str.length || 1
  return { xOffset: fragWidth * (a / len), width: fragWidth * ((b - a) / len) }
}

/**
 * mapMatchToRects(model, range, viewport) → [{ x, y, w, h }]
 *
 * Turns a character range [start, end) in a page's text string into one or more
 * highlight rectangles in viewport (CSS, top-left origin) coordinates.
 *
 * The match may span several fragments, or cover only part of one, so we emit a
 * rect per overlapping fragment. pdf.js reports fragment positions in PDF space
 * (origin bottom-left); `viewport.transform` already encodes the render scale
 * AND the bottom-left → top-left Y-flip, so combining it with a fragment's own
 * transform lands the box on the rendered glyphs.
 *
 * Within a fragment, the matched text is split at WIDE whitespace (2+ spaces) so
 * a single box never spans an obvious gap (e.g. spaced/justified text); normal
 * single-space words stay as one continuous box.
 */
export function mapMatchToRects(model, range, viewport) {
  const rects = []
  const ctx = getMeasureCtx()

  for (const item of model.items) {
    const overlapStart = Math.max(item.start, range.start)
    const overlapEnd = Math.min(item.end, range.end)
    if (overlapStart >= overlapEnd) continue // fragment isn't part of this match

    const charLen = item.end - item.start
    if (charLen <= 0) continue

    const t = pdfjsLib.Util.transform(viewport.transform, item.transform)
    const fontHeight = Math.hypot(t[2], t[3])
    const fragWidth = item.width * viewport.scale
    const baseLeft = t[4]
    const top = t[5] - fontHeight
    const h = fontHeight * V_PAD
    const str = item.str ?? ''

    // The matched portion of this fragment, relative to the fragment string.
    const a = overlapStart - item.start
    const b = overlapEnd - item.start
    const sub = str.slice(a, b)

    // Split into segments that contain at most single internal spaces; a run of
    // 2+ whitespace breaks the segment so the gap isn't highlighted.
    const segRe = /\S(?:\s?\S)*/g
    let seg
    let matched = false
    while ((seg = segRe.exec(sub)) !== null) {
      matched = true
      const segA = a + seg.index
      const segB = segA + seg[0].length
      const { xOffset, width } = measureSlice(ctx, str, segA, segB, fragWidth)
      rects.push({ x: baseLeft + xOffset, y: top, w: width, h })
    }

    // Fallback for whitespace-only / measurement-less cases: one box for [a,b].
    if (!matched) {
      const { xOffset, width } = measureSlice(ctx, str, a, b, fragWidth)
      rects.push({ x: baseLeft + xOffset, y: top, w: width, h })
    }
  }

  return rects
}
