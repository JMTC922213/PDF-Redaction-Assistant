import { IconLayers } from './icons.jsx'

/**
 * EntityPanel — right panel. Lists detected dates and names grouped into
 * collapsible sections once extraction has run; an empty-state placeholder
 * otherwise. Sections, counts, filtering, and rows arrive in step 3.
 */
export default function EntityPanel({ status }) {
  return (
    <aside className="ents">
      <div className="ents-head">
        <span>Entities</span>
      </div>
      {status === 'empty' ? (
        <div className="ents-empty">
          <span className="ents-empty-ico"><IconLayers /></span>
          Dates and names will appear here once a document is loaded.
        </div>
      ) : (
        <div>{/* entity sections rendered in step 3 */}</div>
      )}
    </aside>
  )
}
