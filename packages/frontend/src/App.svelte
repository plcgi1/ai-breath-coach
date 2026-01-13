<script>
    import { fade, fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { translations } from './lib/locales.js';
    import { apiService } from './api.service.js';

    import Header from './lib/Header.svelte';
    import QuickActions from './lib/QuickActions.svelte';
    import NebulaPlayer from './lib/NebulaPlayer.svelte';
    import Stats from './lib/Stats.svelte';
    import Paywall from './lib/Paywall.svelte';

    let tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code || 'ru';
    let lang = translations[tgLang] ? tgLang : 'en';
    $: t = translations[lang];

    let activeScreen = 'main';
    let userQuery = '';
    let isLoading = false;
    let exerciseData = null;
    let exerciseDescription = null;
    const MAX_CHARS = 100;

    const setScreen = (s) => {
        if (isLoading) return;
        activeScreen = s;
        window.Telegram?.WebApp?.HapticFeedback.impactOccurred('medium');
    };

    function closeScreen() {
        if (isLoading) return;
        activeScreen = 'main';
    }

    async function handleQuickAction(slug) {
        if (isLoading) return;
        activeScreen = 'player'; // Сразу открываем, чтобы показать лоадер
        isLoading = true;
        try {
            const result = await apiService.getReadyTechnique(slug);
            exerciseData = result.technique;
            exerciseDescription = result.description || null;
            console.info('exerciseDescription', exerciseDescription)
        } catch (e) {
            closeScreen();
        } finally {
            isLoading = false;
        }
    }

    async function handleUserQuery() {
        if (isLoading || !userQuery.trim() || userQuery.length > MAX_CHARS) return;

        isLoading = true; // Это задизаблит кнопку и textarea автоматически (проверьте атрибуты в HTML)
        
        try {
            // 1. Сначала ждем ответа от ИИ
            const result = await apiService.getAiTechnique(userQuery);
            
            // 2. Только когда данные пришли, сохраняем их
            exerciseData = result.technique;
            exerciseDescription = result.description || null;

            // 3. Переключаем экран
            activeScreen = 'player';
            
            // 4. Очищаем ввод
            userQuery = '';
            
            window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
        } catch (e) {
            console.error('AI Error:', e);
            window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('error');
            // Здесь можно вывести ошибку пользователю
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="app-container">
    <Header {t} onPayClick={() => setScreen('paywall')} onStatsClick={() => setScreen('stats')} />

    <main class="scroll-area">
        <QuickActions {t} {isLoading} onSelect={handleQuickAction} />
    </main>

    <footer class="ai-input-zone">
        <div class="input-box">
            <textarea
                bind:value={userQuery}
                disabled={isLoading}
                placeholder={t.input_placeholder}
                rows="1"
            ></textarea>
            {#if userQuery.length > 0}
                <span class="badge" class:err={userQuery.length > MAX_CHARS}>
                    {userQuery.length}/{MAX_CHARS}
                </span>
            {/if}
        </div>
        <button
            class="round-send"
            disabled={isLoading || !userQuery.trim()}
            on:click={handleUserQuery}
        >
            {#if isLoading}<div class="spinner"></div>{:else}➔{/if}
        </button>
    </footer>

    {#if activeScreen !== 'main'}
        <div class="overlay" transition:fade on:click={closeScreen}></div>
        <div class="bottom-sheet" transition:fly={{ y: 600, duration: 400, easing: cubicOut }}>
            <div class="drag-handle"></div>
            <button class="close-x" on:click={closeScreen}>✕</button>

            <div class="sheet-content">
                {#if activeScreen === 'player'}
                    <NebulaPlayer
                        {t}
                        {isLoading}
                        settings={exerciseData?.settings}
                        description={exerciseDescription}
                        rounds={4}
                        onFinish={closeScreen}
                    />
                {:else if activeScreen === 'stats'}
                    <Stats {t} {isLoading} />
                {:else if activeScreen === 'paywall'}
                    <Paywall {t} {isLoading} />
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .app-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background: var(--tg-bg);
    }
    .scroll-area {
        flex: 1;
        overflow-y: auto;
    }

    .ai-input-zone {
        padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
        background: white;
        border-radius: 24px 24px 0 0;
        display: flex;
        gap: 12px;
        align-items: flex-end;
        box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.05);
    }

    .input-box {
        flex: 1;
        background: #f0f0f5;
        border-radius: 18px;
        padding: 12px 16px;
        position: relative;
    }
    textarea {
        width: 100%;
        border: none;
        background: transparent;
        font-size: 16px;
        outline: none;
        resize: none;
    }
    .badge {
        position: absolute;
        top: -20px;
        right: 8px;
        font-size: 11px;
        color: var(--tg-hint);
    }
    .err {
        color: #ff3b30;
        font-weight: bold;
    }

    .round-send {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        background: var(--tg-link);
        color: white;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .bottom-sheet {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 85vh;
        background: white;
        border-radius: 32px 32px 0 0;
        z-index: 100;
    }
    .drag-handle {
        width: 40px;
        height: 4px;
        background: #e5e5ea;
        border-radius: 2px;
        margin: 12px auto;
    }
    .close-x {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: #f2f2f7;
        color: #8e8e93;
    }
    .sheet-content {
        height: 100%;
        overflow-y: auto;
        padding: 0 20px 40px;
    }
    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 90;
    }
</style>
