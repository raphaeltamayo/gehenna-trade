<script>
  import Portfolio from './lib/Portfolio.svelte'
  import ApiKeyModal from './lib/ApiKeyModal.svelte'
  import ImportModal from './lib/ImportModal.svelte'
  import { loadInvestments } from './lib/store.js'

  let apiKey      = $state(localStorage.getItem('csfloat_api_key') || '')
  let investments = $state(loadInvestments())
  let showApiKey  = $state(!apiKey)
  let showImport  = $state(false)

  function onKeySet(key) {
    apiKey = key
    localStorage.setItem('csfloat_api_key', key)
    showApiKey = false
    if (investments.length === 0) showImport = true
  }

  function onImport(items) {
    investments = items
    showImport = false
  }
</script>

<div class="app">
  <header>
    <div class="header-inner">
      <div class="logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="none" stroke="#b4783c" stroke-width="1.2"/>
          <polygon points="12,6 18,9.5 18,16.5 12,20 6,16.5 6,9.5" fill="#8b1428" opacity="0.4"/>
        </svg>
        <div>
          <h1>GEHENNA<span class="accent">.TRADE</span></h1>
          <p class="tagline">CS2 Investment Intelligence</p>
        </div>
      </div>
      <nav>
        <button class="nav-btn" onclick={() => showImport = true}>⤓ Import</button>
        <button class="nav-btn" onclick={() => showApiKey = true}>⚿ API Key</button>
      </nav>
    </div>
  </header>

  <main>
    {#if investments.length === 0}
      <div class="landing">
        <div class="landing-inner">
          <svg class="landing-hex" width="80" height="80" viewBox="0 0 24 24">
            <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="none" stroke="#2a1018" stroke-width="0.8"/>
            <polygon points="12,5 19,8.7 19,16.3 12,20 5,16.3 5,8.7" fill="#1a0810" stroke="#3a1020" stroke-width="0.5"/>
          </svg>
          <h2>Track your CS2 investments</h2>
          <p>Import your trade history from CSFloat to get started.<br/>Steam inventory support is ready for future use.</p>
          <div class="landing-actions">
            {#if !apiKey}
              <button class="btn-primary" onclick={() => showApiKey = true}>Configure API Key</button>
            {/if}
            <button class="btn-primary" onclick={() => showImport = true}>⤓ Import Trades</button>
          </div>
        </div>
      </div>
    {:else}
      <Portfolio {apiKey} bind:investments />
    {/if}
  </main>

  {#if showApiKey}
    <ApiKeyModal currentKey={apiKey} onSave={onKeySet} onClose={() => showApiKey = false} />
  {/if}

  {#if showImport}
    <ImportModal {apiKey} existing={investments} onImport={onImport} onClose={() => showImport = false} />
  {/if}
</div>

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; margin: 0; padding: 0; }

  :global(body) {
    background: #11080a;
    color: #f6e8d8;
    font-family: 'Crimson Pro', 'Palatino Linotype', Georgia, serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  :global(body::before) {
    content: '';
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 80% 40% at 50% -5%, rgba(130,15,35,0.22) 0%, transparent 65%),
      radial-gradient(ellipse 35% 25% at 95% 85%, rgba(70,15,90,0.14) 0%, transparent 55%),
      repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(130,15,35,0.025) 80px, rgba(130,15,35,0.025) 81px);
  }

  .app { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }

  header {
    border-bottom: 1px solid rgba(180,120,60,0.3);
    background: rgba(17,8,10,0.94); backdrop-filter: blur(16px);
    position: sticky; top: 0; z-index: 100;
  }

  .header-inner {
    max-width: 1700px; margin: 0 auto; padding: 0 1.5rem;
    height: 58px; display: flex; align-items: center; justify-content: space-between;
  }

  .logo { display: flex; align-items: center; gap: 0.75rem; }

  h1 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.05rem; font-weight: 700; letter-spacing: 0.18em; color: #f6e8d8; line-height: 1;
  }

  .accent { color: #8b1428; }

  .tagline { font-size: 0.58rem; letter-spacing: 0.22em; color: #5a4a3a; text-transform: uppercase; margin-top: 3px; }

  nav { display: flex; gap: 0.5rem; }

  .nav-btn {
    background: transparent; border: 1px solid rgba(180,120,60,0.22); color: #7a5a3a;
    padding: 0.32rem 0.8rem; font-family: inherit; font-size: 0.78rem;
    cursor: pointer; letter-spacing: 0.06em; transition: all 0.15s;
  }
  .nav-btn:hover { border-color: rgba(180,120,60,0.5); color: #b4783c; background: rgba(180,120,60,0.06); }

  main { max-width: 1700px; margin: 0 auto; padding: 1.5rem; flex: 1; width: 100%; }

  .landing { display: flex; align-items: center; justify-content: center; min-height: 65vh; }

  .landing-inner { display: flex; flex-direction: column; align-items: center; gap: 1rem; text-align: center; }

  .landing-hex { opacity: 0.6; margin-bottom: 0.5rem; }

  .landing-inner h2 { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: #c4a882; font-weight: 600; }

  .landing-inner p { color: #5a4a3a; font-size: 0.92rem; line-height: 1.7; }

  .landing-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }

  .btn-primary {
    background: linear-gradient(135deg, #8b1428, #5e0d1a);
    border: 1px solid rgba(180,80,80,0.3); color: #f0d8c0;
    padding: 0.5rem 1.4rem; font-family: inherit; font-size: 0.88rem;
    cursor: pointer; letter-spacing: 0.08em; transition: all 0.2s;
  }
  .btn-primary:hover { background: linear-gradient(135deg, #a0182f, #8b1428); box-shadow: 0 6px 24px rgba(139,20,40,0.4); }
</style>
