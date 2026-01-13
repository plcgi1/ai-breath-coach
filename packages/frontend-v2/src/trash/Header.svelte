<script>
    import { user, userInitials, displayName } from '../lib/stores/user.js'
    import { streak, currentDay } from '../lib/stores/progress.js'
</script>

<header class="sticky top-0 z-40 px-4 py-3 flex items-center justify-between bg-[var(--tg-theme-bg-color)]">
    <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-lg font-bold">
            {$userInitials}
        </div>
        <div>
            <div class="flex items-center gap-2">
                <p class="font-semibold text-sm">{$displayName}</p>
                {#if $user.isPremium}
                    <span class="premium-badge px-1.5 py-0.5 rounded text-xs font-bold">PRO</span>
                {/if}
            </div>
            <p class="text-xs text-[var(--tg-theme-hint-color)]">День {$currentDay}</p>
        </div>
    </div>
    
    <div class="animate-[fireGlow_1s_ease-in-out_infinite_alternate] flex items-center gap-1 bg-orange-500/20 px-3 py-1.5 rounded-full">
        <span>🔥</span>
        <span class="font-bold">{$streak}</span>
    </div>
</header>
