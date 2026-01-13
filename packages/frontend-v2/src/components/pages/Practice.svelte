<script>
    import { createEventDispatcher } from 'svelte'
    import { haptic, showPopup } from '../../lib/telegram.js'
    import { TECHNIQUES } from '../../lib/config.js'
    import { user } from '../../lib/stores/user.js'
    import { 
        technique, 
        cycles, 
        sessionMinutes,
        breathingController 
    } from '../../lib/stores/breathing.js'
    
    import TechniqueSelector from '../TechniqueSelector.svelte'
    import BreathingCircle from '../BreathingCircle.svelte'
    import StatsCard from '../StatsCard.svelte'
    
    const dispatch = createEventDispatcher()
    
    async function startQuickSession(minutes) {
        haptic('medium')
        
        const buttonId = await showPopup({
            title: `${minutes}-минутная сессия`,
            message: `Техника: ${$technique.name}\nРасслабьтесь и следуйте инструкциям.`,
            buttons: [
                { id: 'start', type: 'default', text: '▶️ Начать' },
                { id: 'cancel', type: 'cancel' }
            ]
        })
        
        if (buttonId === 'start') {
            breathingController.startQuickSession(minutes)
        }
    }
    
    function openPremium() {
        dispatch('openPremium')
    }
</script>

<div class="px-4 py-4">
    <!-- Technique Selector -->
    <TechniqueSelector on:openPremium={openPremium} />
    
    <!-- Breathing Circle -->
    <BreathingCircle />
    
    <!-- Session Stats -->
    <div class="grid grid-cols-3 gap-3 mb-4">
        <StatsCard label="Циклов" value={$cycles} />
        <StatsCard label="Минут" value={$sessionMinutes} />
        <StatsCard label="Техника" value={$technique.name} />
    </div>
    
    <!-- Technique Info -->
    <div class="stats-card rounded-xl p-3 text-center mb-4">
        <p class="text-sm text-[var(--tg-theme-hint-color)]">
            <span class="font-semibold text-[var(--tg-theme-text-color)]">{$technique.name}:</span> 
            {$technique.description}
        </p>
    </div>
    
    <!-- Quick Sessions -->
    <div class="grid grid-cols-2 gap-3">
        <button 
            on:click={() => startQuickSession(3)} 
            class="stats-card rounded-xl p-4 text-center haptic-tap active:scale-95"
        >
            <span class="text-2xl mb-1 block">⚡</span>
            <span class="text-sm font-medium">3 минуты</span>
        </button>
        <button 
            on:click={() => startQuickSession(5)} 
            class="stats-card rounded-xl p-4 text-center haptic-tap active:scale-95"
        >
            <span class="text-2xl mb-1 block">🧘</span>
            <span class="text-sm font-medium">5 минут</span>
        </button>
    </div>
    
    <!-- AI Recommendation (PRO preview) -->
    {#if !$user.isPremium}
        <div class="mt-4 stats-card rounded-xl p-4 border border-amber-500/30 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent"></div>
            <div class="relative flex items-start gap-3">
                <span class="text-2xl">🤖</span>
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <p class="font-semibold text-sm">AI-рекомендация</p>
                        <span class="premium-badge px-1.5 py-0.5 rounded text-xs">PRO</span>
                    </div>
                    <p class="text-xs text-[var(--tg-theme-hint-color)]">
                        Персональный подбор техники на основе вашего состояния и истории практик
                    </p>
                </div>
                <button on:click={openPremium} class="text-amber-400 text-sm">→</button>
            </div>
        </div>
    {/if}
</div>
