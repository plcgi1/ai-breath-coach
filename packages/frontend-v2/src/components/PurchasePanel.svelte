<script>
    import { createEventDispatcher } from 'svelte';
    import { user } from '../lib/stores/user.js';
    import { tg, haptic } from '../lib/telegram.js';
    import { api } from '../lib/api.js';
    import { limits } from '../lib/stores/limits.js';
    
    const dispatch = createEventDispatcher();
    
    const products = [
        { id: 'technique_panic', name: '🆘 Антипаника', price: 99, desc: 'При панических атаках' },
        { id: 'technique_sleep', name: '🌙 Глубокий сон', price: 99, desc: 'Засыпание за 10 мин' },
        { id: 'technique_wim', name: '❄️ Метод Вим Хофа', price: 149, desc: 'Энергия и иммунитет' },
        { id: 'lifetime', name: '👑 ВСЁ НАВСЕГДА', price: 490, desc: 'Все техники + будущие', featured: true }
    ];
    
    async function buy(product) {
        haptic('medium');
        
        if (!tg) {
            // Демо режим
            user.activatePremium('demo');
            // Сбрасываем лимиты для премиум-пользователя
            limits.resetDailyLimits();
            haptic('success');
            dispatch('close');
            return;
        }
        
        const result = await api.createInvoice($user.id, product.id);
        
        if (result?.invoice_link) {
            tg.openInvoice(result.invoice_link, (status) => {
                if (status === 'paid') {
                    haptic('success');
                    user.activatePremium(product.id);
                    // Сбрасываем лимиты для премиум-пользователя
                    limits.resetDailyLimits();
                    dispatch('close');
                }
            });
        }
    }
    
    function close() {
        dispatch('close');
    }
</script>

<div 
    class="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
    on:click={close}
>
    <div 
        class="w-full max-w-lg bg-gray-900 rounded-t-3xl p-6 animate-slide-up"
        on:click|stopPropagation
    >
        <div class="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4"></div>
        
        <div class="text-center mb-6">
            <span class="text-5xl">👑</span>
            <h3 class="text-xl font-bold mt-2">Разблокировать PRO</h3>
            <p class="text-sm opacity-60">Оплата через Telegram Stars</p>
        </div>
        
        <div class="space-y-3">
            {#each products as product}
                <button
                    on:click={() => buy(product)}
                    class="w-full flex items-center gap-4 p-4 rounded-xl active:scale-[0.98] transition-transform
                        {product.featured 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                            : 'bg-white/5 border border-white/10'}"
                >
                    <div class="flex-1 text-left">
                        <p class="font-bold">{product.name}</p>
                        <p class="text-xs opacity-80">{product.desc}</p>
                    </div>
                    <span class="font-bold">{product.price} ⭐</span>
                </button>
            {/each}
        </div>
        
        <div class="mt-4 text-center text-xs opacity-40">
            <p>Покупка = владение навсегда</p>
            <p>Безопасная оплата через Telegram</p>
        </div>
        
        <button
            on:click={close}
            class="w-full mt-4 py-3 rounded-xl bg-white/10 font-medium"
        >
            Не сейчас
        </button>
    </div>
</div>

<style>
    @keyframes slide-up {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
    .animate-slide-up {
        animation: slide-up 0.3s ease-out;
    }
</style>