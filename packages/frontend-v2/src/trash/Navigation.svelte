<script>
    import { createEventDispatcher } from 'svelte';
    
    export let currentPage = 'practice';
    
    const dispatch = createEventDispatcher();
    
    const tabs = [
        { id: 'practice', label: '🧘 Практика' },
        { id: 'programs', label: '📚 Курсы' },
        { id: 'ai', label: '🤖 AI' },
        { id: 'stats', label: '📊 Прогресс' }
    ];
    
    function selectTab(id) {
        dispatch('change', id);
    }
</script>

<nav class="sticky top-14 z-30 px-4 py-2 bg-[var(--tg-theme-bg-color)]">
    <div class="flex gap-1 bg-white/5 p-1 rounded-xl">
        {#each tabs as tab}
            <button
                on:click={() => selectTab(tab.id)}
                class="flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all
                    {currentPage === tab.id 
                        ? 'bg-[var(--tg-theme-button-color)]' 
                        : ''}"
            >
                {tab.label}
            </button>
        {/each}
    </div>
</nav>
<!-- <script>
    import { createEventDispatcher } from 'svelte'
    import { haptic } from '../lib/telegram.js'
    
    export let currentPage = 'practice'
    
    const dispatch = createEventDispatcher()
    
    const tabs = [
        { id: 'practice', label: '🧘 Практика' },
        { id: 'programs', label: '📚 Курсы' },
        { id: 'stats', label: '📊 Прогресс' }
    ]
    
    function selectTab(id) {
        haptic('light')
        dispatch('change', id)
    }
</script>

<nav class="sticky top-14 z-30 px-4 py-2 bg-[var(--tg-theme-bg-color)]">
    <div class="flex gap-2 bg-white/5 p-1 rounded-xl">
        {#each tabs as tab}
            <button
                on:click={() => selectTab(tab.id)}
                class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all haptic-tap
                    {currentPage === tab.id 
                        ? 'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]' 
                        : 'text-[var(--tg-theme-text-color)]'}"
            >
                {tab.label}
            </button>
        {/each}
    </div>
</nav> -->
