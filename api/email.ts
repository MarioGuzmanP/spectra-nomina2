import type { VercelRequest, VercelResponse } from '@vercel/node'

interface SendEmailBody {
  to: string
  subject: string
  html: string
  pdfBase64?: string
  pdfFilename?: string
  provider: 'resend' | 'smtp'
  resendApiKey?: string
  smtpConfig?: {
    host: string
    port: number
    user: string
    password: string
    fromEmail: string
    fromName: string
  }
  fromEmail?: string
  fromName?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body as SendEmailBody

  if (!body.to || !body.subject || !body.html) {
    return res.status(400).json({ error: 'to, subject, and html are required' })
  }

  try {
    if (body.provider === 'resend') {
      if (!body.resendApiKey) {
        return res.status(400).json({ error: 'resendApiKey is required for Resend provider' })
      }

      const attachments = body.pdfBase64
        ? [{ filename: body.pdfFilename ?? 'paystub.pdf', content: body.pdfBase64 }]
        : []

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${body.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${body.fromName ?? 'Spectra Payroll'} <${body.fromEmail ?? 'payroll@spectra.app'}>`,
          to: [body.to],
          subject: body.subject,
          html: body.html,
          attachments,
        }),
      })

      if (!response.ok) {
        const err = await response.text()
        return res.status(response.status).json({ error: err })
      }

      const data: unknown = await response.json()
      return res.status(200).json(data)
    }

    return res.status(400).json({ error: 'Invalid email provider' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send email'
    return res.status(500).json({ error: message })
  }
}
