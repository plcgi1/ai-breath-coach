<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import { currentMood, breathingController } from '../lib/stores/breathing.js';
    import { haptic } from '../lib/telegram.js';
    import { FALLBACK_TECHNIQUES } from '../lib/data/fallbackTechniques.js';
    import { api } from '../lib/api.js';
    import { t } from "../lib/i18n";

    const dispatch = createEventDispatcher();
    let moods = [];

    onMount(async () => {
        try {
            const data = await api.getBaseTechniques();
            // Если данные пришли и они не пусты — используем их
            if (data && data.length > 0) {
                moods = data.map(m => ({
                    ...m,
                    // Добавляем иконку и цвет, если их нет в БД
                    icon: m.icon || '🧘',
                    color: m.color || 'from-gray-500 to-slate-600'
                }));
            } else {
                // Если API вернул пустоту — включаем заглушки
                moods = FALLBACK_TECHNIQUES;
            }
        } catch (error) {
            console.error("Ошибка загрузки, используем fallbacks:", error);
            moods = FALLBACK_TECHNIQUES;
        }
    });
    
    let longPressTimer = null;
    let isLongPress = false;
    
    function handleTouchStart(mood) {
        breathingController.setMood(mood.slug);
        isLongPress = false;
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            haptic('medium');
            dispatch('longpress', { mood });
        }, 500);
    }
    
    function handleTouchEnd() {
        clearTimeout(longPressTimer);
        if (!isLongPress) {
            haptic('light');
        }
    }
    
    function handleTouchCancel() {
        clearTimeout(longPressTimer);
    }
</script>

<div class="flex items-center justify-center gap-4 mb-8">
    {#each moods as mood}
        <button
            on:touchstart={() => handleTouchStart(mood)}
            on:touchend={handleTouchEnd}
            on:touchcancel={handleTouchCancel}
            on:mousedown={() => handleTouchStart(mood)}
            on:mouseup={handleTouchEnd}
            on:mouseleave={handleTouchCancel}
            class="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200
                {$currentMood === mood.id 
                    ? `bg-gradient-to-br ${mood.color} scale-110 shadow-lg` 
                    : 'bg-white/10 opacity-60'}"
        >
            <span class="text-3xl">{mood.icon}</span>
            <span class="text-xs font-medium">{mood.name}</span>
        </button>
    {/each}
</div>

<p class="text-center text-xs opacity-40 -mt-4 mb-4">
    Удерживайте для PRO-режимов
</p>