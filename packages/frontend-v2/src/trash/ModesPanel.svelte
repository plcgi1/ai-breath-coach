<script>
    import { createEventDispatcher } from 'svelte';
    import { user } from '../lib/stores/user.js';
    import { haptic } from '../lib/telegram.js';
    import { t, i18n } from "../lib/i18n.js";
    
    export let mood = 'stress';
    
    const dispatch = createEventDispatcher();
    
    const modesByMood = {
        sleep: [
            { id: 'basic', name: '4-7-8 Базовый', icon: '😴', premium: false, pattern: '4-7-8' },
            { id: 'deep', name: 'Глубокий сон', icon: '🌙', premium: true, price: 99, pattern: '4-8-10' },
            { id: 'course', name: 'Курс "Сон 7 дней"', icon: '📚', premium: true, price: 149, pattern: 'Программа' }
        ],
        stress: [
            { id: 'basic', name: '4-7-8 Базовый', icon: '😌', premium: false, pattern: '4-7-8' },
            { id: 'panic', name: 'Антипаника 911', icon: '🆘', premium: true, price: 99, pattern: '2-0-8' },
            { id: 'coherent', name: 'Когерентное', icon: '💓', premium: true, price: 99, pattern: '6-0-6' }
        ],
        energy: [
            { id: 'basic', name: 'Быстрая энергия', icon: '⚡', premium: false, pattern: '2-0-2' },
            { id: 'wim', name: 'Метод Вим Хофа', icon: '❄️', premium: true, price: 149, pattern: '30 вдохов' },
            { id: 'fire', name: 'Огненное дыхание', icon: '🔥', premium: true, price: 99, pattern: 'Капалабхати' }
        ]
    };
    
    $: modes = modesByMood[mood] || modesByMood.stress;
    
    function selectMode(mode) {
        haptic('light');
        
        if (mode.premium && !$user.isPremium) {
            dispatch('purchase');
            return;
        }
        
        dispatch('select', { mode });
    }
    
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
        
        <h3 class="text-lg font-bold mb-4 text-center">
            Выберите режим
        </h3>
        
        <div class="space-y-3">
            {#each modes as mode}
                <button
                    on:click={() => selectMode(mode)}
                    class="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 active:scale-[0.98] transition-transform"
                >
                    <span class="text-3xl">{mode.icon}</span>
                    <div class="flex-1 text-left">
                        <p class="font-semibold">{mode.name}</p>
                        <p class="text-xs opacity-60">{mode.pattern}</p>
                    </div>
                    {#if mode.premium && !$user.isPremium}
                        <span class="px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold">
                            {mode.price} ⭐
                        </span>
                    {:else if mode.premium}
                        <span class="text-green-400">✓</span>
                    {:else}
                        <span class="text-xs opacity-60">FREE</span>
                    {/if}
                </button>
            {/each}
        </div>
        
        <button
            on:click={close}
            class="w-full mt-4 py-3 rounded-xl bg-white/10 font-medium"
        >
            Отмена
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