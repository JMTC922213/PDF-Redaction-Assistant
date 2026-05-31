// Generates samples/sample-contract.pdf — a 3-page mock agreement that exercises
// every supported date format plus high- and low-confidence names. Run with:
//   node scripts/make-sample-pdf.mjs
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { writeFileSync } from 'node:fs'

const doc = await PDFDocument.create()
const font = await doc.embedFont(StandardFonts.Helvetica)
const bold = await doc.embedFont(StandardFonts.HelveticaBold)

const PAGES = [
  {
    title: 'EMPLOYMENT AGREEMENT',
    sub: 'Northgate Holdings Ltd. — Confidential',
    body: [
      'This Agreement is entered into on 12 January 2024 between John Smith',
      '(the "Employee") and Northgate Holdings Ltd., a company incorporated',
      'under the laws of England and Wales (the "Company").',
      '',
      'The Employee shall report directly to Alice Wong, Head of Operations,',
      'commencing no later than 3 February 2024. The probationary period',
      'shall extend for ninety (90) days from the commencement date.',
    ],
  },
  {
    title: 'SCHEDULE A — COMPENSATION',
    sub: 'Reviewed 28/02/2024',
    body: [
      'Base salary shall be reviewed annually. The first review is scheduled',
      'for 03-Feb-2024 and conducted by Mary O’Brien of the People team.',
      '',
      'All notices under this Agreement shall be delivered to the registered',
      'office. Either party may terminate with thirty (30) days written notice.',
    ],
  },
  {
    title: 'APPENDIX — SIGNATORIES',
    sub: 'Effective 2024-03-15',
    body: [
      'Signed on April 2, 2024 by the authorised representatives below.',
      '',
      'For the Company: Raymond Patel, Director.',
      'Witnessed by: Dana Whitfield.',
    ],
  },
]

for (const p of PAGES) {
  const page = doc.addPage([595, 842]) // A4 in points
  const { height } = page.getSize()
  let y = height - 70

  page.drawText(p.title, { x: 56, y, size: 18, font: bold, color: rgb(0.1, 0.1, 0.1) })
  y -= 22
  page.drawText(p.sub, { x: 56, y, size: 10, font, color: rgb(0.5, 0.5, 0.5) })
  y -= 36

  for (const line of p.body) {
    if (line) page.drawText(line, { x: 56, y, size: 12, font, color: rgb(0.15, 0.15, 0.15) })
    y -= 22
  }

  page.drawText(`Page ${PAGES.indexOf(p) + 1} of ${PAGES.length}  ·  NH-2024-0117`, {
    x: 56, y: 50, size: 8, font, color: rgb(0.6, 0.6, 0.6),
  })
}

const bytes = await doc.save()
writeFileSync('samples/sample-contract.pdf', bytes)
console.log('Wrote samples/sample-contract.pdf')
