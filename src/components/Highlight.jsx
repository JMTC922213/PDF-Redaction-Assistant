import { useEffect, useRef } from 'react'

/**
 * Highlight — one absolutely-positioned overlay box over a detected entity.
 * Colour comes from the type (date/name); low-confidence names render as a
 * dashed outline. The selected highlight gets a ring + a one-shot pulse and
 * scrolls itself into view when it becomes selected.
 */
export default function Highlight({ rect, type, selected, low, onSelect }) {
  const ref = useRef(null)

  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [selected])

  const cls =
    'hl hl-' + type + (selected ? ' is-selected' : '') + (low ? ' is-low' : '')

  return (
    <div
      ref={ref}
      className={cls}
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
      onClick={onSelect}
    />
  )
}
