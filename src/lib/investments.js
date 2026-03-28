// Initial investment data seeded from CSFloat trade history
// Prices (cfloat/steam) are fetched live and stored in localStorage

export const SEED_INVESTMENTS = [
  { name: "★ M9 Bayonet | Black Laminate (Battle-Scarred)", type: "skin", qty: 1, firstBuy: "2025-12-15", avgBuy: 480.0, totalInvested: 480.0 },
  { name: "★ Huntsman Knife | Tiger Tooth (Factory New)", type: "skin", qty: 1, firstBuy: "2025-08-02", avgBuy: 271.51, totalInvested: 271.51 },
  { name: "AK-47 | Panthera onca (Well-Worn)", type: "skin", qty: 1, firstBuy: "2026-01-05", avgBuy: 200.47, totalInvested: 200.47 },
  { name: "AWP | Asiimov (Field-Tested)", type: "skin", qty: 1, firstBuy: "2025-11-02", avgBuy: 144.22, totalInvested: 144.22 },
  { name: "Gallery Case", type: "container", qty: 120, firstBuy: "2025-06-28", avgBuy: 0.9908, totalInvested: 118.9 },
  { name: "Winter Offensive Weapon Case", type: "container", qty: 11, firstBuy: "2025-10-06", avgBuy: 7.0709, totalInvested: 77.78 },
  { name: "Recoil Case", type: "container", qty: 250, firstBuy: "2025-11-28", avgBuy: 0.3, totalInvested: 75.0 },
  { name: "Fever Case", type: "container", qty: 100, firstBuy: "2025-06-27", avgBuy: 0.7076, totalInvested: 70.76 },
  { name: "USP-S | Stainless (Field-Tested)", type: "skin", qty: 1, firstBuy: "2025-11-08", avgBuy: 67.86, totalInvested: 67.86 },
  { name: "Operation Phoenix Weapon Case", type: "container", qty: 20, firstBuy: "2025-11-28", avgBuy: 3.19, totalInvested: 63.8 },
  { name: "Kilowatt Case", type: "container", qty: 249, firstBuy: "2025-11-28", avgBuy: 0.2385, totalInvested: 59.39 },
  { name: "Huntsman Weapon Case", type: "container", qty: 8, firstBuy: "2025-10-26", avgBuy: 6.33, totalInvested: 50.64 },
  { name: "M4A4 | Temukau (Minimal Wear)", type: "skin", qty: 1, firstBuy: "2025-06-23", avgBuy: 50.49, totalInvested: 50.49 },
  { name: "Clutch Case", type: "container", qty: 50, firstBuy: "2025-06-27", avgBuy: 0.87, totalInvested: 43.5 },
  { name: "StatTrak™ AK-47 | The Outsiders (Minimal Wear)", type: "skin", qty: 1, firstBuy: "2025-09-24", avgBuy: 38.55, totalInvested: 38.55 },
  { name: "Falchion Case", type: "container", qty: 20, firstBuy: "2025-10-06", avgBuy: 1.65, totalInvested: 33.0 },
  { name: "Souvenir AWP | Black Nile (Factory New)", type: "skin", qty: 1, firstBuy: "2025-07-17", avgBuy: 29.54, totalInvested: 29.54 },
  { name: "Snakebite Case", type: "container", qty: 40, firstBuy: "2025-06-27", avgBuy: 0.4795, totalInvested: 19.18 },
  { name: "Music Kit | Dren, Gunman Taco Truck", type: "music_kit", qty: 1, firstBuy: "2025-07-17", avgBuy: 16.0, totalInvested: 16.0 },
  { name: "CS20 Case", type: "container", qty: 10, firstBuy: "2025-06-27", avgBuy: 1.3, totalInvested: 13.0 },
  { name: "10 Year Birthday Sticker Capsule", type: "container", qty: 15, firstBuy: "2025-07-06", avgBuy: 0.8453, totalInvested: 12.68 },
  { name: "Sticker | Kawaii Eyes (Glitter)", type: "sticker", qty: 14, firstBuy: "2025-06-28", avgBuy: 0.7321, totalInvested: 10.25 },
  { name: "Sticker | pashaBiceps | Cologne 2015", type: "sticker", qty: 1, firstBuy: "2025-11-02", avgBuy: 7.95, totalInvested: 7.95 },
  { name: "CS20 Sticker Capsule", type: "container", qty: 10, firstBuy: "2025-07-05", avgBuy: 0.74, totalInvested: 7.4 },
  { name: "Poorly Drawn Capsule", type: "container", qty: 8, firstBuy: "2025-09-22", avgBuy: 0.79, totalInvested: 6.32 },
  { name: "Sticker | Kawaii CT (Holo)", type: "sticker", qty: 1, firstBuy: "2025-06-23", avgBuy: 5.36, totalInvested: 5.36 },
  { name: "Souvenir SSG 08 | Hand Brake (Minimal Wear)", type: "skin", qty: 1, firstBuy: "2025-08-03", avgBuy: 3.85, totalInvested: 3.85 },
  { name: "Music Kit | The Verkkars, EZ4ENCE", type: "music_kit", qty: 1, firstBuy: "2025-08-04", avgBuy: 3.26, totalInvested: 3.26 },
  { name: "Sticker | Blinky", type: "sticker", qty: 10, firstBuy: "2025-07-04", avgBuy: 0.251, totalInvested: 2.51 },
]

/**
 * Load investments from localStorage, falling back to seed data.
 * Merges sale data (soldQty, sellDate, sellPrice) from stored state.
 */
export function loadInvestments() {
  const stored = localStorage.getItem('investments')
  if (!stored) return SEED_INVESTMENTS.map(i => ({ ...i, soldQty: 0, sellDate: null, sellPrice: null }))
  try {
    return JSON.parse(stored)
  } catch {
    return SEED_INVESTMENTS.map(i => ({ ...i, soldQty: 0, sellDate: null, sellPrice: null }))
  }
}

export function saveInvestments(investments) {
  localStorage.setItem('investments', JSON.stringify(investments))
}

/**
 * Fetch CSFloat price for one item.
 * Returns { cfloat: number|null, steam: number|null }
 */
export async function fetchPrice(name, apiKey) {
  const encoded = encodeURIComponent(name)
  const url = `https://csfloat.com/api/v1/listings?market_hash_name=${encoded}&limit=1&sort_by=lowest_price&type=buy_now`
  try {
    const res = await fetch(url, { headers: { Authorization: apiKey } })
    if (!res.ok) return { cfloat: null, steam: null }
    const json = await res.json()
    const first = json?.data?.[0]
    if (!first) return { cfloat: null, steam: null }
    return {
      cfloat: first.price != null ? first.price / 100 : null,
      steam: first.reference?.base_price != null ? first.reference.base_price / 100 : null,
    }
  } catch {
    return { cfloat: null, steam: null }
  }
}

export function calcRow(inv, prices) {
  const p = prices[inv.name] ?? {}
  const cfloat = p.cfloat ?? null
  const steam = p.steam ?? null
  const soldQty = inv.soldQty || 0
  const holdingQty = inv.qty - soldQty
  const currentValue = cfloat != null ? cfloat * holdingQty : null
  const unrealisedPnl = currentValue != null ? currentValue - holdingQty * inv.avgBuy : null
  const unrealisedPct = unrealisedPnl != null ? unrealisedPnl / inv.totalInvested : null
  const proceeds = soldQty > 0 && inv.sellPrice ? soldQty * inv.sellPrice : null
  const realisedPnl = proceeds != null ? proceeds - soldQty * inv.avgBuy : null
  const status = soldQty === 0 ? 'HOLDING' : soldQty >= inv.qty ? 'SOLD' : 'PARTIAL'
  return { cfloat, steam, currentValue, unrealisedPnl, unrealisedPct, proceeds, realisedPnl, status }
}
