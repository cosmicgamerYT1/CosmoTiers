import { COMPETITIVE_MODES, MODES, REGIONS, TIER_SCORE } from './config.js';

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

export function overallScore(player) {
  return COMPETITIVE_MODES.reduce((total, mode) =>
    total + (TIER_SCORE[player.tiers?.[mode.id] || 'Unranked'] || 0), 0);
}

function tierScore(player, modeId) {
  return TIER_SCORE[player.tiers?.[modeId] || 'Unranked'] || 0;
}

function compareForMode(a, b, modeId) {
  const scoreA = modeId === 'Overall' ? overallScore(a) : tierScore(a, modeId);
  const scoreB = modeId === 'Overall' ? overallScore(b) : tierScore(b, modeId);
  return scoreB - scoreA || a.name.localeCompare(b.name);
}

export function rankForMode(players, target, modeId) {
  const targetScore = modeId === 'Overall' ? overallScore(target) : tierScore(target, modeId);
  if (targetScore <= 0) return null;
  const ranked = players
    .filter((player) => (modeId === 'Overall' ? overallScore(player) > 0 : tierScore(player, modeId) > 0))
    .slice()
    .sort((a, b) => compareForMode(a, b, modeId));
  return ranked.findIndex((player) => player.name.toLowerCase() === target.name.toLowerCase()) + 1 || null;
}

export function renderModeTabs(activeMode) {
  document.getElementById('categoryTabs').innerHTML = MODES.map((mode) => `
    <button class="category-tab ${mode.id === activeMode ? 'active' : ''}"
      data-mode="${escapeHtml(mode.id)}" role="tab" aria-selected="${mode.id === activeMode}">
      <img class="category-icon" src="${mode.icon}" alt="" aria-hidden="true">
      <span>${escapeHtml(mode.label)}</span>
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
    matching.sort((a, b) => compareForMode(a, b, activeMode));
  }
  return { matching, visible: matching.slice(0, 10) };
}

export function renderTableHead(activeMode) {
  const columns = COMPETITIVE_MODES.map((mode) => `
    <th class="mode-column ${mode.id === activeMode ? 'active-mode' : ''}" scope="col">
      <span class="table-mode-heading"><img src="${mode.icon}" alt="">${escapeHtml(mode.label)}</span>
    </th>
  `).join('');
  document.getElementById('tableHead').innerHTML = `
    <tr>
      <th scope="col" class="rank-heading">Rank</th>
      <th scope="col" class="player-heading">Player</th>
      <th scope="col" class="region-heading">Region</th>
      <th scope="col" class="overall-column ${activeMode === 'Overall' ? 'active-mode' : ''}">
        <span class="table-mode-heading"><img src="/icons/overall.svg" alt="">Overall</span>
      </th>
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
      ? '<strong>No players ranked yet</strong><span>Search for a player or add a community suggestion to your local preview.</span><button class="empty-suggest" id="emptySuggestButton" type="button">＋ Suggest a player</button>'
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
      const overallCell = `<td class="overall-column ${activeMode === 'Overall' ? 'active-mode' : ''}"><span class="overall-points">${overallScore(player) || '—'}<small>${overallScore(player) ? 'PTS' : ''}</small></span></td>`;
      const tierCells = COMPETITIVE_MODES.map((mode) => `
        <td class="mode-column ${mode.id === activeMode ? 'active-mode' : ''}">${tierBadge(player.tiers?.[mode.id] || 'Unranked')}</td>
      `).join('');
      return `
        <tr data-player="${safeName}" tabindex="0" role="button" aria-label="Open ${safeName} profile">
          <td class="rank-cell"><span class="rank-number">${rankMark}${String(rank).padStart(2, '0')}</span></td>
          <td class="player-cell">${playerInfo}</td>
          <td><span class="region"><span class="flag">${region.flag}</span>${region.name}</span></td>
          ${overallCell}
          ${tierCells}
        </tr>`;
    }).join('');
  }

  document.getElementById('shownCount').textContent = visible.length;
  document.getElementById('resultsLabel').textContent = `${matching.length} ${matching.length === 1 ? 'PLAYER' : 'PLAYERS'} · TOP 10`;
  document.getElementById('tableFootMode').textContent = `✦  ${activeMode.toUpperCase()} RANKINGS`;
  return visible;
}

function profileMarkup(player, allPlayers) {
  const region = REGIONS[player.region] || { name: 'Unknown', flag: '🌐' };
  const overallPosition = rankForMode(allPlayers, player, 'Overall');
  const score = overallScore(player);
  const modeCards = COMPETITIVE_MODES.map((mode) => {
    const tier = player.tiers?.[mode.id] || 'Unranked';
    const position = rankForMode(allPlayers, player, mode.id);
    return `
      <div class="profile-mode">
        <span class="profile-mode-name"><img src="${mode.icon}" alt="">${escapeHtml(mode.label)}</span>
        <span class="profile-mode-result">${position ? `<small>#${position}</small>` : ''}${tierBadge(tier)}</span>
      </div>`;
  }).join('');

  return `
    <div class="profile-top">
      <span class="avatar">${escapeHtml(player.name.slice(0, 2).toUpperCase())}</span>
      <div class="profile-identity"><div class="player-name">${escapeHtml(player.name)}</div>
        <div class="profile-meta">${region.flag} &nbsp;${region.name} &nbsp;·&nbsp; ${escapeHtml(player.tag || 'Community entry')}</div>
      </div>
      <div class="profile-rating"><strong>${overallPosition ? `#${overallPosition}` : '—'}</strong><span>Overall rank</span></div>
    </div>
    <div class="profile-summary">
      <span><strong>${score}</strong><small>Overall points</small></span>
      <span><strong>${COMPETITIVE_MODES.filter((mode) => tierScore(player, mode.id) > 0).length}/11</strong><small>Modes ranked</small></span>
    </div>
    <div class="profile-section-title">Mode rankings</div>
    <div class="profile-grid">${modeCards}</div>
    <p class="form-hint" style="margin:14px 0 0">${player.custom ? 'Local preview entry. This player has not been verified.' : 'Community player profile.'}</p>
  `;
}

export function renderProfile(player, allPlayers) {
  document.getElementById('profileTitle').textContent = player.name;
  document.getElementById('profileContent').innerHTML = profileMarkup(player, allPlayers);
}

export function renderPlayerSearch(query, players) {
  const container = document.getElementById('profileSearchResults');
  const value = query.trim();
  if (!value) {
    container.innerHTML = '<div class="search-empty"><span class="search-empty-icon">⌕</span><strong>Find a ranked player</strong><span>Enter a Minecraft username to view their profile, tiers and leaderboard position.</span></div>';
    return;
  }

  const exact = players.find((player) => player.name.toLowerCase() === value.toLowerCase());
  if (exact) {
    container.innerHTML = `<div class="search-profile">${profileMarkup(exact, players)}</div>`;
    return;
  }

  const matches = players
    .filter((player) => player.name.toLowerCase().includes(value.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 8);

  if (matches.length === 0) {
    container.innerHTML = `<div class="search-empty"><span class="search-empty-icon">⌕</span><strong>No ranked player found</strong><span>No CosmoTiers profile matches “${escapeHtml(value)}”. Check the spelling or try another username.</span></div>`;
    return;
  }

  container.innerHTML = `
    <div class="search-match-heading">${matches.length} MATCHING ${matches.length === 1 ? 'PLAYER' : 'PLAYERS'}</div>
    <div class="search-match-list">${matches.map((player) => {
      const region = REGIONS[player.region] || { name: 'Unknown', flag: '🌐' };
      const position = rankForMode(players, player, 'Overall');
      return `<button class="search-match" type="button" data-search-player="${escapeHtml(player.name)}">
        <span class="avatar">${escapeHtml(player.name.slice(0, 2).toUpperCase())}</span>
        <span class="search-match-copy"><strong>${escapeHtml(player.name)}</strong><small>${region.flag} ${region.name}</small></span>
        <span class="search-match-rank">${position ? `#${position} Overall` : 'Unranked'}</span>
        <span class="search-match-arrow">›</span>
      </button>`;
    }).join('')}</div>`;
}
