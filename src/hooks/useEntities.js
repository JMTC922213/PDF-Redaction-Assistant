import { useEffect, useState } from 'react'
import { buildPageText } from '../lib/buildPageText.js'
import { extractDates } from '../lib/extractDates.js'
import { extractNames } from '../lib/extractNames.js'

/**
 * useEntities(pdf, numPages)
 *
 * Walks every page, builds its text model, runs the date + name extractors, and
 * accumulates a single flat list of entities for the whole document:
 *
 *   Entity = { id, type:'date'|'name', text, page, range:{start,end}, confidence }
 *
 * Also returns `pageModels` (per-page { text, items }) which Step 4's highlight
 * mapper consumes to turn each entity's character range into on-page rectangles.
 *
 * Async + cancellable (same pattern as usePdfDocument): if the document changes
 * mid-scan, the stale run is dropped. Per-page extraction is wrapped in
 * try/catch so one bad page can't abort the whole document.
 */
export function useEntities(pdf, numPages) {
  const [state, setState] = useState({ entities: [], pageModels: {}, extracting: false })

  useEffect(() => {
    if (!pdf) {
      setState({ entities: [], pageModels: {}, extracting: false })
      return
    }

    let cancelled = false
    setState({ entities: [], pageModels: {}, extracting: true })

    ;(async () => {
      const entities = []
      const pageModels = {}
      let seq = 0

      for (let n = 1; n <= numPages; n++) {
        try {
          const page = await pdf.getPage(n)
          const textContent = await page.getTextContent()
          if (cancelled) return

          const model = buildPageText(textContent)
          pageModels[n] = model

          const dateMatches = extractDates(model.text)
          // Dates are reliable, so a "name" that overlaps a date (e.g. "Signed
          // January" clipping the start of "January 12, 2024") is spurious — drop it.
          const nameMatches = extractNames(model.text).filter(
            (nm) => !dateMatches.some((d) => nm.start < d.end && d.start < nm.end),
          )

          for (const d of dateMatches) {
            entities.push({ id: `d-${seq++}`, type: 'date', text: d.text, page: n, range: { start: d.start, end: d.end }, confidence: 'high' })
          }
          for (const nm of nameMatches) {
            entities.push({ id: `n-${seq++}`, type: 'name', text: nm.text, page: n, range: { start: nm.start, end: nm.end }, confidence: nm.confidence })
          }
        } catch (err) {
          // Skip a page that fails rather than crashing the whole scan.
          console.warn(`Entity extraction failed on page ${n}:`, err)
        }
      }

      if (cancelled) return
      setState({ entities, pageModels, extracting: false })
    })()

    return () => {
      cancelled = true
    }
  }, [pdf, numPages])

  return state
}
