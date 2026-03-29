<script>
  import { importFromCsFloat } from './importers.js'
  import { saveInvestments } from './store.js'
  import { fetchCsFloatTrades } from './csfloat.ts'

  let { apiKey, existing = [], onImport, onClose } = $props()

  let loading    = $state(false)
  let loadedCount = $state(0)
  let result     = $state(null)  // { items, source, warnings }
  let mergeMode  = $state('replace') // 'replace' | 'merge'
  let error      = $state('')

  async function startImport() {
    if (!apiKey) {
      error = 'No API Key configured. Please configure it in settings.'
      return
    }
    
    loading = true
    error = ''
    result = null
    loadedCount = 0

    try {
      const trades = await fetchCsFloatTrades(apiKey, (n) => {
        loadedCount = n
      })
      
      result = importFromCsFloat({ trades, count: trades.length })
      
      if (result.items.length === 0 && result.warnings.length) {
        error = result.warnings[0]
        result = null
      }
    } catch (err) {
      error = err.message || 'Failed to fetch trades. Ensure proxy is running and API key is valid.'
    } finally {
      loading = false
    }
  }

  function confirm() {
    if (!result) return
    let final
    if (mergeMode === 'merge' && existing.length > 0) {
      const existingMap = new Map(existing.map(i => [i.name, i]))
      for (const item of result.items) {
        if (!existingMap.has(item.name)) existingMap.set(item.name, item)
      }
      final = [...existingMap.values()]
    } else {
      final = result.items.map(i => ({ ...i, soldQty: 0, sellDate: null, sellPrice: null }))
    }
    saveInvestments(final)
    onImport(final)
  }
</script>

<div class="overlay" onclick={onClose}>
  <div class="modal" onclick={e => e.stopPropagation()}>
    <div class="modal-header">
      <h3>Import Investments</h3>
      <button class="close" onclick={onClose}>✕</button>
    </div>

    <div class="modal-body">
      <!-- Supported sources -->
      <div class="sources">
        <div class="source active">
          <span class="source-icon">⬡</span>
          <span>CSFloat Trades</span>
          <span class="badge">API Supported</span>
        </div>
        <div class="source disabled">
          <span class="source-icon">☁</span>
          <span>Steam Inventory</span>
          <span class="badge coming">Ready</span>
        </div>
      </div>

      <p class="hint">
        Directly fetch your latest verified trades from CSFloat. Make sure your API key is correctly configured.
      </p>

      <!-- Import Action Area -->
      <div class="import-area" class:loading>
        {#if result}
          <div class="result-preview">
            <span class="result-icon">✓</span>
            <strong>{result.items.length} positions detected</strong>
            <span class="result-source">from {result.source} ({loadedCount} total trades fetched)</span>
            {#each result.warnings as w}
              <span class="warning">⚠ {w}</span>
            {/each}
          </div>
        {:else if loading}
          <div class="loading-state">
            <span class="spinner">↻</span>
            <p>Syncing verified buyer trades...</p>
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: {(loadedCount > 0 ? 100 : 20)}%"></div>
            </div>
            <div class="progress-info">
              {loadedCount} trades retrieved
            </div>
          </div>
        {:else}
          <div class="action-inner">
            <span class="action-icon">⤓</span>
            <button class="btn-fetch" onclick={startImport}>Sync CSFloat Trades via API</button>
          </div>
        {/if}
      </div>

      {#if error}
        <p class="error-msg">✕ {error}</p>
      {/if}

      <!-- Merge options (only if existing data) -->
      {#if result && existing.length > 0}
        <div class="merge-opts">
          <label class="merge-opt">
            <input type="radio" bind:group={mergeMode} value="replace" />
            <span>Replace all — clear existing {existing.length} positions</span>
          </label>
          <label class="merge-opt">
            <input type="radio" bind:group={mergeMode} value="merge" />
            <span>Merge — keep existing, add new items only</span>
          </label>
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <button class="btn-cancel" onclick={onClose}>Cancel</button>
      <button class="btn-save" onclick={confirm} disabled={!result}>
        Import {result ? result.items.length + ' items' : ''}
      </button>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed; inset: 0; background: rgba(4,2,6,0.88);
    backdrop-filter: blur(10px); z-index: 1000;
    display: flex; align-items: center; justify-content: center;
  }

  .modal {
    background: #0e080c; border: 1px solid rgba(180,120,60,0.28);
    box-shadow: 0 0 80px rgba(139,20,40,0.25); width: min(520px, 92vw);
    position: relative;
  }

  .modal::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(180,120,60,0.7), transparent);
  }

  .modal-header {
    padding: 1.1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex; align-items: center; justify-content: space-between;
  }

  h3 { font-family: 'Playfair Display', Georgia, serif; font-size: 1rem; font-weight: 600; color: #e8d5c4; }

  .close { background: none; border: none; color: #4a3a2a; cursor: pointer; font-size: 0.9rem; transition: color 0.15s; }
  .close:hover { color: #c4a882; }

  .modal-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

  .sources { display: flex; gap: 0.5rem; }

  .source {
    flex: 1; border: 1px solid rgba(255,255,255,0.06); padding: 0.6rem 0.8rem;
    display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem;
    color: #5a4a3a;
  }

  .source.active { border-color: rgba(139,20,40,0.4); color: #c4a882; background: rgba(139,20,40,0.06); }
  .source.disabled { opacity: 0.5; }

  .source-icon { font-size: 1rem; color: #b4783c; }

  .badge {
    margin-left: auto; font-size: 0.6rem; letter-spacing: 0.12em;
    padding: 0.1rem 0.4rem; background: rgba(139,20,40,0.3); color: #c4a882;
  }
  .badge.coming { background: rgba(60,80,120,0.3); color: #7a9ab0; }

  .hint { font-size: 0.82rem; color: #5a4a3a; line-height: 1.6; }
  strong { color: #9a7a5a; font-weight: 400; }

  .import-area {
    border: 1px solid rgba(139,20,40,0.4); min-height: 140px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.18s; background: rgba(139,20,40,0.04);
  }
  
  .import-area.loading {
    border-color: rgba(180,120,60,0.3); background: rgba(180,120,60,0.03);
  }

  .action-inner {
    display: flex; flex-direction: column; align-items: center; gap: 1rem;
    color: #c4a882; font-size: 0.85rem; padding: 1rem;
  }

  .action-icon { font-size: 2.2rem; color: #8b1428; text-shadow: 0 0 10px rgba(139,20,40,0.4); }

  .btn-fetch {
    background: linear-gradient(135deg, #18050a, #300612); border: 1px solid rgba(180,80,80,0.4);
    color: #e8d5c4; padding: 0.6rem 1.4rem; font-family: inherit; font-weight: 600;
    font-size: 0.85rem; cursor: pointer; transition: all 0.2s; letter-spacing: 0.05em;
  }
  .btn-fetch:hover { border-color: rgba(220,100,100,0.6); box-shadow: 0 4px 15px rgba(139,20,40,0.5); }

  .loading-state {
    display: flex; flex-direction: column; align-items: center; gap: 0.8rem;
    color: #c4a882; font-size: 0.9rem; padding: 1.5rem; width: 100%;
  }

  .spinner { display: inline-block; font-size: 1.8rem; color: #8b1428; animation: spin 1s linear infinite; }
  @keyframes spin { 100% { transform: rotate(360deg); } }

  .progress-bar-container {
    width: 60%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;
  }
  .progress-bar {
    height: 100%; background: linear-gradient(90deg, #8b1428, #c4a882);
    transition: width 0.3s ease;
  }
  .progress-info { font-size: 0.75rem; color: #7a6a5a; }

  .result-preview {
    display: flex; flex-direction: column; align-items: center; gap: 0.3rem; padding: 1rem;
  }

  .result-icon { font-size: 1.5rem; color: #5a9e6a; }
  .result-preview strong { color: #c4a882; font-size: 0.95rem; }
  .result-source { font-size: 0.8rem; color: #8b1428; }
  .warning { font-size: 0.75rem; color: #a0783a; }

  .error-msg { font-size: 0.8rem; color: #a03040; margin-top: 0.5rem; }

  .merge-opts { display: flex; flex-direction: column; gap: 0.5rem; }

  .merge-opt {
    display: flex; align-items: center; gap: 0.6rem; font-size: 0.82rem;
    color: #7a6a5a; cursor: pointer;
  }
  .merge-opt input { accent-color: #8b1428; }

  .modal-footer {
    padding: 0.9rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.05);
    display: flex; gap: 0.6rem; justify-content: flex-end;
  }

  .btn-cancel {
    background: none; border: 1px solid rgba(255,255,255,0.08); color: #5a4a3a;
    padding: 0.4rem 0.9rem; font-family: inherit; font-size: 0.82rem; cursor: pointer;
  }

  .btn-save {
    background: linear-gradient(135deg, #8b1428, #5e0d1a);
    border: 1px solid rgba(180,80,80,0.3); color: #e8d5c4;
    padding: 0.4rem 1.2rem; font-family: inherit; font-size: 0.82rem;
    cursor: pointer; letter-spacing: 0.06em; transition: all 0.2s;
  }
  .btn-save:hover:not(:disabled) { background: linear-gradient(135deg, #a0182f, #8b1428); box-shadow: 0 4px 16px rgba(139,20,40,0.35); }
  .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
