<script>
    import { createEventDispatcher } from 'svelte'
    import { haptic, mainButton, backButton } from '../lib/telegram.js'
    import { progress } from '../lib/stores/progress.js'
    import { breathingController } from '../lib/stores/breathing.js'
    
    const dispatch = createEventDispatcher()
    
    let step = 1
    let data = {
        goal: null,
        experience: null,
        time: null,
        recommendedTechnique: null
    }
    
    const goals = [
        { id: 'anxiety', icon: '😰', title: 'Снизить тревогу', desc: 'Панические атаки, стресс, беспокойство' },
        { id: 'sleep', icon: '😴', title: 'Улучшить сон', desc: 'Быстрее засыпать, глубже спать' },
        { id: 'focus', icon: '🎯', title: 'Повысить концентрацию', desc: 'Фокус на работе и учёбе' },
        { id: 'energy', icon: '⚡', title: 'Больше энергии', desc: 'Бодрость без кофеина' }
    ]
    
    const experiences = [
        { id: 'never', icon: '🌱', title: 'Никогда не пробовал(а)', desc: 'Начнём с самых простых техник' },
        { id: 'sometimes', icon: '🌿', title: 'Пару раз пробовал(а)', desc: 'Знакомы базовые техники' },
        { id: 'regular', icon: '🌳', title: 'Практикую регулярно', desc: 'Готов(а) к продвинутым техникам' }
    ]
    
    const times = [
        { id: '3', icon: '⚡', title: '3 минуты', desc: 'Быстрая практика на каждый день' },
        { id: '5', icon: '🧘', title: '5-10 минут', desc: 'Оптимальная продолжительность' },
        { id: '15', icon: '🏔️', title: '15+ минут', desc: 'Глубокая трансформация' }
    ]
    
    const recommendations = {
        anxiety: { technique: 'relaxing', icon: '😌', title: 'Техника 4-7-8', desc: 'Лучшая для снижения тревоги', tag1: '😌 Расслабление' },
        sleep: { technique: 'sleep', icon: '😴', title: 'Дыхание для сна', desc: 'Поможет быстрее заснуть', tag1: '🌙 Для сна' },
        focus: { technique: 'box', icon: '📦', title: 'Квадратное дыхание', desc: 'Повышает концентрацию', tag1: '🎯 Фокус' },
        energy: { technique: 'energizing', icon: '⚡', title: 'Энергетическое дыхание', desc: 'Заряд бодрости за 3 минуты', tag1: '⚡ Энергия' }
    }
    
    $: recommendation = recommendations[data.goal] || recommendations.anxiety
    
    $: progressWidth = (step / 4) * 100
    
    function selectOption(category, value) {
        haptic('light')
        data[category] = value
        
        setTimeout(() => {
            step++
            if (step === 5) {
                data.recommendedTechnique = recommendation.technique
            }
        }, 300)
    }
    
    function next() {
        haptic('medium')
        if (step === 1) {
            step++
        } else if (step === 5) {
            complete()
        }
    }
    
    function skip() {
        haptic('light')
        complete()
    }
    
    function complete() {
        haptic('success')
        progress.completeOnboarding(data)
        
        if (data.recommendedTechnique) {
            breathingController.selectTechnique(data.recommendedTechnique)
        }
        
        mainButton.show('▶️ Начать практику')
        dispatch('complete')
    }
    
    // Скрыть кнопки Telegram во время онбординга
    mainButton.hide()
    backButton.hide()
</script>

<div class="fixed inset-0 z-[60] bg-[var(--tg-theme-bg-color)]">
    <div class="h-full flex flex-col">
        <!-- Progress -->
        <div class="px-6 pt-6 pb-4">
            <div class="flex gap-2">
                {#each [1, 2, 3, 4] as i}
                    <div class="flex-1 h-1 rounded-full bg-white/20">
                        <div 
                            class="h-full rounded-full bg-blue-500 transition-all duration-300"
                            style="width: {i < step ? '100%' : i === step ? '50%' : '0%'}"
                        ></div>
                    </div>
                {/each}
            </div>
        </div>
        
        <!-- Steps -->
        <div class="flex-1 overflow-hidden relative">
            <!-- Step 1: Welcome -->
            <div 
                class="absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-all duration-300
                    {step > 1 ? '-translate-x-full' : step < 1 ? 'translate-x-full' : ''}"
            >
                <div class="text-7xl mb-6 animate-bounce">🧘</div>
                <h2 class="text-2xl font-bold mb-3">Добро пожаловать в BreathFlow</h2>
                <p class="text-base mb-2 text-[var(--tg-theme-hint-color)]">
                    Научитесь управлять своим состоянием<br>с помощью дыхательных практик
                </p>
                <div class="mt-6 space-y-2 text-sm">
                    <div class="flex items-center gap-2 justify-center">
                        <span class="text-green-400">✓</span>
                        <span>Снижение тревоги за 3 минуты</span>
                    </div>
                    <div class="flex items-center gap-2 justify-center">
                        <span class="text-green-400">✓</span>
                        <span>Быстрое засыпание</span>
                    </div>
                    <div class="flex items-center gap-2 justify-center">
                        <span class="text-green-400">✓</span>
                        <span>Заряд энергии без кофе</span>
                    </div>
                </div>
            </div>
            
            <!-- Step 2: Goal -->
            <div 
                class="absolute inset-0 flex flex-col px-6 pt-8 transition-all duration-300
                    {step > 2 ? '-translate-x-full' : step < 2 ? 'translate-x-full' : ''}"
            >
                <h2 class="text-xl font-bold mb-2 text-center">Какая у вас главная цель?</h2>
                <p class="text-sm text-center mb-6 text-[var(--tg-theme-hint-color)]">Выберите одну, чтобы мы подобрали программу</p>
                
                <div class="space-y-3">
                    {#each goals as goal}
                        <button 
                            on:click={() => selectOption('goal', goal.id)}
                            class="w-full stats-card rounded-xl p-4 flex items-center gap-4 haptic-tap transition-all
                                {data.goal === goal.id ? 'ring-2 ring-blue-500 bg-blue-500/20' : ''}"
                        >
                            <span class="text-3xl">{goal.icon}</span>
                            <div class="text-left flex-1">
                                <p class="font-semibold">{goal.title}</p>
                                <p class="text-xs text-[var(--tg-theme-hint-color)]">{goal.desc}</p>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
            
            <!-- Step 3: Experience -->
            <div 
                class="absolute inset-0 flex flex-col px-6 pt-8 transition-all duration-300
                    {step > 3 ? '-translate-x-full' : step < 3 ? 'translate-x-full' : ''}"
            >
                <h2 class="text-xl font-bold mb-2 text-center">Пробовали дыхательные практики?</h2>
                <p class="text-sm text-center mb-6 text-[var(--tg-theme-hint-color)]">Подстроим сложность под ваш уровень</p>
                
                <div class="space-y-3">
                    {#each experiences as exp}
                        <button 
                            on:click={() => selectOption('experience', exp.id)}
                            class="w-full stats-card rounded-xl p-4 flex items-center gap-4 haptic-tap transition-all
                                {data.experience === exp.id ? 'ring-2 ring-blue-500 bg-blue-500/20' : ''}"
                        >
                            <span class="text-3xl">{exp.icon}</span>
                            <div class="text-left flex-1">
                                <p class="font-semibold">{exp.title}</p>
                                <p class="text-xs text-[var(--tg-theme-hint-color)]">{exp.desc}</p>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
            
            <!-- Step 4: Time -->
            <div 
                class="absolute inset-0 flex flex-col px-6 pt-8 transition-all duration-300
                    {step > 4 ? '-translate-x-full' : step < 4 ? 'translate-x-full' : ''}"
            >
                <h2 class="text-xl font-bold mb-2 text-center">Сколько времени готовы уделять?</h2>
                <p class="text-sm text-center mb-6 text-[var(--tg-theme-hint-color)]">Даже 3 минуты дают результат</p>
                
                <div class="space-y-3">
                    {#each times as time}
                        <button 
                            on:click={() => selectOption('time', time.id)}
                            class="w-full stats-card rounded-xl p-4 flex items-center gap-4 haptic-tap transition-all
                                {data.time === time.id ? 'ring-2 ring-blue-500 bg-blue-500/20' : ''}"
                        >
                            <span class="text-3xl">{time.icon}</span>
                            <div class="text-left flex-1">
                                <p class="font-semibold">{time.title}</p>
                                <p class="text-xs text-[var(--tg-theme-hint-color)]">{time.desc}</p>
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
            
            <!-- Step 5: Result -->
            <div 
                class="absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-all duration-300
                    {step < 5 ? 'translate-x-full' : ''}"
            >
                <div class="text-6xl mb-4">✨</div>
                <h2 class="text-xl font-bold mb-2">Ваша программа готова!</h2>
                <p class="text-sm mb-6 text-[var(--tg-theme-hint-color)]">
                    Мы подобрали идеальные техники для вас
                </p>
                
                <div class="w-full stats-card rounded-xl p-4 mb-4">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="text-3xl">{recommendation.icon}</span>
                        <div class="text-left">
                            <p class="font-semibold">{recommendation.title}</p>
                            <p class="text-xs text-[var(--tg-theme-hint-color)]">{recommendation.desc}</p>
                        </div>
                    </div>
                    <div class="flex gap-2 text-xs">
                        <span class="px-2 py-1 rounded-full bg-blue-500/20">{recommendation.tag1}</span>
                        <span class="px-2 py-1 rounded-full bg-purple-500/20">⏱️ {data.time || 5} мин/день</span>
                    </div>
                </div>
                
                <div class="w-full space-y-2 text-sm text-left stats-card rounded-xl p-4">
                    <p class="font-semibold text-center mb-2">Ваш план на первую неделю:</p>
                    <div class="flex items-center gap-2">
                        <span class="text-green-400">День 1-3:</span>
                        <span class="text-[var(--tg-theme-hint-color)]">Освоение базовой техники</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-green-400">День 4-5:</span>
                        <span class="text-[var(--tg-theme-hint-color)]">Увеличение продолжительности</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-green-400">День 6-7:</span>
                        <span class="text-[var(--tg-theme-hint-color)]">Добавление новой техники</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Bottom buttons -->
        <div class="p-6">
            {#if step === 1 || step === 5}
                <button 
                    on:click={next}
                    class="w-full py-4 rounded-xl font-bold text-lg haptic-tap bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)]"
                >
                    {step === 5 ? '🚀 Начать практику' : 'Далее'}
                </button>
            {/if}
            
            {#if step < 5}
                <button 
                    on:click={skip}
                    class="w-full py-3 text-sm mt-2 haptic-tap text-[var(--tg-theme-hint-color)]"
                >
                    Пропустить
                </button>
            {/if}
        </div>
    </div>
</div>
