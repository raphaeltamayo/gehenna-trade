<script>
  let { investment, onSave, onClose } = $props()
  let soldQty = $state(investment.soldQty || 0)
  let sellDate = $state(investment.sellDate || new Date().toISOString().slice(0, 10))
  let sellPrice = $state(investment.sellPrice || '')

  function submit() {
    if (!soldQty || !sellPrice) return
    onSave({ soldQty: Number(soldQty), sellDate, sellPrice: Number(sellPrice) })
  }

  let proceeds = $derived(soldQty && sellPrice ? (soldQty * sellPrice).toFixed(2) : null)
  let realisedPnl = $derived(proceeds ? (proceeds - soldQty * investment.avgBuy).toFixed(2) : null)
  let pnlPct = $derived(realisedPnl && investment.totalInvested ? ((realisedPnl / investment.totalInvested) * 100).toFixed(2) : null)
</script>

<div class="overlay" onclick={onClose}>
  <div class="modal" onclick={e => e.stopPropagation()}>
    <div class="modal-header">
      <h3>Record Sale</h3>
      <button class="close" onclick={onClose}>✕</button>
    </div>
    <div class="item-info">
      <span class="item-name">{investment.name}</span>
      <span class="item-meta">Avg buy: ${investment.avgBuy.toFixed(4)} · Qty held: {investment.qty}</span>
    </div>
    <div class="modal-body">
      <div class="field">
        <label>Quantity Sold</label>
        <input type="number" bind:value={soldQty} min="1" max={investment.qty} />
      </div>
      <div class="field">
        <label>Sell Date</label>
        <input type="date" bind:value={sellDate} />
      </div>
      <div class="field">
        <label>Sell Price / Unit ($)</label>
        <input type="number" bind:value={sellPrice} min="0" step="0.0001" placeholder="0.0000" />
      </div>
      {#if proceeds}
        <div class="preview">
          <div class="preview-row">
            <span>Total Proceeds</span>
            <span>${proceeds}</span>
          </div>
          <div class="preview-row">
            <span>Realised P&L</span>
            <span class:pos={realisedPnl > 0} class:neg={realisedPnl < 0}>
              {realisedPnl > 0 ? '+' : ''}${realisedPnl} ({pnlPct}%)
            </span>
          </div>
        </div>
      {/if}
    </div>
    <div class="modal-footer">
      <button class="btn-clear" onclick={() => onSave({ soldQty: 0, sellDate: null, sellPrice: null })}>Clear Sale</button>
      <button class="btn-cancel" onclick={onClose}>Cancel</button>
      <button class="btn-save" onclick={submit} disabled={!soldQty || !sellPrice}>Save</button>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed; inset: 0; background: rgba(4,2,6,0.85);
    backdrop-filter: blur(8px); z-index: 1000;
    display: flex; align-items: center; justify-content: center;
  }
  .modal {
    background: #0e080c; border: 1px solid rgba(180,120,60,0.3);
    box-shadow: 0 0 60px rgba(139,20,40,0.3); width: min(440px, 90vw);
    position: relative;
  }
  .modal::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(180,120,60,0.6), transparent);
  }
  .modal-header {
    padding: 1.1rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: space-between;
  }
  h3 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1rem; font-weight: 600; color: #e8d5c4;
  }
  .close {
    background: none; border: none; color: #5a4a3a; cursor: pointer; font-size: 0.9rem;
  }
  .close:hover { color: #c4a882; }
  .item-info {
    padding: 0.75rem 1.5rem; background: rgba(139,20,40,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.04);
    display: flex; flex-direction: column; gap: 0.2rem;
  }
  .item-name { font-size: 0.85rem; color: #c4a882; }
  .item-meta { font-size: 0.75rem; color: #5a4a3a; font-family: 'Courier New', monospace; }
  .modal-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0.85rem; }
  .field { display: flex; flex-direction: column; gap: 0.3rem; }
  label { font-size: 0.68rem; letter-spacing: 0.15em; color: #5a4a3a; text-transform: uppercase; }
  input {
    background: #060306; border: 1px solid rgba(180,120,60,0.2); color: #e8d5c4;
    padding: 0.5rem 0.7rem; font-family: 'Courier New', monospace; font-size: 0.85rem;
    outline: none; transition: border-color 0.15s; width: 100%;
  }
  input:focus { border-color: rgba(180,120,60,0.5); }
  .preview {
    background: rgba(139,20,40,0.08); border: 1px solid rgba(139,20,40,0.2);
    padding: 0.75rem; display: flex; flex-direction: column; gap: 0.4rem;
  }
  .preview-row {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 0.82rem; font-family: 'Courier New', monospace;
  }
  .preview-row span:first-child { color: #6a5a4a; }
  .preview-row span:last-child { color: #c4a882; }
  .pos { color: #5a9e6a !important; }
  .neg { color: #a03040 !important; }
  .modal-footer {
    padding: 0.9rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.06);
    display: flex; gap: 0.6rem; justify-content: flex-end;
  }
  .btn-clear {
    background: none; border: 1px solid rgba(255,255,255,0.08); color: #4a3a2a;
    padding: 0.4rem 0.8rem; font-family: inherit; font-size: 0.8rem; cursor: pointer;
    margin-right: auto; transition: all 0.15s;
  }
  .btn-clear:hover { color: #6a5a4a; }
  .btn-cancel {
    background: none; border: 1px solid rgba(255,255,255,0.1); color: #6a5a4a;
    padding: 0.4rem 0.9rem; font-family: inherit; font-size: 0.82rem; cursor: pointer;
  }
  .btn-save {
    background: linear-gradient(135deg, #8b1428, #5e0d1a);
    border: 1px solid rgba(180,80,80,0.35); color: #f0d8c0;
    padding: 0.4rem 1.1rem; font-family: inherit; font-size: 0.82rem;
    cursor: pointer; letter-spacing: 0.06em; transition: all 0.2s;
  }
  .btn-save:hover:not(:disabled) { background: linear-gradient(135deg, #a0182f, #8b1428); }
  .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
