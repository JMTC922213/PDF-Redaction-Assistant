import { useState } from 'react'
import { openPdfDialog } from '../lib/openPdfDialog.js'
import { IconUpload } from './icons.jsx'

/**
 * PdfViewer — centre panel. In the empty state it shows the dropzone
 * (click-to-browse + drag-and-drop). The rendered PDF canvas, highlight
 * overlays, and viewer toolbar are wired in later steps.
 */
export default function PdfViewer({ status, onFile }) {
  const [dragging, setDragging] = useState(false)

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
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
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

  // Loaded states are built in later steps.
  return (
    <main className="viewer">
      <div className="viewer-toolbar" />
      <div className="viewer-canvas" />
    </main>
  )
}
