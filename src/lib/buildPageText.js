/**
 * buildPageText(textContent)
 *
 * Turns a pdf.js page's text content into a single searchable string plus an
 * index that remembers where every text fragment lives.
 *
 * pdf.js returns text as many small "items" (fragments), each with its own
 * position. We concatenate their strings into one page string so regexes can
 * run across the whole page, while recording for each item the [start, end)
 * character range it occupies in that string and its geometry (transform,
 * width, height) in PDF space. Step 4's highlight mapper uses that index to
 * turn a regex match's character range back into on-page rectangles.
 *
 * A separator (newline at an end-of-line, otherwise a space) is inserted
 * between items so adjacent fragments don't fuse into one word. The separator
 * characters belong to no item, so a match never maps onto them.
 */
export function buildPageText(textContent) {
  let text = ''
  const items = []

  for (const item of textContent.items) {
    const str = item.str ?? ''
    const start = text.length
    text += str
    const end = text.length

    items.push({
      str,
      start,
      end,
      transform: item.transform, // [a, b, c, d, e, f] in PDF user space
      width: item.width,
      height: item.height,
    })

    text += item.hasEOL ? '\n' : ' '
  }

  return { text, items }
}
