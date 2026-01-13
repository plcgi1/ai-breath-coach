<script>
    import { createEventDispatcher } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { api } from '../lib/api.js';
    import { user } from '../lib/stores/user.js';
    import { tg, haptic } from '../lib/telegram.js';

    export let product; // { id, price, name, desc }
    const dispatch = createEventDispatcher();

    let loading = false;

    async function handleBuy() {
        loading = true;
        haptic('medium');

        if (!tg) {
             alert('Оплата только в Telegram');
             loading = false;
             return;
        }

        try {
            const res = await api.createInvoice($user.id, product.id);
            if (res.invoice_link) {
                tg.openInvoice(res.invoice_link, (status) => {
                    if (status === 'paid') {
                        haptic('success');
                        user.setFromTelegram(); // Обновляем статус (в идеале api call)
                        dispatch('close');
                    } else {
                        loading = false;
                    }
                });
            }
        } catch (e) {
            console.error(e);
            loading = false;
        }
    }
</script>

<!-- Backdrop -->
<div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" on:click={() => dispatch('close')} transition:fade></div>

<!-- Bottom Sheet -->
<div class="fixed bottom-0 left-0 right-0 z-50 bg-[#1e1e2e] rounded-t-3xl p-6 border-t border-white/10" transition:fly={{ y: 300, duration: 300 }}>
    
    <div class="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>

    <div class="text-center mb-8">
        <div class="text-6xl mb-4 animate-pulse">{product.name.split(' ')[0]}</div> <!-- Icon -->
        <h2 class="text-2xl font-bold mb-2">Разблокировать «{product.name.split(' ')[1]}»</h2>
        <p class="text-white/60 text-sm">
            Получите доступ к этой технике навсегда.<br>
            Помогает при {product.desc.toLowerCase()}.
        </p>
    </div>

    <div class="space-y-3">
        <button 
            on:click={handleBuy}
            disabled={loading}
            class="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-bold text-lg shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-transform relative overflow-hidden"
        >
            {#if loading}
                ⏳ Загрузка...
            {:else}
                Купить навсегда за {product.price} ⭐
            {/if}
        </button>

        <button 
            on:click={() => dispatch('close')}
            class="w-full py-3 text-sm text-white/40"
        >
            Отмена
        </button>
    </div>
    
    <p class="text-[10px] text-center text-white/20 mt-4">
        Разовая покупка. Безопасная оплата через Telegram.
    </p>
</div>