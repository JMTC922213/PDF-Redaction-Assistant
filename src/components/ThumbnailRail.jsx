import Thumbnail from './Thumbnail.jsx'

/**
 * ThumbnailRail — left panel. Renders one Thumbnail per page once the document
 * is ready; a skeleton strip while loading; an empty-state placeholder otherwise.
 */
export default function ThumbnailRail({ status, pdf, numPages, currentPage, onSelectPage }) {
  return (
    <aside className="rail">
      <div className="rail-head">Pages</div>

      {status === 'empty' && <div className="rail-empty">No document loaded</div>}

      {status === 'loading' && (
        <div className="thumb-list">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="thumb">
              <div className="thumb-sheet skel" style={{ aspectRatio: '1 / 1.3' }} />
            </div>
          ))}
        </div>
      )}

      {status === 'ready' && pdf && (
        <div className="thumb-list">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
            <Thumbnail
              key={n}
              pdf={pdf}
              pageNumber={n}
              active={n === currentPage}
              onSelect={() => onSelectPage(n)}
            />
          ))}
        </div>
      )}
    </aside>
  )
}
