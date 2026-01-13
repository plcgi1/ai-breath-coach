/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  КОНФИГУРАЦИЯ ДЛЯ ИНДИ-РАЗРАБОТЧИКА                             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

export const CONFIG = {
    // Бот для приёма платежей (создать через @BotFather)
    BOT_USERNAME: 'breathflow_bot',
    
    // Цены в Telegram Stars
    PRICES: {
        weekly: 75,    // ~$1.50
        monthly: 249,  // ~$5.00
        yearly: 1490   // ~$30.00
    },
    
    // API endpoints (когда добавите бэкенд)
    // API_URL: null, // 'https://your-api.workers.dev'
    API_URL: 'http://localhost:3000',
    
    // Включить dev mode
    DEV_MODE: import.meta.env.DEV
}

// Дыхательные техники
export const TECHNIQUES = {
    relaxing: {
        id: 'relaxing',
        name: '4-7-8',
        description: 'Вдох 4с → Задержка 7с → Выдох 8с',
        inhale: 4, holdIn: 7, exhale: 8, holdOut: 0,
        color: 'from-blue-400 to-purple-500',
        icon: '😌',
        premium: false
    },
    box: {
        id: 'box',
        name: 'Квадрат',
        description: '4с вдох → 4с держим → 4с выдох → 4с пауза',
        inhale: 4, holdIn: 4, exhale: 4, holdOut: 4,
        color: 'from-purple-400 to-pink-500',
        icon: '📦',
        premium: false
    },
    energizing: {
        id: 'energizing',
        name: 'Энергия',
        description: 'Быстрый вдох 2с → Быстрый выдох 2с',
        inhale: 2, holdIn: 0, exhale: 2, holdOut: 0,
        color: 'from-orange-400 to-red-500',
        icon: '⚡',
        premium: false
    },
    sleep: {
        id: 'sleep',
        name: 'Сон',
        description: 'Вдох 4с → Медленный выдох 8с → Пауза 2с',
        inhale: 4, holdIn: 0, exhale: 8, holdOut: 2,
        color: 'from-indigo-400 to-blue-600',
        icon: '🌙',
        premium: false
    },
    wim: {
        id: 'wim',
        name: 'Вим Хоф',
        description: '30 глубоких вдохов → Задержка → Восстановление',
        inhale: 2, holdIn: 0, exhale: 2, holdOut: 0,
        color: 'from-cyan-400 to-blue-500',
        icon: '❄️',
        premium: true
    }
}

// Достижения
export const ACHIEVEMENTS = {
    firstBreath: { icon: '🌟', text: 'Первый вдох' },
    streak3: { icon: '🔥', text: '3 дня подряд' },
    minutes10: { icon: '⏱️', text: '10 минут' },
    streak7: { icon: '🏔️', text: '7 дней подряд' },
    sessions10: { icon: '💪', text: '10 сессий' },
    allTechniques: { icon: '⭐', text: 'Все техники' },
    streak30: { icon: '💎', text: '30 дней' },
    master: { icon: '🧘', text: 'Мастер дыхания' }
}

// Программы
export const PROGRAMS = {
    morning: { 
        id: 'morning',
        name: 'Утренняя энергия',
        icon: '🌅',
        technique: 'energizing', 
        minutes: 5,
        description: 'Заряд бодрости',
        premium: false
    },
    stress: { 
        id: 'stress',
        name: 'Снятие стресса',
        icon: '😌',
        technique: 'relaxing', 
        minutes: 7,
        description: 'Расслабление',
        premium: false
    },
    focus: { 
        id: 'focus',
        name: 'Фокус',
        icon: '🎯',
        technique: 'box', 
        minutes: 4,
        description: 'Концентрация',
        premium: false
    },
    meditation: {
        id: 'meditation',
        name: 'Глубокая медитация',
        icon: '🧠',
        technique: 'relaxing',
        minutes: 21,
        description: '21 день • Полный курс',
        premium: true
    },
    sleepProgram: {
        id: 'sleepProgram',
        name: 'Здоровый сон',
        icon: '😴',
        technique: 'sleep',
        minutes: 14,
        description: '14 дней • Аудио-гид',
        premium: true
    },
    wimHof: {
        id: 'wimHof',
        name: 'Метод Вим Хофа',
        icon: '❄️',
        technique: 'wim',
        minutes: 30,
        description: '30 дней • Холод + дыхание',
        premium: true
    }
}
