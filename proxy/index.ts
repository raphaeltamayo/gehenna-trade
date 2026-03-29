/**
 * Gehenna Trade — Bun proxy server
 * Runs alongside `bun run dev` to avoid CORS issues with CSFloat API.
 * Usage: bun run proxy/index.ts
 */

const CSFLOAT_BASE = 'https://csfloat.com/api/v1'
const PORT = 3001

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

Bun.serve({
  port: PORT,
  async fetch(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS })
    }

    const url = new URL(req.url)

    // Health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Only proxy /api/v1/* paths
    if (!url.pathname.startsWith('/api/v1/')) {
      return new Response('Not found', { status: 404, headers: CORS })
    }

    const apiKey = req.headers.get('Authorization')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const targetUrl = `${CSFLOAT_BASE}${url.pathname.replace('/api/v1', '')}${url.search}`

    try {
      const upstream = await fetch(targetUrl, {
        headers: {
          Authorization: apiKey,
          'User-Agent': 'gehenna-trade/1.0',
        },
      })

      const body = await upstream.text()
      return new Response(body, {
        status: upstream.status,
        headers: {
          ...CORS,
          'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
        },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }
  },
})

console.log(`\n⬡ Gehenna Trade proxy running on http://localhost:${PORT}`)
console.log(`  Proxying CSFloat API — CORS resolved\n`)
