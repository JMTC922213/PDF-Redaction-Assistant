import { useEffect, useRef } from 'react'

/**
 * EntityRow — one detected entity. Shows a type swatch, the matched text, and
 * the page badge. Low-confidence names render muted with a hollow swatch.
 * Redacted entities show a struck-through label + a "REDACTED" tag (click to
 * restore); others reveal a "Redact" action on hover.
 */
export default function EntityRow({ entity, active, redacted, onSelect, onToggleRedact }) {
  const ref = useRef(null)
  const swatch = entity.type === 'date' ? 'swatch-date' : 'swatch-name'
  const low = entity.confidence === 'low'

  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const toggle = (e) => {
    e.stopPropagation()
    onToggleRedact()
  }

  return (
    <button
      ref={ref}
      type="button"
      className={
        'ent-row' + (active ? ' is-active' : '') + (low ? ' is-low' : '') + (redacted ? ' is-redacted' : '')
      }
      onClick={onSelect}
      aria-current={active ? 'true' : undefined}
      title={low ? 'Low-confidence match — verify before redacting' : undefined}
    >
      <span className={'swatch ' + swatch} />
      <span className="ent-text">{entity.text}</span>
      {redacted ? (
        <span className="ent-tag" role="button" onClick={toggle} title="Click to restore">REDACTED</span>
      ) : (
        <>
          <span className="ent-page">p.{entity.page}</span>
          <span className="ent-redact-btn" role="button" onClick={toggle}>Redact</span>
        </>
      )}
    </button>
  )
}
