<script>
    import { createEventDispatcher } from 'svelte';
    import { api } from '../lib/api.js';
    import { user } from '../lib/stores/user.js';
    import { progress } from '../lib/stores/progress.js';
    import { haptic } from '../lib/telegram.js';
    import { t, i18n } from "../lib/i18n";
    
    const dispatch = createEventDispatcher();
    
    let query = '';
    let loading = false;
    let result = null;
    let aiUsesToday = 0;
    
    const FREE_AI_LIMIT = 3;
    
    const quickPrompts = [
        { text: 'Не могу уснуть уже час', icon: '😴' },
        { text: 'Паника, сердце колотится', icon: '😰' },
        { text: 'Засыпаю на работе', icon: '⚡' },
        { text: 'Нужно успокоиться перед встречей', icon: '🎯' }
    ];
    
    $: canUseAI = $user.isPremium || aiUsesToday < FREE_AI_LIMIT;
    $: remainingFree = FREE_AI_LIMIT - aiUsesToday;
    
    async function askAI(text) {
        const q = text || query.trim();
        if (!q || loading) return;
        
        if (!canUseAI) {
            dispatch('purchase');
            return;
        }
        
        haptic('medium');
        loading = true;
        
        try {
            result = await api.getAiRecommendation(q);
            aiUsesToday++;
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    }
    
    function applyResult() {
        if (!result?.technique) return;
        haptic('success');
        dispatch('result', { technique: result.technique, description: result.description });
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
        class="w-full max-w-lg bg-gray-900 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up"
        on:click|stopPropagation
    >
        <div class="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4"></div>
        
        <div class="text-center mb-4">
            <span class="text-4xl">🤖</span>
            <h3 class="text-lg font-bold mt-2">AI-подбор техники</h3>
            <p class="text-xs opacity-60">Опишите своё состояние</p>
        </div>
        
        <!-- Лимит для бесплатных -->
        {#if !$user.isPremium}
            <div class="bg-white/5 rounded-lg p-2 mb-4 text-center text-xs">
                {#if remainingFree > 0}
                    Осталось бесплатных запросов: <span class="font-bold text-amber-400">{remainingFree}</span>
                {:else}
                    <span class="text-amber-400">Лимит исчерпан.</span> 
                    <button on:click={() => dispatch('purchase')} class="underline">Получить PRO</button>
                {/if}
            </div>
        {/if}
        
        <!-- Быстрые кнопки -->
        <div class="flex flex-wrap gap-2 mb-4">
            {#each quickPrompts as prompt}
                <button
                    on:click={() => askAI(prompt.text)}
                    class="px-3 py-1.5 rounded-full bg-white/10 text-sm active:scale-95"
                    disabled={!canUseAI || loading}
                >
                    {prompt.icon} {prompt.text}
                </button>
            {/each}
        </div>
        
        <!-- Ввод -->
        <div class="bg-white/5 rounded-xl p-4 mb-4">
            <textarea
                bind:value={query}
                placeholder="Или опишите своими словами..."
                class="w-full bg-transparent text-sm resize-none outline-none"
                rows="2"
            ></textarea>
            <button
                on:click={() => askAI()}
                disabled={!query.trim() || loading || !canUseAI}
                class="w-full mt-2 py-2 rounded-lg font-medium bg-blue-500 disabled:opacity-50"
            >
                {loading ? '🔄 Анализирую...' : '✨ Подобрать'}
            </button>
        </div>
        
        <!-- Результат -->
        {#if result}
            <div class="bg-white/5 rounded-xl p-4 border border-green-500/30">
                <p class="text-sm mb-3">{result.description}</p>
                
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs opacity-60">
                        {result.technique.settings.inhale}с - 
                        {result.technique.settings.holdIn || 0}с - 
                        {result.technique.settings.exhale}с - 
                        {result.technique.settings.holdOut || 0}с
                    </span>
                    <span class="text-xs opacity-60">{result.technique.rounds} раундов</span>
                </div>
                
                <button
                    on:click={applyResult}
                    class="w-full py-3 rounded-xl font-bold bg-green-500"
                >
                    ▶️ Начать практику
                </button>
            </div>
        {/if}
        
        <button
            on:click={close}
            class="w-full mt-4 py-3 rounded-xl bg-white/10 font-medium"
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