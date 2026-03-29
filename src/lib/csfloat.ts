import { PROXY_BASE } from './store.js'

export interface Trade {
  id: string
  created_at: string
  buyer_id: string
  buyer: Buyer
  seller_id: string
  seller: Seller
  contract_id: string
  accepted_at: string
  state: string
  verification_mode: string
  steam_offer: SteamOffer
  verify_sale_at: string
  verified_at: string
  inventory_check_status: number
  trade_protection_ends_at: string
  contract: Contract
  trade_url: string
  trade_token: string
  wait_for_cancel_ping: boolean
  is_settlement_period: boolean
  role?: 'buyer' | 'seller'
}

export interface Buyer {
  avatar: string
  away: boolean
  flags: number
  online: boolean
  stall_public: boolean
  statistics: Statistics
  steam_id: string
  username: string
}

export interface Statistics {
  median_trade_time: number
  total_avoided_trades: number
  total_failed_trades: number
  total_trades: number
  total_verified_trades: number
}

export interface Seller {
  avatar: string
  away: boolean
  flags: number
  online: boolean
  stall_public: boolean
  statistics: Statistics
  steam_id: string
  username: string
}

export interface SteamOffer {
  id: string
  state: number
  is_from_seller: boolean
  can_cancel_at: string
  sent_at: string
  deadline_at: string
  updated_at: string
}

export interface Contract {
  id: string
  created_at: string
  type: string
  price: number
  state: string
  seller: Seller2
  reference: Reference
  item: Item
  is_seller: boolean
  is_watchlisted: boolean
  watchers: number
  sold_at: string
}

export interface Seller2 {
  away: boolean
  flags: number
  obfuscated_id: string
  online: boolean
  stall_public: boolean
  statistics: Statistics
}

export interface Reference {
  base_price: number
  predicted_price: number
  quantity: number
  last_updated: string
}

export interface Item {
  asset_id: string
  def_index: number
  icon_url: string
  rarity: number
  market_hash_name: string
  tradable: number
  is_commodity: boolean
  type: string
  rarity_name: string
  type_name: string
  item_name: string
}

/**
 * Fetch all verified trades for a specific role from CSFloat using pagination.
 */
async function fetchCsFloatRole(
  apiKey: string,
  role: 'buyer' | 'seller',
  onProgress: (loaded: number) => void
): Promise<Trade[]> {
  const limit = 500
  let page = 0
  let allTrades: Trade[] = []
  let hasMore = true

  while (hasMore) {
    const url = `${PROXY_BASE}/me/trades?role=${role}&state=verified&limit=${limit}&page=${page}`
    
    const res = await fetch(url, {
      headers: {
        Authorization: apiKey
      }
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch ${role} trades from CSFloat (Status: ${res.status})`)
    }

    const data = await res.json()
    let currentTrades: Trade[] = Array.isArray(data) ? data : (data?.trades || [])

    // Filter verified (safety net)
    const verified = currentTrades.filter(t => t.state === 'verified')
    allTrades = allTrades.concat(verified)
    
    onProgress(allTrades.length)

    if (currentTrades.length < limit) {
      hasMore = false
    } else {
      page++
    }
  }

  return allTrades
}

/**
 * Fetch all verified buyer and seller trades from CSFloat concurrently.
 * @param apiKey - The CSFloat API Key.
 * @param onProgress - Callback indicating total number of items loaded so far.
 * @returns Array of loaded trades.
 */
export async function fetchCsFloatTrades(
  apiKey: string,
  onProgress: (loaded: number) => void
): Promise<Trade[]> {
  let buyerProgress = 0
  let sellerProgress = 0

  const handleProgress = () => {
    onProgress(buyerProgress + sellerProgress)
  }

  const [buyers, sellers] = await Promise.all([
    fetchCsFloatRole(apiKey, 'buyer', (p) => { buyerProgress = p; handleProgress(); }),
    fetchCsFloatRole(apiKey, 'seller', (p) => { sellerProgress = p; handleProgress(); })
  ])

  // Attach a role flag to differentiate them if needed later
  buyers.forEach(t => t.role = 'buyer')
  sellers.forEach(t => t.role = 'seller')

  return [...buyers, ...sellers]
}
