import { writable, derived } from 'svelte/store';

export const techniques = writable([]);

export const lockedTechniques = derived(techniques, ($techniques) => {
  return $techniques.filter((tech) => tech.status === 'locked');
});

export const unlockedTechniques = derived(techniques, ($techniques) => {
  return $techniques.filter((tech) => tech.status !== 'locked');
});

export const sortedTechniques = derived(techniques, ($techniques) => {
  return [...$techniques].sort((a, b) => {
    if (a.status === 'unlocked' && b.status === 'locked') return -1;
    if (a.status === 'locked' && b.status === 'unlocked') return 1;
    return 0;
  });
});
