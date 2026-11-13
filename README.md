# CosmoTiers

A modular Vite project for a Minecraft PvP tier-list and leaderboard website. The existing CosmoTiers blue-space visual identity and core interactions have been retained, while the app has been split into maintainable source files.

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
├── index.html             # App entry document
├── package.json           # Scripts and dependencies
├── vite.config.js         # Vite configuration
└── src/
    ├── config.js          # Modes, tiers and region metadata
    ├── main.js            # App startup and event handling
    ├── render.js          # Tabs, rankings table and player profile UI
    ├── storage.js         # Local browser player storage
    └── styles.css         # CosmoTiers theme and responsive layout
```

## Current leaderboard setup

- Starts with **zero players**. The old demonstration player list is removed.
- Shows a maximum of **10 players** in each mode, sorted by tier by default.
- Modes appear in this exact order: Sword, Axe, Mace, UHC, NethOP, Pot, SMP, Crystal, TNT Minecart, Spear, Trident.
- Player suggestions and edits are stored in the current browser only. They are not automatically published or verified.
- Existing local demo entries from the previous `cosmotiers-preview-players-v1` storage key are cleared when the new app starts.

## Notes

This is a frontend starter project. To make rankings shared between visitors or support accounts, moderation and official tier verification, connect the app to a backend/database in a later stage.
