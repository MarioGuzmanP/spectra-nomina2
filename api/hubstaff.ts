import type { VercelRequest, VercelResponse } from '@vercel/node'

interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

async function exchangeRefreshToken(
  refreshToken: string,
): Promise<{ accessToken: string; newRefreshToken: string; expiresIn: number }> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const res = await fetch('https://account.hubstaff.com/access_tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    if (res.status === 401) {
      throw new Error('Refresh token expired — generate a new one at developer.hubstaff.com')
    }
    throw new Error(`Hubstaff token exchange failed (${res.status}): ${text}`)
  }

  const data = await res.json() as TokenResponse
  if (!data.access_token) {
    throw new Error('Token exchange succeeded but access_token is missing in response')
  }

  return {
    accessToken: data.access_token,
    newRefreshToken: data.refresh_token,
    expiresIn: data.expires_in ?? 86399,
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { endpoint, ...extraParams } = req.query
  const directAccessToken = req.headers['x-hubstaff-access-token']
  const refreshToken = req.headers['x-hubstaff-refresh-token']

  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'endpoint parameter is required' })
  }
  if (!directAccessToken && !refreshToken) {
    return res.status(400).json({ error: 'Either x-hubstaff-access-token or x-hubstaff-refresh-token header is required' })
  }

  let accessToken: string

  if (directAccessToken && typeof directAccessToken === 'string') {
    // Use provided access token directly — no exchange needed
    accessToken = directAccessToken
  } else {
    // Exchange refresh token for a fresh access token
    if (typeof refreshToken !== 'string') {
      return res.status(400).json({ error: 'x-hubstaff-refresh-token must be a string' })
    }
    try {
      const exchanged = await exchangeRefreshToken(refreshToken)
      accessToken = exchanged.accessToken
      // Return new tokens so frontend can cache and save them
      res.setHeader('x-new-refresh-token', exchanged.newRefreshToken)
      res.setHeader('x-new-access-token', exchanged.accessToken)
      res.setHeader('x-access-token-expiry', String(Date.now() + exchanged.expiresIn * 1000))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Token exchange failed'
      return res.status(401).json({ error: message })
    }
  }

  // Build Hubstaff API URL with any extra query params
  const qs = new URLSearchParams()
  for (const [key, val] of Object.entries(extraParams)) {
    if (typeof val === 'string') qs.append(key, val)
  }
  const queryString = qs.toString()
  const url = `https://api.hubstaff.com/v2/${endpoint}${queryString ? `?${queryString}` : ''}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    if (response.status === 401) {
      return res.status(401).json({ error: 'Unauthorized — access token rejected by Hubstaff. Your refresh token may have expired.' })
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
