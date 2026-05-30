import { useEffect, useState } from 'react'
import TopBar from './components/TopBar.jsx'
import ThumbnailRail from './components/ThumbnailRail.jsx'
import PdfViewer from './components/PdfViewer.jsx'
import EntityPanel from './components/EntityPanel.jsx'
import { usePdfDocument } from './hooks/usePdfDocument.js'

const ZOOM_STEP = 0.2
const ZOOM_MIN = 0.5
const ZOOM_MAX = 3

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

/**
 * App — owns the top-level state and lays out the three panels.
 *
 * State here is the single source of truth the panels read from:
 *   file        → the chosen File (drives loading via usePdfDocument)
 *   currentPage → which page the viewer + rail consider active
 *   zoom        → render scale multiplier (1 = 100%)
 * Document status/pdf/numPages come from the usePdfDocument hook.
 */
export default function App() {
  const [file, setFile] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(1)

  const { status, pdf, numPages, error } = usePdfDocument(file)

  // Whenever a new document loads, snap back to page 1.
  useEffect(() => {
    if (pdf) setCurrentPage(1)
  }, [pdf])

  function handleFile(f) {
    if (!f || f.type !== 'application/pdf') return
    setFile(f)
  }

  const goToPage = (n) => setCurrentPage(clamp(n, 1, numPages || 1))
  const zoomIn = () => setZoom((z) => clamp(+(z + ZOOM_STEP).toFixed(2), ZOOM_MIN, ZOOM_MAX))
  const zoomOut = () => setZoom((z) => clamp(+(z - ZOOM_STEP).toFixed(2), ZOOM_MIN, ZOOM_MAX))

  return (
    <div className="rm rm-clarity">
      <TopBar status={status} fileName={file?.name} onFile={handleFile} />
      <div className="rm-body">
        <ThumbnailRail
          status={status}
          pdf={pdf}
          numPages={numPages}
          currentPage={currentPage}
          onSelectPage={goToPage}
        />
        <PdfViewer
          status={status}
          error={error}
          pdf={pdf}
          numPages={numPages}
          currentPage={currentPage}
          zoom={zoom}
          onFile={handleFile}
          onPrev={() => goToPage(currentPage - 1)}
          onNext={() => goToPage(currentPage + 1)}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
        />
        <EntityPanel status={status} />
      </div>
    </div>
  )
}
