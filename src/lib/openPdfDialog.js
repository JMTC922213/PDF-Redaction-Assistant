/**
 * Opens the native file picker (PDF only) and invokes `onFile` with the chosen
 * File. Used by both the top-bar "Upload PDF" button and the dropzone, so the
 * picker logic lives in one place. Creates a transient <input> so no hidden
 * element needs to live in the DOM.
 */
export function openPdfDialog(onFile) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/pdf'
  input.addEventListener('change', () => {
    const file = input.files?.[0]
    if (file) onFile(file)
  })
  input.click()
}
