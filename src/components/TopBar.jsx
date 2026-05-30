import { openPdfDialog } from '../lib/openPdfDialog.js'
import { IconShield, IconFile, IconSearch } from './icons.jsx'

/**
 * TopBar — brand, loaded-file chip, search bar, and primary actions.
 * Search and Export only appear once a document is loaded.
 */
export default function TopBar({ status, fileName, onFile }) {
  const ready = status === 'ready'

  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo"><IconShield /></span>
        <span className="brand-name">Redactor</span>
      </div>

      {fileName && (
        <div className="file-chip" title={fileName}>
          <span className="file-ico"><IconFile /></span>
          {fileName}
        </div>
      )}

      {ready && (
        <div className="searchbar">
          <span className="search-ico"><IconSearch /></span>
          <input type="text" placeholder="Search document…" aria-label="Search document" />
        </div>
      )}

      <div className="topbar-actions">
        <button className="btn btn-ghost" disabled={!ready}>
          Export PDF
        </button>
        <button className="btn btn-primary" onClick={() => openPdfDialog(onFile)}>
          Upload PDF
        </button>
      </div>
    </header>
  )
}
