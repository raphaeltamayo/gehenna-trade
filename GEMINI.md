# Gehenna Trades - Project Documentation

## Project Overview
**Gehenna Trades** is a CS2 portfolio application designed for tracking and managing visual investments (CS2 skins, containers, and items). 

### Key UX Priority
The central philosophy of this project is **"Least user hassle"**. This means minimizing manual effort for the user at all times. Automation (e.g., using API keys to sync data directly) is strongly preferred over manual processes like CSV/JSON file uploads or data entry.

### Design System
The visual style is heavily inspired by **Aru from Blue Archive**.
- **Aesthetic Focus:** "Outlaw CEO" / "Problem Solver 68" vibe. High contrast, elegant yet slightly imposing.
- **Colors:** Deep burgundy/crimson (`#8b1428`), contrasting against dark backgrounds (`#080508`) with gold/amber text (`#e8d5c4`, `#c4a882`) and elegant line separators.
- **Typography:** Serif fonts (`Playfair Display`, `Crimson Pro`) to convey a premium and intelligent atmosphere. 

### Technology Stack
- **Frontend Framework:** Svelte 5 with Vite.
- **Styling:** Vanilla CSS with custom utility/scoping.
- **API Proxy:** Used Bun to create an internal proxy (`proxy/index.ts`) for bypassing remote CORS issues when requesting CSFloat's API directly from the browser.
- **Types:** TypeScript integration used progressively, especially for new network logic and data structures.

## Core Features
1. **Direct API Imports (CSFloat):** The app communicates directly with `csfloat.com` via an API Key to fetch verified investor trades automatically. 
2. **Realtime Pricing Fetch:** Retrieves current prices and Steam reference data on the fly.
3. **Portfolio Table:** Renders profit/loss, aggregate quantities, and status ("HOLDING", "PARTIAL", "SOLD").

---

### Context Tree
*(Use child `GEMINI_*.md` files or subdirectories for specific modules if system complexity grows)*
- `GEMINI.md` (Root documentation)
