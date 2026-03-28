<script>
  let { currentKey = '', onSave, onClose } = $props()
  let value = $state(currentKey)
  let show = $state(false)

  function submit() {
    if (value.trim()) onSave(value.trim())
  }
</script>

<div class="overlay" onclick={onClose}>
  <div class="modal" onclick={e => e.stopPropagation()}>
    <div class="modal-header">
      <span class="modal-icon">⚿</span>
      <h3>CSFloat API Key</h3>
      <button class="close" onclick={onClose}>✕</button>
    </div>
    <div class="modal-body">
      <p>Your API key is stored locally in your browser and never sent anywhere except CSFloat's API.</p>
      <p class="hint">Find it at <strong>csfloat.com → Profile → Developer</strong></p>
      <div class="input-wrap">
        <input
          type={show ? 'text' : 'password'}
          bind:value
          placeholder="Paste your API key..."
          onkeydown={e => e.key === 'Enter' && submit()}
        />
        <button class="toggle-vis" onclick={() => show = !show}>{show ? '◉' : '○'}</button>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-cancel" onclick={onClose}>Cancel</button>
      <button class="btn-save" onclick={submit} disabled={!value.trim()}>Save Key</button>
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
    background: #0e080c;
    border: 1px solid rgba(180,120,60,0.3);
    box-shadow: 0 0 60px rgba(139,20,40,0.3), 0 0 120px rgba(139,20,40,0.1);
    width: min(480px, 90vw);
    position: relative;
  }

  .modal::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(180,120,60,0.6), transparent);
  }

  .modal-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; gap: 0.75rem;
  }

  .modal-icon { font-size: 1.3rem; color: #b4783c; }

  h3 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.1rem; font-weight: 600; color: #e8d5c4; flex: 1;
  }

  .close {
    background: none; border: none; color: #5a4a3a; cursor: pointer;
    font-size: 0.9rem; padding: 0.2rem 0.4rem; transition: color 0.15s;
  }
  .close:hover { color: #c4a882; }

  .modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }

  p { font-size: 0.88rem; color: #8a7a6a; line-height: 1.6; }
  .hint { color: #6a5a4a; }
  strong { color: #b4783c; font-weight: 400; }

  .input-wrap { position: relative; margin-top: 0.5rem; }

  input {
    width: 100%; background: #060306; border: 1px solid rgba(180,120,60,0.25);
    color: #e8d5c4; padding: 0.65rem 2.5rem 0.65rem 0.85rem;
    font-family: 'Courier New', monospace; font-size: 0.82rem;
    outline: none; transition: border-color 0.15s;
  }
  input:focus { border-color: rgba(180,120,60,0.55); }
  input::placeholder { color: #3a2a2a; }

  .toggle-vis {
    position: absolute; right: 0.6rem; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: #5a4a3a; cursor: pointer; font-size: 1rem;
    transition: color 0.15s;
  }
  .toggle-vis:hover { color: #b4783c; }

  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(255,255,255,0.06);
    display: flex; gap: 0.75rem; justify-content: flex-end;
  }

  .btn-cancel {
    background: none; border: 1px solid rgba(255,255,255,0.1); color: #6a5a4a;
    padding: 0.45rem 1rem; font-family: inherit; font-size: 0.85rem;
    cursor: pointer; transition: all 0.15s;
  }
  .btn-cancel:hover { border-color: rgba(255,255,255,0.2); color: #8a7a6a; }

  .btn-save {
    background: linear-gradient(135deg, #8b1428, #5e0d1a);
    border: 1px solid rgba(180,80,80,0.35); color: #f0d8c0;
    padding: 0.45rem 1.2rem; font-family: inherit; font-size: 0.85rem;
    cursor: pointer; letter-spacing: 0.08em; transition: all 0.2s;
  }
  .btn-save:hover:not(:disabled) { background: linear-gradient(135deg, #a0182f, #8b1428); box-shadow: 0 4px 16px rgba(139,20,40,0.4); }
  .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
