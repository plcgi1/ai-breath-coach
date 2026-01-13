<!-- 
Загружаем список техник:
  бесплатные
  оплаченные

Политики
    Тарифы
    
  Для бесплатных - 1 раз в день
  Для оплаченных - неограниченно в течении подписки
  Если оплачен
-->
<script>
    import { onMount } from 'svelte';
    import { initTelegram, applyTgTheme, haptic } from './lib/telegram.js';
    import { user } from './lib/stores/user.js';
    import { progress, streak, totalMinutes, totalSessions } from './lib/stores/progress.js';
    import { currentMood, isBreathing, breathingController } from './lib/stores/breathing.js';
    import { appStatus } from './lib/stores/appState.js';
    import { limitReached, canStartSession } from './lib/stores/limits.js';
    import { baseTechniques, loadBaseTechniques } from './lib/stores/techniques.js';
    import MoodSelector from './components/MoodSelector.svelte';
    import BreathingCircle from './components/BreathingCircle.svelte';
    import ModesPanel from './components/ModesPanel.svelte';
    import AIPanel from './components/AIPanel.svelte';
    import StatsPanel from './components/StatsPanel.svelte';
    import PurchasePanel from './components/PurchasePanel.svelte';
    import { t } from "./lib/i18n";

    // Панели
    let showModes = false;
    let showAI = true;
    let showStats = false;
    let showPurchase = false;
    let selectedMoodForModes = null;
    
    // Свайп вверх для AI
    let touchStartY = 0;
    
    function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
    }
    
    function handleTouchEnd(e) {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;
        
        // Свайп вверх > 100px
        if (diff > 100 && !$isBreathing) {
            haptic('light');
            showAI = true;
        }
    }
    
    function handleLongPress(event) {
        selectedMoodForModes = event.detail.mood;
        showModes = true;
    }
    
    function handleSelectMode(event) {
        const { mode } = event.detail;
        showModes = false;
        
        // Применяем выбранный режим
        breathingController.setMode($currentMood, mode.id);
        
        setTimeout(() => {
            breathingController.start();
        }, 300);
    }
    
    function handleAIResult(event) {
        const { technique } = event.detail;
        showAI = false;
        
        // Применяем AI технику
        breathingController.setCustomTechnique(technique);
        
        setTimeout(() => {
            breathingController.start();
        }, 300);
    }
    
    function openStats() {
        haptic('light');
        showStats = true;
    }
    
    function openPurchase() {
        haptic('light');
        showPurchase = true;
    }
    
    onMount(async () => {
        initTelegram();
        applyTgTheme();
        user.setFromTelegram();
        progress.load();
        
        // Загружаем все техники с сервера
        await loadBaseTechniques();
    });
</script>

<div 
    class="min-h-screen flex flex-col"
    on:touchstart={handleTouchStart}
    on:touchend={handleTouchEnd}
>
    <!-- Header с кнопками -->
    <header class="flex items-center justify-between px-4 py-3">
        <button 
            on:click={openStats}
            class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg active:scale-95"
        >
            📊
        </button>
        
        {#if $appStatus.isOffline}
            <div class="offline-indicator">
                <span>⚠️</span>
                <span>{@html $t("homepage.offlineMode")}</span>
            </div>
        {/if}

        <button 
            on:click={openPurchase}
            class="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-bold flex items-center gap-1 active:scale-95"
        >
            👑 PRO
        </button>
    </header>
    
    <!-- Основной контент -->
    <main class="flex-1 flex flex-col items-center justify-center px-4">
        <!-- 3 кнопки состояния -->
        <MoodSelector on:longpress={handleLongPress} />
        
        <!-- Круг дыхания -->
        <BreathingCircle />
        
        <!-- Мини-статистика -->
        <div class="flex items-center justify-center gap-8 mt-8">
            <div class="text-center">
                <p class="text-2xl font-bold">🔥 {$streak}</p>
                <p class="text-xs opacity-60">
                    {@html $t("homepage.statDays")}
                </p>
            </div>
            <div class="text-center">
                <p class="text-2xl font-bold">⏱️ {$totalMinutes}</p>
                <p class="text-xs opacity-60">
                    {@html $t("homepage.minites")}
                </p>
            </div>
            <div class="text-center">
                <p class="text-2xl font-bold">✓ {$totalSessions}</p>
                <p class="text-xs opacity-60">
                    {@html $t("homepage.sessions")}
                </p>
            </div>
        </div>
    </main>
    
    <!-- Подсказка свайпа -->
    {#if !$isBreathing}
        <div class="text-center pb-8 opacity-40">
            <p class="text-xs">↑ {@html $t("homepage.swipeup")} ↑</p>
        </div>
    {/if}
    
    <!-- Панели -->
    {#if showModes}
        <ModesPanel 
            mood={selectedMoodForModes}
            on:close={() => showModes = false}
            on:select={handleSelectMode}
            on:purchase={openPurchase}
        />
    {/if}
    
    {#if showAI}
        <AIPanel 
            on:close={() => showAI = false}
            on:result={handleAIResult}
            on:purchase={openPurchase}
        />
    {/if}
    
    {#if showStats}
        <StatsPanel on:close={() => showStats = false} />
    {/if}
    
    {#if showPurchase}
        <PurchasePanel on:close={() => showPurchase = false} />
    {/if}
</div>

<style>
    :global(body) {
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
        color: white;
        font-family: 'Nunito', -apple-system, sans-serif;
        min-height: 100vh;
        overflow-x: hidden;
        user-select: none;
        -webkit-user-select: none;
    }

    .offline-indicator {
        position: fixed;
        /* Размещаем сверху */
        top: 1rem; 
        /* Центрируем по горизонтали */
        left: 50%;
        transform: translateX(-50%);
        
        /* Гарантируем, что иконка будет поверх других элементов */
        z-index: 100;
        
        /* Оформление */
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem;
        background-color: rgba(245, 158, 11, 0.2); /* amber-500 с прозрачностью */
        color: #f59e0b; /* amber-500 */
        border: 1px solid rgba(245, 158, 11, 0.3);
        border-radius: 9999px;
        font-size: 10px;
        white-space: nowrap;
        
        /* Плавное появление */
        animation: fade-in 0.3s ease-out;
    }

    @keyframes fade-in {
        from { opacity: 0; transform: translate(-50%, -10px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
</style>