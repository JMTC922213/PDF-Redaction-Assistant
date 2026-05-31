import { PDFDocument } from 'pdf-lib'
import { mapMatchToRects } from './mapMatchToRects.js'

// Render scale for rasterised pages — 2× keeps the burned-in pages crisp.
const EXPORT_SCALE = 2

/**
 * exportRedactedPdf — produces a new PDF with the redacted entities removed.
 *
 * SECURITY MODEL (the important bit): a black rectangle drawn over text in a
 * vector PDF leaves the text extractable underneath — that is NOT redaction.
 * So for any page that contains a redaction we *rasterise* it: render the page
 * to a canvas, paint opaque black boxes over the redacted regions, and embed the
 * flattened image as the new page. No selectable text survives under a box.
 *
 * Pages with NO redactions are copied through unchanged, so they keep their
 * crisp vector text and selectability. Trade-off: redacted pages lose
 * selectable text (documented as a known limitation).
 *
 * Returns the new PDF as a Uint8Array.
 */
export async function exportRedactedPdf({ file, pdf, numPages, pageModels, redactedEntities }) {
  const srcDoc = await PDFDocument.load(await file.arrayBuffer())
  const outDoc = await PDFDocument.create()

  // Group redacted entities by page.
  const byPage = new Map()
  for (const e of redactedEntities) {
    if (!byPage.has(e.page)) byPage.set(e.page, [])
    byPage.get(e.page).push(e)
  }

  for (let n = 1; n <= numPages; n++) {
    const reds = byPage.get(n)

    if (!reds || reds.length === 0) {
      // No redactions → keep the original vector page (text stays selectable).
      const [copied] = await outDoc.copyPages(srcDoc, [n - 1])
      outDoc.addPage(copied)
      continue
    }

    // Redactions present → rasterise the page with the boxes burned in.
    const page = await pdf.getPage(n)
    const viewport = page.getViewport({ scale: EXPORT_SCALE })

    const canvas = document.createElement('canvas')
    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)
    const ctx = canvas.getContext('2d')

    await page.render({ canvasContext: ctx, viewport }).promise

    // Paint opaque boxes over every redacted region (slightly padded for safety).
    ctx.fillStyle = '#000'
    const model = pageModels[n]
    for (const e of reds) {
      for (const r of mapMatchToRects(model, e.range, viewport)) {
        ctx.fillRect(r.x - 1, r.y - 1, r.w + 2, r.h + 2)
      }
    }

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
    const png = await outDoc.embedPng(new Uint8Array(await blob.arrayBuffer()))

    // New page sized to the original (unscaled) page; image fills it.
    const v1 = page.getViewport({ scale: 1 })
    const outPage = outDoc.addPage([v1.width, v1.height])
    outPage.drawImage(png, { x: 0, y: 0, width: v1.width, height: v1.height })
  }

  return outDoc.save()
}

/** Triggers a browser download of the given PDF bytes. */
export function downloadPdf(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
