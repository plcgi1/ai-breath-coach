import { get } from 'svelte/store';
import { initUserAuthData } from './telegram.js'
import { user } from './stores/user.js';
// TODO добавить это на случай если нет сети
// import { setOfflineMode } from './stores/appState.js';

const API_URL = '/api'//'http://localhost:3000/api';

async function fetchAPI(endpoint, options = {}) {
    const $user = get(user);
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                 Authorization: `twa ${initUserAuthData}`,
             }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn('API Error:', error);
        return null;
    }
}

export const api = {
    async getBaseTechniques() {
        const response = await fetchAPI(`/breathing/base-techniques`);

        if (!response) throw new Error('Network error');
                
        return response;
    },

    async getAiRecommendation(query) {
        const result = await fetchAPI('/breathing/ai', {
            method: 'POST',
            body: JSON.stringify({ query })
        });
        
        // Fallback
        if (!result) {
            return this.fallbackAI(query);
        }
        
        return result;
    },
    
    async createInvoice(userId, productId) {
        return await fetchAPI('/payments/create-invoice', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, product_id: productId })
        });
    },
    
    fallbackAI(query) {
        const q = query.toLowerCase();
        
        if (q.includes('сон') || q.includes('уснуть')) {
            return {
                description: '🌙 Техника 4-7-8 замедлит пульс и поможет заснуть за 5-10 минут.',
                technique: { rounds: 6, settings: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 } }
            };
        }
        
        if (q.includes('паник') || q.includes('тревог') || q.includes('сердце')) {
            return {
                description: '🆘 Длинный выдох активирует парасимпатику. Фокус на выдохе!',
                technique: { rounds: 10, settings: { inhale: 2, holdIn: 0, exhale: 8, holdOut: 2 } }
            };
        }
        
        if (q.includes('энерг') || q.includes('устал') || q.includes('засыпаю')) {
            return {
                description: '⚡ Быстрое дыхание насытит кровь кислородом и взбодрит.',
                technique: { rounds: 20, settings: { inhale: 1, holdIn: 0, exhale: 1, holdOut: 0 } }
            };
        }
        
        return {
            description: '😌 Квадратное дыхание — универсальная техника для баланса.',
            technique: { rounds: 6, settings: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 } }
        };
    }
};
