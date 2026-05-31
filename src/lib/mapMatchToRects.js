import { pdfjsLib } from './pdfjs.js'

/**
 * mapMatchToRects(model, range, viewport) → [{ x, y, w, h }]
 *
 * Turns a character range [start, end) in a page's text string into one or more
 * highlight rectangles in viewport (CSS, top-left origin) coordinates.
 *
 * The match may span several text fragments, or cover only part of one, so we
 * emit a rect per overlapping fragment. pdf.js reports fragment positions in PDF
 * space (origin bottom-left); `viewport.transform` already encodes the render
 * scale AND the bottom-left → top-left Y-flip, so combining it with a fragment's
 * own transform lands the box exactly on the rendered glyphs.
 *
 *   t = viewport.transform ∘ item.transform   (a 2D affine matrix [a,b,c,d,e,f])
 *   • (t[4], t[5]) = the fragment's baseline origin in device pixels
 *   • hypot(t[2], t[3]) = the glyph height in device pixels (handles the flip sign)
 *   • box top = baselineY − glyphHeight   (glyphs rise above the baseline)
 */
export function mapMatchToRects(model, range, viewport) {
  const rects = []

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

    // The match may cover only part of this fragment — slice it horizontally by
    // character index (a good approximation for near-uniform glyph widths).
    const fracStart = (overlapStart - item.start) / charLen
    const fracEnd = (overlapEnd - item.start) / charLen

    rects.push({
      x: baseLeft + fragWidth * fracStart,
      y: top,
      w: fragWidth * (fracEnd - fracStart),
      h: fontHeight,
    })
  }

  return rects
}
