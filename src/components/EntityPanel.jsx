import { IconLayers } from './icons.jsx'
import EntitySection from './EntitySection.jsx'

/**
 * EntityPanel — right panel. Splits the flat entity list into Dates and Names
 * sections with count badges. Handles the empty (no doc), scanning, and
 * nothing-found states. Selection is owned by App so the list and the (Step 4)
 * page highlights stay in sync.
 */
export default function EntityPanel({ status, entities, extracting, selectedId, onSelectEntity, redactedIds, onToggleRedact }) {
  if (status === 'empty') {
    return (
      <aside className="ents">
        <div className="ents-head"><span>Entities</span></div>
        <div className="ents-empty">
          <span className="ents-empty-ico"><IconLayers /></span>
          Dates and names will appear here once a document is loaded.
        </div>
      </aside>
    )
  }

  const dates = entities.filter((e) => e.type === 'date')
  const names = entities.filter((e) => e.type === 'name')

  return (
    <aside className="ents">
      <div className="ents-head">
        <span>Entities</span>
        {!extracting && <span className="ents-total">{entities.length}</span>}
      </div>

      {extracting ? (
        <div className="ents-empty">Scanning document…</div>
      ) : entities.length === 0 ? (
        <div className="ents-empty">
          <span className="ents-empty-ico"><IconLayers /></span>
          No dates or names detected in this document.
        </div>
      ) : (
        <>
          <div className="ents-scroll">
            <EntitySection type="date" label="Dates" items={dates} selectedId={selectedId} onSelectEntity={onSelectEntity} redactedIds={redactedIds} onToggleRedact={onToggleRedact} />
            <EntitySection type="name" label="Names" items={names} selectedId={selectedId} onSelectEntity={onSelectEntity} redactedIds={redactedIds} onToggleRedact={onToggleRedact} />
          </div>
          <div className="kbd-bar">
            <span className="kbd-hint"><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
            <span className="kbd-hint"><span className="kbd">↵</span> jump</span>
            <span className="kbd-hint"><span className="kbd">R</span> redact</span>
          </div>
        </>
      )}
    </aside>
  )
}
