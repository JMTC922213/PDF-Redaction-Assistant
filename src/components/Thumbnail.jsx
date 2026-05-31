import { useEffect, useRef } from 'react'

const THUMB_WIDTH = 130 // CSS px; the rail is 168px wide minus padding

/**
 * Thumbnail — a small rendered preview of one page. Renders the page at a scale
 * chosen so its width lands at THUMB_WIDTH. Clicking jumps the viewer to it; the
 * active page is styled via the `active` class on the wrapper.
 */
export default function Thumbnail({ pdf, pageNumber, active, hasDate, hasName, onSelect }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let renderTask = null

    ;(async () => {
      const page = await pdf.getPage(pageNumber)
      if (cancelled) return

      const unscaled = page.getViewport({ scale: 1 })
      const scale = THUMB_WIDTH / unscaled.width
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
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') throw err
      }
    })()

    return () => {
      cancelled = true
      renderTask?.cancel()
    }
  }, [pdf, pageNumber])

  return (
    <button
      type="button"
      className={'thumb' + (active ? ' is-active' : '')}
      onClick={onSelect}
      aria-label={`Go to page ${pageNumber}`}
      aria-current={active ? 'true' : undefined}
    >
      <div className="thumb-sheet">
        <canvas ref={canvasRef} />
        {(hasDate || hasName) && (
          <div className="tdots">
            {hasDate && <span className="tdot tdot-date" />}
            {hasName && <span className="tdot tdot-name" />}
          </div>
        )}
      </div>
      <div className="thumb-no">{pageNumber}</div>
    </button>
  )
}
