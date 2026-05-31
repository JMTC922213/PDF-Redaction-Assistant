import Highlight from './Highlight.jsx'
import { mapMatchToRects } from '../lib/mapMatchToRects.js'

/**
 * HighlightLayer — a transparent overlay sized to exactly match the rendered
 * page, holding one box per detected entity on the current page. Sits as a
 * sibling of the canvas inside the (position:relative) sheet.
 *
 * Every entity on the page is highlighted (so a reviewer sees everything at
 * once); the selected one is emphasised. Boxes are recomputed from the live
 * viewport, so they stay aligned through zoom and page changes.
 */
export default function HighlightLayer({
  viewport, model, entities, selectedId, onSelectEntity,
  searchMatches = [], activeSearchId,
}) {
  if (!viewport || !model) return null

  return (
    <div className="hl-layer" style={{ width: viewport.width, height: viewport.height }}>
      {entities.flatMap((e) =>
        mapMatchToRects(model, e.range, viewport).map((rect, i) => (
          <Highlight
            key={`${e.id}-${i}`}
            rect={rect}
            type={e.type}
            selected={e.id === selectedId}
            low={e.confidence === 'low'}
            onSelect={() => onSelectEntity(e)}
          />
        )),
      )}

      {searchMatches.flatMap((m) =>
        mapMatchToRects(model, m.range, viewport).map((rect, i) => (
          <Highlight
            key={`${m.id}-${i}`}
            rect={rect}
            type="search"
            selected={m.id === activeSearchId}
          />
        )),
      )}
    </div>
  )
}
