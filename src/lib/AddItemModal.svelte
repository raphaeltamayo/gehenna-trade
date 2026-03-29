<script>
  let { onAdd, onClose } = $props()
  let name     = $state('')
  let type     = $state('skin')
  let qty      = $state(1)
  let avgBuy   = $state('')
  let firstBuy = $state(new Date().toISOString().slice(0,10))

  function submit() {
    if (!name.trim() || !avgBuy) return
    onAdd({ name:name.trim(), type, qty:Number(qty), firstBuy, avgBuy:Number(avgBuy), totalInvested:Number(qty)*Number(avgBuy), iconUrl:'' })
  }
</script>

<div class="overlay" onclick={onClose}>
  <div class="modal" onclick={e => e.stopPropagation()}>
    <div class="mhdr">
      <h3>Add Item</h3>
      <button class="close" onclick={onClose}>✕</button>
    </div>
    <div class="mbody">
      <div class="field full"><label>Item Name (exact Steam market name)</label><input type="text" bind:value={name} placeholder="AK-47 | Redline (Field-Tested)" /></div>
      <div class="row">
        <div class="field">
          <label>Type</label>
          <select bind:value={type}>
            <option value="skin">Skin</option>
            <option value="container">Case</option>
            <option value="sticker">Sticker</option>
            <option value="music_kit">Music Kit</option>
          </select>
        </div>
        <div class="field"><label>Quantity</label><input type="number" bind:value={qty} min="1" /></div>
      </div>
      <div class="row">
        <div class="field"><label>Avg Buy Price ($)</label><input type="number" bind:value={avgBuy} min="0" step="0.0001" placeholder="0.0000" /></div>
        <div class="field"><label>First Buy Date</label><input type="date" bind:value={firstBuy} /></div>
      </div>
      {#if qty && avgBuy}
        <div class="total">Total: <strong>${(Number(qty)*Number(avgBuy)).toFixed(2)}</strong></div>
      {/if}
    </div>
    <div class="mftr">
      <button class="btn-c" onclick={onClose}>Cancel</button>
      <button class="btn-s" onclick={submit} disabled={!name.trim()||!avgBuy}>Add Item</button>
    </div>
  </div>
</div>

<style>
  .overlay { position:fixed;inset:0;background:rgba(4,2,6,.88);backdrop-filter:blur(10px);z-index:1000;display:flex;align-items:center;justify-content:center; }
  .modal { background:#0e080c;border:1px solid rgba(180,120,60,.28);box-shadow:0 0 70px rgba(139,20,40,.28);width:min(460px,90vw);position:relative; }
  .modal::before { content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(180,120,60,.65),transparent); }
  .mhdr { padding:1rem 1.4rem;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;justify-content:space-between; }
  h3 { font-family:'Playfair Display',Georgia,serif;font-size:1rem;font-weight:600;color:#e8d5c4; }
  .close { background:none;border:none;color:#4a3a2a;cursor:pointer;font-size:.9rem; }
  .close:hover { color:#c4a882; }
  .mbody { padding:1.1rem 1.4rem;display:flex;flex-direction:column;gap:.75rem; }
  .field { display:flex;flex-direction:column;gap:.25rem;flex:1; }
  .field.full { width:100%; }
  .row { display:flex;gap:.65rem; }
  label { font-size:.65rem;letter-spacing:.14em;color:#4a3a2a;text-transform:uppercase; }
  input, select { width:100%;background:#060306;border:1px solid rgba(180,120,60,.2);color:#e8d5c4;padding:.48rem .7rem;font-family:'Courier New',monospace;font-size:.83rem;outline:none;transition:border-color .15s; }
  input:focus, select:focus { border-color:rgba(180,120,60,.5); }
  select option { background:#0e080c; }
  .total { font-size:.78rem;color:#5a4a3a;text-align:right;font-family:'Courier New',monospace; }
  strong { color:#b4783c;font-weight:400; }
  .mftr { padding:.85rem 1.4rem;border-top:1px solid rgba(255,255,255,.05);display:flex;gap:.5rem;justify-content:flex-end; }
  .btn-c { background:none;border:1px solid rgba(255,255,255,.08);color:#5a4a3a;padding:.35rem .85rem;font-family:inherit;font-size:.78rem;cursor:pointer; }
  .btn-s { background:linear-gradient(135deg,#8b1428,#5e0d1a);border:1px solid rgba(180,80,80,.3);color:#f0d8c0;padding:.35rem 1rem;font-family:inherit;font-size:.78rem;cursor:pointer;letter-spacing:.06em;transition:all .2s; }
  .btn-s:hover:not(:disabled) { background:linear-gradient(135deg,#a0182f,#8b1428); }
  .btn-s:disabled { opacity:.4;cursor:not-allowed; }
</style>
