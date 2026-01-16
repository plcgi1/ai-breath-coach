import { CONFIG } from '../config.js';
import { initUserAuthData } from './telegram.js';

async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${CONFIG.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `twa ${initUserAuthData}`
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
  async askAI(query) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Пример ответа от ИИ
        resolve({
          slug: 'lion',
          name: 'Сила Льва',
          icon: '🦁',
          is_free: false,
          settings: [{ inhale: 5, holdIn: 2, exhale: 2, holdOut: 0, rounds: 8 }]
        });
      });
    });
  },

  async getTechniques() {
    const response = await fetchAPI(`/breathing/techniques`);
    if (!response) throw new Error('Network error');
    return response;
  },

  async getData() {
    const purchased = JSON.parse(localStorage.getItem('nebula_purchases') || '[]');
    const techniques = await this.getTechniques();
    return {
      techniques,
      user: {
        purchased
      }
    };
  },

  async createOrder(type, techId = null) {
    const payload = {
      order: type,
      techId
    };
    const result = await fetchAPI('/payments/invoice', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    console.log('createOrder result:', result);
    return result;

    // return { success: true, orderId: 'ORDER12345', invoiceUrl: 'https://example.com/payment' };
  },

  async logSession(slug) {
    const history = JSON.parse(localStorage.getItem('nebula_history') || '[]');
    history.push({ slug, date: new Date().toISOString() });
    localStorage.setItem('nebula_history', JSON.stringify(history));
  },

  async getStats() {
    const history = JSON.parse(localStorage.getItem('nebula_history') || '[]');
    const today = new Date().toDateString();
    return {
      total: history.length,
      today: history.filter((s) => new Date(s.date).toDateString() === today).length,
      history: history.slice(-5).reverse()
    };
  },

  async checkPaymentStatus(orderId) {
    const result = await fetchAPI(`/payments/check-order?orderId=${orderId}`, {
      method: 'GET'
    });
    console.log('checkPaymentStatus result:', result);

    return { paid: result.status === 'paid' };
  }
};

// async function fetchAPI(endpoint, options = {}) {
//     const $user = get(user);

//     try {
//         const response = await fetch(`${API_URL}${endpoint}`, {
//             ...options,
//             headers: {
//                 'Content-Type': 'application/json',
//                  Authorization: `twa ${initUserAuthData}`,
//              }
//         });

//         if (!response.ok) throw new Error(`HTTP ${response.status}`);
//         return await response.json();
//     } catch (error) {
//         console.warn('API Error:', error);
//         return null;
//     }
// }
// async getBaseTechniques() {
//         const response = await fetchAPI(`/breathing/base-techniques`);

//         if (!response) throw new Error('Network error');

//         return response;
//     },

//     async getAiRecommendation(query) {
//         const result = await fetchAPI('/breathing/ai', {
//             method: 'POST',
//             body: JSON.stringify({ query })
//         });

//         // Fallback
//         if (!result) {
//             return this.fallbackAI(query);
//         }

//         return result;
//     },

//     async createInvoice(userId, productId) {
//         return await fetchAPI('/payments/create-invoice', {
//             method: 'POST',
//             body: JSON.stringify({ user_id: userId, product_id: productId })
//         });
//     },

//     fallbackAI(query) {
//         const q = query.toLowerCase();

//         if (q.includes('сон') || q.includes('уснуть')) {
//             return {
//                 description: '🌙 Техника 4-7-8 замедлит пульс и поможет заснуть за 5-10 минут.',
//                 technique: { rounds: 6, settings: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 } }
//             };
//         }

//         if (q.includes('паник') || q.includes('тревог') || q.includes('сердце')) {
//             return {
//                 description: '🆘 Длинный выдох активирует парасимпатику. Фокус на выдохе!',
//                 technique: { rounds: 10, settings: { inhale: 2, holdIn: 0, exhale: 8, holdOut: 2 } }
//             };
//         }

//         if (q.includes('энерг') || q.includes('устал') || q.includes('засыпаю')) {
//             return {
//                 description: '⚡ Быстрое дыхание насытит кровь кислородом и взбодрит.',
//                 technique: { rounds: 20, settings: { inhale: 1, holdIn: 0, exhale: 1, holdOut: 0 } }
//             };
//         }

//         return {
//             description: '😌 Квадратное дыхание — универсальная техника для баланса.',
//             technique: { rounds: 6, settings: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 } }
//         };
//     }
