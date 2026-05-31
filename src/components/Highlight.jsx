import { useEffect, useRef } from 'react'
import HighlightPopover from './HighlightPopover.jsx'

/**
 * Highlight — one absolutely-positioned overlay box over a detected entity (or
 * a search hit). Colour comes from the type; low-confidence names render as a
 * dashed outline; redacted entities render as a solid black "REDACTED" bar.
 * The selected entity gets a ring, a one-shot pulse, scrolls into view, and
 * shows the action popover.
 */
export default function Highlight({
  rect, type, selected, low, redacted, showPopover, text, onSelect, onRedact,
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [selected])

  const cls =
    'hl hl-' + type +
    (selected ? ' is-selected' : '') +
    (low ? ' is-low' : '') +
    (redacted ? ' is-redacted' : '')

  return (
    <div
      ref={ref}
      className={cls}
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
      onClick={onSelect}
    >
      {selected && showPopover && !redacted && (
        <HighlightPopover
          text={text}
          onRedact={onRedact}
          onJump={() => ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })}
        />
      )}
    </div>
  )
}
