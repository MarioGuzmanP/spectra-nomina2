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

/**
 * Flatten query params into a flat Record<string, string>.
 * Handles both:
 *  - Flat format (Node querystring): { 'date[start]': '2026-06-01' }
 *  - Nested format (qs library):     { date: { start: '2026-06-01' } }
 * In both cases the result is { 'date[start]': '2026-06-01' }
 */
function flattenParams(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key
    if (typeof val === 'string') {
      result[fullKey] = val
    } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
      result[fullKey] = val[0] as string
    } else if (val !== null && typeof val === 'object') {
      Object.assign(result, flattenParams(val as Record<string, unknown>, fullKey))
    }
  }
  return result
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
    accessToken = directAccessToken
  } else {
    if (typeof refreshToken !== 'string') {
      return res.status(400).json({ error: 'x-hubstaff-refresh-token must be a string' })
    }
    try {
      const exchanged = await exchangeRefreshToken(refreshToken)
      accessToken = exchanged.accessToken
      res.setHeader('x-new-refresh-token', exchanged.newRefreshToken)
      res.setHeader('x-new-access-token', exchanged.accessToken)
      res.setHeader('x-access-token-expiry', String(Date.now() + exchanged.expiresIn * 1000))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Token exchange failed'
      return res.status(401).json({ error: message })
    }
  }

  // Flatten bracket-keyed params (handles both querystring and qs-parsed formats),
  // then build the Hubstaff URL with literal bracket syntax — Hubstaff v2 requires
  // date[start]/date[stop] unencoded (date%5Bstart%5D is NOT accepted).
  const flat = flattenParams(extraParams as Record<string, unknown>)
  const queryParts = Object.entries(flat).map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
  const queryString = queryParts.join('&')
  const url = `https://api.hubstaff.com/v2/${endpoint}${queryString ? `?${queryString}` : ''}`

  console.log('[hubstaff proxy] →', url)

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    console.log('[hubstaff proxy] ←', response.status, endpoint)

    if (response.status === 401) {
      return res.status(401).json({ error: 'Unauthorized — access token rejected by Hubstaff. Your refresh token may have expired.' })
    }
    if (response.status === 404) {
      return res.status(404).json({ error: 'Hubstaff resource not found' })
    }
    if (!response.ok) {
      const text = await response.text()
      console.error('[hubstaff proxy] error body:', text)
      return res.status(response.status).json({ error: text || 'Hubstaff API error' })
    }

    const data: unknown = await response.json()
    return res.status(200).json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return res.status(500).json({ error: message })
  }
}
