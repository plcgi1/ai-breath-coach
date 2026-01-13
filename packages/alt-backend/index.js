/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  BREATHFLOW API SERVER + TELEGRAM STARS WEBHOOK                  ║
 * ║  Сервер для дыхательных практик с AI и приёмом платежей         ║
 * ║                                                                  ║
 * ║  Запуск: node server/index.js                                    ║
 * ║  Или: npm run server                                             ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();

const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════════════
// КОНФИГУРАЦИЯ
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
    // Получить у @BotFather
    BOT_TOKEN: process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE',
    
    // Цены в Telegram Stars
    PRICES: {
        weekly: 75,
        monthly: 249,
        yearly: 1490,
        lifetime: 2990
    },
    
    // Продолжительность подписок в днях
    DURATIONS: {
        weekly: 7,
        monthly: 30,
        yearly: 365,
        lifetime: 36500 // 100 лет
    },
    
    // Webhook секрет (любая строка)
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || 'your_webhook_secret_here'
};

// ═══════════════════════════════════════════════════════════════════
// БАЗА ДАННЫХ (In-Memory для демо, замените на Supabase/PostgreSQL)
// ═══════════════════════════════════════════════════════════════════

const DB = {
    // Пользователи
    users: new Map(),
    // Платежи
    payments: new Map(),
    // Подписки
    subscriptions: new Map()
};

/**
 * Получить или создать пользователя
 */
function getOrCreateUser(userId, userData = {}) {
    if (!DB.users.has(userId)) {
        DB.users.set(userId, {
            id: userId,
            firstName: userData.first_name || 'User',
            username: userData.username || null,
            isPremium: false,
            premiumUntil: null,
            premiumPlan: null,
            totalStarsSpent: 0,
            createdAt: new Date().toISOString(),
            ...userData
        });
    }
    return DB.users.get(userId);
}

/**
 * Проверить премиум статус
 */
function checkPremiumStatus(userId) {
    const user = DB.users.get(userId);
    if (!user) return false;
    
    if (user.isPremium && user.premiumUntil) {
        const now = new Date();
        const until = new Date(user.premiumUntil);
        
        if (now > until) {
            // Подписка истекла
            user.isPremium = false;
            user.premiumPlan = null;
            return false;
        }
        return true;
    }
    return user.isPremium || false;
}

/**
 * Активировать премиум
 */
function activatePremium(userId, plan, paymentId) {
    const user = getOrCreateUser(userId);
    const days = CONFIG.DURATIONS[plan] || 30;
    
    const now = new Date();
    let premiumUntil;
    
    // Если уже есть активная подписка — продлеваем
    if (user.premiumUntil && new Date(user.premiumUntil) > now) {
        premiumUntil = new Date(user.premiumUntil);
        premiumUntil.setDate(premiumUntil.getDate() + days);
    } else {
        premiumUntil = new Date();
        premiumUntil.setDate(premiumUntil.getDate() + days);
    }
    
    user.isPremium = true;
    user.premiumUntil = premiumUntil.toISOString();
    user.premiumPlan = plan;
    user.totalStarsSpent += CONFIG.PRICES[plan] || 0;
    
    console.log(`✅ Premium activated for user ${userId}: ${plan} until ${user.premiumUntil}`);
    
    return user;
}

// ═══════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════

app.use(cors());
app.use(express.json());

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

// ═══════════════════════════════════════════════════════════════════
// TELEGRAM WEBHOOK для STARS
// ═══════════════════════════════════════════════════════════════════

/**
 * Проверка подписи Telegram (важно для безопасности!)
 */
function verifyTelegramWebhook(req) {
    const signature = req.headers['x-telegram-bot-api-secret-token'];
    return signature === CONFIG.WEBHOOK_SECRET;
}

/**
 * POST /webhook/telegram
 * 
 * Telegram отправляет сюда все обновления включая платежи.
 * Настройка: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_URL>/webhook/telegram&secret_token=<SECRET>
 */
app.post('/webhook/telegram', async (req, res) => {
    // Проверка подписи
    if (!verifyTelegramWebhook(req)) {
        console.error('❌ Invalid webhook signature');
        return res.status(403).json({ error: 'Invalid signature' });
    }
    
    const update = req.body;
    console.log('📨 Telegram Update:', JSON.stringify(update, null, 2));
    
    try {
        // ═══════════════════════════════════════════════════════════
        // ОБРАБОТКА pre_checkout_query (Пользователь нажал "Оплатить")
        // ═══════════════════════════════════════════════════════════
        if (update.pre_checkout_query) {
            const query = update.pre_checkout_query;
            console.log('💳 Pre-checkout query:', query);
            
            // Подтверждаем платёж (можно добавить проверки)
            await answerPreCheckoutQuery(query.id, true);
            
            return res.json({ ok: true });
        }
        
        // ═══════════════════════════════════════════════════════════
        // ОБРАБОТКА successful_payment (Платёж прошёл успешно!)
        // ═══════════════════════════════════════════════════════════
        if (update.message?.successful_payment) {
            const payment = update.message.successful_payment;
            const userId = update.message.from.id;
            const user = update.message.from;
            
            console.log('✅ Successful payment:', payment);
            console.log('👤 From user:', user);
            
            // Парсим payload (там наш plan)
            const payload = payment.invoice_payload;
            const plan = payload.replace('premium_', '');
            
            // Сохраняем платёж
            const paymentRecord = {
                id: payment.telegram_payment_charge_id,
                providerPaymentId: payment.provider_payment_charge_id,
                userId: userId,
                plan: plan,
                amount: payment.total_amount,
                currency: payment.currency,
                createdAt: new Date().toISOString()
            };
            DB.payments.set(paymentRecord.id, paymentRecord);
            
            // Активируем премиум
            getOrCreateUser(userId, user);
            activatePremium(userId, plan, paymentRecord.id);
            
            // Отправляем сообщение пользователю
            await sendMessage(userId, 
                `🎉 *Спасибо за покупку!*\n\n` +
                `Ваш план: *${getPlanName(plan)}*\n` +
                `Активен до: *${formatDate(DB.users.get(userId).premiumUntil)}*\n\n` +
                `Теперь вам доступны все премиум техники и AI-рекомендации!\n\n` +
                `Откройте приложение и наслаждайтесь практикой 🧘`
            );
            
            return res.json({ ok: true });
        }
        
        // ═══════════════════════════════════════════════════════════
        // ОБРАБОТКА refunded_payment (Возврат средств)
        // ═══════════════════════════════════════════════════════════
        if (update.message?.refunded_payment) {
            const refund = update.message.refunded_payment;
            const userId = update.message.from.id;
            
            console.log('💸 Refund:', refund);
            
            // Деактивируем премиум
            const user = DB.users.get(userId);
            if (user) {
                user.isPremium = false;
                user.premiumUntil = null;
                user.premiumPlan = null;
            }
            
            return res.json({ ok: true });
        }
        
        // Обычное сообщение — игнорируем или обрабатываем
        res.json({ ok: true });
        
    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(500).json({ error: 'Internal error' });
    }
});

// ═══════════════════════════════════════════════════════════════════
// TELEGRAM API HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Подтвердить pre_checkout_query
 */
async function answerPreCheckoutQuery(queryId, ok, errorMessage = null) {
    const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/answerPreCheckoutQuery`;
    
    const body = {
        pre_checkout_query_id: queryId,
        ok: ok
    };
    
    if (!ok && errorMessage) {
        body.error_message = errorMessage;
    }
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    
    const result = await response.json();
    console.log('answerPreCheckoutQuery result:', result);
    return result;
}

/**
 * Отправить сообщение пользователю
 */
async function sendMessage(chatId, text, parseMode = 'Markdown') {
    const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: parseMode
        })
    });
    
    const result = await response.json();
    console.log('sendMessage result:', result);
    return result;
}

/**
 * Создать Invoice Link для оплаты Stars
 */
async function createInvoiceLink(userId, plan) {
    const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/createInvoiceLink`;
    
    const price = CONFIG.PRICES[plan];
    if (!price) {
        throw new Error(`Unknown plan: ${plan}`);
    }
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: `BreathFlow PRO — ${getPlanName(plan)}`,
            description: getProductDescription(plan),
            payload: `premium_${plan}`,
            currency: 'XTR', // XTR = Telegram Stars
            prices: [
                {
                    label: getPlanName(plan),
                    amount: price // В Stars, не в копейках!
                }
            ]
        })
    });
    
    const result = await response.json();
    console.log('createInvoiceLink result:', result);
    
    if (result.ok) {
        return result.result;
    } else {
        throw new Error(result.description || 'Failed to create invoice');
    }
}

/**
 * Возврат средств (Refund)
 */
async function refundPayment(userId, telegramPaymentChargeId) {
    const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/refundStarPayment`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            telegram_payment_charge_id: telegramPaymentChargeId
        })
    });
    
    const result = await response.json();
    console.log('refundPayment result:', result);
    return result;
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function getPlanName(plan) {
    const names = {
        weekly: 'Неделя',
        monthly: 'Месяц',
        yearly: 'Год',
        lifetime: 'Навсегда'
    };
    return names[plan] || plan;
}

function getProductDescription(plan) {
    const descriptions = {
        weekly: '7 дней PRO доступа: все техники, AI-рекомендации, аудио-медитации',
        monthly: '30 дней PRO доступа: все техники, AI-рекомендации, аудио-медитации, курсы',
        yearly: '365 дней PRO доступа: всё включено + приоритетная поддержка',
        lifetime: 'Пожизненный PRO доступ: все текущие и будущие функции навсегда'
    };
    return descriptions[plan] || 'PRO доступ к BreathFlow';
}

function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
}

// ═══════════════════════════════════════════════════════════════════
// API ENDPOINTS ДЛЯ КЛИЕНТА
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/create-invoice
 * Создать ссылку для оплаты
 */
app.post('/api/payments/create-invoice', async (req, res) => {
    try {
        const { user_id, plan } = req.body;
        
        if (!user_id || !plan) {
            return res.status(400).json({ error: 'user_id and plan are required' });
        }
        
        if (!CONFIG.PRICES[plan]) {
            return res.status(400).json({ error: 'Invalid plan' });
        }
        
        console.log(`📝 Creating invoice for user ${user_id}, plan: ${plan}`);
        
        const invoiceLink = await createInvoiceLink(user_id, plan);
        
        res.json({
            ok: true,
            invoice_link: invoiceLink,
            plan: plan,
            price: CONFIG.PRICES[plan],
            currency: 'XTR'
        });
        
    } catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/payments/status/:userId
 * Проверить статус подписки
 */
app.get('/api/payments/status/:userId', (req, res) => {
    const userId = req.params.userId;
    const user = DB.users.get(userId);
    
    if (!user) {
        return res.json({
            isPremium: false,
            premiumUntil: null,
            plan: null
        });
    }
    
    const isPremium = checkPremiumStatus(userId);
    
    res.json({
        isPremium: isPremium,
        premiumUntil: user.premiumUntil,
        plan: user.premiumPlan,
        totalStarsSpent: user.totalStarsSpent
    });
});

/**
 * POST /api/payments/refund
 * Запросить возврат (для админов)
 */
app.post('/api/payments/refund', async (req, res) => {
    try {
        const { user_id, payment_id, admin_key } = req.body;
        
        // Простая проверка админа (замените на нормальную авторизацию)
        if (admin_key !== 'your_admin_secret_key') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const result = await refundPayment(user_id, payment_id);
        
        res.json(result);
        
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/payments/history/:userId
 * История платежей пользователя
 */
app.get('/api/payments/history/:userId', (req, res) => {
    const userId = req.params.userId;
    
    const payments = Array.from(DB.payments.values())
        .filter(p => p.userId == userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ payments });
});

// ═══════════════════════════════════════════════════════════════════
// БАЗА ДАННЫХ ТЕХНИК
// ═══════════════════════════════════════════════════════════════════

const TECHNIQUES = {
    // === БЕСПЛАТНЫЕ ===
    'box-breathing': {
        slug: 'box-breathing',
        name: 'Квадратное дыхание',
        premium: false,
        description: `Квадратное дыхание (Box Breathing) — это техника, используемая Navy SEALs для мгновенного снятия стресса.

**Инструкция:**
1. Вдохните через нос на 4 счёта
2. Задержите дыхание на 4 счёта
3. Выдохните через рот на 4 счёта
4. Задержите дыхание на 4 счёта
5. Повторите 6 раз`,
        technique: {
            rounds: 6,
            settings: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 }
        }
    },
    
    'relaxing-478': {
        slug: 'relaxing-478',
        name: '4-7-8 Расслабление',
        premium: false,
        description: `Техника 4-7-8 — "природный транквилизатор" для нервной системы.

**Инструкция:**
1. Вдохните через нос на 4 счёта
2. Задержите дыхание на 7 счётов
3. Выдохните через рот на 8 счётов
4. Повторите 4 раза`,
        technique: {
            rounds: 4,
            settings: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 }
        }
    },
    
    'simple-deep': {
        slug: 'simple-deep',
        name: 'Глубокое дыхание',
        premium: false,
        description: `Самая простая техника — дышите животом, не грудью.

**Инструкция:**
1. Вдохните, чтобы живот поднялся (4 сек)
2. Выдохните, живот опускается (6 сек)
3. Повторите 10 раз`,
        technique: {
            rounds: 10,
            settings: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 }
        }
    },
    
    // === ПРЕМИУМ ===
    'wim-hof': {
        slug: 'wim-hof',
        name: 'Метод Вим Хофа',
        premium: true,
        description: `⚠️ Не делайте в воде или за рулём!

**Фаза 1:** 30 глубоких вдохов
**Фаза 2:** Задержка на выдохе (1-3 мин)
**Фаза 3:** Восстановление (15 сек на вдохе)
**Повторите 3 раунда**`,
        technique: {
            rounds: 3,
            settings: { inhale: 2, holdIn: 0, exhale: 1.5, holdOut: 0 }
        }
    },
    
    'anti-panic': {
        slug: 'anti-panic',
        name: 'Антипаника 911',
        premium: true,
        description: `🆘 Экстренная техника при панике.

**Главное:** Длинный ВЫДОХ!
1. Выдох через губы — 8 сек
2. Короткий вдох — 2 сек
3. Повторяйте пока не станет легче`,
        technique: {
            rounds: 20,
            settings: { inhale: 2, holdIn: 0, exhale: 8, holdOut: 1 }
        }
    },
    
    'sleep-478-pro': {
        slug: 'sleep-478-pro',
        name: 'Глубокий сон PRO',
        premium: true,
        description: `Продвинутая техника для засыпания за 10 минут.

**Прогрессия:**
- Блок 1: 4-7-8 (3 цикла)
- Блок 2: 4-8-10 (3 цикла)
- Блок 3: 4-10-12 (2 цикла)`,
        technique: {
            rounds: 8,
            settings: { inhale: 4, holdIn: 8, exhale: 10, holdOut: 2 }
        }
    },
    
    'energizer': {
        slug: 'energizer',
        name: 'Энерджайзер',
        premium: true,
        description: `Капалабхати — замена кофе!

**Техника:**
1. Резкий выдох носом (живот внутрь)
2. Пассивный вдох
3. 60 циклов → задержка 30 сек`,
        technique: {
            rounds: 3,
            settings: { inhale: 0.7, holdIn: 0, exhale: 0.3, holdOut: 0 }
        }
    },
    
    'coherent-365': {
        slug: 'coherent-365',
        name: 'Когерентное 365',
        premium: true,
        description: `5 вдохов в минуту — оптимум для HRV.

**Правило 365:**
- 3 раза в день
- 6 секунд вдох + 6 секунд выдох
- 5 минут каждый раз`,
        technique: {
            rounds: 30,
            settings: { inhale: 6, holdIn: 0, exhale: 6, holdOut: 0 }
        }
    }
};

// ═══════════════════════════════════════════════════════════════════
// API ДЫХАТЕЛЬНЫХ ТЕХНИК
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/breathing/:slug
 */
app.get('/api/breathing/:slug', (req, res) => {
    const { slug } = req.params;
    const userId = req.headers['x-user-id'];
    
    const technique = TECHNIQUES[slug];
    
    if (!technique) {
        return res.status(404).json({ error: 'not_found' });
    }
    
    // Проверка премиум доступа
    if (technique.premium) {
        const isPremium = userId ? checkPremiumStatus(userId) : false;
        
        if (!isPremium) {
            return res.status(403).json({ 
                error: 'premium_required',
                message: 'Для доступа требуется PRO подписка'
            });
        }
    }
    
    res.json({
        description: technique.description,
        technique: technique.technique
    });
});

/**
 * POST /api/breathing/ai
 */
app.post('/api/breathing/ai', async (req, res) => {
    const { query } = req.body;
    const userId = req.headers['x-user-id'];
    const isPremium = userId ? checkPremiumStatus(userId) : false;
    
    if (!query) {
        return res.status(400).json({ error: 'Query required' });
    }
    
    const recommendation = getAiRecommendation(query, isPremium);
    
    await new Promise(r => setTimeout(r, 300));
    
    res.json(recommendation);
});

/**
 * GET /api/techniques
 */
app.get('/api/techniques', (req, res) => {
    const userId = req.headers['x-user-id'];
    const isPremium = userId ? checkPremiumStatus(userId) : false;
    
    const list = Object.values(TECHNIQUES).map(t => ({
        slug: t.slug,
        name: t.name,
        premium: t.premium,
        locked: t.premium && !isPremium
    }));
    
    res.json({ techniques: list, isPremium });
});

// ═══════════════════════════════════════════════════════════════════
// AI RECOMMENDATION
// ═══════════════════════════════════════════════════════════════════

function getAiRecommendation(query, isPremium) {
    const q = query.toLowerCase();
    
    let technique, description;
    
    if (q.includes('паник') || q.includes('тревог') || q.includes('страх')) {
        if (isPremium) {
            technique = { rounds: 15, settings: { inhale: 2, holdIn: 0, exhale: 8, holdOut: 1 } };
            description = 'Экстренная техника "Антипаника". Фокус на длинном выдохе!';
        } else {
            technique = { rounds: 8, settings: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 } };
            description = 'Техника 4-7-8 поможет успокоиться. Длинный выдох — ключ!';
        }
    } else if (q.includes('сон') || q.includes('спать') || q.includes('уснуть')) {
        technique = { rounds: 8, settings: { inhale: 4, holdIn: 8, exhale: 10, holdOut: 2 } };
        description = 'Техника для сна с прогрессивным замедлением. Делайте лёжа в постели.';
    } else if (q.includes('энерг') || q.includes('устал') || q.includes('бодр')) {
        technique = { rounds: 20, settings: { inhale: 1.5, holdIn: 0, exhale: 1.5, holdOut: 0 } };
        description = 'Быстрое дыхание для энергии. Эффект как от кофе!';
    } else if (q.includes('фокус') || q.includes('концентр') || q.includes('работ')) {
        technique = { rounds: 6, settings: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 } };
        description = 'Квадратное дыхание — техника Navy SEALs для концентрации.';
    } else {
        technique = { rounds: 4, settings: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 } };
        description = 'Универсальная техника 4-7-8 для расслабления и баланса.';
    }
    
    return { description, technique };
}

// ═══════════════════════════════════════════════════════════════════
// HEALTH CHECK & ADMIN
// ═══════════════════════════════════════════════════════════════════

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        version: '3.0 + Telegram Stars',
        users: DB.users.size,
        payments: DB.payments.size,
        timestamp: new Date().toISOString()
    });
});

// Админка — статистика
app.get('/api/admin/stats', (req, res) => {
    const totalRevenue = Array.from(DB.payments.values())
        .reduce((sum, p) => sum + p.amount, 0);
    
    const premiumUsers = Array.from(DB.users.values())
        .filter(u => checkPremiumStatus(u.id)).length;
    
    res.json({
        totalUsers: DB.users.size,
        premiumUsers,
        totalPayments: DB.payments.size,
        totalRevenue: `${totalRevenue} ⭐`,
        revenueUSD: `~$${(totalRevenue * 0.02).toFixed(2)}`
    });
});

// ═══════════════════════════════════════════════════════════════════
// SETUP WEBHOOK HELPER
// ═══════════════════════════════════════════════════════════════════

app.get('/api/setup-webhook', async (req, res) => {
    const webhookUrl = req.query.url;
    
    if (!webhookUrl) {
        return res.status(400).json({
            error: 'Provide ?url=YOUR_WEBHOOK_URL',
            example: '/api/setup-webhook?url=https://your-domain.com/webhook/telegram'
        });
    }
    
    const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/setWebhook`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url: webhookUrl,
            secret_token: CONFIG.WEBHOOK_SECRET,
            allowed_updates: ['message', 'pre_checkout_query']
        })
    });
    
    const result = await response.json();
    res.json(result);
});

// ═══════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║  🧘 BREATHFLOW API SERVER v3.0                                   ║
║  + TELEGRAM STARS WEBHOOK                                        ║
║                                                                  ║
║  Server: http://localhost:${PORT}                                  ║
║                                                                  ║
║  📡 API Endpoints:                                               ║
║  GET  /api/breathing/:slug     - получить технику               ║
║  POST /api/breathing/ai        - AI рекомендация                ║
║  GET  /api/techniques          - список техник                  ║
║                                                                  ║
║  💳 Payments:                                                    ║
║  POST /api/payments/create-invoice  - создать invoice           ║
║  GET  /api/payments/status/:userId  - статус подписки           ║
║  GET  /api/payments/history/:userId - история платежей          ║
║                                                                  ║
║  🔔 Webhook:                                                     ║
║  POST /webhook/telegram        - Telegram updates               ║
║  GET  /api/setup-webhook?url=  - настроить webhook              ║
║                                                                  ║
║  📊 Admin:                                                       ║
║  GET  /api/admin/stats         - статистика                     ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

📝 Чтобы настроить webhook, откройте:
   http://localhost:${PORT}/api/setup-webhook?url=https://YOUR_DOMAIN/webhook/telegram

💡 Или вручную:
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=<URL>&secret_token=<SECRET>
    `);
});

module.exports = app;
