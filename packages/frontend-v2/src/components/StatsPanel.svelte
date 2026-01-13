<script>
    import { createEventDispatcher } from 'svelte';
    import { 
        streak, 
        maxStreak,
        totalMinutes, 
        totalSessions,
        weeklyData 
    } from '../lib/stores/progress.js';
    
    const dispatch = createEventDispatcher();
    
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    $: chartData = days.map((day, i) => ({
        day,
        value: $weeklyData[i + 1] || 0
    }));
    
    $: maxValue = Math.max(10, ...chartData.map(d => d.value));
    
    function close() {
        dispatch('close');
    }
</script>

<div 
    class="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
    on:click={close}
>
    <div 
        class="w-full max-w-lg bg-gray-900 rounded-t-3xl p-6 animate-slide-up"
        on:click|stopPropagation
    >
        <div class="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4"></div>
        
        <h3 class="text-lg font-bold mb-6 text-center">📊 Ваш прогресс</h3>
        
        <!-- Основные метрики -->
        <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-white/5 rounded-xl p-4 text-center">
                <p class="text-3xl font-bold text-amber-400">🔥 {$streak}</p>
                <p class="text-xs opacity-60">текущая серия</p>
            </div>
            <div class="bg-white/5 rounded-xl p-4 text-center">
                <p class="text-3xl font-bold">🏆 {$maxStreak}</p>
                <p class="text-xs opacity-60">лучшая серия</p>
            </div>
            <div class="bg-white/5 rounded-xl p-4 text-center">
                <p class="text-3xl font-bold">{$totalMinutes}</p>
                <p class="text-xs opacity-60">минут всего</p>
            </div>
            <div class="bg-white/5 rounded-xl p-4 text-center">
                <p class="text-3xl font-bold">{$totalSessions}</p>
                <p class="text-xs opacity-60">сессий</p>
            </div>
        </div>
        
        <!-- Недельный график -->
        <div class="bg-white/5 rounded-xl p-4">
            <p class="text-sm font-medium mb-3">Эта неделя</p>
            <div class="flex items-end justify-between h-24 gap-2">
                {#each chartData as day, i}
                    <div class="flex-1 flex flex-col items-center gap-1">
                        <div 
                            class="w-full bg-blue-500 rounded-t transition-all"
                            style="height: {Math.max(4, (day.value / maxValue) * 80)}px"
                        ></div>
                        <span class="text-xs opacity-60">{day.day}</span>
                    </div>
                {/each}
            </div>
        </div>
        
        <button
            on:click={close}
            class="w-full mt-6 py-3 rounded-xl bg-white/10 font-medium"
        >
            Закрыть
        </button>
    </div>
</div>

<style>
    @keyframes slide-up {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
    .animate-slide-up {
        animation: slide-up 0.3s ease-out;
    }
</style>