import { useEffect, useRef } from 'react'

/**
 * PageCanvas — renders one pdf.js page into a <canvas> at the given zoom.
 *
 * Notes on correctness:
 * - We multiply the canvas bitmap by devicePixelRatio and scale the render
 *   transform to match, so text stays crisp on retina screens while the CSS
 *   size stays at the logical viewport size.
 * - pdf.js renders are async; if zoom/page changes mid-render we cancel the
 *   previous RenderTask to avoid "canvas in use" errors and flicker.
 * - The reported viewport size is sent up via onViewport so the (future)
 *   highlight overlay can size itself to exactly match the canvas.
 */
export default function PageCanvas({ pdf, pageNumber, scale, onViewport }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let renderTask = null

    ;(async () => {
      const page = await pdf.getPage(pageNumber)
      if (cancelled) return

      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      if (!canvas) return

      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(viewport.width * dpr)
      canvas.height = Math.floor(viewport.height * dpr)
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`

      const ctx = canvas.getContext('2d')
      renderTask = page.render({
        canvasContext: ctx,
        viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
      })

      try {
        await renderTask.promise
        if (!cancelled) onViewport?.(viewport)
      } catch (err) {
        // RenderingCancelledException is expected when we supersede a render.
        if (err?.name !== 'RenderingCancelledException') throw err
      }
    })()

    return () => {
      cancelled = true
      renderTask?.cancel()
    }
  }, [pdf, pageNumber, scale, onViewport])

  return <canvas ref={canvasRef} className="pdf-canvas" />
}
