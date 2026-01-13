const API_BASE = 'http://localhost:3000/api';

export const apiService = {
    async getReadyTechnique(slug) {
        const path = `/breathing/ready/${slug}`;
        const response = await fetch(`${API_BASE}${path}`, {
            headers: { Authorization: window.Telegram?.WebApp?.initData || '' }
        });
        if (!response.ok) throw new Error('Network error');
        const result = await response.json();
        return result;
    },

    async getAiTechnique(prompt) {
        const path = `/breathing/ai`;
        const response = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: window.Telegram?.WebApp?.initData || ''
            },
            body: JSON.stringify({ request: prompt })
        });
        if (!response.ok) throw new Error('AI error');
        return await response.json();
    },

    async getStatistics(limit = 100, fromDate = '', toDate = '') {
        const path = `/statistics`;
        const params = new URLSearchParams({
            limit,
            ...(fromDate && { fromDate }),
            ...(toDate && { toDate })
        });

        const response = await fetch(`${API_BASE}${path}/list?${params}`, {
            headers: { Authorization: window.Telegram?.WebApp?.initData || '' }
        });
        
        if (!response.ok) throw new Error('Failed to fetch statistics');
        return await response.json(); // Возвращает { count, data: [...] }
    }

};
