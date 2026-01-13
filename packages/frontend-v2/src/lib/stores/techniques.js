import { writable } from 'svelte/store';
import { api } from '../api.js';

// Store для всех техник
export const baseTechniques = writable([]);
export const loadingTechniques = writable(false);

// Функция для загрузки всех техник с сервера
export async function loadBaseTechniques() {
    loadingTechniques.set(true);
    
    try {
        const data = await api.getBaseTechniques();
        
        if (data && Array.isArray(data)) {
            baseTechniques.set(data);
            return data;
        } else {
            console.warn('Invalid data received from getBaseTechniques:', data);
            // Возвращаем fallback данные
            const fallbackTechniques = [
                { id: 'relaxing', name: '4-7-8', icon: '😌', premium: false, pattern: '4-7-8', color: 'from-blue-500 to-cyan-500' },
                { id: 'box', name: 'Квадрат', icon: '📦', premium: false, pattern: '4-4-4-4', color: 'from-purple-500 to-pink-500' },
                { id: 'energizing', name: 'Энергия', icon: '⚡', premium: false, pattern: '2-0-2-0', color: 'from-yellow-500 to-orange-500' },
                { id: 'sleep', name: 'Сон', icon: '🌙', premium: false, pattern: '4-0-8-2', color: 'from-indigo-500 to-blue-500' },
                { id: 'wim', name: 'Вим Хоф', icon: '❄️', premium: true, pattern: '30 вдохов', color: 'from-teal-500 to-green-500' },
                { id: 'coherent', name: 'Когерентность', icon: '💓', premium: true, pattern: '6-0-6-0', color: 'from-red-500 to-pink-500' },
                { id: 'panic', name: 'Антипаника', icon: '🆘', premium: true, pattern: '2-0-8-1', color: 'from-rose-500 to-red-500' }
            ];
            baseTechniques.set(fallbackTechniques);
            return fallbackTechniques;
        }
    } catch (error) {
        console.error('Error loading base techniques:', error);
        const fallbackTechniques = [
            { id: 'relaxing', name: '4-7-8', icon: '😌', premium: false, pattern: '4-7-8', color: 'from-blue-500 to-cyan-500' },
            { id: 'box', name: 'Квадрат', icon: '📦', premium: false, pattern: '4-4-4-4', color: 'from-purple-500 to-pink-500' },
            { id: 'energizing', name: 'Энергия', icon: '⚡', premium: false, pattern: '2-0-2-0', color: 'from-yellow-500 to-orange-500' }
        ];
        baseTechniques.set(fallbackTechniques);
        return fallbackTechniques;
    } finally {
        loadingTechniques.set(false);
    }
}

// Функция для получения конкретной техники по ID
export function getTechniqueById(id) {
    return new Promise((resolve) => {
        baseTechniques.subscribe(techniques => {
            const technique = techniques.find(t => t.id === id);
            resolve(technique);
        })();
    });
}