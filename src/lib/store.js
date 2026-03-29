import { iconUrl } from './importers.js'

export const PROXY_BASE = 'http://localhost:3001/api/v1'
const STEAM_CDN = 'https://community.akamai.steamstatic.com/economy/image'

/** @returns {import('./importers.js').InvestmentInput[]} */
export function loadInvestments() {
  try {
    const s = localStorage.getItem('investments')
    return s ? JSON.parse(s) : []
  } catch { return [] }
}

export function saveInvestments(investments) {
  localStorage.setItem('investments', JSON.stringify(investments))
}

export function loadPrices() {
  try {
    const s = localStorage.getItem('prices')
    return s ? JSON.parse(s) : {}
  } catch { return {} }
}

export function savePrices(prices) {
  localStorage.setItem('prices', JSON.stringify(prices))
}

/**
 * Fetch CSFloat price + icon for one item via local proxy.
 * Returns { cfloat, steam, iconUrl }
 */
export async function fetchPrice(name, apiKey) {
  const encoded = encodeURIComponent(name)
  const url = `${PROXY_BASE}/listings?market_hash_name=${encoded}&limit=1&sort_by=lowest_price&type=buy_now`
  try {
    const res = await fetch(url, { headers: { Authorization: apiKey } })
    if (!res.ok) return { cfloat: null, steam: null, iconUrl: null }
    const json = await res.json()
    const first = json?.data?.[0]
    if (!first) return { cfloat: null, steam: null, iconUrl: null }
    return {
      cfloat: first.price != null ? first.price / 100 : null,
      steam: first.reference?.base_price != null ? first.reference.base_price / 100 : null,
      iconUrl: first.item?.icon_url
        ? `${STEAM_CDN}/${first.item.icon_url}/96fx96f`
        : null,
    }
  } catch {
    return { cfloat: null, steam: null, iconUrl: null }
  }
}

/** Compute all derived fields for a row */
export function calcRow(inv, prices) {
  const p = prices[inv.name] ?? {}
  const cfloat = p.cfloat ?? null
  const steam  = p.steam  ?? null
  const icon   = p.iconUrl ?? (inv.iconUrl ? `${STEAM_CDN}/${inv.iconUrl}/96fx96f` : null)
  const soldQty    = inv.soldQty || 0
  const holdingQty = inv.qty - soldQty
  const currentValue   = cfloat != null ? cfloat * holdingQty : null
  const unrealisedPnl  = currentValue != null ? currentValue - holdingQty * inv.avgBuy : null
  const unrealisedPct  = unrealisedPnl != null && inv.totalInvested > 0 ? unrealisedPnl / inv.totalInvested : null
  const proceeds       = soldQty > 0 && inv.sellPrice ? soldQty * inv.sellPrice : null
  const realisedPnl    = proceeds != null ? proceeds - soldQty * inv.avgBuy : null
  const status         = soldQty === 0 ? 'HOLDING' : soldQty >= inv.qty ? 'SOLD' : 'PARTIAL'
  return { cfloat, steam, icon, currentValue, unrealisedPnl, unrealisedPct, proceeds, realisedPnl, status }
}
