import { useEffect, useState } from 'react'
import { pdfjsLib } from '../lib/pdfjs.js'

/**
 * usePdfDocument(file)
 *
 * Loads a File into a pdf.js document and reports progress as a single status.
 * Returns: { status, pdf, numPages, error }
 *   status: 'empty'   — no file selected
 *           'loading' — parsing
 *           'ready'   — pdf available
 *           'error'   — failed (message in `error`)
 *
 * Why a hook: loading is async + cancellable, and several panels need the same
 * pdf object. Keeping it here means App just hands in a file and reads the result;
 * the messy async/cancellation lives in one place.
 */
export function usePdfDocument(file) {
  const [state, setState] = useState({ status: 'empty', pdf: null, numPages: 0, error: null })

  useEffect(() => {
    if (!file) {
      setState({ status: 'empty', pdf: null, numPages: 0, error: null })
      return
    }

    let cancelled = false
    let loadingTask = null
    setState({ status: 'loading', pdf: null, numPages: 0, error: null })

    ;(async () => {
      try {
        const data = await file.arrayBuffer()
        loadingTask = pdfjsLib.getDocument({ data })
        const pdf = await loadingTask.promise
        if (cancelled) return
        setState({ status: 'ready', pdf, numPages: pdf.numPages, error: null })
      } catch (err) {
        if (cancelled) return
        setState({ status: 'error', pdf: null, numPages: 0, error: err?.message || 'Failed to open PDF' })
      }
    })()

    // If the file changes (or component unmounts) before loading finishes, ignore
    // the stale result and tear down the in-flight task.
    return () => {
      cancelled = true
      loadingTask?.destroy?.()
    }
  }, [file])

  return state
}
