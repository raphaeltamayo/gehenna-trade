<script>
  let { investment, onSave, onClose } = $props()
  let soldQty   = $state(investment.soldQty || 0)
  let sellDate  = $state(investment.sellDate || new Date().toISOString().slice(0,10))
  let sellPrice = $state(investment.sellPrice || '')

  let proceeds    = $derived(soldQty && sellPrice ? (soldQty * sellPrice).toFixed(2) : null)
  let realisedPnl = $derived(proceeds != null ? (proceeds - soldQty * investment.avgBuy).toFixed(2) : null)
  let pct         = $derived(realisedPnl && investment.totalInvested ? ((realisedPnl/investment.totalInvested)*100).toFixed(2) : null)

  function submit() {
    if (!soldQty || !sellPrice) return
    onSave({ soldQty:Number(soldQty), sellDate, sellPrice:Number(sellPrice) })
  }
</script>

<div class="overlay" onclick={onClose}>
  <div class="modal" onclick={e => e.stopPropagation()}>
    <div class="mhdr">
      <h3>Record Sale</h3>
      <button class="close" onclick={onClose}>✕</button>
    </div>
    <div class="item-info">
      <span class="iname">{investment.name}</span>
      <span class="imeta">Avg buy ${investment.avgBuy.toFixed(4)} · Qty {investment.qty}</span>
    </div>
    <div class="mbody">
      <div class="field"><label>Quantity Sold</label><input type="number" bind:value={soldQty} min="1" max={investment.qty} /></div>
      <div class="field"><label>Sell Date</label><input type="date" bind:value={sellDate} /></div>
      <div class="field"><label>Sell Price / Unit ($)</label><input type="number" bind:value={sellPrice} min="0" step="0.0001" placeholder="0.0000" /></div>
      {#if proceeds}
        <div class="preview">
          <div class="pr"><span>Total Proceeds</span><span>${proceeds}</span></div>
          <div class="pr">
            <span>Realised P&L</span>
            <span class:pos={realisedPnl>0} class:neg={realisedPnl<0}>{realisedPnl>0?'+':''}${realisedPnl} ({pct}%)</span>
          </div>
        </div>
      {/if}
    </div>
    <div class="mftr">
      <button class="btn-clr" onclick={() => onSave({soldQty:0,sellDate:null,sellPrice:null})}>Clear</button>
      <button class="btn-c" onclick={onClose}>Cancel</button>
      <button class="btn-s" onclick={submit} disabled={!soldQty||!sellPrice}>Save</button>
    </div>
  </div>
</div>

<style>
  .overlay { position:fixed;inset:0;background:rgba(4,2,6,.88);backdrop-filter:blur(10px);z-index:1000;display:flex;align-items:center;justify-content:center; }
  .modal { background:#0e080c;border:1px solid rgba(180,120,60,.28);box-shadow:0 0 70px rgba(139,20,40,.28);width:min(420px,90vw);position:relative; }
  .modal::before { content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(180,120,60,.65),transparent); }
  .mhdr { padding:1rem 1.4rem;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;justify-content:space-between; }
  h3 { font-family:'Playfair Display',Georgia,serif;font-size:1rem;font-weight:600;color:#e8d5c4; }
  .close { background:none;border:none;color:#4a3a2a;cursor:pointer;font-size:.9rem; }
  .close:hover { color:#c4a882; }
  .item-info { padding:.65rem 1.4rem;background:rgba(139,20,40,.05);border-bottom:1px solid rgba(255,255,255,.04);display:flex;flex-direction:column;gap:.2rem; }
  .iname { font-size:.83rem;color:#c4a882; }
  .imeta { font-size:.72rem;color:#4a3a2a;font-family:'Courier New',monospace; }
  .mbody { padding:1.1rem 1.4rem;display:flex;flex-direction:column;gap:.75rem; }
  .field { display:flex;flex-direction:column;gap:.25rem; }
  label { font-size:.65rem;letter-spacing:.14em;color:#4a3a2a;text-transform:uppercase; }
  input { width:100%;background:#060306;border:1px solid rgba(180,120,60,.2);color:#e8d5c4;padding:.48rem .7rem;font-family:'Courier New',monospace;font-size:.83rem;outline:none;transition:border-color .15s; }
  input:focus { border-color:rgba(180,120,60,.5); }
  .preview { background:rgba(139,20,40,.07);border:1px solid rgba(139,20,40,.18);padding:.65rem;display:flex;flex-direction:column;gap:.35rem; }
  .pr { display:flex;justify-content:space-between;font-size:.8rem;font-family:'Courier New',monospace; }
  .pr span:first-child { color:#5a4a3a; }
  .pr span:last-child { color:#c4a882; }
  .pos { color:#5a9e6a !important; }
  .neg { color:#a03040 !important; }
  .mftr { padding:.85rem 1.4rem;border-top:1px solid rgba(255,255,255,.05);display:flex;gap:.5rem;justify-content:flex-end; }
  .btn-clr { background:none;border:1px solid rgba(255,255,255,.07);color:#3a2a1a;padding:.35rem .75rem;font-family:inherit;font-size:.78rem;cursor:pointer;margin-right:auto; }
  .btn-clr:hover { color:#6a5a4a; }
  .btn-c { background:none;border:1px solid rgba(255,255,255,.08);color:#5a4a3a;padding:.35rem .85rem;font-family:inherit;font-size:.78rem;cursor:pointer; }
  .btn-s { background:linear-gradient(135deg,#8b1428,#5e0d1a);border:1px solid rgba(180,80,80,.3);color:#f0d8c0;padding:.35rem 1rem;font-family:inherit;font-size:.78rem;cursor:pointer;letter-spacing:.06em;transition:all .2s; }
  .btn-s:hover:not(:disabled) { background:linear-gradient(135deg,#a0182f,#8b1428); }
  .btn-s:disabled { opacity:.4;cursor:not-allowed; }
</style>
