import type { ReactElement } from 'react'

/**
 * Lazily imports @react-pdf/renderer so the 434KB chunk is only loaded
 * when the user actually requests a PDF, not on initial page load.
 */
async function getPdfRenderer() {
  const { pdf } = await import('@react-pdf/renderer')
  return { pdf }
}

export async function generatePdfBlob(element: ReactElement): Promise<Blob> {
  const { pdf } = await getPdfRenderer()
  return await pdf(element).toBlob()
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
