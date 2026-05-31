import { useState } from 'react'
import { openPdfDialog } from '../lib/openPdfDialog.js'
import { IconUpload } from './icons.jsx'
import ViewerToolbar from './ViewerToolbar.jsx'
import PageCanvas from './PageCanvas.jsx'
import HighlightLayer from './HighlightLayer.jsx'

/**
 * PdfViewer — centre panel. Switches on `status`:
 *   empty   → dropzone (click + drag-and-drop)
 *   loading → skeleton sheet
 *   error   → friendly message
 *   ready   → toolbar + rendered page
 */
export default function PdfViewer({
  status, error, pdf, numPages, currentPage, zoom,
  entities, pageModels, selectedId, onSelectEntity,
  onFile, onPrev, onNext, onZoomIn, onZoomOut,
}) {
  const [dragging, setDragging] = useState(false)
  // The live viewport of the rendered page; reported by PageCanvas after each
  // render. Highlights are computed against it so they track zoom/page changes.
  const [viewport, setViewport] = useState(null)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  if (status === 'empty') {
    return (
      <main className="viewer">
        <div className="viewer-toolbar">
          <div className="vt-left">
            <span className="vt-page" style={{ opacity: 0.5 }}>No file</span>
          </div>
        </div>
        <div className="viewer-canvas is-upload">
          <div
            className={'dropzone' + (dragging ? ' is-dragging' : '')}
            role="button"
            tabIndex={0}
            onClick={() => openPdfDialog(onFile)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPdfDialog(onFile)}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className="dz-ico"><IconUpload /></div>
            <div className="dz-title">Drop a PDF to begin</div>
            <div className="dz-sub">or click to browse — everything runs locally in your browser.</div>
            <span className="dz-btn">Choose file</span>
            <div className="dz-formats">.PDF · UP TO 50 MB · NOTHING LEAVES THIS DEVICE</div>
          </div>
        </div>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="viewer">
        <div className="viewer-toolbar" />
        <div className="viewer-canvas is-upload">
          <div className="dropzone" style={{ cursor: 'default' }}>
            <div className="dz-title">Couldn’t open that PDF</div>
            <div className="dz-sub">{error || 'The file may be corrupt or password-protected.'}</div>
            <button className="btn btn-primary" onClick={() => openPdfDialog(onFile)}>Choose another file</button>
          </div>
        </div>
      </main>
    )
  }

  if (status === 'loading') {
    return (
      <main className="viewer">
        <div className="viewer-toolbar" />
        <div className="viewer-canvas">
          <div className="sheet skel" style={{ width: 560, height: 720 }} />
        </div>
      </main>
    )
  }

  // ready
  return (
    <main className="viewer">
      <ViewerToolbar
        currentPage={currentPage}
        numPages={numPages}
        zoom={zoom}
        onPrev={onPrev}
        onNext={onNext}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
      />
      <div className="viewer-canvas">
        <div className="sheet">
          <PageCanvas pdf={pdf} pageNumber={currentPage} scale={zoom} onViewport={setViewport} />
          <HighlightLayer
            viewport={viewport}
            model={pageModels[currentPage]}
            entities={entities.filter((e) => e.page === currentPage)}
            selectedId={selectedId}
            onSelectEntity={onSelectEntity}
          />
        </div>
      </div>
    </main>
  )
}
