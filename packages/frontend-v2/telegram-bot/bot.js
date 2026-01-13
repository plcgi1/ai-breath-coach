/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  BREATHFLOW TELEGRAM BOT                                         ║
 * ║  Напоминания, онбординг, поддержка                               ║
 * ║                                                                  ║
 * ║  Можно запустить отдельно или интегрировать в Worker            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-app.pages.dev';
const API_URL = process.env.API_URL || 'https://your-worker.workers.dev';

// ═══════════════════════════════════════════════════════════════════
// TELEGRAM API HELPERS
// ═══════════════════════════════════════════════════════════════════

async function sendMessage(chatId, text, options = {}) {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'Markdown',
            ...options
        })
    });
    return response.json();
}

async function sendPhoto(chatId, photoUrl, caption, options = {}) {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            photo: photoUrl,
            caption,
            parse_mode: 'Markdown',
            ...options
        })
    });
    return response.json();
}

async function answerCallbackQuery(callbackQueryId, text = '') {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            callback_query_id: callbackQueryId,
            text
        })
    });
}

// ═══════════════════════════════════════════════════════════════════
// КОМАНДЫ БОТА
// ═══════════════════════════════════════════════════════════════════

const COMMANDS = {
    /**
     * /start — Приветствие и онбординг
     */
    async start(msg, args) {
        const userId = msg.from.id;
        const firstName = msg.from.first_name;
        
        // Проверяем реферальную ссылку
        const refId = args[0]?.replace('ref_', '');
        if (refId && refId !== String(userId)) {
            // Сохраняем реферала (через API)
            await fetch(`${API_URL}/api/referral`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, referrer_id: refId })
            });
        }
        
        await sendMessage(userId, 
            `👋 Привет, *${firstName}*!\n\n` +
            `🧘 *BreathFlow* — твой карманный инструмент для:\n\n` +
            `😌 Снятия тревоги за 3 минуты\n` +
            `😴 Быстрого засыпания\n` +
            `⚡ Заряда энергии без кофе\n` +
            `🎯 Улучшения концентрации\n\n` +
            `Научно доказанные техники дыхания, которые используют в Google, Apple и спецназе.\n\n` +
            `👇 *Нажми кнопку, чтобы начать:*`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🧘 Открыть BreathFlow', web_app: { url: WEBAPP_URL } }],
                        [{ text: '❓ Как это работает?', callback_data: 'how_it_works' }],
                        [{ text: '🎁 Пригласить друга', callback_data: 'referral' }]
                    ]
                }
            }
        );
    },
    
    /**
     * /breathe — Быстрая практика прямо в чате
     */
    async breathe(msg) {
        const userId = msg.from.id;
        
        await sendMessage(userId,
            `🧘 *Быстрая практика 4-7-8*\n\n` +
            `Следуйте инструкциям:\n\n` +
            `1️⃣ Выдохните полностью\n` +
            `2️⃣ Вдохните через нос — *4 секунды*\n` +
            `3️⃣ Задержите дыхание — *7 секунд*\n` +
            `4️⃣ Выдохните через рот — *8 секунд*\n\n` +
            `Повторите 4 раза.\n\n` +
            `_Для полноценной практики с таймером откройте приложение:_`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🧘 Открыть с таймером', web_app: { url: WEBAPP_URL } }]
                    ]
                }
            }
        );
    },
    
    /**
     * /remind — Настройка напоминаний
     */
    async remind(msg) {
        const userId = msg.from.id;
        
        await sendMessage(userId,
            `⏰ *Настройка напоминаний*\n\n` +
            `Выберите время для ежедневной практики:`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '🌅 07:00', callback_data: 'remind_07:00' },
                            { text: '☀️ 09:00', callback_data: 'remind_09:00' },
                            { text: '🌤 12:00', callback_data: 'remind_12:00' }
                        ],
                        [
                            { text: '🌇 18:00', callback_data: 'remind_18:00' },
                            { text: '🌙 21:00', callback_data: 'remind_21:00' },
                            { text: '😴 23:00', callback_data: 'remind_23:00' }
                        ],
                        [
                            { text: '🚫 Отключить', callback_data: 'remind_off' }
                        ]
                    ]
                }
            }
        );
    },
    
    /**
     * /stats — Статистика пользователя
     */
    async stats(msg) {
        const userId = msg.from.id;
        
        // Получаем статистику через API
        try {
            const response = await fetch(`${API_URL}/api/payments/status/${userId}`);
            const data = await response.json();
            
            const isPro = data.isLifetime || data.purchases?.length > 0;
            
            await sendMessage(userId,
                `📊 *Ваша статистика*\n\n` +
                `👤 ID: \`${userId}\`\n` +
                `👑 Статус: ${isPro ? 'PRO ✨' : 'Free'}\n` +
                `💰 Потрачено: ${data.totalSpent || 0} ⭐\n` +
                `📦 Покупок: ${data.purchases?.length || 0}\n\n` +
                `_Подробная статистика практик — в приложении_`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '📊 Открыть статистику', web_app: { url: WEBAPP_URL + '?page=stats' } }]
                        ]
                    }
                }
            );
        } catch (e) {
            await sendMessage(userId, '❌ Не удалось загрузить статистику. Попробуйте позже.');
        }
    },
    
    /**
     * /help — Помощь
     */
    async help(msg) {
        const userId = msg.from.id;
        
        await sendMessage(userId,
            `❓ *Помощь по BreathFlow*\n\n` +
            `*Команды:*\n` +
            `/start — Главное меню\n` +
            `/breathe — Быстрая практика\n` +
            `/remind — Настроить напоминания\n` +
            `/stats — Ваша статистика\n` +
            `/help — Эта справка\n\n` +
            `*Техники дыхания:*\n` +
            `• *4-7-8* — снятие тревоги\n` +
            `• *Квадрат* — концентрация\n` +
            `• *Вим Хоф* — энергия (PRO)\n` +
            `• *Антипаника* — при панике (PRO)\n\n` +
            `*Вопросы?*\n` +
            `Напишите нам: @breathflow_support`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🧘 Открыть приложение', web_app: { url: WEBAPP_URL } }]
                    ]
                }
            }
        );
    }
};

// ═══════════════════════════════════════════════════════════════════
// CALLBACK HANDLERS
// ═══════════════════════════════════════════════════════════════════

const CALLBACKS = {
    /**
     * Как это работает
     */
    async how_it_works(query) {
        const userId = query.from.id;
        
        await answerCallbackQuery(query.id);
        
        await sendMessage(userId,
            `🧠 *Как работает дыхание?*\n\n` +
            `Когда вы делаете *длинный выдох*, активируется парасимпатическая нервная система — режим "отдых и восстановление".\n\n` +
            `*Научные факты:*\n` +
            `• 5 минут = снижение кортизола на 25%\n` +
            `• Пульс замедляется на 10-20 ударов\n` +
            `• Давление снижается\n` +
            `• Уходит мышечное напряжение\n\n` +
            `*Исследования:*\n` +
            `Stanford, Harvard, HeartMath Institute\n\n` +
            `_Попробуйте сами — эффект за 3 минуты!_`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🧘 Попробовать', web_app: { url: WEBAPP_URL } }],
                        [{ text: '« Назад', callback_data: 'back_to_start' }]
                    ]
                }
            }
        );
    },
    
    /**
     * Реферальная программа
     */
    async referral(query) {
        const userId = query.from.id;
        const refLink = `https://t.me/breathflow_bot?start=ref_${userId}`;
        
        await answerCallbackQuery(query.id);
        
        await sendMessage(userId,
            `🎁 *Пригласи друга*\n\n` +
            `Поделись ссылкой и получи:\n` +
            `• 🆓 7 дней PRO бесплатно\n` +
            `• 💫 +50 ⭐ за каждую покупку друга\n\n` +
            `*Твоя ссылка:*\n` +
            `\`${refLink}\`\n\n` +
            `_Нажми на ссылку, чтобы скопировать_`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📤 Поделиться', switch_inline_query: `Попробуй BreathFlow — дыхание против тревоги! 🧘 ${refLink}` }],
                        [{ text: '« Назад', callback_data: 'back_to_start' }]
                    ]
                }
            }
        );
    },
    
    /**
     * Установка напоминания
     */
    async remind(query, time) {
        const userId = query.from.id;
        
        if (time === 'off') {
            await fetch(`${API_URL}/api/reminders/set`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, enabled: false })
            });
            
            await answerCallbackQuery(query.id, '🔕 Напоминания отключены');
            await sendMessage(userId, `🔕 Напоминания *отключены*.\n\nВключить снова: /remind`);
        } else {
            await fetch(`${API_URL}/api/reminders/set`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, time, enabled: true })
            });
            
            await answerCallbackQuery(query.id, `✅ Напоминание в ${time}`);
            await sendMessage(userId, 
                `✅ Отлично! Буду напоминать каждый день в *${time}*\n\n` +
                `🔔 Не забудьте включить уведомления от бота!\n\n` +
                `Изменить время: /remind`
            );
        }
    },
    
    /**
     * Назад к старту
     */
    async back_to_start(query) {
        await answerCallbackQuery(query.id);
        await COMMANDS.start({ from: query.from }, []);
    }
};

// ═══════════════════════════════════════════════════════════════════
// ШАБЛОНЫ НАПОМИНАНИЙ
// ═══════════════════════════════════════════════════════════════════

const REMINDER_TEMPLATES = {
    morning: [
        '🌅 Доброе утро! Начни день с 3 минут осознанного дыхания.',
        '☀️ Новый день — новые возможности! Зарядись энергией через дыхание.',
        '🧘 Утренняя практика ждёт. Всего 5 минут — и день пойдёт лучше!',
        '⚡ Кофе подождёт! Попробуй энергетическое дыхание.'
    ],
    afternoon: [
        '🌤 Середина дня — время перезагрузки! 3 минуты дыхания = новые силы.',
        '😤 Стресс накапливается? Выдохни его прямо сейчас.',
        '🎯 Нужен фокус? Квадратное дыхание за 4 минуты.'
    ],
    evening: [
        '🌇 Вечер — время отпустить напряжение дня.',
        '😌 Подготовь тело ко сну: 5 минут расслабляющего дыхания.',
        '🌙 Техника 4-7-8 поможет заснуть быстрее. Попробуй!'
    ],
    streak: [
        '🔥 Не сбрось свою серию! Практика ждёт.',
        '💪 Уже {streak} дней подряд! Продолжай!',
        '🏆 Ты близко к достижению! Осталось {days} дней.'
    ]
};

/**
 * Получить случайное напоминание по времени суток
 */
function getRandomReminder(hour) {
    let templates;
    if (hour >= 5 && hour < 12) {
        templates = REMINDER_TEMPLATES.morning;
    } else if (hour >= 12 && hour < 18) {
        templates = REMINDER_TEMPLATES.afternoon;
    } else {
        templates = REMINDER_TEMPLATES.evening;
    }
    return templates[Math.floor(Math.random() * templates.length)];
}

// ═══════════════════════════════════════════════════════════════════
// WEBHOOK HANDLER
// ═══════════════════════════════════════════════════════════════════

/**
 * Обработка входящего update от Telegram
 */
async function handleUpdate(update) {
    // Команды
    if (update.message?.text?.startsWith('/')) {
        const [command, ...args] = update.message.text.slice(1).split(' ');
        const handler = COMMANDS[command.toLowerCase()];
        
        if (handler) {
            await handler(update.message, args);
        } else {
            await sendMessage(update.message.from.id, 
                `❓ Неизвестная команда.\n\nИспользуйте /help для списка команд.`
            );
        }
        return;
    }
    
    // Callback кнопки
    if (update.callback_query) {
        const data = update.callback_query.data;
        
        // Напоминания
        if (data.startsWith('remind_')) {
            const time = data.replace('remind_', '');
            await CALLBACKS.remind(update.callback_query, time);
            return;
        }
        
        // Другие callbacks
        const handler = CALLBACKS[data];
        if (handler) {
            await handler(update.callback_query);
        }
        return;
    }
    
    // Обычное сообщение — подсказка
    if (update.message?.text) {
        await sendMessage(update.message.from.id,
            `🧘 Откройте приложение для практики:\n\n/start — главное меню\n/help — помощь`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🧘 Открыть BreathFlow', web_app: { url: WEBAPP_URL } }]
                    ]
                }
            }
        );
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPRESS SERVER (для локальной разработки)
// ═══════════════════════════════════════════════════════════════════

if (typeof require !== 'undefined') {
    const express = require('express');
    const app = express();
    app.use(express.json());
    
    app.post('/webhook', async (req, res) => {
        try {
            await handleUpdate(req.body);
            res.json({ ok: true });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: e.message });
        }
    });
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🤖 Bot server running on port ${PORT}`);
        console.log(`📡 Set webhook: https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=YOUR_URL/webhook`);
    });
}

// Экспорт для Cloudflare Workers
module.exports = { handleUpdate, sendMessage, getRandomReminder };
