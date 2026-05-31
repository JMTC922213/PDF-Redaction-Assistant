import { useEffect, useState } from 'react'
import TopBar from './components/TopBar.jsx'
import ThumbnailRail from './components/ThumbnailRail.jsx'
import PdfViewer from './components/PdfViewer.jsx'
import EntityPanel from './components/EntityPanel.jsx'
import { usePdfDocument } from './hooks/usePdfDocument.js'
import { useEntities } from './hooks/useEntities.js'

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
  const [selectedId, setSelectedId] = useState(null)

  const { status, pdf, numPages, error } = usePdfDocument(file)
  const { entities, pageModels, extracting } = useEntities(pdf, numPages)

  // Whenever a new document loads, snap back to page 1 and clear any selection.
  useEffect(() => {
    if (pdf) {
      setCurrentPage(1)
      setSelectedId(null)
    }
  }, [pdf])

  function handleFile(f) {
    if (!f || f.type !== 'application/pdf') return
    setFile(f)
  }

  // Clicking an entity selects it and jumps to its page. The on-page highlight
  // box is added in Step 4 (needs the match→rect mapper).
  function selectEntity(entity) {
    setSelectedId(entity.id)
    setCurrentPage(entity.page)
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
          entities={entities}
          onSelectPage={goToPage}
        />
        <PdfViewer
          status={status}
          error={error}
          pdf={pdf}
          numPages={numPages}
          currentPage={currentPage}
          zoom={zoom}
          entities={entities}
          pageModels={pageModels}
          selectedId={selectedId}
          onSelectEntity={selectEntity}
          onFile={handleFile}
          onPrev={() => goToPage(currentPage - 1)}
          onNext={() => goToPage(currentPage + 1)}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
        />
        <EntityPanel
          status={status}
          entities={entities}
          extracting={extracting}
          selectedId={selectedId}
          onSelectEntity={selectEntity}
        />
      </div>
    </div>
  )
}
