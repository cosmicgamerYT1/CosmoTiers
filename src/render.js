import { MODES, REGIONS, TIER_SCORE } from './config.js';

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

export function tierClass(tier) {
  return `tier-${String(tier || 'unranked').toLowerCase()}`;
}

export function tierBadge(tier) {
  const value = tier || 'Unranked';
  return `<span class="tier-pill ${tierClass(value)}">${value === 'Unranked' ? '—' : escapeHtml(value)}</span>`;
}

export function renderModeTabs(activeMode) {
  document.getElementById('categoryTabs').innerHTML = MODES.map((mode) => `
    <button class="category-tab ${mode.id === activeMode ? 'active' : ''}"
      data-mode="${escapeHtml(mode.id)}" role="tab" aria-selected="${mode.id === activeMode}">
      <span class="category-icon" aria-hidden="true">${mode.icon}</span><span>${escapeHtml(mode.label)}</span>
    </button>
  `).join('');
}

export function sortAndLimitPlayers(players, activeMode) {
  const search = document.getElementById('playerSearch').value.trim().toLowerCase();
  const region = document.getElementById('regionFilter').value;
  const sort = document.getElementById('sortFilter').value;
  const matching = players.filter((player) =>
    player.name.toLowerCase().includes(search) && (region === 'all' || player.region === region)
  );

  if (sort === 'name') {
    matching.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    matching.sort((a, b) =>
      (TIER_SCORE[b.tiers?.[activeMode] || 'Unranked'] || 0) -
      (TIER_SCORE[a.tiers?.[activeMode] || 'Unranked'] || 0) ||
      a.name.localeCompare(b.name)
    );
  }
  return { matching, visible: matching.slice(0, 10) };
}

export function renderTableHead(activeMode) {
  const columns = MODES.map((mode) => `
    <th class="mode-column ${mode.id === activeMode ? 'active-mode' : ''}" scope="col">${escapeHtml(mode.label)}</th>
  `).join('');
  document.getElementById('tableHead').innerHTML = `
    <tr>
      <th scope="col" style="width:72px">Rank</th>
      <th scope="col" style="width:240px">Player</th>
      <th scope="col" style="width:150px">Region</th>
      ${columns}
    </tr>
  `;
}

export function renderRows(players, activeMode) {
  const { matching, visible } = sortAndLimitPlayers(players, activeMode);
  const body = document.getElementById('leaderboardBody');
  const table = document.querySelector('.table-wrap table');
  const emptyState = document.getElementById('emptyState');
  const search = document.getElementById('playerSearch').value.trim();

  if (visible.length === 0) {
    body.innerHTML = '';
    table.style.display = 'table';
    emptyState.style.display = 'block';
    emptyState.innerHTML = matching.length === 0 && !search && document.getElementById('regionFilter').value === 'all'
      ? '<strong>No players ranked yet</strong><span>Be the first to appear on the CosmoTiers leaderboard.<br>Use “Suggest player” to add a local preview entry.</span>'
      : '<strong>No players found</strong><span>Try another username or change the region filter.</span>';
  } else {
    table.style.display = 'table';
    emptyState.style.display = 'none';
    body.innerHTML = visible.map((player, index) => {
      const region = REGIONS[player.region] || { name: 'Unknown', flag: '🌐' };
      const rank = index + 1;
      const rankMark = rank === 1 ? '<span class="rank-crown">✦</span>' : '';
      const safeName = escapeHtml(player.name);
      const playerInfo = `
        <div class="player-info">
          <span class="avatar">${escapeHtml(player.name.slice(0, 2).toUpperCase())}</span>
          <span><span class="player-name">${safeName}</span><span class="player-sub">${escapeHtml(player.tag || 'COMMUNITY ENTRY')}</span></span>
        </div>`;
      const tierCells = MODES.map((mode) => `
        <td class="mode-column ${mode.id === activeMode ? 'active-mode' : ''}">${tierBadge(player.tiers?.[mode.id] || 'Unranked')}</td>
      `).join('');
      return `
        <tr data-player="${safeName}" tabindex="0" role="button" aria-label="Open ${safeName} profile">
          <td class="rank-cell"><span class="rank-number">${rankMark}${String(rank).padStart(2, '0')}</span></td>
          <td class="player-cell">${playerInfo}</td>
          <td><span class="region"><span class="flag">${region.flag}</span>${region.name}</span></td>
          ${tierCells}
        </tr>`;
    }).join('');
  }

  document.getElementById('shownCount').textContent = visible.length;
  document.getElementById('resultsLabel').textContent = `${matching.length} ${matching.length === 1 ? 'PLAYER' : 'PLAYERS'} · TOP 10`;
  document.getElementById('tableFootMode').textContent = `✦  ${activeMode.toUpperCase()} RANKINGS`;
  return visible;
}

export function renderProfile(player) {
  const region = REGIONS[player.region] || { name: 'Unknown', flag: '🌐' };
  document.getElementById('profileTitle').textContent = player.name;
  document.getElementById('profileContent').innerHTML = `
    <div class="profile-top">
      <span class="avatar">${escapeHtml(player.name.slice(0, 2).toUpperCase())}</span>
      <div><div class="player-name" style="font-size:15px">${escapeHtml(player.name)}</div>
        <div class="profile-meta">${region.flag} &nbsp;${region.name} &nbsp;·&nbsp; ${escapeHtml(player.tag || 'Community entry')}</div>
      </div>
    </div>
    <div class="profile-grid">${MODES.map((mode) => `
      <div class="profile-mode"><span>${escapeHtml(mode.label)}</span>${tierBadge(player.tiers?.[mode.id] || 'Unranked')}</div>
    `).join('')}</div>
    <p class="form-hint" style="margin:14px 0 0">${player.custom ? 'Local preview entry. This player has not been verified.' : 'Community player profile.'}</p>
  `;
}
