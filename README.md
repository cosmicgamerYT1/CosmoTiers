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
│   └── icons/             # Mode icons (provided and temporary placeholders)
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

The supplied icons are currently assigned to Sword, Axe, Mace, UHC, NethOP, Pot and SMP. Overall, Crystal, TNT Minecart, Spear and Trident use temporary matching blue SVG icons. Replace the corresponding files in `public/icons/` when the remaining final images are provided; keep the same filenames or update `src/config.js`.

## Notes

This is a frontend starter project. To make player rankings searchable across devices and visitors, connect the website to a shared backend/database in a later stage. At present, suggestions and player data remain in local browser storage.
