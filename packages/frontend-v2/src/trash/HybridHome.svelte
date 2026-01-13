<script>
    import { createEventDispatcher } from 'svelte';
    import { fade, slide } from 'svelte/transition';
    import BreathingCircle from './BreathingCircle.svelte';
    import StateSelector from './StateSelector.svelte';
    import { api } from '../lib/api.js';
    import { haptic } from '../lib/telegram.js';
    import { breathingController, technique } from '../lib/stores/breathing.js';

    const dispatch = createEventDispatcher();
    
    let aiQuery = '';
    let isAiLoading = false;
    let aiMessage = ''; // Сообщение от AI над кругом

    // Обработчик выбора состояния (чипса)
    function handleStateSelect(event) {
        const selectedTech = event.detail; // { slug, premium, ... }
        
        // Сброс AI сообщения при ручном выборе
        aiMessage = '';
        aiQuery = '';

        // Применяем технику
        breathingController.selectTechnique(selectedTech.slug);
    }

    // Обработчик AI запроса
    async function handleAiSubmit() {
        if (!aiQuery.trim()) return;
        
        isAiLoading = true;
        haptic('medium');
        
        try {
            const res = await api.getAiRecommendation(aiQuery);
            
            // Применяем настройки от AI
            breathingController.applyCustomSettings(res.technique);
            
            // Показываем сообщение от AI
            aiMessage = res.description;
            haptic('success');
            
        } catch (e) {
            console.error(e);
        } finally {
            isAiLoading = false;
        }
    }
</script>

<div class="flex-1 flex flex-col h-full">
    
    <!-- 1. AI Input (Второй пилот) -->
    <!-- Минималистичное поле ввода -->
    <div class="px-6 pt-4 pb-2">
        <div class="relative bg-white/5 rounded-2xl border border-white/10 transition-all focus-within:border-blue-500/50 focus-within:bg-white/10">
            <input 
                type="text" 
                bind:value={aiQuery}
                on:keydown={(e) => e.key === 'Enter' && handleAiSubmit()}
                placeholder="Напиши, что чувствуешь..." 
                class="w-full bg-transparent px-4 py-3 pr-10 text-sm outline-none placeholder:text-white/30"
            />
            <button 
                on:click={handleAiSubmit}
                class="absolute right-2 top-1/2 -translate-y-1/2 text-lg opacity-50 active:scale-90 transition-transform"
            >
                {isAiLoading ? '⏳' : '✨'}
            </button>
        </div>
        {#if aiMessage}
            <p transition:slide class="text-xs text-center mt-2 text-blue-300">{aiMessage}</p>
        {/if}
    </div>

    <!-- 2. Дыхательный круг (80% внимания) -->
    <div class="flex-1 flex items-center justify-center relative min-h-[300px]">
        <BreathingCircle />
    </div>

    <!-- 3. Панель состояний (Пульт управления) -->
    <div class="pb-8 pt-4 bg-gradient-to-t from-[var(--tg-theme-bg-color)] to-transparent">
        <p class="text-xs text-center mb-3 opacity-50 uppercase tracking-widest font-bold">Выбери состояние</p>
        <StateSelector 
            on:select={handleStateSelect}
            on:paywall={(e) => dispatch('triggerPaywall', e.detail)}
        />
    </div>
</div>