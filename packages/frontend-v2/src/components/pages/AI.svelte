<script>
    import { createEventDispatcher } from 'svelte';
    import api from '../../lib/api.js';
    import { haptic } from '../../lib/telegram.js';
    import { breathingController } from '../../lib/stores/breathing.js';
    
    const dispatch = createEventDispatcher();
    
    let query = '';
    let loading = false;
    let result = null;
    let history = [];
    
    const quickButtons = [
        { text: '😴 Не могу уснуть', query: 'Не могу уснуть' },
        { text: '😰 Паника', query: 'Паническая атака' },
        { text: '⚡ Энергия', query: 'Нужна энергия' },
        { text: '🎯 Фокус', query: 'Сфокусироваться' },
        { text: '😌 Стресс', query: 'Снять стресс' }
    ];
    
    async function submitQuery(q) {
        const searchQuery = q || query.trim();
        if (!searchQuery) return;
        
        haptic('medium');
        loading = true;
        result = null;
        
        try {
            const data = await api.getAiRecommendation(searchQuery);
            result = data;
            
            // Добавляем в историю
            history = [{ query: searchQuery, result: data, time: new Date() }, ...history.slice(0, 4)];
            
            haptic('success');
        } catch (error) {
            console.error('AI Error:', error);
            haptic('error');
        } finally {
            loading = false;
        }
    }
    
    function startPractice() {
        if (!result) return;
        
        haptic('medium');
        
        // Применяем технику
        const settings = result.technique.settings;
        document.documentElement.style.setProperty('--inhale-duration', `${settings.inhale}s`);
        document.documentElement.style.setProperty('--hold-in-duration', `${settings.holdIn || 0}s`);
        document.documentElement.style.setProperty('--exhale-duration', `${settings.exhale}s`);
        document.documentElement.style.setProperty('--hold-out-duration', `${settings.holdOut || 0}s`);
        
        dispatch('startPractice', result);
    }
</script>

<div class="px-4 py-4">
    <!-- Header -->
    <div class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 mb-6 text-center">
        <span class="text-4xl mb-2 block">🤖</span>
        <h2 class="text-xl font-bold mb-1">AI-подбор техники</h2>
        <p class="text-sm opacity-90">Опишите состояние — ИИ подберёт практику</p>
    </div>
    
    <!-- Quick Buttons -->
    <div class="flex flex-wrap gap-2 mb-4">
        {#each quickButtons as btn}
            <button
                on:click={() => submitQuery(btn.query)}
                class="px-3 py-2 rounded-full text-sm haptic-tap transition-all
                    {btn.query.includes('сон') ? 'bg-indigo-500/30' : ''}
                    {btn.query.includes('аник') ? 'bg-red-500/30' : ''}
                    {btn.query.includes('нерг') ? 'bg-orange-500/30' : ''}
                    {btn.query.includes('окус') ? 'bg-blue-500/30' : ''}
                    {btn.query.includes('тресс') ? 'bg-green-500/30' : ''}"
                disabled={loading}
            >
                {btn.text}
            </button>
        {/each}
    </div>
    
    <!-- Input -->
    <div class="stats-card rounded-xl p-4 mb-4">
        <textarea
            bind:value={query}
            placeholder="Опишите как вы себя чувствуете..."
            class="w-full bg-transparent text-sm resize-none outline-none"
            rows="3"
            disabled={loading}
        ></textarea>
        <button
            on:click={() => submitQuery()}
            class="w-full mt-3 py-2 rounded-lg font-medium haptic-tap bg-[var(--tg-theme-button-color)]"
            disabled={loading || !query.trim()}
        >
            {loading ? '🔄 Анализирую...' : '✨ Подобрать технику'}
        </button>
    </div>
    
    <!-- Result -->
    {#if result}
        <div class="stats-card rounded-xl p-4 mb-4">
            <div class="flex items-start gap-3 mb-3">
                <span class="text-2xl">🤖</span>
                <p class="text-sm text-[var(--tg-theme-hint-color)]">{result.description}</p>
            </div>
            
            <div class="bg-white/5 rounded-xl p-4 mb-3">
                <div class="flex items-center gap-3 mb-2">
                    <span class="text-3xl">🧘</span>
                    <div>
                        <h4 class="font-bold">Персональная техника</h4>
                        <p class="text-xs text-[var(--tg-theme-hint-color)]">
                            Вдох {result.technique.settings.inhale}с
                            {#if result.technique.settings.holdIn}→ Задержка {result.technique.settings.holdIn}с{/if}
                            → Выдох {result.technique.settings.exhale}с
                            {#if result.technique.settings.holdOut}→ Пауза {result.technique.settings.holdOut}с{/if}
                        </p>
                    </div>
                </div>
                <span class="text-xs px-2 py-1 rounded-full bg-blue-500/20">
                    {result.technique.rounds} раундов
                </span>
            </div>
            
            <button
                on:click={startPractice}
                class="w-full py-3 rounded-xl font-medium haptic-tap bg-[var(--tg-theme-button-color)]"
            >
                ▶️ Начать практику
            </button>
        </div>
    {/if}
    
    <!-- History -->
    {#if history.length > 0}
        <div class="mt-6">
            <h3 class="text-sm font-semibold mb-3 text-[var(--tg-theme-hint-color)]">📜 ИСТОРИЯ</h3>
            <div class="space-y-2">
                {#each history as item}
                    <button
                        on:click={() => { result = item.result; }}
                        class="w-full stats-card rounded-lg p-3 text-left haptic-tap"
                    >
                        <p class="text-sm font-medium truncate">"{item.query}"</p>
                        <p class="text-xs text-[var(--tg-theme-hint-color)]">
                            {item.time.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>