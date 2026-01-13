<script>
    import { createEventDispatcher } from 'svelte'
    import { PROGRAMS } from '../../lib/config.js'
    import { haptic, share } from '../../lib/telegram.js'
    import { CONFIG } from '../../lib/config.js'
    import { user } from '../../lib/stores/user.js'
    import { breathingController } from '../../lib/stores/breathing.js'
    
    const dispatch = createEventDispatcher()
    
    const freePrograms = Object.values(PROGRAMS).filter(p => !p.premium)
    const premiumPrograms = Object.values(PROGRAMS).filter(p => p.premium)
    
    function startProgram(program) {
        haptic('medium')
        
        if (program.premium && !$user.isPremium) {
            dispatch('openPremium')
            return
        }
        
        breathingController.selectTechnique(program.technique, $user.isPremium)
        breathingController.startQuickSession(program.minutes)
    }
    
    function inviteFriend() {
        haptic('light')
        
        const refLink = `https://t.me/${CONFIG.BOT_USERNAME}/app?startapp=ref_${$user.id}`
        const shareText = '🧘 Попробуй BreathFlow — приложение для дыхательных практик!\n\nПомогает расслабиться, сфокусироваться и лучше спать.'
        
        share(refLink, shareText)
    }
    
    function openPremium() {
        dispatch('openPremium')
    }
</script>

<div class="px-4 py-4">
    <!-- Free Programs -->
    <div class="mb-6">
        <h3 class="text-sm font-semibold mb-3 text-[var(--tg-theme-hint-color)]">БЕСПЛАТНЫЕ</h3>
        <div class="space-y-3">
            {#each freePrograms as program}
                <button 
                    on:click={() => startProgram(program)}
                    class="w-full stats-card rounded-xl p-4 flex items-center gap-3 haptic-tap active:scale-[0.99] text-left"
                >
                    <div class="text-3xl">{program.icon}</div>
                    <div class="flex-1">
                        <h4 class="font-semibold">{program.name}</h4>
                        <p class="text-xs text-[var(--tg-theme-hint-color)]">{program.minutes} мин • {program.description}</p>
                    </div>
                    <span class="text-lg">→</span>
                </button>
            {/each}
        </div>
    </div>
    
    <!-- Premium Programs -->
    <div class="mb-6">
        <div class="flex items-center gap-2 mb-3">
            <h3 class="text-sm font-semibold text-[var(--tg-theme-hint-color)]">ПРЕМИУМ</h3>
            <span class="premium-badge px-2 py-0.5 rounded text-xs font-bold">PRO</span>
        </div>
        <div class="space-y-3">
            {#each premiumPrograms as program}
                <button 
                    on:click={() => startProgram(program)}
                    class="w-full stats-card rounded-xl p-4 flex items-center gap-3 opacity-90 relative overflow-hidden haptic-tap text-left"
                >
                    <div class="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent"></div>
                    <div class="text-3xl relative">{program.icon}</div>
                    <div class="flex-1 relative">
                        <h4 class="font-semibold">{program.name}</h4>
                        <p class="text-xs text-[var(--tg-theme-hint-color)]">{program.description}</p>
                    </div>
                    {#if $user.isPremium}
                        <span class="text-lg relative">→</span>
                    {:else}
                        <span class="premium-badge px-2 py-1 rounded text-xs relative">🔒</span>
                    {/if}
                </button>
            {/each}
        </div>
    </div>
    
    <!-- Referral -->
    <div class="stats-card rounded-xl p-4 text-center">
        <p class="text-2xl mb-2">🎁</p>
        <p class="font-semibold mb-1">Пригласи друга</p>
        <p class="text-xs mb-3 text-[var(--tg-theme-hint-color)]">Получи 7 дней PRO бесплатно</p>
        <button 
            on:click={inviteFriend}
            class="px-6 py-2 rounded-full text-sm font-medium haptic-tap bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]"
        >
            Поделиться
        </button>
    </div>
</div>
