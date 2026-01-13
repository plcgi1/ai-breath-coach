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

// /**
//  * ╔══════════════════════════════════════════════════════════════════╗
//  * ║  API SERVICE                                                      ║
//  * ║  Все запросы к серверу                                           ║
//  * ╚══════════════════════════════════════════════════════════════════╝
//  */

// import { get } from 'svelte/store';
// import { user } from './stores/user.js';
// import { CONFIG, TECHNIQUES } from './config.js';

// // ═══════════════════════════════════════════════════════════════════
// // КОНФИГУРАЦИЯ
// // ═══════════════════════════════════════════════════════════════════

// const API_URL = CONFIG.API_URL || 'http://localhost:3000/api';

// // ═══════════════════════════════════════════════════════════════════
// // HELPERS
// // ═══════════════════════════════════════════════════════════════════

// /**
//  * Базовый fetch с заголовками
//  */
// async function fetchAPI(endpoint, options = {}) {
//     const $user = get(user);
    
//     const headers = {
//         'Content-Type': 'application/json',
//         'X-User-Id': String($user.id || 'guest'),
//         'X-Is-Premium': String($user.isPremium || false),
//         ...options.headers
//     };
    
//     const response = await fetch(`${API_URL}${endpoint}`, {
//         ...options,
//         headers
//     });
    
//     return response;
// }

// // ═══════════════════════════════════════════════════════════════════
// // API МЕТОДЫ
// // ═══════════════════════════════════════════════════════════════════

// export const api = {
    
//     /**
//      * Получить технику дыхания по slug
//      * GET /api/breathing/:slug
//      */
//     async getTechnique(slug) {
//         try {
//             const response = await fetchAPI(`/breathing/${slug}`);
            
//             if (!response.ok) {
//                 if (response.status === 403) {
//                     return { error: 'premium_required' };
//                 }
//                 throw new Error(`HTTP ${response.status}`);
//             }
            
//             const data = await response.json();
//             console.log('📥 Technique loaded:', slug, data);
//             return data;
            
//         } catch (error) {
//             console.warn('⚠️ API Error, using fallback:', error);
//             return this.getFallbackTechnique(slug);
//         }
//     },
    
//     /**
//      * AI подбор техники по запросу
//      * POST /api/breathing/ai
//      */
//     async getAiRecommendation(query) {
//         try {
//             const response = await fetchAPI('/breathing/ai', {
//                 method: 'POST',
//                 body: JSON.stringify({ query })
//             });
            
//             if (!response.ok) {
//                 throw new Error(`HTTP ${response.status}`);
//             }
            
//             const data = await response.json();
//             console.log('🤖 AI Recommendation:', data);
//             return data;
            
//         } catch (error) {
//             console.warn('⚠️ AI API Error, using fallback:', error);
//             return this.getFallbackAiRecommendation(query);
//         }
//     },
    
//     /**
//      * Получить список продуктов
//      * GET /api/products
//      */
//     async getProducts() {
//         try {
//             const response = await fetchAPI('/products');
            
//             if (!response.ok) {
//                 throw new Error(`HTTP ${response.status}`);
//             }
            
//             const data = await response.json();
//             console.log('🛒 Products loaded:', data);
//             return data.products || [];
            
//         } catch (error) {
//             console.warn('⚠️ Products API Error:', error);
//             return this.getFallbackProducts();
//         }
//     },
    
//     /**
//      * Создать invoice для оплаты
//      * POST /api/payments/create-invoice
//      */
//     async createInvoice(userId, productId) {
//         try {
//             const response = await fetchAPI('/payments/create-invoice', {
//                 method: 'POST',
//                 body: JSON.stringify({
//                     user_id: userId,
//                     product_id: productId
//                 })
//             });
            
//             if (!response.ok) {
//                 throw new Error(`HTTP ${response.status}`);
//             }
            
//             const data = await response.json();
//             console.log('📝 Invoice created:', data);
//             return data;
            
//         } catch (error) {
//             console.error('❌ Create invoice error:', error);
//             return { error: error.message };
//         }
//     },
    
//     /**
//      * Проверить статус подписки
//      * GET /api/payments/status/:userId
//      */
//     async getSubscriptionStatus(userId) {
//         try {
//             const response = await fetchAPI(`/payments/status/${userId}`);
            
//             if (!response.ok) {
//                 throw new Error(`HTTP ${response.status}`);
//             }
            
//             const data = await response.json();
//             console.log('👑 Subscription status:', data);
//             return data;
            
//         } catch (error) {
//             console.warn('⚠️ Status API Error:', error);
//             return { isPremium: false, purchases: [] };
//         }
//     },
    
//     /**
//      * Отправить событие аналитики
//      * POST /api/analytics/event
//      */
//     async trackEvent(event, data = {}) {
//         try {
//             await fetchAPI('/analytics/event', {
//                 method: 'POST',
//                 body: JSON.stringify({ event, data })
//             });
//         } catch (error) {
//             // Не критично если не отправилось
//             console.warn('Analytics error:', error);
//         }
//     },
    
//     /**
//      * Установить напоминание
//      * POST /api/reminders/set
//      */
//     async setReminder(userId, time, enabled = true) {
//         try {
//             const response = await fetchAPI('/reminders/set', {
//                 method: 'POST',
//                 body: JSON.stringify({
//                     user_id: userId,
//                     time,
//                     enabled
//                 })
//             });
            
//             return response.ok;
            
//         } catch (error) {
//             console.error('Reminder error:', error);
//             return false;
//         }
//     },
    
//     // ═══════════════════════════════════════════════════════════════
//     // FALLBACK МЕТОДЫ (когда сервер недоступен)
//     // ═══════════════════════════════════════════════════════════════
    
//     /**
//      * Fallback техника из локального конфига
//      */
//     getFallbackTechnique(slug) {
//         const tech = TECHNIQUES[slug];
//         if (!tech) return null;
        
//         return {
//             description: tech.description,
//             technique: {
//                 rounds: tech.rounds || 4,
//                 settings: {
//                     inhale: tech.inhale,
//                     holdIn: tech.holdIn,
//                     exhale: tech.exhale,
//                     holdOut: tech.holdOut
//                 }
//             }
//         };
//     },
    
//     /**
//      * Fallback AI рекомендация (rule-based)
//      */
//     getFallbackAiRecommendation(query) {
//         const q = query.toLowerCase();
        
//         let technique, description, name;
        
//         if (q.includes('сон') || q.includes('уснуть') || q.includes('спать')) {
//             technique = { rounds: 8, settings: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 } };
//             description = '🌙 Техника 4-7-8 идеально подходит для засыпания. Длинный выдох активирует парасимпатическую нервную систему и замедляет сердцебиение.';
//             name = '4-7-8 для сна';
//         } else if (q.includes('паник') || q.includes('тревог') || q.includes('страх')) {
//             technique = { rounds: 15, settings: { inhale: 2, holdIn: 0, exhale: 8, holdOut: 1 } };
//             description = '🆘 При панике главное — длинный выдох! Дышите через сжатые губы, как будто дуете на горячий суп.';
//             name = 'Антипаника';
//         } else if (q.includes('энерг') || q.includes('устал') || q.includes('бодр')) {
//             technique = { rounds: 20, settings: { inhale: 1, holdIn: 0, exhale: 1, holdOut: 0 } };
//             description = '⚡ Быстрое дыхание насытит кровь кислородом и взбодрит лучше кофе!';
//             name = 'Энерджайзер';
//         } else if (q.includes('фокус') || q.includes('концентр') || q.includes('работ')) {
//             technique = { rounds: 6, settings: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 } };
//             description = '🎯 Квадратное дыхание используется в Google и спецназе для концентрации.';
//             name = 'Квадратное дыхание';
//         } else {
//             technique = { rounds: 4, settings: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 } };
//             description = '😌 Универсальная техника 4-7-8 для расслабления и баланса.';
//             name = '4-7-8';
//         }
        
//         return { description, technique, meta: { name } };
//     },
    
//     /**
//      * Fallback список продуктов
//      */
//     getFallbackProducts() {
//         return [
//             { id: 'technique_anti-panic', name: '🆘 Антипаника 911', price: 99, type: 'technique' },
//             { id: 'technique_wim-hof', name: '❄️ Метод Вим Хофа', price: 199, type: 'technique' },
//             { id: 'technique_energizer', name: '⚡ Энерджайзер', price: 99, type: 'technique' },
//             { id: 'technique_sleep-pro', name: '🌙 Глубокий сон PRO', price: 149, type: 'technique' },
//             { id: 'course_sleep', name: '😴 Курс: Здоровый сон', price: 149, type: 'course' },
//             { id: 'lifetime', name: '👑 Всё навсегда', price: 990, type: 'lifetime' }
//         ];
//     }
// };

// export default api;
