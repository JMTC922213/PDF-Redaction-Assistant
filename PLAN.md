# Redactor — Build Plan

A working document for the PDF Redaction Assistant (Option B take-home). Captures
the locked decisions, architecture, state model, and the step-by-step build order.
Updated as steps complete.

---

## 1. What we're building

A **fully client-side, three-panel** web app: upload a PDF → auto-detect **dates**
and **person names** in its text → overlay semi-transparent highlights on a live
pdf.js viewer → let a reviewer jump between entities, search, and **redact + export**
a truly blacked-out PDF. No backend, no network calls at runtime.

Runs in two commands: `npm install && npm run dev`.

### Assessment weighting (drives where we invest)
| Area | Weight |
|---|---|
| Code Quality & Structure (incl. commit history) | 30% |
| UI / UX Design | 30% |
| Problem Decomposition (README, data model, architecture) | 25% |
| Functionality & Correctness | 15% |

55% is design + reasoning → the README and clean architecture matter as much as the code.

---

## 2. Locked decisions

- **Stack:** React + Vite, fully client-side. Inline SVG icons (no icon library).
- **Design:** "Clarity" light theme, Landing Edition — ported verbatim from the
  design handoff (tokens, spacing, radii, Public Sans + IBM Plex Mono). Three states:
  empty/upload → loading → review → (redact mode).
- **Rendering:** pdf.js (Mozilla) for page render + `getTextContent()`.
- **Date extraction:** regex set covering the brief's required formats.
- **Name extraction:** **pure regex + stop-list** (no compromise.js) with
  **confidence tiers** — high-confidence = solid highlight, low-confidence =
  dashed/dimmed and easily dismissed. Directly answers the brief's "handle false
  positives gracefully" grading note.
- **Redaction export:** **rasterize redacted pages** (render page → paint opaque
  boxes → embed as image) so no recoverable text survives under a redaction.
  Untouched pages stay as-is. Deliberate trade-off: redacted pages lose
  text-selectability, in exchange for *real* redaction. Documented in README.
- **Workflow:** build one step at a time; user reviews + commits manually after each.
  A commit message is provided per step.

---

## 3. The three engineering bets (where this stands out)

1. **match → rect mapper (the technical differentiator).**
   `getTextContent()` returns text *fragments*; a detected entity often spans
   several fragments or part of one. Per page we concatenate fragment strings into
   one page string while recording each fragment's `[startOffset, endOffset,
   transform, width, height]`. Regex runs on the page string → char ranges → map
   back to overlapping fragments → emit one (merged) rect per fragment, with the
   **y-axis flip** via `viewport.convertToViewportPoint`. Gets pixel-accurate,
   multi-fragment highlights right where most submissions break.

2. **Confidence-tiered name extraction** — see locked decisions. Turns the
   regex's inherent imprecision into a visible, reviewer-friendly feature.

3. **Real redaction on export** — see locked decisions. Domain insight: a black box
   drawn over text in a vector PDF leaves the text extractable underneath, which is
   a genuine privacy failure for a tool literally called a Redaction Assistant.

---

## 4. Architecture

### Component tree
```
App                              ← owns top-level state, lays out panels
├─ TopBar                        ← brand · file chip · SearchBar · Upload/Export
├─ ThumbnailRail                 ← page thumbnails (active page highlighted)
│  └─ Thumbnail
├─ PdfViewer                     ← ViewerToolbar · PageCanvas · HighlightLayer
│  ├─ ViewerToolbar              ← page steppers · Review|Redact toggle · zoom
│  ├─ PageCanvas                 ← pdf.js canvas render
│  └─ HighlightLayer             ← absolutely-positioned overlay boxes
│     ├─ Highlight
│     └─ HighlightPopover        ← Redact · Jump · Copy
└─ EntityPanel
   ├─ EntitySection (Dates, Names) ← chevron · swatch · count badge · filter
   │  └─ EntityRow                 ← text · page badge · active/redacted states
   └─ KeyboardHints

lib/  pdf.js loading, text-model builder, extractDates, extractNames, mapMatchToRects, redactExport
hooks/ usePdfDocument, useEntities, useKeyboardNav
```

### State model
```
status:      'empty' | 'loading' | 'ready' | 'error'
doc:         { name, numPages, pdfProxy } | null
pages:       { [n]: { viewport, textItems[], pageString, offsets[] } }   // cached
entities:    Entity[]                                                    // flat, all pages
             Entity = { id, type:'date'|'name', text, normalized?, page,
                        rects: {x,y,w,h}[], confidence:'high'|'low', redacted:boolean }
currentPage: number
selectedId:  string | null            // active entity → drives highlight + list
expanded:    { dates: boolean, names: boolean }
mode:        'review' | 'redact'
search:      { term, matches: Match[], index }
zoom:        number
```
Derived selectors: `entitiesOnPage(n)`, `byType`, `selectedEntity`, `counts`.

---

## 5. Build order (one commit per step)

- [x] **Step 1 — Scaffold + design system + empty/upload shell.**
      Vite+React, ported Clarity CSS, three-panel shell, dropzone (click +
      drag-drop), status state machine. *Verified: build + dev server OK.*
      `chore: scaffold Vite + React app with Clarity design system`

- [ ] **Step 2 — pdf.js load → render pages to canvas + thumbnail rail + nav/zoom.**
      `usePdfDocument` hook, worker setup, page render, thumbnail strip with active
      page, page steppers + zoom controls, loading state.

- [ ] **Step 3 — text model + date/name extractors + entity panel.**
      Per-page text model (string + offsets), `extractDates`/`extractNames` with
      stop-list + confidence, entity sections with counts/toggles/filter.

- [ ] **Step 4 — match→rect mapper + highlight overlays + entity click.**
      The y-flip coordinate mapping, HighlightLayer, click entity → jump + select +
      pulse, multi-highlight, thumbnail entity dots.

- [ ] **Step 5 — polish: keyboard nav, search, active states, loading/error.**
      `useKeyboardNav` (↑/↓/↵/R), document-wide search with match navigation.

- [ ] **Step 6 — stretch: redaction mode + pdf-lib rasterized export.**
      Redact-mode click behavior, popover actions, secure export.

- [ ] **Step 7 — README + sample multi-page test PDF + screenshots.**
      Setup, extraction approach with pattern examples, state model, known limits.

---

## 6. Known risks / things to watch

- pdf.js worker config under Vite (use the bundled worker via `?url` import).
- Highlight overlay must re-compute on zoom + stay pixel-aligned to the canvas.
- Justified text / ligatures can make fragment widths imperfect — acceptable per brief.
- Rasterized export increases file size on redacted pages — documented trade-off.
- Repo hygiene: decide whether the task brief `.docx` and `design_handoff/` folder
  belong in the submitted repo (suggest a `/design` folder or exclude).
