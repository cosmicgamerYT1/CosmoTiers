const STORAGE_KEY = 'cosmotiers.players.v2';
const LEGACY_KEYS = ['cosmotiers-preview-players-v1'];

export function loadPlayers() {
  try {
    // Remove the previous demo-data store so the new leaderboard starts empty.
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((player) =>
      player && typeof player.name === 'string' && typeof player.region === 'string' &&
      player.tiers && typeof player.tiers === 'object'
    );
  } catch {
    return [];
  }
}

export function savePlayers(players) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    return true;
  } catch {
    return false;
  }
}
