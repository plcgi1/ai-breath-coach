import { writable } from 'svelte/store';
import { i18n } from "../i18n";

export const selectedTech = writable(null);

export const session = writable({
  isRunning: false,
  phase: i18n('homepage.areYouReady'),
  timer: 0,
  tech: null
});
