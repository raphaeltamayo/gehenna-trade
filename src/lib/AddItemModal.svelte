<script>
  let { onAdd, onClose } = $props()
  let name = $state('')
  let type = $state('skin')
  let qty = $state(1)
  let avgBuy = $state('')
  let firstBuy = $state(new Date().toISOString().slice(0, 10))

  function submit() {
    if (!name.trim() || !avgBuy) return
    onAdd({
      name: name.trim(),
      type,
      qty: Number(qty),
      firstBuy,
      avgBuy: Number(avgBuy),
      totalInvested: Number(qty) * Number(avgBuy),
    })
  }
</script>

<div class="overlay" onclick={onClose}>
  <div class="modal" onclick={e => e.stopPropagation()}>
    <div class="modal-header">
      <h3>Add Investment</h3>
      <button class="close" onclick={onClose}>✕</button>
    </div>
    <div class="modal-body">
      <div class="field full">
        <label>Item Name (exact Steam market name)</label>
        <input type="text" bind:value={name} placeholder="AK-47 | Redline (Field-Tested)" />
      </div>
      <div class="row">
        <div class="field">
          <label>Type</label>
          <select bind:value={type}>
            <option value="skin">Skin</option>
            <option value="container">Case / Container</option>
            <option value="sticker">Sticker</option>
            <option value="music_kit">Music Kit</option>
          </select>
        </div>
        <div class="field">
          <label>Quantity</label>
          <input type="number" bind:value={qty} min="1" />
        </div>
      </div>
      <div class="row">
        <div class="field">
          <label>Avg Buy Price ($)</label>
          <input type="number" bind:value={avgBuy} min="0" step="0.0001" placeholder="0.0000" />
        </div>
        <div class="field">
          <label>First Buy Date</label>
          <input type="date" bind:value={firstBuy} />
        </div>
      </div>
      {#if qty && avgBuy}
        <div class="total-preview">
          Total Invested: <strong>${(Number(qty) * Number(avgBuy)).toFixed(2)}</strong>
        </div>
      {/if}
    </div>
    <div class="modal-footer">
      <button class="btn-cancel" onclick={onClose}>Cancel</button>
      <button class="btn-save" onclick={submit} disabled={!name.trim() || !avgBuy}>Add Item</button>
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
    box-shadow: 0 0 60px rgba(139,20,40,0.3); width: min(480px, 90vw);
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
  .close { background: none; border: none; color: #5a4a3a; cursor: pointer; font-size: 0.9rem; }
  .close:hover { color: #c4a882; }
  .modal-body { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0.85rem; }
  .field { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; }
  .field.full { width: 100%; }
  .row { display: flex; gap: 0.75rem; }
  label { font-size: 0.68rem; letter-spacing: 0.15em; color: #5a4a3a; text-transform: uppercase; }
  input, select {
    background: #060306; border: 1px solid rgba(180,120,60,0.2); color: #e8d5c4;
    padding: 0.5rem 0.7rem; font-family: 'Courier New', monospace; font-size: 0.85rem;
    outline: none; transition: border-color 0.15s; width: 100%;
  }
  input:focus, select:focus { border-color: rgba(180,120,60,0.5); }
  select option { background: #0e080c; }
  .total-preview {
    font-size: 0.8rem; color: #6a5a4a; text-align: right;
    font-family: 'Courier New', monospace;
  }
  strong { color: #b4783c; font-weight: 400; }
  .modal-footer {
    padding: 0.9rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.06);
    display: flex; gap: 0.6rem; justify-content: flex-end;
  }
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
