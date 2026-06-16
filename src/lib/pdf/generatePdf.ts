import type { ReactElement } from 'react'

let fontsRegistered = false

/**
 * Registers an embedded Unicode font (Roboto, bundled in /public/fonts) so the PDF
 * renders the full Latin set — accents/ñ (e.g. "Idaly Peña"), accented company names,
 * and currency symbols like ₱ and ₡ — which the built-in Helvetica (WinAnsi) cannot.
 * Served same-origin, so it works offline with no external CDN dependency.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function registerFonts(Font: any) {
  if (fontsRegistered) return
  Font.register({
    family: 'Roboto',
    fonts: [
      { src: '/fonts/Roboto-Regular.ttf', fontWeight: 'normal' },
      { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
    ],
  })
  // Keep words intact (no automatic hyphenation of names/amounts).
  Font.registerHyphenationCallback((word: string) => [word])
  fontsRegistered = true
}

/**
 * Lazily imports @react-pdf/renderer so the 434KB chunk is only loaded
 * when the user actually requests a PDF, not on initial page load.
 */
async function getPdfRenderer() {
  const { pdf, Font } = await import('@react-pdf/renderer')
  registerFonts(Font)
  return { pdf }
}

export async function generatePdfBlob(element: ReactElement): Promise<Blob> {
  const { pdf } = await getPdfRenderer()
  try {
    return await pdf(element).toBlob()
  } catch (err) {
    console.error('[PDF] generatePdfBlob failed:', err)
    throw err
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
