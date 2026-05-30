import { useState } from 'react'
import TopBar from './components/TopBar.jsx'
import ThumbnailRail from './components/ThumbnailRail.jsx'
import PdfViewer from './components/PdfViewer.jsx'
import EntityPanel from './components/EntityPanel.jsx'

/**
 * App — owns the top-level application state and lays out the three panels.
 *
 * Status drives which "screen" the shell shows:
 *   empty   → upload / dropzone
 *   loading → skeletons while pdf.js parses (wired in a later step)
 *   ready   → document + entities
 *   error   → friendly failure message
 *
 * For this step the shell is static at `empty`; uploading a file only captures
 * its name. pdf.js rendering and entity extraction arrive in the next steps.
 */
export default function App() {
  const [status, setStatus] = useState('empty')
  const [fileName, setFileName] = useState(null)

  function handleFile(file) {
    if (!file || file.type !== 'application/pdf') return
    setFileName(file.name)
    // TODO(step 2): hand the File to pdf.js via usePdfDocument and flip status.
  }

  return (
    <div className="rm rm-clarity">
      <TopBar status={status} fileName={fileName} onFile={handleFile} />
      <div className="rm-body">
        <ThumbnailRail status={status} />
        <PdfViewer status={status} onFile={handleFile} />
        <EntityPanel status={status} />
      </div>
    </div>
  )
}
