<script>
    import { createEventDispatcher } from 'svelte';
    import { user } from '../lib/stores/user.js';
    import { currentTechnique } from '../lib/stores/breathing.js';
    import { haptic } from '../lib/telegram.js';

    const dispatch = createEventDispatcher();

    // Гибридные состояния (смесь эмоций и техник)
    const states = [
        { 
            id: 'balance', 
            slug: 'box-breathing', 
            label: '🧘 Баланс', 
            desc: 'Равновесие',
            color: 'bg-blue-500/20 border-blue-500/50',
            premium: false 
        },
        { 
            id: 'sleep', 
            slug: 'sleep-478-pro', 
            label: '😴 Не сплю', 
            desc: 'Уснуть за 5 мин',
            color: 'bg-indigo-500/20 border-indigo-500/50',
            premium: true,
            productId: 'technique_sleep-pro',
            price: 149
        },
        { 
            id: 'panic', 
            slug: 'anti-panic', 
            label: '😰 Паника', 
            desc: 'Стоп тревога',
            color: 'bg-red-500/20 border-red-500/50',
            premium: true,
            productId: 'technique_anti-panic',
            price: 99
        },
        { 
            id: 'energy', 
            slug: 'energizer', 
            label: '⚡ Энергия', 
            desc: 'Вместо кофе',
            color: 'bg-orange-500/20 border-orange-500/50',
            premium: true,
            productId: 'technique_energizer',
            price: 99
        }
    ];

    function handleClick(state) {
        haptic('light');

        // Проверка прав доступа "на лету"
        if (state.premium && !$user.isPremium) {
            haptic('medium');
            // Вызываем шторку оплаты
            dispatch('paywall', { 
                id: state.productId, 
                price: state.price,
                name: state.label,
                desc: state.desc
            });
            return;
        }

        dispatch('select', state);
    }
</script>

<div class="flex gap-3 overflow-x-auto px-6 pb-4 scrollbar-hide snap-x">
    {#each states as state}
        <button 
            on:click={() => handleClick(state)}
            class="snap-center flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl border transition-all haptic-tap
                {state.color}
                {$currentTechnique === state.slug ? 'ring-2 ring-white scale-105' : 'opacity-80'}"
        >
            <span class="text-2xl mb-1 filter drop-shadow-lg">{state.label.split(' ')[0]}</span>
            <span class="font-bold text-sm leading-tight">{state.label.split(' ')[1]}</span>
            
            {#if state.premium && !$user.isPremium}
                <div class="mt-1 px-1.5 py-0.5 bg-black/40 rounded text-[10px] flex items-center gap-1">
                    🔒 {state.price}⭐
                </div>
            {/if}
        </button>
    {/each}
</div>