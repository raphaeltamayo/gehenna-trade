# Gehenna Trade — CS2 Investment Tracker

## Setup
bun install

## Development (two terminals)
Terminal 1: bun run dev          → http://localhost:5173
Terminal 2: bun run proxy/index.ts   → http://localhost:3001 (CORS proxy)

## First use
1. API Key button → paste your CSFloat key (csfloat.com → Profile → Developer)
2. Import button → drop your CSFloat trades JSON
3. Refresh Prices → fetches live CSFloat + Steam prices

## Adding items
+ Add button → item name (exact Steam market name), type, qty, buy price.
Image loads automatically on next refresh.

## Steam inventory import
Drop your inventory JSON (steamcommunity.com/inventory/STEAMID/730/2?l=english&count=5000).
Purchase prices not available from inventory — fill manually.

## Production build
bun run build → serve dist/ statically + run proxy as a server
