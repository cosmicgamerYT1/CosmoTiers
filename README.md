# CosmoTiers

CosmoTiers is a modular Vite project for a Minecraft PvP tier-list and leaderboard website, with a blue space theme and mode-specific player rankings.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

The deployable site is generated in `dist/`.

## Project structure

```text
cosmotiers/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── icons/             # Overall and game-mode SVG icons
└── src/
    ├── config.js          # Modes, icon paths, tiers and region metadata
    ├── main.js            # App startup, search and event handling
    ├── render.js          # Tabs, leaderboard and player profiles
    ├── storage.js         # Local browser player storage
    └── styles.css         # CosmoTiers theme and responsive layout
```

## Game-mode order

1. Overall
2. Sword
3. Axe
4. Mace
5. UHC
6. NethOP
7. Pot
8. SMP
9. Crystal
10. TNT Minecart
11. Spear
12. Trident

The Overall leaderboard adds the tier scores across the 11 competitive modes. Each mode has its own independent tier ladder and ranking order.

## Tier guide labels and colours

- Tier 1 — Master (gold)
- Tier 2 — Elite (silver)
- Tier 3 — Advanced (bronze / brown)
- Tier 4 — Skilled (blue)
- Tier 5 — Beginner (grey)

HT and LT badges share their tier colour family, with high-tier and low-tier shades distinguished in the stylesheet.

## Player search and profiles

- The **Search player** button opens a centered username search dialog.
- Search checks the players currently stored in this CosmoTiers dataset. Exact matches show the player's profile; partial matches show selectable results.
- Player profiles show their Overall rank and points, plus each mode's tier and mode rank.
- The search does not query Mojang/Microsoft account services or an online shared database.

## Current leaderboard setup

- Starts with **zero players**. Older preview/demo storage keys are cleared.
- Shows a maximum of **10 players** in each selected leaderboard.
- Players are ranked by their tier in the selected mode. Overall uses the sum of tier scores across the 11 competitive modes.
- Player suggestions are stored in the current browser only. They are local preview entries, not verified or published rankings.
- A blank **SERVER IP** card is reserved for the server address to be added later.

## Icons

All 12 supplied SVG icons are now installed and assigned to their matching entries: Overall, Sword, Axe, Mace, UHC, NethOP, Pot, SMP, Crystal, TNT Minecart, Spear and Trident. The five latest icons are assigned to Overall, Crystal, TNT Minecart, Spear and Trident.

## Notes

This is a frontend starter project. To make player rankings searchable across devices and visitors, connect the website to a shared backend/database in a later stage. At present, suggestions and player data remain in local browser storage.
