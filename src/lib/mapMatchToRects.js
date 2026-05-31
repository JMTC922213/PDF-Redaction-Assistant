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
 * For a PARTIAL fragment match we can't assume uniform character widths (PDFs
 * use proportional fonts — "W" ≫ "i"). So we measure the real sub-string width
 * with a canvas and normalise it to the fragment's known device width. This is
 * far more accurate than slicing by character count, which left boxes shifted
 * and too narrow.
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

    const a = overlapStart - item.start // sub-string start within the fragment
    const b = overlapEnd - item.start // sub-string end

    let xOffset, subWidth
    const str = item.str
    if (ctx && str && str.length === charLen && fragWidth > 0) {
      // Measure with any proportional font; we normalise by total width, so the
      // absolute font size cancels out and only the relative metrics matter.
      ctx.font = '32px sans-serif'
      const full = ctx.measureText(str).width || 1
      const norm = fragWidth / full
      xOffset = ctx.measureText(str.slice(0, a)).width * norm
      subWidth = ctx.measureText(str.slice(a, b)).width * norm
    } else {
      // Fallback (no canvas / odd fragment): proportional by character count.
      xOffset = fragWidth * (a / charLen)
      subWidth = fragWidth * ((b - a) / charLen)
    }

    const h = fontHeight * V_PAD
    rects.push({
      x: baseLeft + xOffset,
      y: t[5] - fontHeight, // top = baseline − em-height (covers ascenders/caps)
      w: subWidth,
      h, // extends below the baseline to cover descenders
    })
  }

  return rects
}
