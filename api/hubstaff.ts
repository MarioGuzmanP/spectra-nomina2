import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { endpoint, token } = req.query

  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'endpoint parameter is required' })
  }
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'token parameter is required' })
  }

  const url = `https://api.hubstaff.com/v2/${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    if (response.status === 401) {
      return res.status(401).json({ error: 'Unauthorized — check your Hubstaff access token' })
    }
    if (response.status === 404) {
      return res.status(404).json({ error: 'Hubstaff resource not found' })
    }
    if (!response.ok) {
      const text = await response.text()
      return res.status(response.status).json({ error: text || 'Hubstaff API error' })
    }

    const data: unknown = await response.json()
    return res.status(200).json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return res.status(500).json({ error: message })
  }
}
