import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { path, subdomain, apiKey } = req.query

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'path parameter is required' })
  }
  if (!subdomain || typeof subdomain !== 'string') {
    return res.status(400).json({ error: 'subdomain parameter is required' })
  }
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'apiKey parameter is required' })
  }

  const credentials = Buffer.from(`${apiKey}:x`).toString('base64')
  const url = `https://api.bamboohr.com/api/gateway.php/${subdomain}${path}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    })

    if (response.status === 401) {
      return res.status(401).json({ error: 'Unauthorized — check your BambooHR API key' })
    }
    if (response.status === 404) {
      return res.status(404).json({ error: 'BambooHR resource not found' })
    }
    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: text || 'BambooHR API error' })
    }

    const data: unknown = await response.json()

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
    return res.status(200).json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return res.status(500).json({ error: message })
  }
}
