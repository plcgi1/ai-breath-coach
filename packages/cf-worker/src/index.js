/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  BREATHFLOW API - CLOUDFLARE WORKERS                             ║
 * ║  Zero-cost serverless API with KV storage                        ║
 * ║                                                                  ║
 * ║  Deploy: wrangler deploy                                         ║
 * ║  Dev: wrangler dev                                               ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════
// КОНФИГУРАЦИЯ
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
    PRICES: {
        // Отдельные техники
        'technique_anti-panic': 99,
        'technique_wim-hof': 199,
        'technique_energizer': 99,
        'technique_sleep-pro': 149,
        'technique_coherent': 99,
        
        // Курсы
        'course_sleep': 149,
        'course_anxiety': 249,
        'course_energy': 199,
        'course_meditation': 299,
        
        // Бандлы
        'bundle_starter': 299,
        'bundle_complete': 599,
        'lifetime': 990
    },
    
    DURATIONS: {
        weekly: 7,
        monthly: 30,
        yearly: 365,
        lifetime: 36500
    }
};

// ═══════════════════════════════════════════════════════════════════
// ТЕХНИКИ ДЫХАНИЯ
// ═══════════════════════════════════════════════════════════════════

const TECHNIQUES = {
    'box-breathing': {
        slug: 'box-breathing',
        name: 'Квадратное дыхание',
        premium: false,
        price: 0,
        description: `**Квадратное дыхание (Box Breathing)**

Техника, используемая Navy SEALs для мгновенного контроля стресса в экстремальных ситуациях.

**Инструкция:**
1. Вдохните через нос — 4 секунды
2. Задержите дыхание — 4 секунды
3. Выдохните через рот — 4 секунды
4. Задержите на выдохе — 4 секунды

**Повторите 6 циклов (≈3 минуты)**

💡 Визуализируйте квадрат: каждая сторона = одна фаза`,
        technique: {
            rounds: 6,
            settings: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 }
        }
    },
    
    'relaxing-478': {
        slug: 'relaxing-478',
        name: '4-7-8 Расслабление',
        premium: false,
        price: 0,
        description: `**Техника 4-7-8**

Создана доктором Эндрю Вейлом. Называется "природный транквилизатор" для нервной системы.

**Инструкция:**
1. Полностью выдохните через рот со звуком
2. Закройте рот, вдохните через нос — 4 счёта
3. Задержите дыхание — 7 счётов
4. Медленно выдохните через рот — 8 счётов

**Повторите 4 цикла**

⚠️ Не делайте больше 4 циклов первые 2 недели`,
        technique: {
            rounds: 4,
            settings: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 }
        }
    },
    
    'simple-deep': {
        slug: 'simple-deep',
        name: 'Глубокое дыхание',
        premium: false,
        price: 0,
        description: `**Диафрагмальное дыхание**

Самая простая и базовая техника. Идеальна для начинающих.

**Инструкция:**
1. Положите руку на живот
2. Вдохните так, чтобы живот поднялся — 4 сек
3. Выдохните, живот опускается — 6 сек
4. Грудь не двигается!

**Повторите 10 циклов**`,
        technique: {
            rounds: 10,
            settings: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 }
        }
    },
    
    'anti-panic': {
        slug: 'anti-panic',
        name: 'Антипаника 911',
        premium: true,
        price: 99,
        productId: 'technique_anti-panic',
        description: `**🆘 ЭКСТРЕННАЯ ТЕХНИКА**

Используйте при панической атаке или сильной тревоге.

**Главное правило:** Фокус на ВЫДОХЕ!

**Инструкция:**
1. Выдохните через сжатые губы — 8 секунд
   (как будто дуете на горячий суп)
2. Короткий вдох носом — 2 секунды
3. Снова длинный выдох — 8 секунд

**Повторяйте 15-20 раз**

🧠 Почему работает: длинный выдох физически не позволяет телу паниковать — активируется парасимпатика.

**Дополнительно:**
• Опустите плечи
• Разожмите челюсть
• Считайте выдохи вслух`,
        technique: {
            rounds: 20,
            settings: { inhale: 2, holdIn: 0, exhale: 8, holdOut: 1 }
        }
    },
    
    'wim-hof': {
        slug: 'wim-hof',
        name: 'Метод Вим Хофа',
        premium: true,
        price: 199,
        productId: 'technique_wim-hof',
        description: `**❄️ Метод "Ледяного Человека"**

Техника Вим Хофа для энергии, иммунитета и ментальной силы.

**⚠️ ВАЖНО:** Не делайте в воде, за рулём, стоя!

**РАУНД (повторить 3 раза):**

**Фаза 1 — Гипервентиляция:**
• 30 глубоких вдохов
• Вдох: живот → грудь (полный)
• Выдох: расслабленный (не до конца)
• Темп: ~2 секунды на цикл

**Фаза 2 — Задержка:**
• После 30-го вдоха — выдохните
• НЕ вдыхайте! Держите сколько можете
• Цель: 1-3 минуты (будет легче с практикой)

**Фаза 3 — Восстановление:**
• Глубокий вдох
• Задержите на 15 секунд
• Выдохните, начните новый раунд

**Эффект:** прилив энергии, покалывание в теле, эйфория`,
        technique: {
            rounds: 3,
            settings: { inhale: 2, holdIn: 0, exhale: 1.5, holdOut: 0 },
            special: 'wim-hof'
        }
    },
    
    'energizer': {
        slug: 'energizer',
        name: 'Кофеиновое дыхание',
        premium: true,
        price: 99,
        productId: 'technique_energizer',
        description: `**⚡ Замена кофе за 3 минуты**

Капалабхати — древняя техника йогов для мгновенной бодрости.

**Инструкция:**

**Фаза 1 — Огненное дыхание (2 мин):**
• Резкий короткий выдох через нос
• При выдохе живот резко втягивается
• Вдох пассивный (живот сам расслабляется)
• Темп: 1 цикл в секунду
• Сделайте 60 циклов

**Фаза 2 — Задержка:**
• Глубокий вдох
• Задержите на 30-45 секунд
• Медленный выдох

**Фаза 3 — Интеграция:**
• 5 спокойных глубоких вдохов

🧠 Эффект: насыщение кислородом, выброс эндорфинов, ясность ума`,
        technique: {
            rounds: 3,
            settings: { inhale: 0.7, holdIn: 0, exhale: 0.3, holdOut: 0 },
            special: 'kapalabhati'
        }
    },
    
    'sleep-pro': {
        slug: 'sleep-pro',
        name: '4-7-8 Продвинутый',
        premium: true,
        price: 149,
        productId: 'technique_sleep-pro',
        description: `**🌙 Засыпание за 10 минут**

Прогрессивная версия 4-7-8 с постепенным замедлением.

**Подготовка:**
• Лягте в кровать
• Закройте глаза
• 5 обычных глубоких вдохов

**Блок 1 — Разогрев (3 цикла):**
• Вдох 4 сек → Задержка 7 сек → Выдох 8 сек

**Блок 2 — Углубление (3 цикла):**
• Вдох 4 сек → Задержка 8 сек → Выдох 10 сек

**Блок 3 — Погружение (2 цикла):**
• Вдох 4 сек → Задержка 10 сек → Выдох 12 сек

**Финал:**
• Отпустите контроль
• Дышите как хотите
• Позвольте себе заснуть

💤 Большинство засыпают до конца блока 3`,
        technique: {
            rounds: 8,
            settings: { inhale: 4, holdIn: 8, exhale: 10, holdOut: 2 }
        }
    },
    
    'coherent': {
        slug: 'coherent',
        name: 'Когерентное 365',
        premium: true,
        price: 99,
        productId: 'technique_coherent',
        description: `**💓 Оптимальный ритм для сердца**

5 вдохов в минуту = резонансная частота сердечно-сосудистой системы.

**Правило 365:**
• 3 раза в день
• 6 секунд вдох + 6 секунд выдох
• 5 минут каждый раз

**Инструкция:**
1. Вдох — 6 секунд (плавно, как волна)
2. Выдох — 6 секунд (без паузы)
3. Непрерывно, 5+ минут

**Визуализация:**
Представьте волну: вдох — волна поднимается, выдох — опускается.

📊 Исследования: повышает HRV (вариабельность пульса) — ключевой маркер здоровья и стрессоустойчивости.`,
        technique: {
            rounds: 30,
            settings: { inhale: 6, holdIn: 0, exhale: 6, holdOut: 0 }
        }
    }
};

// ═══════════════════════════════════════════════════════════════════
// ПРОДУКТЫ ДЛЯ ПРОДАЖИ
// ═══════════════════════════════════════════════════════════════════

const PRODUCTS = {
    // Отдельные техники
    'technique_anti-panic': {
        id: 'technique_anti-panic',
        name: '🆘 Антипаника 911',
        description: 'Экстренная техника при панических атаках',
        price: 99,
        type: 'technique',
        unlocks: ['anti-panic']
    },
    'technique_wim-hof': {
        id: 'technique_wim-hof',
        name: '❄️ Метод Вим Хофа',
        description: 'Энергия, иммунитет, ментальная сила',
        price: 199,
        type: 'technique',
        unlocks: ['wim-hof']
    },
    'technique_energizer': {
        id: 'technique_energizer',
        name: '⚡ Кофеиновое дыхание',
        description: 'Замена кофе за 3 минуты',
        price: 99,
        type: 'technique',
        unlocks: ['energizer']
    },
    'technique_sleep-pro': {
        id: 'technique_sleep-pro',
        name: '🌙 Продвинутый сон',
        description: 'Засыпание за 10 минут',
        price: 149,
        type: 'technique',
        unlocks: ['sleep-pro']
    },
    'technique_coherent': {
        id: 'technique_coherent',
        name: '💓 Когерентное 365',
        description: 'Оптимальный ритм для сердца',
        price: 99,
        type: 'technique',
        unlocks: ['coherent']
    },
    
    // Курсы
    'course_sleep': {
        id: 'course_sleep',
        name: '😴 Курс: Здоровый сон',
        description: '7 дней трансформации сна',
        price: 149,
        type: 'course',
        unlocks: ['sleep-pro', 'relaxing-478'],
        duration: '7 дней'
    },
    'course_anxiety': {
        id: 'course_anxiety',
        name: '😌 Курс: Без тревоги',
        description: '14 дней работы с тревогой',
        price: 249,
        type: 'course',
        unlocks: ['anti-panic', 'coherent', 'relaxing-478'],
        duration: '14 дней'
    },
    
    // Бандлы
    'bundle_starter': {
        id: 'bundle_starter',
        name: '🎁 Стартовый набор',
        description: '3 техники по цене 2',
        price: 299,
        type: 'bundle',
        unlocks: ['anti-panic', 'sleep-pro', 'energizer'],
        savings: '30%'
    },
    
    // Lifetime
    'lifetime': {
        id: 'lifetime',
        name: '👑 Всё навсегда',
        description: 'Все техники + все будущие обновления',
        price: 990,
        type: 'lifetime',
        unlocks: ['*'],
        badge: 'Основатель'
    }
};

// ═══════════════════════════════════════════════════════════════════
// РОУТЕР
// ═══════════════════════════════════════════════════════════════════

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;
        
        // CORS
        if (method === 'OPTIONS') {
            return corsResponse();
        }
        
        try {
            // ═══════════════════════════════════════════════════════
            // WEBHOOK TELEGRAM
            // ═══════════════════════════════════════════════════════
            if (path === '/webhook/telegram' && method === 'POST') {
                return handleTelegramWebhook(request, env);
            }
            
            // ═══════════════════════════════════════════════════════
            // API ROUTES
            // ═══════════════════════════════════════════════════════
            
            // Health check
            if (path === '/api/health') {
                return jsonResponse({ status: 'ok', version: 'CF Workers 1.0' });
            }
            
            // Техники
            if (path.startsWith('/api/breathing/')) {
                if (path === '/api/breathing/ai' && method === 'POST') {
                    return handleAiRecommendation(request, env);
                }
                const slug = path.replace('/api/breathing/', '');
                return handleGetTechnique(slug, request, env);
            }
            
            // Продукты
            if (path === '/api/products') {
                return handleGetProducts(request, env);
            }
            
            // Платежи
            if (path === '/api/payments/create-invoice' && method === 'POST') {
                return handleCreateInvoice(request, env);
            }
            
            if (path.startsWith('/api/payments/status/')) {
                const userId = path.replace('/api/payments/status/', '');
                return handlePaymentStatus(userId, env);
            }
            
            // Аналитика
            if (path === '/api/analytics/event' && method === 'POST') {
                return handleAnalyticsEvent(request, env);
            }
            
            if (path === '/api/analytics/dashboard') {
                return handleAnalyticsDashboard(env);
            }
            
            // Напоминания
            if (path === '/api/reminders/set' && method === 'POST') {
                return handleSetReminder(request, env);
            }
            
            if (path === '/api/cron/send-reminders') {
                return handleSendReminders(env);
            }
            
            // Setup
            if (path === '/api/setup-webhook') {
                const webhookUrl = url.searchParams.get('url');
                return handleSetupWebhook(webhookUrl, env);
            }
            
            // 404
            return jsonResponse({ error: 'Not found' }, 404);
            
        } catch (error) {
            console.error('Error:', error);
            return jsonResponse({ error: error.message }, 500);
        }
    },
    
    // Scheduled tasks (Cron)
    async scheduled(event, env, ctx) {
        // Запускается по расписанию (настроить в wrangler.toml)
        // Отправка напоминаний
        ctx.waitUntil(sendScheduledReminders(env));
    }
};

// ═══════════════════════════════════════════════════════════════════
// HANDLERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Получить технику дыхания
 */
async function handleGetTechnique(slug, request, env) {
    const technique = TECHNIQUES[slug];
    
    if (!technique) {
        return jsonResponse({ error: 'not_found' }, 404);
    }
    
    const userId = request.headers.get('X-User-Id');
    
    // Проверка доступа к PRO технике
    if (technique.premium) {
        const hasAccess = await checkUserAccess(userId, slug, env);
        
        if (!hasAccess) {
            return jsonResponse({
                error: 'payment_required',
                product: PRODUCTS[technique.productId],
                price: technique.price
            }, 403);
        }
    }
    
    // Логируем просмотр
    await trackEvent(env, 'technique_view', { userId, slug });
    
    return jsonResponse({
        description: technique.description,
        technique: technique.technique
    });
}

/**
 * AI подбор техники
 */
async function handleAiRecommendation(request, env) {
    const { query } = await request.json();
    const userId = request.headers.get('X-User-Id');
    
    if (!query) {
        return jsonResponse({ error: 'Query required' }, 400);
    }
    
    // Логируем запрос
    await trackEvent(env, 'ai_query', { userId, query });
    
    const q = query.toLowerCase();
    let technique, description, name;
    
    // Простой rule-based AI (можно заменить на LLM)
    if (q.includes('паник') || q.includes('тревог') || q.includes('страх') || q.includes('атака')) {
        technique = { rounds: 15, settings: { inhale: 2, holdIn: 0, exhale: 8, holdOut: 1 } };
        description = '🆘 При панике главное — длинный ВЫДОХ! Физически невозможно паниковать при 8-секундном выдохе. Дышите через сжатые губы, как будто дуете на горячий суп. Сосредоточьтесь только на выдохе.';
        name = 'Антипаника';
    } else if (q.includes('сон') || q.includes('спать') || q.includes('уснуть') || q.includes('бессонн')) {
        technique = { rounds: 8, settings: { inhale: 4, holdIn: 8, exhale: 10, holdOut: 2 } };
        description = '🌙 Для засыпания нужно замедлить всё: пульс, мысли, дыхание. Эта техника с прогрессивным удлинением выдоха переведёт вас в режим сна за 5-10 минут. Делайте лёжа, с закрытыми глазами.';
        name = 'Глубокий сон';
    } else if (q.includes('энерг') || q.includes('устал') || q.includes('бодр') || q.includes('сонн') || q.includes('кофе')) {
        technique = { rounds: 3, settings: { inhale: 1, holdIn: 0, exhale: 1, holdOut: 0 } };
        description = '⚡ Быстрое дыхание насытит кровь кислородом и запустит выброс адреналина. 30 быстрых вдохов, затем задержка — и вы почувствуете прилив энергии лучше любого кофе!';
        name = 'Энерджайзер';
    } else if (q.includes('фокус') || q.includes('концентр') || q.includes('работ') || q.includes('внимани')) {
        technique = { rounds: 6, settings: { inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 } };
        description = '🎯 Квадратное дыхание — секрет концентрации спецназа и топ-менеджеров. 4 равные фазы создают баланс и ясность ума. Идеально перед важной встречей или сложной задачей.';
        name = 'Фокус';
    } else if (q.includes('стресс') || q.includes('нерв') || q.includes('напряж') || q.includes('расслаб')) {
        technique = { rounds: 4, settings: { inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 } };
        description = '😌 Техника 4-7-8 — это "природный транквилизатор". Длинная задержка на вдохе насыщает кровь кислородом, а длинный выдох включает парасимпатику. Эффект как от лёгкого успокоительного.';
        name = '4-7-8';
    } else {
        technique = { rounds: 10, settings: { inhale: 4, holdIn: 0, exhale: 6, holdOut: 0 } };
        description = '🧘 Начните с простого глубокого дыхания. Вдох животом 4 секунды, выдох 6 секунд. Это базовая техника, которая подходит для любой ситуации.';
        name = 'Глубокое дыхание';
    }
    
    return jsonResponse({ description, technique, meta: { name } });
}

/**
 * Список продуктов
 */
async function handleGetProducts(request, env) {
    const userId = request.headers.get('X-User-Id');
    const purchases = await getUserPurchases(userId, env);
    
    const products = Object.values(PRODUCTS).map(p => ({
        ...p,
        purchased: purchases.includes(p.id) || purchases.includes('lifetime')
    }));
    
    return jsonResponse({ products });
}

/**
 * Создать invoice для оплаты
 */
async function handleCreateInvoice(request, env) {
    const { user_id, product_id } = await request.json();
    
    const product = PRODUCTS[product_id];
    if (!product) {
        return jsonResponse({ error: 'Product not found' }, 404);
    }
    
    const BOT_TOKEN = env.BOT_TOKEN;
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: product.name,
            description: product.description,
            payload: JSON.stringify({ product_id, user_id }),
            currency: 'XTR',
            prices: [{ label: product.name, amount: product.price }]
        })
    });
    
    const result = await response.json();
    
    if (result.ok) {
        await trackEvent(env, 'invoice_created', { user_id, product_id, price: product.price });
        return jsonResponse({ invoice_link: result.result, product });
    }
    
    return jsonResponse({ error: result.description }, 400);
}

/**
 * Статус платежей пользователя
 */
async function handlePaymentStatus(userId, env) {
    const userData = await env.USERS.get(`user:${userId}`, 'json') || {};
    const purchases = userData.purchases || [];
    const isLifetime = purchases.includes('lifetime');
    
    return jsonResponse({
        purchases,
        isLifetime,
        totalSpent: userData.totalSpent || 0
    });
}

/**
 * Telegram Webhook
 */
async function handleTelegramWebhook(request, env) {
    const signature = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (signature !== env.WEBHOOK_SECRET) {
        return jsonResponse({ error: 'Invalid signature' }, 403);
    }
    
    const update = await request.json();
    const BOT_TOKEN = env.BOT_TOKEN;
    
    // Pre-checkout query
    if (update.pre_checkout_query) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerPreCheckoutQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pre_checkout_query_id: update.pre_checkout_query.id,
                ok: true
            })
        });
        return jsonResponse({ ok: true });
    }
    
    // Successful payment
    if (update.message?.successful_payment) {
        const payment = update.message.successful_payment;
        const userId = update.message.from.id;
        const payload = JSON.parse(payment.invoice_payload);
        
        // Сохраняем покупку
        await saveUserPurchase(userId, payload.product_id, payment.total_amount, env);
        
        // Отправляем сообщение
        const product = PRODUCTS[payload.product_id];
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: userId,
                text: `🎉 *Спасибо за покупку!*\n\n` +
                      `Вы приобрели: *${product.name}*\n\n` +
                      `Откройте приложение — контент уже доступен! 🧘`,
                parse_mode: 'Markdown'
            })
        });
        
        // Аналитика
        await trackEvent(env, 'purchase_completed', {
            user_id: userId,
            product_id: payload.product_id,
            amount: payment.total_amount
        });
        
        return jsonResponse({ ok: true });
    }
    
    // Команда /start
    if (update.message?.text?.startsWith('/start')) {
        const userId = update.message.from.id;
        const firstName = update.message.from.first_name;
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: userId,
                text: `👋 Привет, ${firstName}!\n\n` +
                      `🧘 *BreathFlow* — дыхательные практики для:\n` +
                      `• Снятия тревоги за 3 минуты\n` +
                      `• Быстрого засыпания\n` +
                      `• Заряда энергии без кофе\n\n` +
                      `Нажмите кнопку ниже, чтобы начать! 👇`,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🧘 Открыть приложение', web_app: { url: env.WEBAPP_URL || 'https://your-app.pages.dev' } }
                    ]]
                }
            })
        });
        
        await trackEvent(env, 'bot_start', { user_id: userId });
        
        return jsonResponse({ ok: true });
    }
    
    return jsonResponse({ ok: true });
}

// ═══════════════════════════════════════════════════════════════════
// АНАЛИТИКА
// ═══════════════════════════════════════════════════════════════════

/**
 * Трекинг события
 */
async function trackEvent(env, event, data = {}) {
    const timestamp = new Date().toISOString();
    const key = `event:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    
    await env.ANALYTICS.put(key, JSON.stringify({
        event,
        data,
        timestamp
    }), { expirationTtl: 60 * 60 * 24 * 30 }); // 30 дней
    
    // Инкремент счётчиков
    const today = timestamp.split('T')[0];
    const counterKey = `counter:${event}:${today}`;
    const current = parseInt(await env.ANALYTICS.get(counterKey) || '0');
    await env.ANALYTICS.put(counterKey, String(current + 1), { expirationTtl: 60 * 60 * 24 * 90 });
}

/**
 * POST /api/analytics/event
 */
async function handleAnalyticsEvent(request, env) {
    const { event, data } = await request.json();
    const userId = request.headers.get('X-User-Id');
    
    await trackEvent(env, event, { ...data, userId });
    
    return jsonResponse({ ok: true });
}

/**
 * GET /api/analytics/dashboard
 */
async function handleAnalyticsDashboard(env) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    
    // Собираем метрики
    const metrics = {
        today: {
            bot_start: parseInt(await env.ANALYTICS.get(`counter:bot_start:${today}`) || '0'),
            technique_view: parseInt(await env.ANALYTICS.get(`counter:technique_view:${today}`) || '0'),
            purchase_completed: parseInt(await env.ANALYTICS.get(`counter:purchase_completed:${today}`) || '0'),
            invoice_created: parseInt(await env.ANALYTICS.get(`counter:invoice_created:${today}`) || '0')
        },
        yesterday: {
            bot_start: parseInt(await env.ANALYTICS.get(`counter:bot_start:${yesterday}`) || '0'),
            purchase_completed: parseInt(await env.ANALYTICS.get(`counter:purchase_completed:${yesterday}`) || '0')
        }
    };
    
    // Считаем общую выручку (из KV)
    const revenueData = await env.ANALYTICS.get('total_revenue', 'json') || { stars: 0, count: 0 };
    
    return jsonResponse({
        metrics,
        revenue: {
            totalStars: revenueData.stars,
            totalUSD: (revenueData.stars * 0.02).toFixed(2),
            totalPurchases: revenueData.count
        },
        conversionRate: metrics.today.invoice_created > 0 
            ? ((metrics.today.purchase_completed / metrics.today.invoice_created) * 100).toFixed(1) + '%'
            : '0%'
    });
}

// ═══════════════════════════════════════════════════════════════════
// НАПОМИНАНИЯ
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /api/reminders/set
 */
async function handleSetReminder(request, env) {
    const { user_id, time, timezone, enabled } = await request.json();
    
    await env.USERS.put(`reminder:${user_id}`, JSON.stringify({
        time,
        timezone: timezone || 'Europe/Moscow',
        enabled: enabled !== false,
        createdAt: new Date().toISOString()
    }));
    
    return jsonResponse({ ok: true, time, enabled });
}

/**
 * Отправка напоминаний (вызывается Cron или вручную)
 */
async function handleSendReminders(env) {
    const sent = await sendScheduledReminders(env);
    return jsonResponse({ ok: true, sent });
}

async function sendScheduledReminders(env) {
    const BOT_TOKEN = env.BOT_TOKEN;
    const now = new Date();
    const currentHour = now.getUTCHours();
    
    // Получаем список пользователей с напоминаниями (в реальности — через cursor)
    const reminders = await env.USERS.list({ prefix: 'reminder:' });
    let sent = 0;
    
    for (const key of reminders.keys) {
        const reminder = await env.USERS.get(key.name, 'json');
        if (!reminder?.enabled) continue;
        
        // Простая проверка времени (в реальности нужен учёт timezone)
        const reminderHour = parseInt(reminder.time?.split(':')[0] || '9');
        
        // Если час совпадает (±1)
        if (Math.abs(currentHour - reminderHour) <= 1) {
            const userId = key.name.replace('reminder:', '');
            
            // Проверяем, не отправляли ли уже сегодня
            const today = now.toISOString().split('T')[0];
            const sentKey = `reminder_sent:${userId}:${today}`;
            const alreadySent = await env.USERS.get(sentKey);
            
            if (!alreadySent) {
                // Отправляем напоминание
                const messages = [
                    '🧘 Время для дыхательной практики! 3 минуты — и день станет лучше.',
                    '😌 Не забудь подышать сегодня. Твоё тело скажет спасибо!',
                    '🌅 Доброе утро! Начни день с 5 минут осознанного дыхания.',
                    '⚡ Перерыв на дыхание? Всего 3 минуты для перезагрузки!',
                    '🔥 Твоя серия практик ждёт! Не сбрось streak.'
                ];
                
                const message = messages[Math.floor(Math.random() * messages.length)];
                
                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: userId,
                        text: message,
                        reply_markup: {
                            inline_keyboard: [[
                                { text: '🧘 Начать практику', web_app: { url: env.WEBAPP_URL || 'https://your-app.pages.dev' } }
                            ]]
                        }
                    })
                });
                
                // Помечаем как отправленное
                await env.USERS.put(sentKey, '1', { expirationTtl: 86400 });
                sent++;
            }
        }
    }
    
    return sent;
}

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Проверить доступ пользователя к технике
 */
async function checkUserAccess(userId, techniqueSlug, env) {
    if (!userId) return false;
    
    const userData = await env.USERS.get(`user:${userId}`, 'json');
    if (!userData) return false;
    
    const purchases = userData.purchases || [];
    
    // Lifetime = всё доступно
    if (purchases.includes('lifetime')) return true;
    
    // Проверяем конкретную технику
    const technique = TECHNIQUES[techniqueSlug];
    if (technique?.productId && purchases.includes(technique.productId)) return true;
    
    // Проверяем курсы и бандлы
    for (const purchaseId of purchases) {
        const product = PRODUCTS[purchaseId];
        if (product?.unlocks?.includes(techniqueSlug)) return true;
    }
    
    return false;
}

/**
 * Получить покупки пользователя
 */
async function getUserPurchases(userId, env) {
    if (!userId) return [];
    const userData = await env.USERS.get(`user:${userId}`, 'json');
    return userData?.purchases || [];
}

/**
 * Сохранить покупку
 */
async function saveUserPurchase(userId, productId, amount, env) {
    const userData = await env.USERS.get(`user:${userId}`, 'json') || {
        purchases: [],
        totalSpent: 0
    };
    
    if (!userData.purchases.includes(productId)) {
        userData.purchases.push(productId);
    }
    userData.totalSpent += amount;
    userData.lastPurchase = new Date().toISOString();
    
    await env.USERS.put(`user:${userId}`, JSON.stringify(userData));
    
    // Обновляем общую выручку
    const revenue = await env.ANALYTICS.get('total_revenue', 'json') || { stars: 0, count: 0 };
    revenue.stars += amount;
    revenue.count += 1;
    await env.ANALYTICS.put('total_revenue', JSON.stringify(revenue));
    
    // Сохраняем платёж
    const paymentKey = `payment:${Date.now()}:${userId}`;
    await env.PAYMENTS.put(paymentKey, JSON.stringify({
        userId,
        productId,
        amount,
        timestamp: new Date().toISOString()
    }));
}

/**
 * Настройка webhook
 */
async function handleSetupWebhook(webhookUrl, env) {
    if (!webhookUrl) {
        return jsonResponse({ 
            error: 'Provide ?url=YOUR_WEBHOOK_URL',
            example: '/api/setup-webhook?url=https://your-worker.workers.dev/webhook/telegram'
        }, 400);
    }
    
    const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            url: webhookUrl,
            secret_token: env.WEBHOOK_SECRET,
            allowed_updates: ['message', 'pre_checkout_query']
        })
    });
    
    return jsonResponse(await response.json());
}

// ═══════════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════════

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
        }
    });
}

function corsResponse() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
        }
    });
}
