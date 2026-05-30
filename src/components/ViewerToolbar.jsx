import { IconChevronLeft, IconChevronRight, IconMinus, IconPlus } from './icons.jsx'

/**
 * ViewerToolbar — page steppers (left), zoom controls (right). The centre
 * Review|Redact toggle is added in the redaction step.
 *
 * It's a "dumb" control bar: it never holds state, it just calls the handlers
 * App gives it. App owns currentPage/zoom so the rail and canvas stay in sync.
 */
export default function ViewerToolbar({ currentPage, numPages, zoom, onPrev, onNext, onZoomOut, onZoomIn }) {
  const pct = Math.round(zoom * 100)
  return (
    <div className="viewer-toolbar">
      <div className="vt-left">
        <button className="vt-btn" onClick={onPrev} disabled={currentPage <= 1} aria-label="Previous page">
          <IconChevronLeft />
        </button>
        <span className="vt-page">Page {currentPage} / {numPages}</span>
        <button className="vt-btn" onClick={onNext} disabled={currentPage >= numPages} aria-label="Next page">
          <IconChevronRight />
        </button>
      </div>

      <div className="vt-right">
        <button className="vt-btn" onClick={onZoomOut} disabled={zoom <= 0.5} aria-label="Zoom out">
          <IconMinus />
        </button>
        <span className="vt-zoom">{pct}%</span>
        <button className="vt-btn" onClick={onZoomIn} disabled={zoom >= 3} aria-label="Zoom in">
          <IconPlus />
        </button>
      </div>
    </div>
  )
}
