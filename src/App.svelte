<script>
  import Portfolio from './lib/Portfolio.svelte'
  import ApiKeyModal from './lib/ApiKeyModal.svelte'

  let apiKey = $state(localStorage.getItem('csfloat_api_key') || '')
  let showModal = $state(!apiKey)

  function onKeySet(key) {
    apiKey = key
    localStorage.setItem('csfloat_api_key', key)
    showModal = false
  }
</script>

<div class="app">
  <header>
    <div class="header-inner">
      <div class="logo">
        <span class="logo-mark">⬡</span>
        <div>
          <h1>GEHENNA<span class="accent">.TRADE</span></h1>
          <p class="tagline">CS2 Investment Intelligence</p>
        </div>
      </div>
      <button class="btn-ghost" onclick={() => showModal = true}>⚿ API Key</button>
    </div>
  </header>

  <main>
    {#if apiKey}
      <Portfolio {apiKey} />
    {:else}
      <div class="empty-state">
        <span class="empty-hex">⬡</span>
        <h2>No API Key Configured</h2>
        <p>Connect your CSFloat account to track investments.</p>
        <button class="btn-primary" onclick={() => showModal = true}>Configure API Key</button>
      </div>
    {/if}
  </main>

  {#if showModal}
    <ApiKeyModal currentKey={apiKey} onSave={onKeySet} onClose={() => showModal = false} />
  {/if}
</div>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }

  :global(body) {
    background: #080508;
    color: #e8d5c4;
    font-family: 'Crimson Pro', 'Palatino Linotype', Georgia, serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  :global(body::before) {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 40% at 50% -5%, rgba(130, 15, 35, 0.2) 0%, transparent 65%),
      radial-gradient(ellipse 35% 25% at 95% 85%, rgba(70, 15, 90, 0.14) 0%, transparent 55%),
      repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(130,15,35,0.025) 80px, rgba(130,15,35,0.025) 81px);
    pointer-events: none;
    z-index: 0;
  }

  .app { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }

  header {
    border-bottom: 1px solid rgba(180,120,60,0.2);
    background: rgba(8,5,8,0.92);
    backdrop-filter: blur(16px);
    position: sticky; top: 0; z-index: 100;
  }

  .header-inner {
    max-width: 1600px; margin: 0 auto; padding: 0 2rem;
    height: 60px; display: flex; align-items: center; justify-content: space-between;
  }

  .logo { display: flex; align-items: center; gap: 0.8rem; }

  .logo-mark {
    font-size: 1.5rem; color: #b4783c; line-height: 1;
    filter: drop-shadow(0 0 10px rgba(180,120,60,0.6));
  }

  h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.1rem; font-weight: 700; letter-spacing: 0.18em; color: #e8d5c4; line-height: 1;
  }

  .accent { color: #8b1428; }

  .tagline {
    font-size: 0.6rem; letter-spacing: 0.22em; color: #6a5a4a;
    text-transform: uppercase; margin-top: 3px;
  }

  .btn-ghost {
    background: transparent; border: 1px solid rgba(180,120,60,0.28); color: #b4783c;
    padding: 0.35rem 0.85rem; font-family: inherit; font-size: 0.82rem;
    cursor: pointer; letter-spacing: 0.06em; transition: all 0.18s;
  }
  .btn-ghost:hover { background: rgba(180,120,60,0.08); border-color: rgba(180,120,60,0.55); }

  main { max-width: 1600px; margin: 0 auto; padding: 2rem; flex: 1; }

  .empty-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 60vh; gap: 1rem; text-align: center;
  }

  .empty-hex { font-size: 5rem; color: #1e0810; display: block; }

  .empty-state h2 {
    font-family: 'Playfair Display', serif; font-size: 1.6rem; color: #c4a882; font-weight: 600;
  }

  .empty-state p { color: #6a5a4a; font-size: 0.95rem; }

  .btn-primary {
    background: linear-gradient(135deg, #8b1428 0%, #5e0d1a 100%);
    border: 1px solid rgba(180,80,80,0.35); color: #f0d8c0;
    padding: 0.55rem 1.6rem; font-family: inherit; font-size: 0.9rem;
    cursor: pointer; letter-spacing: 0.1em; transition: all 0.2s; margin-top: 0.5rem;
  }
  .btn-primary:hover { background: linear-gradient(135deg, #a0182f 0%, #8b1428 100%); box-shadow: 0 6px 24px rgba(139,20,40,0.45); }
</style>
