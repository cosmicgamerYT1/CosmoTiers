export const MODES = [
  { id: 'Sword', label: 'Sword', icon: '⚔' },
  { id: 'Axe', label: 'Axe', icon: '⛏' },
  { id: 'Mace', label: 'Mace', icon: '✦' },
  { id: 'UHC', label: 'UHC', icon: '♥' },
  { id: 'NethOP', label: 'NethOP', icon: '◇' },
  { id: 'Pot', label: 'Pot', icon: '⚗' },
  { id: 'SMP', label: 'SMP', icon: '◈' },
  { id: 'Crystal', label: 'Crystal', icon: '◆' },
  { id: 'TNT Minecart', label: 'TNT Minecart', icon: '▣' },
  { id: 'Spear', label: 'Spear', icon: '➶' },
  { id: 'Trident', label: 'Trident', icon: '♆' },
];

export const DEFAULT_MODE = 'Sword';

export const TIER_SCORE = {
  HT1: 10,
  LT1: 9,
  HT2: 8,
  LT2: 7,
  HT3: 6,
  LT3: 5,
  HT4: 4,
  LT4: 3,
  HT5: 2,
  LT5: 1,
  Unranked: 0,
};

export const TIER_OPTIONS = [
  'Unranked', 'LT5', 'HT5', 'LT4', 'HT4', 'LT3', 'HT3', 'LT2', 'HT2', 'LT1', 'HT1',
];

export const REGIONS = {
  EU: { name: 'Europe', flag: '🌍' },
  NA: { name: 'North America', flag: '🌎' },
  AS: { name: 'Asia', flag: '🌏' },
  SA: { name: 'South America', flag: '🌎' },
  AU: { name: 'Oceania', flag: '🌏' },
  AF: { name: 'Africa', flag: '🌍' },
};
