import { useEffect } from 'react'

/**
 * useKeyboardNav — global keyboard shortcuts for moving through the entity list:
 *   ↑ / ↓  select previous / next entity (which also jumps to its page)
 *   ↵      re-select the current entity (re-centre it)
 *   R      redact the current entity (handler wired in the redaction step)
 *
 * Ignores keystrokes while a text field is focused, so typing in the search box
 * doesn't move the selection.
 */
export function useKeyboardNav({ entities, selectedId, onSelect, onRedact }) {
  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (!entities.length) return

      const idx = entities.findIndex((en) => en.id === selectedId)

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        onSelect(entities[idx < 0 ? 0 : Math.min(entities.length - 1, idx + 1)])
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        onSelect(entities[idx < 0 ? entities.length - 1 : Math.max(0, idx - 1)])
      } else if (e.key === 'Enter') {
        if (idx >= 0) onSelect(entities[idx])
      } else if ((e.key === 'r' || e.key === 'R') && idx >= 0) {
        onRedact?.(entities[idx])
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entities, selectedId, onSelect, onRedact])
}
