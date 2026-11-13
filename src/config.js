export const COMPETITIVE_MODES = [
  { id: 'Sword', label: 'Sword', icon: '/icons/sword.svg' },
  { id: 'Axe', label: 'Axe', icon: '/icons/axe.svg' },
  { id: 'Mace', label: 'Mace', icon: '/icons/mace.svg' },
  { id: 'UHC', label: 'UHC', icon: '/icons/uhc.svg' },
  { id: 'NethOP', label: 'NethOP', icon: '/icons/nethop.svg' },
  { id: 'Pot', label: 'Pot', icon: '/icons/pot.svg' },
  { id: 'SMP', label: 'SMP', icon: '/icons/smp.svg' },
  { id: 'Crystal', label: 'Crystal', icon: '/icons/crystal.svg' },
  { id: 'TNT Minecart', label: 'TNT Minecart', icon: '/icons/tnt-minecart.svg' },
  { id: 'Spear', label: 'Spear', icon: '/icons/spear.svg' },
  { id: 'Trident', label: 'Trident', icon: '/icons/trident.svg' },
];

export const OVERALL_MODE = { id: 'Overall', label: 'Overall', icon: '/icons/overall.svg' };
export const MODES = [OVERALL_MODE, ...COMPETITIVE_MODES];
export const DEFAULT_MODE = 'Overall';
export const DEFAULT_SUGGEST_MODE = 'Sword';

// HT1 is highest. Each tier step has a distinct score for deterministic sorting.
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
