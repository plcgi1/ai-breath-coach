<script>
    import { createEventDispatcher } from 'svelte'
    import { TECHNIQUES } from '../lib/config.js'
    import { currentTechnique, breathingController } from '../lib/stores/breathing.js'
    import { user } from '../lib/stores/user.js'
    import { haptic } from '../lib/telegram.js'
    
    const dispatch = createEventDispatcher()
    
    const techniques = Object.values(TECHNIQUES)
    
    function selectTechnique(id) {
        const tech = TECHNIQUES[id]
        
        // Если PRO техника и нет подписки
        if (tech.premium && !$user.isPremium) {
            haptic('warning')
            dispatch('openPremium')
            return
        }
        
        breathingController.selectTechnique(id, $user.isPremium)
    }
</script>

<div class="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
    {#each techniques as tech}
        <button
            on:click={() => selectTechnique(tech.id)}
            class="technique-chip flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium haptic-tap relative
                bg-gradient-to-r {tech.color.replace('to-', 'to-').replace('from-', 'from-')}/30
                border border-white/20
                {$currentTechnique === tech.id ? 'ring-2 ring-white scale-105' : ''}"
        >
            {tech.icon} {tech.name}
            
            {#if tech.premium}
                <span class="premium-badge absolute -top-1 -right-1 px-1 py-0.5 rounded text-xs">PRO</span>
            {/if}
        </button>
    {/each}
</div>
