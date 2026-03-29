/**
 * Generic import system for CS2 investment sources.
 * Each importer receives raw data and returns a normalized array of InvestmentInput.
 */

export function importFromJson(json) {
  if (json && typeof json === 'object' && Array.isArray(json.trades) && 'count' in json) {
    return importFromCsFloat(json)
  }
  if (json && typeof json === 'object' && Array.isArray(json.assets) && Array.isArray(json.descriptions)) {
    return importFromSteamInventory(json)
  }
  return { items: [], source: 'unknown', warnings: ['Unrecognized file format.'] }
}

export function importFromCsFloat(data) {
  const warnings = []
  const groups = new Map()

  // Base Buyers
  for (const trade of data.trades) {
    if (trade.state !== 'verified' || trade.role === 'seller') continue
    const contract = trade.contract
    const item = contract?.item
    if (!item?.market_hash_name) continue

    const name = item.market_hash_name
    const priceCents = contract.price ?? 0
    const date = (trade.accepted_at ?? trade.created_at ?? '').slice(0, 10)

    if (!groups.has(name)) {
      groups.set(name, {
        name,
        type: normalizeType(item.type),
        buys: [],
        sells: [],
        iconUrl: item.icon_url ?? '',
      })
    }
    const g = groups.get(name)
    g.buys.push({ qty: 1, price: priceCents / 100, date })
    if (!g.iconUrl && item.icon_url) g.iconUrl = item.icon_url
  }

  // Combine identical buys
  for (const group of groups.values()) {
    const reduced = []
    group.buys.sort((a, b) => a.date.localeCompare(b.date))
    for (const b of group.buys) {
      const last = reduced[reduced.length - 1]
      if (last && last.date === b.date && last.price === b.price) {
        last.qty += b.qty
      } else {
        reduced.push({ ...b })
      }
    }
    group.buys = reduced
  }

  // Integrate sellers (FIFO deductions basically mean we just track total sales, the store automatically assumes average avgBuy P&L deduction)
  for (const trade of data.trades) {
    if (trade.state !== 'verified' || trade.role !== 'seller') continue
    const contract = trade.contract
    const item = contract?.item
    if (!item?.market_hash_name) continue

    const name = item.market_hash_name
    const sellPrice = (contract.price ?? 0) / 100
    const date = (trade.accepted_at ?? trade.created_at ?? '').slice(0, 10)

    const g = groups.get(name)
    if (!g) continue // Ignored if acquired outside CSFloat

    g.sells.push({ qty: 1, price: sellPrice, date })
  }

  const items = [...groups.values()].map(g => {
    const totalQty = g.buys.reduce((sum, b) => sum + b.qty, 0)
    let totalInvested = g.buys.reduce((sum, b) => sum + (b.price * b.qty), 0)
    let firstBuy = g.buys.length ? g.buys[0].date : ''
    let avgBuy = totalQty > 0 ? (totalInvested / totalQty) : 0

    let soldQty = 0
    let totalProceeds = 0
    let lastSellDate = null

    for (const s of g.sells) {
        soldQty += s.qty
        totalProceeds += s.price * s.qty
        if (!lastSellDate || s.date > lastSellDate) lastSellDate = s.date
    }

    let sellPriceAvg = soldQty > 0 ? (totalProceeds / soldQty) : null

    // Clamp soldQty to not exceed totalQty (we don't allow shorting here logically)
    soldQty = Math.min(soldQty, totalQty)

    return {
      name: g.name,
      type: g.type,
      qty: totalQty,
      firstBuy,
      avgBuy: round4(avgBuy),
      totalInvested: round2(totalInvested),
      iconUrl: g.iconUrl,
      buys: g.buys,
      soldQty,
      sellPrice: sellPriceAvg ? round4(sellPriceAvg) : null,
      sellDate: lastSellDate
    }
  }).sort((a, b) => b.totalInvested - a.totalInvested)

  if (items.length === 0) {
    warnings.push('No verified trades found.')
  }

  return { items, source: 'CSFloat (API)', warnings }
}

export function importFromSteamInventory(data) {
  // Untouched for future steam imports
  const warnings = ['Steam inventory imported — purchase prices not available. Please fill in Avg Buy prices manually.']
  const descMap = new Map()

  for (const desc of data.descriptions ?? []) {
    const key = `${desc.classid}_${desc.instanceid}`
    descMap.set(key, desc)
  }

  const groups = new Map()

  for (const asset of data.assets ?? []) {
    const key = `${asset.classid}_${asset.instanceid}`
    const desc = descMap.get(key)
    if (!desc) continue

    const name = desc.market_hash_name
    if (!name) continue

    const type = inferSteamType(desc)

    if (!groups.has(name)) {
      groups.set(name, {
        name,
        type,
        count: 0,
        iconUrl: desc.icon_url ?? '',
      })
    }
    groups.get(name).count += parseInt(asset.amount ?? '1', 10)
  }

  const today = new Date().toISOString().slice(0, 10)
  const items = [...groups.values()].map(g => ({
    name: g.name,
    type: g.type,
    qty: g.count,
    firstBuy: today,
    avgBuy: 0,
    totalInvested: 0,
    iconUrl: g.iconUrl,
  }))

  return { items, source: 'Steam Inventory', warnings }
}

function normalizeType(raw) {
  switch (raw) {
    case 'skin': return 'skin'
    case 'container': return 'container'
    case 'sticker': return 'sticker'
    case 'music_kit': return 'music_kit'
    default: return 'container'
  }
}

function inferSteamType(desc) {
  const tags = desc.tags ?? []
  for (const tag of tags) {
    if (tag.category === 'Type') {
      const v = tag.internal_name?.toLowerCase() ?? ''
      if (v.includes('skin') || v.includes('weapon')) return 'skin'
      if (v.includes('container') || v.includes('case')) return 'container'
      if (v.includes('sticker')) return 'sticker'
      if (v.includes('music')) return 'music_kit'
    }
  }
  return 'container'
}

function round2(n) { return Math.round(n * 100) / 100 }
function round4(n) { return Math.round(n * 10000) / 10000 }

export function iconUrl(hash, size = '96fx96f') {
  if (!hash) return null
  return `https://community.akamai.steamstatic.com/economy/image/${hash}/${size}`
}
