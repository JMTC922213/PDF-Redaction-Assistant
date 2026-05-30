/**
 * ThumbnailRail — left panel. Shows a page thumbnail strip once a document is
 * loaded; an empty-state placeholder otherwise. Thumbnails arrive in step 2.
 */
export default function ThumbnailRail({ status }) {
  return (
    <aside className="rail">
      <div className="rail-head">Pages</div>
      {status === 'empty' ? (
        <div className="rail-empty">No document loaded</div>
      ) : (
        <div className="thumb-list">{/* thumbnails rendered in step 2 */}</div>
      )}
    </aside>
  )
}
