<script>
  import { onMount } from 'svelte'
  import { loadInvestments, saveInvestments, fetchPrice, calcRow } from './investments.js'
  import SaleModal from './SaleModal.svelte'
  import AddItemModal from './AddItemModal.svelte'

  let { apiKey } = $props()

  let investments = $state(loadInvestments())
  let prices = $state(JSON.parse(localStorage.getItem('prices') || '{}'))
  let lastUpdated = $state(localStorage.getItem('prices_updated') || null)
  let loading = $state(false)
  let loadingItem = $state('')
  let loadingProgress = $state(0)
  let saleTarget = $state(null)
  let showAddModal = $state(false)
  let sortCol = $state('totalInvested')
  let sortDir = $state(-1)
  let filter = $state('all')

  // Derived rows
  let rows = $derived(investments.map(inv => ({ ...inv, ...calcRow(inv, prices) })))

  let filtered = $derived(
    rows.filter(r => filter === 'all' || r.type === filter || (filter === 'holding' && r.status === 'HOLDING') || (filter === 'sold' && r.status === 'SOLD'))
  )

  let sorted = $derived(
    [...filtered].sort((a, b) => {
      const av = a[sortCol] ?? -Infinity
      const bv = b[sortCol] ?? -Infinity
      return typeof av === 'string' ? av.localeCompare(bv) * sortDir : (av - bv) * sortDir
    })
  )

  // Summary stats
  let totalInvested = $derived(investments.reduce((s, i) => s + i.totalInvested, 0))
  let totalCurrentValue = $derived(rows.reduce((s, r) => s + (r.currentValue ?? 0), 0))
  let totalUnrealised = $derived(rows.reduce((s, r) => s + (r.unrealisedPnl ?? 0), 0))
  let totalRealised = $derived(rows.reduce((s, r) => s + (r.realisedPnl ?? 0), 0))
  let totalReturn = $derived(totalInvested > 0 ? (totalUnrealised + totalRealised) / totalInvested : 0)
  let pricesLoaded = $derived(Object.keys(prices).length)

  async function refreshAll() {
    if (loading) return
    loading = true
    loadingProgress = 0
    const total = investments.length
    const newPrices = { ...prices }
    for (let i = 0; i < investments.length; i++) {
      const inv = investments[i]
      loadingItem = inv.name
      loadingProgress = Math.round((i / total) * 100)
      const p = await fetchPrice(inv.name, apiKey)
      newPrices[inv.name] = { ...p, updatedAt: new Date().toISOString() }
      prices = { ...newPrices }
      // small delay to respect rate limits
      await new Promise(r => setTimeout(r, 400))
    }
    loadingProgress = 100
    localStorage.setItem('prices', JSON.stringify(newPrices))
    const now = new Date().toLocaleString()
    localStorage.setItem('prices_updated', now)
    lastUpdated = now
    loading = false
    loadingItem = ''
  }

  function setSort(col) {
    if (sortCol === col) sortDir = sortDir * -1
    else { sortCol = col; sortDir = -1 }
  }

  function openSale(inv) { saleTarget = inv }

  function saveSale({ soldQty, sellDate, sellPrice }) {
    investments = investments.map(i =>
      i.name === saleTarget.name ? { ...i, soldQty, sellDate, sellPrice } : i
    )
    saveInvestments(investments)
    saleTarget = null
  }

  function addItem(item) {
    investments = [...investments, { ...item, soldQty: 0, sellDate: null, sellPrice: null }]
    saveInvestments(investments)
    showAddModal = false
  }

  function fmt(n, digits = 2) {
    if (n == null) return '—'
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
  }

  function fmtPct(n) {
    if (n == null) return '—'
    const sign = n >= 0 ? '+' : ''
    return sign + (n * 100).toFixed(2) + '%'
  }

  function pnlClass(n) {
    if (n == null) return ''
    return n > 0 ? 'pos' : n < 0 ? 'neg' : ''
  }

  function sortIcon(col) {
    if (sortCol !== col) return ''
    return sortDir === 1 ? ' ↑' : ' ↓'
  }

  const TYPE_LABEL = { skin: 'SKIN', container: 'CASE', sticker: 'STICKER', music_kit: 'KIT' }
  const TYPE_COLOR = { skin: '#8b1428', container: '#4a2060', sticker: '#1a4060', music_kit: '#1a4030' }
</script>

<div class="portfolio">
  <!-- Summary strip -->
  <div class="summary-strip">
    <div class="stat">
      <span class="stat-label">Total Invested</span>
      <span class="stat-value">${fmt(totalInvested)}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat">
      <span class="stat-label">Current Value</span>
      <span class="stat-value">{totalCurrentValue > 0 ? '$' + fmt(totalCurrentValue) : '—'}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat">
      <span class="stat-label">Unrealised P&L</span>
      <span class="stat-value {pnlClass(totalUnrealised)}">{totalUnrealised !== 0 ? (totalUnrealised > 0 ? '+' : '') + '$' + fmt(totalUnrealised) : '—'}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat">
      <span class="stat-label">Realised P&L</span>
      <span class="stat-value {pnlClass(totalRealised)}">{totalRealised !== 0 ? (totalRealised > 0 ? '+' : '') + '$' + fmt(totalRealised) : '—'}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat">
      <span class="stat-label">Total Return</span>
      <span class="stat-value {pnlClass(totalReturn)}">{fmtPct(totalReturn)}</span>
    </div>
    <div class="stat-divider"></div>
    <div class="stat">
      <span class="stat-label">Positions</span>
      <span class="stat-value">{investments.length}</span>
    </div>
  </div>

  <!-- Toolbar -->
  <div class="toolbar">
    <div class="filters">
      {#each ['all','skin','container','sticker','music_kit','holding','sold'] as f}
        <button class="filter-btn" class:active={filter === f} onclick={() => filter = f}>
          {f === 'music_kit' ? 'KIT' : f.toUpperCase()}
        </button>
      {/each}
    </div>
    <div class="toolbar-right">
      {#if lastUpdated}
        <span class="last-updated">Updated {lastUpdated} · {pricesLoaded}/{investments.length} prices</span>
      {/if}
      <button class="btn-add" onclick={() => showAddModal = true}>+ Add Item</button>
      <button class="btn-refresh" onclick={refreshAll} disabled={loading}>
        {#if loading}
          <span class="spinner"></span> {loadingProgress}% — {loadingItem.slice(0, 28)}{loadingItem.length > 28 ? '…' : ''}
        {:else}
          ↺ Refresh Prices
        {/if}
      </button>
    </div>
  </div>

  <!-- Loading bar -->
  {#if loading}
    <div class="progress-bar">
      <div class="progress-fill" style="width: {loadingProgress}%"></div>
    </div>
  {/if}

  <!-- Table -->
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th onclick={() => setSort('name')} class="sortable left-align">Item{sortIcon('name')}</th>
          <th>Type</th>
          <th onclick={() => setSort('qty')} class="sortable">Qty{sortIcon('qty')}</th>
          <th onclick={() => setSort('firstBuy')} class="sortable">First Buy{sortIcon('firstBuy')}</th>
          <th onclick={() => setSort('avgBuy')} class="sortable">Avg Buy{sortIcon('avgBuy')}</th>
          <th onclick={() => setSort('totalInvested')} class="sortable">Invested{sortIcon('totalInvested')}</th>
          <th onclick={() => setSort('cfloat')} class="sortable gold">CSFloat{sortIcon('cfloat')}</th>
          <th onclick={() => setSort('steam')} class="sortable">Steam Ref{sortIcon('steam')}</th>
          <th onclick={() => setSort('currentValue')} class="sortable">Value{sortIcon('currentValue')}</th>
          <th onclick={() => setSort('unrealisedPnl')} class="sortable">P&L{sortIcon('unrealisedPnl')}</th>
          <th onclick={() => setSort('unrealisedPct')} class="sortable">P&L %{sortIcon('unrealisedPct')}</th>
          <th>Sold</th>
          <th>Realised</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each sorted as row (row.name)}
          <tr class="row" class:sold-row={row.status === 'SOLD'}>
            <td class="name-cell left-align">
              <span class="item-name" title={row.name}>{row.name}</span>
            </td>
            <td>
              <span class="type-badge" style="background:{TYPE_COLOR[row.type]}22; border-color:{TYPE_COLOR[row.type]}55; color:{TYPE_COLOR[row.type]}cc">
                {TYPE_LABEL[row.type] ?? row.type}
              </span>
            </td>
            <td class="num">{row.qty}</td>
            <td class="num">{row.firstBuy}</td>
            <td class="num input-col">${fmt(row.avgBuy, 4)}</td>
            <td class="num">${fmt(row.totalInvested)}</td>
            <td class="num gold">{row.cfloat != null ? '$' + fmt(row.cfloat, 4) : '—'}</td>
            <td class="num muted">{row.steam != null ? '$' + fmt(row.steam, 4) : '—'}</td>
            <td class="num">{row.currentValue != null ? '$' + fmt(row.currentValue) : '—'}</td>
            <td class="num {pnlClass(row.unrealisedPnl)}">
              {row.unrealisedPnl != null ? (row.unrealisedPnl >= 0 ? '+' : '') + '$' + fmt(row.unrealisedPnl) : '—'}
            </td>
            <td class="num {pnlClass(row.unrealisedPct)}">
              {fmtPct(row.unrealisedPct)}
            </td>
            <td class="num muted">
              {row.soldQty ? `${row.soldQty} @ $${fmt(row.sellPrice, 4)}` : '—'}
            </td>
            <td class="num {pnlClass(row.realisedPnl)}">
              {row.realisedPnl != null ? (row.realisedPnl >= 0 ? '+' : '') + '$' + fmt(row.realisedPnl) : '—'}
            </td>
            <td>
              <span class="status-badge status-{row.status.toLowerCase()}">{row.status}</span>
            </td>
            <td>
              <button class="btn-sell" onclick={() => openSale(row)} title="Record sale">✎</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

{#if saleTarget}
  <SaleModal investment={saleTarget} onSave={saveSale} onClose={() => saleTarget = null} />
{/if}

{#if showAddModal}
  <AddItemModal onAdd={addItem} onClose={() => showAddModal = false} />
{/if}

<style>
  .portfolio { display: flex; flex-direction: column; gap: 1rem; }

  /* Summary strip */
  .summary-strip {
    display: flex; align-items: center; flex-wrap: wrap; gap: 0;
    background: #0c070a;
    border: 1px solid rgba(180,120,60,0.18);
    padding: 0;
    overflow: hidden;
  }

  .stat {
    display: flex; flex-direction: column; align-items: center;
    padding: 1rem 1.5rem; flex: 1; min-width: 120px;
    gap: 0.3rem;
  }

  .stat-divider {
    width: 1px; height: 40px;
    background: rgba(180,120,60,0.12);
    flex-shrink: 0;
  }

  .stat-label {
    font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase;
    color: #5a4a3a; font-family: 'Crimson Pro', serif;
  }

  .stat-value {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.15rem; font-weight: 600; color: #c4a882;
  }

  .stat-value.pos { color: #5a9e6a; }
  .stat-value.neg { color: #a03040; }

  /* Toolbar */
  .toolbar {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 0.75rem;
  }

  .filters { display: flex; gap: 0.3rem; flex-wrap: wrap; }

  .filter-btn {
    background: transparent; border: 1px solid rgba(255,255,255,0.07);
    color: #5a4a3a; padding: 0.3rem 0.7rem; font-family: inherit;
    font-size: 0.72rem; letter-spacing: 0.12em; cursor: pointer; transition: all 0.15s;
  }
  .filter-btn:hover { border-color: rgba(180,120,60,0.3); color: #8a7060; }
  .filter-btn.active {
    background: rgba(139,20,40,0.2); border-color: rgba(139,20,40,0.5);
    color: #c4a882;
  }

  .toolbar-right { display: flex; align-items: center; gap: 0.75rem; }

  .last-updated { font-size: 0.7rem; color: #4a3a2a; letter-spacing: 0.06em; }

  .btn-add {
    background: transparent; border: 1px solid rgba(180,120,60,0.28);
    color: #b4783c; padding: 0.38rem 0.8rem; font-family: inherit;
    font-size: 0.8rem; cursor: pointer; transition: all 0.15s;
  }
  .btn-add:hover { background: rgba(180,120,60,0.08); }

  .btn-refresh {
    background: linear-gradient(135deg, #8b1428, #5e0d1a);
    border: 1px solid rgba(180,80,80,0.3); color: #f0d8c0;
    padding: 0.38rem 1rem; font-family: inherit; font-size: 0.8rem;
    cursor: pointer; letter-spacing: 0.06em; transition: all 0.2s;
    display: flex; align-items: center; gap: 0.5rem; min-width: 150px;
  }
  .btn-refresh:hover:not(:disabled) { background: linear-gradient(135deg, #a0182f, #8b1428); box-shadow: 0 4px 16px rgba(139,20,40,0.35); }
  .btn-refresh:disabled { opacity: 0.7; cursor: not-allowed; }

  .spinner {
    width: 12px; height: 12px; border: 1.5px solid rgba(240,216,192,0.3);
    border-top-color: #f0d8c0; border-radius: 50%;
    animation: spin 0.7s linear infinite; flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Progress bar */
  .progress-bar {
    height: 2px; background: rgba(139,20,40,0.15); overflow: hidden;
  }
  .progress-fill {
    height: 100%; background: linear-gradient(90deg, #8b1428, #d4783c);
    transition: width 0.3s ease; box-shadow: 0 0 8px rgba(139,20,40,0.5);
  }

  /* Table */
  .table-wrap {
    overflow-x: auto;
    border: 1px solid rgba(180,120,60,0.12);
    background: #0a060a;
  }

  table {
    width: 100%; border-collapse: collapse;
    font-size: 0.82rem; white-space: nowrap;
  }

  thead tr {
    background: #0e080c;
    border-bottom: 1px solid rgba(180,120,60,0.2);
  }

  th {
    padding: 0.6rem 0.75rem; text-align: right;
    font-size: 0.65rem; letter-spacing: 0.14em; font-weight: 400;
    color: #5a4a3a; text-transform: uppercase; font-family: 'Crimson Pro', serif;
    user-select: none;
  }
  th.sortable { cursor: pointer; transition: color 0.15s; }
  th.sortable:hover { color: #9a8a7a; }
  th.left-align { text-align: left; }
  th.gold { color: #6a4a20; }

  tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.12s; }
  tbody tr:hover { background: rgba(180,120,60,0.04); }
  tbody tr.sold-row { opacity: 0.55; }
  tbody tr.sold-row:hover { opacity: 0.75; }

  td {
    padding: 0.55rem 0.75rem; text-align: right;
    color: #c4a882;
  }
  td.left-align { text-align: left; }
  td.num { font-family: 'Courier New', monospace; font-size: 0.8rem; }
  td.muted { color: #5a4a3a; }
  td.gold { color: #b4783c; }
  td.pos { color: #5a9e6a; }
  td.neg { color: #a03040; }
  td.input-col { color: #7ab0d8; }

  .name-cell { max-width: 220px; }
  .item-name {
    display: block; overflow: hidden; text-overflow: ellipsis;
    color: #e8d5c4; font-size: 0.83rem;
  }

  .type-badge {
    display: inline-block; padding: 0.15rem 0.45rem;
    border: 1px solid; border-radius: 0;
    font-size: 0.62rem; letter-spacing: 0.14em;
    font-family: 'Crimson Pro', serif;
  }

  .status-badge {
    display: inline-block; padding: 0.15rem 0.5rem;
    font-size: 0.62rem; letter-spacing: 0.14em;
    font-family: 'Crimson Pro', serif;
  }
  .status-holding { background: rgba(180,120,60,0.1); color: #8a6840; border: 1px solid rgba(180,120,60,0.2); }
  .status-sold { background: rgba(60,140,80,0.1); color: #5a9e6a; border: 1px solid rgba(60,140,80,0.2); }
  .status-partial { background: rgba(60,80,140,0.1); color: #6a8ab0; border: 1px solid rgba(60,80,140,0.2); }

  .btn-sell {
    background: none; border: 1px solid rgba(255,255,255,0.06);
    color: #4a3a2a; padding: 0.2rem 0.45rem; cursor: pointer;
    font-size: 0.8rem; transition: all 0.15s;
  }
  .btn-sell:hover { border-color: rgba(180,120,60,0.3); color: #b4783c; }
</style>
