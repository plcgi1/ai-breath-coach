<script>
    import { createEventDispatcher } from 'svelte'
    import { CONFIG } from '../lib/config.js'
    import { tg, haptic, openInvoice, showPopup, showAlert } from '../lib/telegram.js'
    import { user } from '../lib/stores/user.js'
    import { progress } from '../lib/stores/progress.js'
    
    const dispatch = createEventDispatcher()
    
    const plans = [
        { id: 'weekly', label: 'Неделя', stars: CONFIG.PRICES.weekly, price: '~$1.50' },
        { id: 'monthly', label: 'Месяц', stars: CONFIG.PRICES.monthly, price: '~$5', popular: true },
        { id: 'yearly', label: 'Год', stars: CONFIG.PRICES.yearly, price: '', discount: '−50%' }
    ]
    
    const features = [
        '20+ программ и курсов',
        'AI-рекомендации техник',
        'Расширенная статистика',
        'Напоминания в Telegram',
        'Метод Вим Хофа'
    ]
    
    function close() {
        dispatch('close')
    }
    
    async function buyPremium(plan, stars) {
        haptic('medium')
        
        if (!tg) {
            alert('Оплата доступна только в Telegram')
            return
        }
        
        // Если есть API — создаём реальный invoice
        if (CONFIG.API_URL) {
            try {
                const response = await fetch(`${CONFIG.API_URL}/create-invoice`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: $user.id,
                        plan,
                        stars
                    })
                })
                
                const { invoice_link } = await response.json()
                const status = await openInvoice(invoice_link)
                
                if (status === 'paid') {
                    haptic('success')
                    activatePremium(plan)
                    showAlert('🎉 Добро пожаловать в PRO!')
                }
            } catch (error) {
                console.error('Payment error:', error)
                showAlert('Ошибка оплаты. Попробуйте позже.')
            }
        } else {
            // Демо-режим
            const buttonId = await showPopup({
                title: 'Демо-режим',
                message: `Оплата ${stars} ⭐ Stars\n\nДля приёма платежей подключите бэкенд.`,
                buttons: [
                    { id: 'demo', type: 'default', text: '🎁 Тест PRO (демо)' },
                    { id: 'cancel', type: 'cancel' }
                ]
            })
            
            if (buttonId === 'demo') {
                activatePremium(plan)
            }
        }
        
        close()
    }
    
    function activatePremium(plan) {
        user.activatePremium(plan)
        progress.savePremium(plan)
        haptic('success')
    }
    
    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) {
            close()
        }
    }
</script>

<div 
    class="fixed inset-0 modal-overlay z-50 flex items-end justify-center"
    on:click={handleBackdropClick}
    on:keydown={(e) => e.key === 'Escape' && close()}
    role="dialog"
    aria-modal="true"
>
    <div class="w-full max-w-lg rounded-t-3xl p-6 relative animate-[slideUp_0.3s_ease-out] bg-[var(--tg-theme-secondary-bg-color)]">
        <!-- Handle -->
        <div class="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4"></div>
        
        <!-- Close button -->
        <button 
            on:click={close} 
            class="absolute top-4 right-4 text-2xl opacity-60 haptic-tap"
        >×</button>
        
        <!-- Header -->
        <div class="text-center mb-5">
            <div class="text-5xl mb-3">👑</div>
            <h3 class="text-xl font-bold mb-1">BreathFlow PRO</h3>
            <p class="text-sm text-[var(--tg-theme-hint-color)]">Раскройте полный потенциал</p>
        </div>
        
        <!-- Features -->
        <div class="space-y-2 mb-5">
            {#each features as feature}
                <div class="flex items-center gap-3 text-sm">
                    <span class="text-green-400">✓</span>
                    <span>{feature}</span>
                </div>
            {/each}
        </div>
        
        <!-- Pricing -->
        <div class="space-y-3">
            {#each plans as plan}
                <button 
                    on:click={() => buyPremium(plan.id, plan.stars)}
                    class="w-full py-3 rounded-xl font-semibold transition haptic-tap flex items-center justify-between px-4 relative
                        {plan.popular 
                            ? 'py-4 premium-badge pro-glow' 
                            : plan.discount 
                                ? 'bg-[var(--tg-theme-button-color)]' 
                                : 'border border-white/20 bg-[var(--tg-theme-bg-color)]'}"
                >
                    {#if plan.popular}
                        <span class="absolute -top-2 left-4 bg-green-500 text-xs px-2 py-0.5 rounded font-bold">ПОПУЛЯРНО</span>
                    {/if}
                    
                    <span class={plan.popular ? 'font-bold' : ''}>{plan.label}</span>
                    
                    <span class="flex items-center gap-1">
                        {plan.stars} ⭐
                        {#if plan.price}
                            <span class="text-xs opacity-60">{plan.price}</span>
                        {/if}
                        {#if plan.discount}
                            <span class="text-green-300 text-xs">{plan.discount}</span>
                        {/if}
                    </span>
                </button>
            {/each}
        </div>
        
        <p class="text-xs text-center mt-4 text-[var(--tg-theme-hint-color)]">
            Оплата через Telegram Stars ⭐<br>
            Отмена в любой момент
        </p>
    </div>
</div>

<style>
    @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
</style>
