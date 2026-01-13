import { writable, derived, get } from 'svelte/store';
import { user } from './user.js';

// Стор для управления лимитами
function createLimitsStore() {
    const { subscribe, set, update } = writable({
        dailySessions: 0,           // количество сессий сегодня
        maxDailySessions: 1,        // максимальное количество сессий в день (для free)
        lastSessionDate: null,      // дата последней сессии
        limitReached: false,        // достигнут ли лимит
        sessionHistory: []          // история сессий
    });

    return {
        subscribe,

        // Обновить информацию о лимитах из серверного ответа
        updateFromServer(layoutAndLimits) {
            update(limits => ({
                ...limits,
                dailySessions: layoutAndLimits.dailySessions || limits.dailySessions,
                maxDailySessions: layoutAndLimits.maxDailySessions || limits.maxDailySessions,
                lastSessionDate: layoutAndLimits.lastSessionDate || limits.lastSessionDate,
                limitReached: layoutAndLimits.limitReached || false,
                sessionHistory: layoutAndLimits.sessionHistory || limits.sessionHistory
            }));
        },

        // Начать новую сессию
        async startSession() {
            const now = new Date();
            const today = now.toDateString();
            const $user = get(user);
            
            update(limits => {
                // Проверяем, был ли уже сеанс сегодня
                const wasToday = limits.lastSessionDate && 
                               new Date(limits.lastSessionDate).toDateString() === today;

                let newDailySessions = limits.dailySessions;
                let newLastSessionDate = limits.lastSessionDate;

                if (!wasToday) {
                    // Новый день, сбрасываем счетчик
                    newDailySessions = 1;
                    newLastSessionDate = now.toISOString();
                } else {
                    // Сегодня уже была сессия
                    newDailySessions = limits.dailySessions + 1;
                    newLastSessionDate = now.toISOString();
                }

                // Проверяем лимит
                let newLimitReached = false;
                if (!$user.isPremium) {
                    // Для free пользователей лимит 1 сессия в день на всё
                    newLimitReached = newDailySessions > 1;
                } else {
                    // Для премиум пользователей нет суточного лимита
                    newLimitReached = false;
                }

                // Добавляем запись в историю
                const newSessionHistory = [
                    ...limits.sessionHistory.slice(-29), // сохраняем последние 30 сессий
                    {
                        date: now.toISOString(),
                        techniqueUsed: null // будет обновлено при завершении
                    }
                ];

                return {
                    ...limits,
                    dailySessions: newDailySessions,
                    lastSessionDate: newLastSessionDate,
                    limitReached: newLimitReached,
                    sessionHistory: newSessionHistory
                };
            });

            // Возвращаем true, если сессия разрешена
            return !get(this).limitReached;
        },

        // Завершить сессию
        completeSession(techniqueId = null) {
            update(limits => {
                const lastSession = limits.sessionHistory[limits.sessionHistory.length - 1];
                if (lastSession && !lastSession.techniqueUsed) {
                    // Обновляем последнюю сессию с информацией о технике
                    const updatedHistory = [...limits.sessionHistory];
                    updatedHistory[updatedHistory.length - 1] = {
                        ...lastSession,
                        techniqueUsed: techniqueId,
                        completed: true
                    };

                    return {
                        ...limits,
                        sessionHistory: updatedHistory
                    };
                }
                return limits;
            });
        },

        // Сбросить суточные лимиты (вызывается при смене дня)
        resetDailyLimits() {
            const now = new Date();
            const today = now.toDateString();

            update(limits => {
                const wasYesterday = limits.lastSessionDate && 
                                   new Date(limits.lastSessionDate).toDateString() !== today;

                if (wasYesterday || !limits.lastSessionDate) {
                    // Новый день, сбрасываем суточные лимиты
                    return {
                        ...limits,
                        dailySessions: 0,
                        limitReached: false,
                        lastSessionDate: now.toISOString()
                    };
                }
                return limits;
            });
        }
    };
}

export const limits = createLimitsStore();

// Производные сторы
export const dailySessions = derived(limits, $limits => $limits.dailySessions);
export const maxDailySessions = derived(limits, $limits => $limits.maxDailySessions);
export const limitReached = derived(
    [limits, user], 
    ([$limits, $user]) => {
        if ($user.isPremium) return false;
        return $limits.limitReached;
    }
);

// Проверка, может ли пользователь начать новую сессию
export const canStartSession = derived(
    [limits, user],
    ([$limits, $user]) => {
        if ($user.isPremium) return true;
        return !$limits.limitReached;
    }
);