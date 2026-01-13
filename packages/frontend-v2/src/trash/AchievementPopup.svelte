<script>
    import { ACHIEVEMENTS } from '../lib/config.js'
    
    export let achievement = null
    
    $: data = achievement ? ACHIEVEMENTS[achievement] : null
</script>

{#if data}
    <div class="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-[achievementPop_0.5s_ease-out]">
        <div class="stats-card rounded-xl p-4 flex items-center gap-3 border border-amber-400/50">
            <span class="text-3xl">{data.icon}</span>
            <div>
                <p class="text-amber-300 text-xs font-semibold">Новое достижение!</p>
                <p class="font-bold text-sm">{data.text}</p>
            </div>
        </div>
    </div>
{/if}

<style>
    @keyframes achievementPop {
        0% { transform: scale(0) translateX(-50%); opacity: 0; }
        50% { transform: scale(1.2) translateX(-50%); }
        100% { transform: scale(1) translateX(-50%); opacity: 1; }
    }
</style>
