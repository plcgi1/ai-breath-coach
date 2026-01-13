import { writable } from 'svelte/store';

// Стор будет хранить объект с мета-данными приложения
export const appStatus = writable({
    isOffline: false,
    lastSync: new Date()
});

export const setOfflineMode = (value) => {
    appStatus.update(state => ({
        ...state,
        isOffline: value,
        lastSync: new Date()
    }));
};

// Подписка на события браузера 🌐
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setOfflineMode(false));
    window.addEventListener('offline', () => setOfflineMode(true));
}