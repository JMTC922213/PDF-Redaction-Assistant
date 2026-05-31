/**
 * EntityRow — one detected entity in the list. Shows a type swatch, the matched
 * text, and the page it's on. Low-confidence names render with a hollow swatch +
 * muted text and a tooltip, so a reviewer can tell at a glance which matches to
 * double-check before redacting. The active row is highlighted via `is-active`.
 */
export default function EntityRow({ entity, active, onSelect }) {
  const swatch = entity.type === 'date' ? 'swatch-date' : 'swatch-name'
  const low = entity.confidence === 'low'

  return (
    <button
      type="button"
      className={'ent-row' + (active ? ' is-active' : '') + (low ? ' is-low' : '')}
      onClick={onSelect}
      aria-current={active ? 'true' : undefined}
      title={low ? 'Low-confidence match — verify before redacting' : undefined}
    >
      <span className={'swatch ' + swatch} />
      <span className="ent-text">{entity.text}</span>
      <span className="ent-page">p.{entity.page}</span>
    </button>
  )
}
