<script>
  let { currentKey = '', onSave, onClose } = $props()
  let value = $state(currentKey)
  let show  = $state(false)
  function submit() { if (value.trim()) onSave(value.trim()) }
</script>

<div class="overlay" onclick={onClose}>
  <div class="modal" onclick={e => e.stopPropagation()}>
    <div class="mhdr">
      <h3>CSFloat API Key</h3>
      <button class="close" onclick={onClose}>✕</button>
    </div>
    <div class="mbody">
      <p>Stored locally in your browser. Used only to call CSFloat API via the local proxy.</p>
      <p class="hint">Find it at <strong>csfloat.com → Profile → Developer</strong></p>
      <div class="iw">
        <input type={show?'text':'password'} bind:value placeholder="Paste your API key…"
          onkeydown={e => e.key==='Enter'&&submit()} />
        <button class="vis" onclick={() => show=!show}>{show?'◉':'○'}</button>
      </div>
    </div>
    <div class="mftr">
      <button class="btn-c" onclick={onClose}>Cancel</button>
      <button class="btn-s" onclick={submit} disabled={!value.trim()}>Save Key</button>
    </div>
  </div>
</div>

<style>
  .overlay { position:fixed;inset:0;background:rgba(4,2,6,.88);backdrop-filter:blur(10px);z-index:1000;display:flex;align-items:center;justify-content:center; }
  .modal { background:#0e080c;border:1px solid rgba(180,120,60,.28);box-shadow:0 0 70px rgba(139,20,40,.28);width:min(460px,90vw);position:relative; }
  .modal::before { content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(180,120,60,.65),transparent); }
  .mhdr { padding:1.1rem 1.5rem;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;justify-content:space-between; }
  h3 { font-family:'Playfair Display',Georgia,serif;font-size:1rem;font-weight:600;color:#e8d5c4; }
  .close { background:none;border:none;color:#4a3a2a;cursor:pointer;font-size:.9rem;transition:color .15s; }
  .close:hover { color:#c4a882; }
  .mbody { padding:1.25rem 1.5rem;display:flex;flex-direction:column;gap:.7rem; }
  p { font-size:.85rem;color:#6a5a4a;line-height:1.6; }
  .hint { color:#5a4a3a; }
  strong { color:#9a7850;font-weight:400; }
  .iw { position:relative; }
  input { width:100%;background:#060306;border:1px solid rgba(180,120,60,.2);color:#e8d5c4;padding:.55rem 2.2rem .55rem .8rem;font-family:'Courier New',monospace;font-size:.82rem;outline:none;transition:border-color .15s; }
  input:focus { border-color:rgba(180,120,60,.5); }
  input::placeholder { color:#2a1a1a; }
  .vis { position:absolute;right:.55rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#4a3a2a;cursor:pointer;font-size:.95rem;transition:color .15s; }
  .vis:hover { color:#b4783c; }
  .mftr { padding:.9rem 1.5rem;border-top:1px solid rgba(255,255,255,.05);display:flex;gap:.6rem;justify-content:flex-end; }
  .btn-c { background:none;border:1px solid rgba(255,255,255,.08);color:#5a4a3a;padding:.38rem .9rem;font-family:inherit;font-size:.82rem;cursor:pointer; }
  .btn-s { background:linear-gradient(135deg,#8b1428,#5e0d1a);border:1px solid rgba(180,80,80,.3);color:#f0d8c0;padding:.38rem 1.1rem;font-family:inherit;font-size:.82rem;cursor:pointer;letter-spacing:.06em;transition:all .2s; }
  .btn-s:hover:not(:disabled) { background:linear-gradient(135deg,#a0182f,#8b1428); }
  .btn-s:disabled { opacity:.4;cursor:not-allowed; }
</style>
