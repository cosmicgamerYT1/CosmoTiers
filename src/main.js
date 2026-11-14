import './styles.css';
import { DEFAULT_MODE, DEFAULT_SUGGEST_MODE, COMPETITIVE_MODES, MODES, TIER_OPTIONS } from './config.js';
import { loadPlayers, savePlayers } from './storage.js';
import { initAuth } from './auth.js';
import {
  escapeHtml, renderModeTabs, renderPlayerSearch, renderProfile,
  renderRows, renderTableHead,
} from './render.js';

let players = loadPlayers();
let activeMode = DEFAULT_MODE;
let toastTimer;

function showModal(id) {
  const element = document.getElementById(id);
  element.classList.add('open');
  element.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const focusable = element.querySelector('input, select, button');
  if (focusable) window.setTimeout(() => focusable.focus(), 30);
}

function closeModal(id) {
  const element = document.getElementById(id);
  element.classList.remove('open');
  element.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.modal-backdrop.open')) document.body.style.overflow = '';
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function openProfile(name) {
  const player = players.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
  if (!player) return;
  renderProfile(player, players);
  showModal('profileModal');
}

function render() {
  renderModeTabs(activeMode);
  renderTableHead(activeMode);
  renderRows(players, activeMode);
}

function populateModeOptions() {
  const formMode = document.getElementById('newMode');
  formMode.innerHTML = COMPETITIVE_MODES.map((mode) =>
    `<option value="${escapeHtml(mode.id)}">${escapeHtml(mode.label)}</option>`
  ).join('');
  formMode.value = DEFAULT_SUGGEST_MODE;
  document.getElementById('newTier').innerHTML = TIER_OPTIONS.map((tier) =>
    `<option value="${tier}">${tier === 'Unranked' ? 'Unranked / untested' : tier}</option>`
  ).join('');
}

function exportPlayers() {
  const data = { project: 'CosmoTiers', formatVersion: 3, modes: MODES.map(({ id }) => id), players };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'cosmotiers-players.json';
  anchor.click();
  URL.revokeObjectURL(url);
  showToast('Player data exported as JSON.');
}

function handleSuggest(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const name = String(formData.get('name') || '').trim();
  const region = String(formData.get('region') || 'EU');
  const mode = String(formData.get('mode') || DEFAULT_SUGGEST_MODE);
  const tier = String(formData.get('tier') || 'Unranked');

  if (!/^[A-Za-z0-9_]{2,16}$/.test(name)) {
    showToast('Enter a valid Minecraft username.');
    return;
  }
  if (players.some((player) => player.name.toLowerCase() === name.toLowerCase())) {
    showToast('That player is already in this preview.');
    return;
  }

  const tiers = Object.fromEntries(COMPETITIVE_MODES.map(({ id }) => [id, 'Unranked']));
  if (COMPETITIVE_MODES.some((entry) => entry.id === mode) && TIER_OPTIONS.includes(tier)) tiers[mode] = tier;

  players.push({ name, region, tag: 'COMMUNITY ENTRY', tiers, custom: true });
  const storageAvailable = savePlayers(players);
  activeMode = mode;
  document.getElementById('playerSearch').value = '';
  document.getElementById('regionFilter').value = 'all';
  document.getElementById('sortFilter').value = 'tier';
  render();
  closeModal('suggestModal');
  form.reset();
  document.getElementById('newMode').value = DEFAULT_SUGGEST_MODE;
  showToast(storageAvailable ? `${name} added to your local preview.` : `${name} added, but browser storage is unavailable.`);
}

function openPlayerSearch() {
  const input = document.getElementById('profileSearchInput');
  input.value = '';
  renderPlayerSearch('', players);
  showModal('playerSearchModal');
}

function bindEvents() {
  document.getElementById('categoryTabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-mode]');
    if (!button) return;
    activeMode = button.dataset.mode;
    render();
  });

  ['playerSearch', 'regionFilter', 'sortFilter'].forEach((id) => {
    const control = document.getElementById(id);
    control.addEventListener(id === 'playerSearch' ? 'input' : 'change', () => renderRows(players, activeMode));
  });

  document.getElementById('leaderboardBody').addEventListener('click', (event) => {
    const row = event.target.closest('tr[data-player]');
    if (row) openProfile(row.dataset.player);
  });
  document.getElementById('leaderboardBody').addEventListener('keydown', (event) => {
    const row = event.target.closest('tr[data-player]');
    if (row && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openProfile(row.dataset.player);
    }
  });

  document.getElementById('openSearch').addEventListener('click', openPlayerSearch);
  document.getElementById('profileSearchInput').addEventListener('input', (event) => {
    renderPlayerSearch(event.currentTarget.value, players);
  });
  document.getElementById('profileSearchResults').addEventListener('click', (event) => {
    const result = event.target.closest('[data-search-player]');
    if (!result) return;
    const input = document.getElementById('profileSearchInput');
    input.value = result.dataset.searchPlayer;
    renderPlayerSearch(input.value, players);
  });

  document.getElementById('suggestForm').addEventListener('submit', handleSuggest);
  document.getElementById('exportButton').addEventListener('click', exportPlayers);
  document.getElementById('emptyState').addEventListener('click', (event) => {
    if (event.target.closest('#emptySuggestButton')) showModal('suggestModal');
  });
  document.getElementById('suggestPlayerLink').addEventListener('click', () => showModal('suggestModal'));

  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => closeModal(button.dataset.close));
  });
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) closeModal(backdrop.id);
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach((modal) => closeModal(modal.id));
    }
    if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      document.getElementById('playerSearch').focus();
    }
  });

  const nav = document.getElementById('mainNav');
  document.getElementById('mobileMenu').addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    document.getElementById('mobileMenu').setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    document.getElementById('mobileMenu').setAttribute('aria-expanded', 'false');
  }));
}

populateModeOptions();
bindEvents();
render();
initAuth({ showModal, closeModal, showToast });
