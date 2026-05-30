// Central pdf.js setup. pdf.js does its parsing on a Web Worker; under Vite we
// point it at the bundled worker file via the `?url` import so it ships with the
// build (no CDN, keeping everything offline / client-side per the brief).
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export { pdfjsLib }
