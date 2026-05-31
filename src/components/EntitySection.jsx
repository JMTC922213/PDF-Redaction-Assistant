import { useState } from 'react'
import { IconChevron, IconSearch } from './icons.jsx'
import EntityRow from './EntityRow.jsx'

/**
 * EntitySection — a collapsible group (Dates or Names) with a count badge, an
 * optional text filter (shown only when the list is long enough to need it),
 * and the list of rows.
 *
 * Owns its own `open` and `filter` state because those are purely local view
 * concerns — App doesn't need to know whether a section is expanded.
 */
export default function EntitySection({ type, label, items, selectedId, onSelectEntity }) {
  const [open, setOpen] = useState(true)
  const [filter, setFilter] = useState('')

  const swatch = type === 'date' ? 'swatch-date' : 'swatch-name'
  const q = filter.trim().toLowerCase()
  const filtered = q ? items.filter((e) => e.text.toLowerCase().includes(q)) : items

  return (
    <div className="ent-section">
      <button className="ent-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="chev"><IconChevron open={open} /></span>
        <span className={'swatch ' + swatch} />
        <span className="ent-label">{label}</span>
        <span className="ent-count is-badge">{items.length}</span>
      </button>

      {open && (
        <>
          {items.length > 6 && (
            <div className="ent-filter">
              <IconSearch size={14} />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={`Filter ${label.toLowerCase()}…`}
                aria-label={`Filter ${label.toLowerCase()}`}
              />
            </div>
          )}

          <div className="ent-body">
            {filtered.map((e) => (
              <EntityRow
                key={e.id}
                entity={e}
                active={e.id === selectedId}
                onSelect={() => onSelectEntity(e)}
              />
            ))}
            {filtered.length === 0 && <div className="ent-empty-row">No matches</div>}
          </div>
        </>
      )}
    </div>
  )
}
