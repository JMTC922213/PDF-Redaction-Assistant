import { openPdfDialog } from '../lib/openPdfDialog.js'
import { IconShield, IconFile, IconSearch } from './icons.jsx'

/**
 * TopBar — brand, loaded-file chip, search bar, and primary actions.
 * Search and Export only appear once a document is loaded.
 */
export default function TopBar({
  status, fileName, onFile,
  searchTerm, onSearchChange, matchCount, activeIndex, onNextMatch, onPrevMatch,
  onExport, exporting, redactionCount,
}) {
  const ready = status === 'ready'

  function handleSearchKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.shiftKey ? onPrevMatch() : onNextMatch()
    }
  }

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
        <div className={'searchbar' + (searchTerm ? ' is-active' : '')}>
          <span className="search-ico"><IconSearch /></span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKey}
            placeholder="Search document…"
            aria-label="Search document"
          />
          {searchTerm.trim().length >= 2 && (
            <span className="search-count" title="Enter: next · Shift+Enter: previous">
              {matchCount ? activeIndex + 1 : 0} / {matchCount}
            </span>
          )}
        </div>
      )}

      <div className="topbar-actions">
        <button className="btn btn-ghost" disabled={!ready || exporting} onClick={onExport}>
          {exporting ? 'Exporting…' : redactionCount ? `Export PDF (${redactionCount})` : 'Export PDF'}
        </button>
        <button className="btn btn-primary" onClick={() => openPdfDialog(onFile)}>
          Upload PDF
        </button>
      </div>
    </header>
  )
}
