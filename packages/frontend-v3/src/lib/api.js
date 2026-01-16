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
  },

   async checkPaymentStatus(orderId) {
    const result = await fetchAPI(`/payments/check-order?orderId=${orderId}`, {
      method: 'GET'
    });
    console.log('checkPaymentStatus result:', result);

    return { paid: result.status === 'paid' };
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
};
