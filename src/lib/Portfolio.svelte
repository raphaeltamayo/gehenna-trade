<script>
  import { fetchPrice, calcRow, saveInvestments, loadPrices, savePrices } from './store.js'
  import SaleModal   from './SaleModal.svelte'
  import AddItemModal from './AddItemModal.svelte'

  let { apiKey, investments = $bindable() } = $props()

  let prices      = $state(loadPrices())
  let lastUpdated = $state(localStorage.getItem('prices_updated') || null)
  let loading     = $state(false)
  let loadingIdx  = $state(0)
  let loadingName = $state('')
  let saleTarget  = $state(null)
  let showAdd     = $state(false)
  let sortCol     = $state('totalInvested')
  let sortDir     = $state(-1)
  let filter      = $state('all')
  let expandedRows = $state(new Set())

  let rows = $derived(investments.map(inv => ({ ...inv, ...calcRow(inv, prices) })))

  let filtered = $derived(rows.filter(r => {
    if (filter === 'holding') return r.status === 'HOLDING'
    if (filter === 'sold')    return r.status === 'SOLD'
    if (filter === 'partial') return r.status === 'PARTIAL'
    if (filter === 'all')     return true
    return r.type === filter
  }))

  let sorted = $derived([...filtered].sort((a, b) => {
    const av = a[sortCol] ?? (sortDir === 1 ? Infinity : -Infinity)
    const bv = b[sortCol] ?? (sortDir === 1 ? Infinity : -Infinity)
    return typeof av === 'string' ? av.localeCompare(bv) * sortDir : (av - bv) * sortDir
  }))

  let totalInvested    = $derived(investments.reduce((s, i) => s + i.totalInvested, 0))
  let totalValue       = $derived(rows.reduce((s, r) => s + (r.currentValue ?? 0), 0))
  let totalUnrealised  = $derived(rows.reduce((s, r) => s + (r.unrealisedPnl ?? 0), 0))
  let totalRealised    = $derived(rows.reduce((s, r) => s + (r.realisedPnl ?? 0), 0))
  let totalReturn      = $derived(totalInvested > 0 ? (totalUnrealised + totalRealised) / totalInvested : 0)
  let pricesLoaded     = $derived(Object.keys(prices).length)
  let loadingProgress  = $derived(investments.length > 0 ? Math.round(loadingIdx / investments.length * 100) : 0)

  async function refreshAll() {
    if (loading || !apiKey) return
    loading = true
    loadingIdx = 0
    const next = { ...prices }
    for (let i = 0; i < investments.length; i++) {
      loadingIdx = i
      loadingName = investments[i].name
      const p = await fetchPrice(investments[i].name, apiKey)
      next[investments[i].name] = { ...p, updatedAt: new Date().toISOString() }
      prices = { ...next }
      await new Promise(r => setTimeout(r, 350))
    }
    loadingIdx = investments.length
    savePrices(next)
    const ts = new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
    localStorage.setItem('prices_updated', ts)
    lastUpdated = ts
    loading = false
    loadingName = ''
  }

  function toggleSort(col) {
    if (sortCol === col) sortDir = sortDir * -1
    else { sortCol = col; sortDir = -1 }
  }

  function saveSale({ soldQty, sellDate, sellPrice }) {
    investments = investments.map(i =>
      i.name === saleTarget.name ? { ...i, soldQty, sellDate, sellPrice } : i
    )
    saveInvestments(investments)
    saleTarget = null
  }

  function toggleRow(name) {
    const next = new Set(expandedRows)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    expandedRows = next
  }

  function addItem(item) {
    investments = [...investments, { ...item, soldQty: 0, sellDate: null, sellPrice: null }]
    saveInvestments(investments)
    showAdd = false
  }

  const f  = (n, d=2) => n == null ? '—' : new Intl.NumberFormat('en-US', { minimumFractionDigits:d, maximumFractionDigits:d }).format(n)
  const fp = n => n == null ? '—' : (n>=0?'+':'') + (n*100).toFixed(2) + '%'
  const fc = n => n == null ? '' : n > 0 ? 'pos' : n < 0 ? 'neg' : ''
  const si = col => sortCol === col ? (sortDir===1?' ↑':' ↓') : ''

  const TYPE_LABEL = { skin:'SKIN', container:'CASE', sticker:'STICKER', music_kit:'KIT' }
  const TYPE_CLR   = { skin:'#8b1428', container:'#4a2060', sticker:'#1a4060', music_kit:'#1a4030' }

  const FILTERS = [
    { v:'all', l:'All' },
    { v:'holding', l:'Holding' },
    { v:'sold', l:'Sold' },
    { v:'skin', l:'Skins' },
    { v:'container', l:'Cases' },
    { v:'sticker', l:'Stickers' },
    { v:'music_kit', l:'Kits' },
  ]
</script>

<div class="portfolio">

  <!-- Summary strip -->
  <div class="summary">
    {#each [
      ['Total Invested', '$'+f(totalInvested), ''],
      ['Current Value',  totalValue>0?'$'+f(totalValue):'—', ''],
      ['Unrealised P&L', (totalUnrealised>=0?'+':'')+' $'+f(Math.abs(totalUnrealised)), fc(totalUnrealised)],
      ['Realised P&L',   (totalRealised>=0?'+':'')+' $'+f(Math.abs(totalRealised)), fc(totalRealised)],
      ['Total Return',   fp(totalReturn), fc(totalReturn)],
      ['Positions',      String(investments.length), ''],
    ] as [label, value, cls]}
      <div class="stat">
        <span class="stat-label">{label}</span>
        <span class="stat-value {cls}">{value}</span>
      </div>
    {/each}
  </div>

  <!-- Toolbar -->
  <div class="toolbar">
    <div class="filters">
      {#each FILTERS as f}
        <button class="flt" class:active={filter===f.v} onclick={() => filter = f.v}>{f.l}</button>
      {/each}
    </div>
    <div class="toolbar-right">
      {#if lastUpdated}
        <span class="ts">↺ {lastUpdated} · {pricesLoaded}/{investments.length}</span>
      {/if}
      {#if !apiKey}
        <span class="warn-badge">⚠ Set API key to refresh prices</span>
      {/if}
      <button class="btn-add" onclick={() => showAdd = true}>+ Add</button>
      <button class="btn-refresh" onclick={refreshAll} disabled={loading || !apiKey}>
        {#if loading}
          <span class="spin"></span>{loadingProgress}% &nbsp;<span class="loading-name">{loadingName.slice(0,24)}{loadingName.length>24?'…':''}</span>
        {:else}
          ↺ Refresh Prices
        {/if}
      </button>
    </div>
  </div>

  {#if loading}
    <div class="pbar"><div class="pfill" style="width:{loadingProgress}%"></div></div>
  {/if}

  <!-- Table -->
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th class="th-caret"></th>
          <th class="th-img"></th>
          <th class="left sortable" onclick={() => toggleSort('name')}>Item{si('name')}</th>
          <th>Type</th>
          <th class="sortable" onclick={() => toggleSort('qty')}>Qty{si('qty')}</th>
          <th class="sortable" onclick={() => toggleSort('firstBuy')}>First Buy{si('firstBuy')}</th>
          <th class="sortable blue-h" onclick={() => toggleSort('avgBuy')}>Avg Buy{si('avgBuy')}</th>
          <th class="sortable" onclick={() => toggleSort('totalInvested')}>Invested{si('totalInvested')}</th>
          <th class="sortable gold-h" onclick={() => toggleSort('cfloat')}>CSFloat{si('cfloat')}</th>
          <th class="sortable" onclick={() => toggleSort('steam')}>Steam{si('steam')}</th>
          <th class="sortable" onclick={() => toggleSort('currentValue')}>Value{si('currentValue')}</th>
          <th class="sortable" onclick={() => toggleSort('unrealisedPnl')}>P&L{si('unrealisedPnl')}</th>
          <th class="sortable" onclick={() => toggleSort('unrealisedPct')}>P&L%{si('unrealisedPct')}</th>
          <th>Sold</th>
          <th class="sortable" onclick={() => toggleSort('realisedPnl')}>Realised{si('realisedPnl')}</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each sorted as row (row.name)}
          <tr class:dim={row.status==='SOLD'}>
            <!-- Caret Toggle -->
            <td class="caret" onclick={() => toggleRow(row.name)}>
              <span class="caret-icon" class:expanded={expandedRows.has(row.name)}>▶</span>
            </td>

            <!-- Item image -->
            <td class="img-cell">
              {#if row.icon}
                <img src={row.icon} alt={row.name} class="item-img" loading="lazy" />
              {:else}
                <div class="img-placeholder">
                  <span>{TYPE_LABEL[row.type]?.[0] ?? '?'}</span>
                </div>
              {/if}
            </td>

            <!-- Name -->
            <td class="name-cell left">
              <span class="item-name" title={row.name}>{row.name}</span>
            </td>

            <!-- Type -->
            <td>
              <span class="type-tag" style="color:{TYPE_CLR[row.type]}cc; border-color:{TYPE_CLR[row.type]}44; background:{TYPE_CLR[row.type]}11">
                {TYPE_LABEL[row.type] ?? row.type}
              </span>
            </td>

            <td class="n">{row.qty}</td>
            <td class="n muted">{row.firstBuy}</td>
            <td class="n blue">${f(row.avgBuy, 4)}</td>
            <td class="n">${f(row.totalInvested)}</td>
            <td class="n gold">{row.cfloat!=null?'$'+f(row.cfloat,4):'—'}</td>
            <td class="n muted">{row.steam!=null?'$'+f(row.steam,4):'—'}</td>
            <td class="n">{row.currentValue!=null?'$'+f(row.currentValue):'—'}</td>
            <td class="n {fc(row.unrealisedPnl)}">{row.unrealisedPnl!=null?(row.unrealisedPnl>=0?'+':'')+' $'+f(Math.abs(row.unrealisedPnl)):'—'}</td>
            <td class="n {fc(row.unrealisedPct)}">{fp(row.unrealisedPct)}</td>
            <td class="n muted">{row.soldQty?`${row.soldQty}×$${f(row.sellPrice,4)}`:'—'}</td>
            <td class="n {fc(row.realisedPnl)}">{row.realisedPnl!=null?(row.realisedPnl>=0?'+':'')+' $'+f(Math.abs(row.realisedPnl)):'—'}</td>

            <td>
              <span class="status status-{row.status.toLowerCase()}">{row.status}</span>
            </td>

            <td>
              <button class="btn-edit" onclick={() => saleTarget = row} title="Record sale">✎</button>
            </td>
          </tr>
          
          {#if expandedRows.has(row.name)}
            <tr class="expanded-row">
              <td></td>
              <td colspan="16" class="expanded-cell">
                <div class="buys-container">
                  {#if row.buys?.length > 0}
                    <table class="buys-table">
                      <thead>
                        <tr>
                          <th class="left">Date</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Total Invested</th>
                        </tr>
                      </thead>
                      <tbody>
                        {#each row.buys as b}
                          <tr>
                            <td class="left muted">{b.date}</td>
                            <td class="n">{b.qty}</td>
                            <td class="n blue">${f(b.price, 4)}</td>
                            <td class="n">${f(b.qty * b.price)}</td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  {:else}
                    <div class="no-history">
                      No precise investment history found. Please hit "⤓ Import Trades" to automatically sync your purchases via API!
                    </div>
                  {/if}
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>
  </div>
</div>

{#if saleTarget}
  <SaleModal investment={saleTarget} onSave={saveSale} onClose={() => saleTarget = null} />
{/if}

{#if showAdd}
  <AddItemModal onAdd={addItem} onClose={() => showAdd = false} />
{/if}

<style>
  .portfolio { display: flex; flex-direction: column; gap: 1rem; }

  /* Summary */
  .summary {
    display: flex; flex-wrap: wrap;
    border: 1px solid rgba(180,120,60,0.2); background: #18090b;
  }

  .stat {
    flex: 1; min-width: 110px; padding: 0.9rem 1.2rem;
    display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
    border-right: 1px solid rgba(180,120,60,0.1);
  }
  .stat:last-child { border-right: none; }

  .stat-label { font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: #4a3a2a; }
  .stat-value { font-family: 'Playfair Display', Georgia, serif; font-size: 1.1rem; color: #c4a882; }
  .stat-value.pos { color: #5a9e6a; }
  .stat-value.neg { color: #a03040; }

  /* Toolbar */
  .toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.6rem; }

  .filters { display: flex; gap: 0.25rem; flex-wrap: wrap; }

  .flt {
    background: transparent; border: 1px solid rgba(255,255,255,0.08); color: #7a6650;
    padding: 0.25rem 0.6rem; font-family: inherit; font-size: 0.7rem;
    letter-spacing: 0.1em; cursor: pointer; transition: all 0.14s;
  }
  .flt:hover { border-color: rgba(180,120,60,0.3); color: #7a6050; }
  .flt.active { background: rgba(139,20,40,0.18); border-color: rgba(139,20,40,0.45); color: #c4a882; }

  .toolbar-right { display: flex; align-items: center; gap: 0.6rem; }

  .ts { font-size: 0.68rem; color: #3a2a1a; letter-spacing: 0.05em; }

  .warn-badge { font-size: 0.7rem; color: #8a6030; background: rgba(139,80,20,0.1); border: 1px solid rgba(139,80,20,0.2); padding: 0.2rem 0.6rem; }

  .btn-add {
    background: transparent; border: 1px solid rgba(180,120,60,0.22); color: #7a5a3a;
    padding: 0.28rem 0.7rem; font-family: inherit; font-size: 0.75rem;
    cursor: pointer; transition: all 0.14s;
  }
  .btn-add:hover { border-color: rgba(180,120,60,0.5); color: #b4783c; }

  .btn-refresh {
    background: linear-gradient(135deg, #8b1428, #5e0d1a);
    border: 1px solid rgba(180,80,80,0.28); color: #f0d8c0;
    padding: 0.28rem 0.9rem; font-family: inherit; font-size: 0.75rem;
    cursor: pointer; letter-spacing: 0.05em; transition: all 0.2s;
    display: flex; align-items: center; gap: 0.45rem; min-width: 140px;
  }
  .btn-refresh:hover:not(:disabled) { background: linear-gradient(135deg, #a0182f, #8b1428); box-shadow: 0 4px 14px rgba(139,20,40,0.35); }
  .btn-refresh:disabled { opacity: 0.6; cursor: not-allowed; }

  .loading-name { opacity: 0.7; font-size: 0.7rem; }

  .spin {
    width: 11px; height: 11px; border: 1.5px solid rgba(240,216,192,0.25);
    border-top-color: #f0d8c0; border-radius: 50%;
    animation: spin 0.7s linear infinite; flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Progress */
  .pbar { height: 2px; background: rgba(139,20,40,0.12); }
  .pfill {
    height: 100%; background: linear-gradient(90deg, #8b1428, #c4783c);
    transition: width 0.25s; box-shadow: 0 0 8px rgba(139,20,40,0.5);
  }

  /* Table */
  .table-wrap { overflow-x: auto; border: 1px solid rgba(180,120,60,0.15); background: #140809; }

  table { width: 100%; border-collapse: collapse; font-size: 0.82rem; white-space: nowrap; }

  thead tr { background: #1a0b0e; border-bottom: 1px solid rgba(180,120,60,0.25); }

  th {
    padding: 0.55rem 0.65rem; text-align: right;
    font-size: 0.65rem; letter-spacing: 0.12em; font-weight: 500;
    color: #887460; text-transform: uppercase; user-select: none;
  }
  th.left { text-align: left; }
  th.sortable { cursor: pointer; transition: color 0.14s; }
  th.sortable:hover { color: #b49c80; }
  th.gold-h { color: #8a6a40; }
  th.blue-h { color: #406080; }
  th.th-caret { width: 28px; }
  th.th-img { width: 48px; }

  tbody tr { border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.1s; }
  tbody tr:hover { background: rgba(180,120,60,0.06); }
  tbody tr.dim { opacity: 0.55; }
  tbody tr.dim:hover { opacity: 0.75; }

  td { padding: 0.45rem 0.65rem; text-align: right; color: #d8c4b0; }
  td.left { text-align: left; }
  td.n { font-family: 'Courier New', monospace; font-size: 0.82rem; }
  td.muted { color: #8a7a6a; }
  td.gold { color: #c48c4c; }
  td.blue { color: #6a9ac8; }
  td.pos { color: #6aad7a; }
  td.neg { color: #b04050; }

  /* Item image */
  .img-cell { padding: 0.3rem 0.4rem 0.3rem 0.65rem; width: 48px; }

  .item-img {
    width: 40px; height: 40px; object-fit: contain;
    background: rgba(139,20,40,0.08); border: 1px solid rgba(180,120,60,0.1);
    display: block;
  }

  .img-placeholder {
    width: 40px; height: 40px;
    background: rgba(139,20,40,0.06); border: 1px solid rgba(180,120,60,0.08);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.65rem; color: #3a2020; letter-spacing: 0.05em;
  }

  /* Name */
  .name-cell { max-width: 200px; }
  .item-name { display: block; overflow: hidden; text-overflow: ellipsis; color: #d8c8b4; font-size: 0.82rem; }

  /* Tags */
  .type-tag {
    display: inline-block; padding: 0.12rem 0.4rem; border: 1px solid;
    font-size: 0.6rem; letter-spacing: 0.12em;
  }

  /* Status */
  .status {
    display: inline-block; padding: 0.12rem 0.45rem;
    font-size: 0.6rem; letter-spacing: 0.12em;
  }
  .status-holding { background: rgba(180,120,60,0.08); color: #7a5830; border: 1px solid rgba(180,120,60,0.18); }
  .status-sold    { background: rgba(60,140,80,0.08);  color: #4a8e5a; border: 1px solid rgba(60,140,80,0.18); }
  .status-partial { background: rgba(60,80,140,0.08);  color: #5a78a0; border: 1px solid rgba(60,80,140,0.18); }

  .btn-edit {
    background: none; border: 1px solid rgba(255,255,255,0.15); color: #8a7a6a;
    padding: 0.18rem 0.4rem; cursor: pointer; font-size: 0.78rem; transition: all 0.14s;
  }
  .btn-edit:hover { border-color: rgba(180,120,60,0.5); color: #c48c4c; }

  /* Caret toggle for expanding rows */
  .caret { width: 20px; cursor: pointer; text-align: center; color: #8a7a6a; }
  .caret:hover { color: #c48c4c; background: rgba(180,120,60,0.1) }
  .caret-icon { display: inline-block; font-size: 0.6rem; transition: transform 0.2s; }
  .caret-icon.expanded { transform: rotate(90deg); color: #c48c4c; }

  /* Nested Buys Table */
  .expanded-row { background: #0c0507; }
  .expanded-row:hover { background: #0c0507; }
  .expanded-cell { padding: 0.5rem 1.5rem 1rem 0; border-bottom: 2px solid rgba(139,20,40,0.3); }
  .buys-container { display: flex; justify-content: flex-end; }
  
  .buys-table { width: 60%; background: #130709; border: 1px solid rgba(180,120,60,0.15); }
  .buys-table th { background: #1a080a; padding: 0.35rem 0.65rem; border-bottom: 1px solid rgba(180,120,60,0.15); }
  .buys-table td { padding: 0.35rem 0.65rem; font-size: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.03); }
  .buys-table tr:last-child td { border-bottom: none; }

  .no-history {
    background: rgba(180,120,60,0.05); border: 1px dashed rgba(180,120,60,0.3);
    color: #c48c4c; padding: 0.8rem 1.5rem; font-size: 0.82rem; text-align: center;
    border-radius: 4px; width: 60%; margin: 0;
  }
</style>
