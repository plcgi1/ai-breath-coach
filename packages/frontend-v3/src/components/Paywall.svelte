<script>
    import { api } from '../lib/api';
    import { selectedTech } from '../lib/store/session';
    import { t } from "../lib/i18n";

    export let show = false;
    export let onPaymentSuccess;

    let isChecking = false;
    let pollingInterval;
    let isClosing = false; 
    let activeTab = 'single'; // Состояние выбора тарифа

    async function handlePayment() {
        if (isChecking) return;
        try {
            // Если выбран весь каталог, отправляем специальный slug, иначе — текущий
            const productSlug = activeTab === 'all' ? 'all_access' : $selectedTech.slug;
            const { paymentUrl, orderId } = await api.createOrder(productSlug);
            
            // window.location.href = paymentUrl; // Перенаправление на оплату
            startPolling(orderId);
        } catch (e) { console.error("Ошибка оплаты:", e); }
    }

    function startPolling(orderId) {
        isChecking = true;
        pollingInterval = setInterval(async () => {
            try {
                const status = await api.checkPaymentStatus(orderId);
                if (status.paid) {
                    clearInterval(pollingInterval);
                    isChecking = false;
                    onPaymentSuccess(activeTab === 'all' ? 'all_access' : $selectedTech.slug);
                    close(); // Закрываем с анимацией после успеха
                }
            } catch (e) { console.error(e); }
        }, 3000);
    }

    function close() {
        isClosing = true;
        setTimeout(() => {
            clearInterval(pollingInterval);
            isChecking = false;
            isClosing = false;
            show = false; 
        }, 400);
    }
</script>

{#if show}
    <div class="paywall-wrapper {isClosing ? 'wrapper-exit' : ''}">
        <div class="backdrop-css" on:click={close}></div> [cite: 16, 18]

        <div class="modal-center-css glass {isClosing ? 'modal-exit' : ''}" on:click|stopPropagation>
            <div class="premium-badge">PREMIUM</div> [cite: 13, 20]
            
            <h2>{$t("paywall.title")}</h2>
            
            <div class="tabs-container">
                <button class:active={activeTab === 'single'} on:click={() => activeTab = 'single'}>
                    {$t("paywall.tab_single")}
                </button>
                <button class:active={activeTab === 'all'} on:click={() => activeTab = 'all'}>
                    {$t("paywall.tab_all")}
                    <span class="badge-mini">{$t("paywall.benefit")}</span>
                </button>
            </div>

            <div class="offer-box">
                {#if activeTab === 'single'}
                    <div class="details">
                        <span class="main-icon">{$selectedTech?.icon}</span>
                        <h3>{$selectedTech?.name}</h3>
                        <p>{@html $t("paywall.single_desc", { name: $selectedTech?.name })}</p> 
                        <div class="price">{@html $t("paywall.price_per_month")}</div>
                    </div>
                {:else}
                    <div class="details">
                        <span class="main-icon">💎</span>
                        <h3>{$t("paywall.all_access_title")}</h3>
                        <p>{$t("paywall.all_desc")}</p>
                        <div class="price">{@html $t("paywall.price_forever")}</div>
                    </div>
                {/if}
            </div>

            <button class="pay-btn" on:click={handlePayment}>
                <span>{activeTab === 'single' ? $t("paywall.btn_single") : $t("paywall.btn_all")}</span>
                <span class="star-icon">⭐</span> [cite: 15]
            </button>
            
            <button class="secondary-btn" on:click={close}>
                {$t("paywall.leave_free")}
            </button>
        </div>
    </div>
{/if}

<style>
    /* Стили анимации и обертки из оригинала */
    .paywall-wrapper { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
    .backdrop-css { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px); animation: fadeIn 0.4s ease-out forwards; }
    
    .modal-center-css { 
        position: relative; width: 100%; max-width: 320px; 
        background: linear-gradient(165deg, #1e293b 0%, #0f172a 100%); 
        border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 30px; 
        padding: 30px 20px; text-align: center; 
        animation: modalUp 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }

    /* Новые стили для табов и оффера */
    .premium-badge { background: #fbbf24; color: #000; font-size: 0.7rem; font-weight: 800; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 15px; }
    .tabs-container { display: flex; background: rgba(0,0,0,0.3); padding: 4px; border-radius: 15px; margin-bottom: 20px; }
    .tabs-container button { flex: 1; border: none; background: none; color: #94a3b8; padding: 8px; border-radius: 12px; font-size: 0.8rem; cursor: pointer; position: relative; }
    .tabs-container button.active { background: #1e293b; color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
    
    .badge-mini { position: absolute; top: -8px; right: -5px; background: #10b981; color: white; font-size: 0.6rem; padding: 2px 6px; border-radius: 6px; }
    
    .offer-box { min-height: 180px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
    .main-icon { font-size: 3rem; display: block; margin-bottom: 10px; filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.4)); }
    .price { font-size: 1.5rem; font-weight: 800; color: white; margin-top: 15px; }
    .price :global(span) { font-size: 0.9rem; color: #64748b; font-weight: 400; }

    .pay-btn { width: 100%; background: #fbbf24; color: #000; border: none; padding: 16px; border-radius: 18px; font-weight: 800; display: flex; justify-content: center; gap: 8px; cursor: pointer; }
    .secondary-btn { background: none; border: none; color: #475569; margin-top: 15px; font-size: 0.8rem; cursor: pointer; }

    /* Анимации закрытия */
    .wrapper-exit .backdrop-css { animation: fadeOut 0.4s ease-in forwards; }
    .modal-exit { animation: modalDown 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards !important; }

    @keyframes modalUp { from { opacity: 0; transform: translateY(100px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes modalDown { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(100px); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
</style>
