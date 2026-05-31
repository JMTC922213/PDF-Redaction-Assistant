/**
 * HighlightPopover — the small action card under a selected highlight.
 * Redact (toggle), Jump (re-centre), Copy (text to clipboard).
 * Stops click propagation so its buttons don't re-trigger the highlight itself.
 */
export default function HighlightPopover({ text, onRedact, onJump }) {
  return (
    <div className="hl-pop" onClick={(e) => e.stopPropagation()}>
      <button className="pop-redact" onClick={onRedact}>
        <span className="pop-ico">■</span> Redact
      </button>
      <button onClick={onJump}>
        <span className="pop-ico">↧</span> Jump
      </button>
      <button onClick={() => navigator.clipboard?.writeText(text)}>
        <span className="pop-ico">⧉</span> Copy
      </button>
    </div>
  )
}
