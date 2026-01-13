<script>
    import { ACHIEVEMENTS } from '../../lib/config.js'
    import { CONFIG } from '../../lib/config.js'
    import { haptic, share } from '../../lib/telegram.js'
    import { user } from '../../lib/stores/user.js'
    import { 
        progress,
        totalMinutes, 
        totalSessions, 
        maxStreak,
        avgMinutes,
        achievementCount,
        weeklyData 
    } from '../../lib/stores/progress.js'
    
    import StatsCard from '../StatsCard.svelte'
    
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    const today = new Date().getDay()
    
    // Данные для недельного графика
    $: chartData = (() => {
        const maxMinutes = Math.max(10, ...Object.values($weeklyData))
        
        return [1, 2, 3, 4, 5, 6, 0].map(dayIndex => {
            const minutes = $weeklyData[dayIndex] || 0
            const height = Math.max(4, (minutes / maxMinutes) * 70)
            const isToday = dayIndex === today
            
            return {
                dayIndex,
                dayName: days[dayIndex],
                minutes,
                height,
                isToday
            }
        })
    })()
    
    const achievementsList = Object.entries(ACHIEVEMENTS).map(([id, data]) => ({
        id,
        ...data,
        unlocked: $progress.achievements[id]
    }))
    
    function shareStats() {
        haptic('light')
        
        const shareText = `🧘 Мои результаты в BreathFlow:\n\n🔥 Серия: ${$progress.streak} дней\n⏱️ Всего: ${$totalMinutes} минут\n📊 Сессий: ${$totalSessions}\n\nПопробуй и ты!`
        const shareUrl = `https://t.me/${CONFIG.BOT_USERNAME}/app`
        
        share(shareUrl, shareText)
    }
</script>

<div class="px-4 py-4">
    <!-- Weekly Chart -->
    <div class="stats-card rounded-xl p-4 mb-4">
        <h3 class="font-semibold mb-3 text-sm">Эта неделя</h3>
        <div class="flex justify-between items-end h-24">
            {#each chartData as day}
                <div class="flex flex-col items-center gap-1 flex-1">
                    <div 
                        class="w-6 rounded-t transition-all {day.isToday ? 'bg-blue-500' : 'bg-blue-500/50'}"
                        style="height: {day.height}px"
                    ></div>
                    <span 
                        class="text-xs {day.isToday ? 'font-semibold' : ''}"
                        style="color: {day.isToday ? 'var(--tg-theme-text-color)' : 'var(--tg-theme-hint-color)'}"
                    >
                        {day.dayName}
                    </span>
                </div>
            {/each}
        </div>
    </div>
    
    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-3 mb-4">
        <StatsCard label="Минут всего" value={$totalMinutes} />
        <StatsCard label="Сессий" value={$totalSessions} />
        <StatsCard label="Лучшая серия" value="🔥 {$maxStreak}" highlight={true} />
        <StatsCard label="Мин/день" value={$avgMinutes} />
    </div>
    
    <!-- Achievements -->
    <div class="stats-card rounded-xl p-4 mb-4">
        <h3 class="font-semibold mb-3 text-sm flex items-center gap-2">
            🏆 Достижения
            <span class="text-xs text-[var(--tg-theme-hint-color)]">({$achievementCount})</span>
        </h3>
        <div class="grid grid-cols-4 gap-2">
            {#each achievementsList as achievement}
                <div 
                    class="text-center {achievement.unlocked ? '' : 'opacity-40'}"
                >
                    <div class="text-2xl mb-1">{achievement.icon}</div>
                    <p class="text-xs">{achievement.text}</p>
                </div>
            {/each}
        </div>
    </div>
    
    <!-- Share Button -->
    <button 
        on:click={shareStats}
        class="w-full stats-card rounded-xl p-4 text-center haptic-tap active:scale-[0.99]"
    >
        <span class="text-lg mr-2">📤</span>
        <span class="font-medium">Поделиться результатами</span>
    </button>
</div>
