import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

// Extract plain text from the first `maxPages` pages of a PDF File (client-side).
export async function extractPdfText(file: File, maxPages = 12): Promise<string> {
  const data = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const pageCount = Math.min(pdf.numPages, maxPages)
  const chunks: string[] = []
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const items = content.items as Array<{ str?: string }>
    chunks.push(items.map((it) => it.str ?? '').join(' '))
  }
  return chunks.join('\n').replace(/\s+\n/g, '\n').trim()
}
