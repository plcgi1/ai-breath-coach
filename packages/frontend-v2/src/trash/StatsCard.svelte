<script>
    export let label = ''
    export let value = ''
    export let icon = ''
    export let highlight = false
</script>

<div class="stats-card rounded-xl p-3 text-center">
    {#if icon}
        <span class="text-2xl mb-1 block {highlight ? 'animate-[fireGlow_1s_ease-in-out_infinite_alternate]' : ''}">{icon}</span>
    {/if}
    <p class="text-2xl font-bold {highlight ? 'animate-[fireGlow_1s_ease-in-out_infinite_alternate]' : ''}">{value}</p>
    <p class="text-xs text-[var(--tg-theme-hint-color)]">{label}</p>
</div>
