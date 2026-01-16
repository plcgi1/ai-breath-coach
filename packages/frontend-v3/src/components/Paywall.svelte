<script>
  import { api } from '../lib/api';
  import { selectedTech } from '../lib/store/session';
  import { t } from '../lib/i18n';
  import PracticeScroll from './PracticeScroll.svelte';
  import { tg } from '../lib/telegram';

  export let show = false;
  export let purchasedSlugs = []; // Передаем список купленных из App.svelte
  export let onPaymentSuccess;
  export let data = [];

  let isChecking = false;
  let pollingInterval;
  let isClosing = false;

  // Цены для MVP
  const PRICE_SINGLE = 99;
  const PRICE_AI = 799;

  function calcBenefit(singlePrice, aiPrice) {
    const premiumPracticesCount = data.length - 3;
    const totalCostSeparately = premiumPracticesCount * singlePrice;
    const savings = totalCostSeparately - aiPrice;
    const savingsPercent = Math.round((savings / totalCostSeparately) * 100);
    return { totalCostSeparately, savings, savingsPercent };
  }

  // Внутреннее состояние выбора в самом каталоге Paywall
  let localSelected = $selectedTech;
  let currentType = null; // Новый флаг для локального спиннера

  function paymentCallback(invoicePayload) {
    console.info('Payment callback received with payload:', invoicePayload);
    // Здесь можно обработать успешный платеж, если нужно
  }

  async function handlePayment(type) {
    console.info('handlePayment called with type:', type);

    if (isChecking) return;
    currentType = type; // Запоминаем, какая кнопка нажата
    try {
      console.info('Creating order for type:', localSelected);
      const { invoiceUrl, orderId } = await api.createOrder(type, localSelected.id);

      // Открываем платежную ссылку (если API её возвращает)
      if (invoiceUrl) {
        console.info('Opening payment URL:', invoiceUrl);
        // TODO window.open(paymentUrl, '_blank');
        // tg.openInvoice(invoiceUrl, paymentCallback);
      }

      startPolling(orderId, type);
    } catch (e) {
      console.error('Error:', e);
      isChecking = false;
      currentType = null;
    }
  }

  function startPolling(orderId, type) {
    isChecking = true;
    pollingInterval = setInterval(async () => {
      try {
        const status = await api.checkPaymentStatus(orderId);
        if (status.paid) {
          clearInterval(pollingInterval);
          isChecking = false;
          onPaymentSuccess(type);
          close();
        }
      } catch (e) {
        console.error(e);
      }
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

  $: isOwned = purchasedSlugs.includes(localSelected.slug);

  const { totalCostSeparately, savings, savingsPercent } = calcBenefit(PRICE_SINGLE, PRICE_AI);
</script>

{#if show}
  <div class="paywall-wrapper {isClosing ? 'wrapper-exit' : ''}">
    <div class="backdrop-css" on:click={close}></div>

    <div class="modal-center-css glass {isClosing ? 'modal-exit' : ''}" on:click|stopPropagation>
      <div class="premium-star">⭐</div>
      <h2>{$t('paywall.title')}</h2>

      <div class="paywall-catalog-container">
        <PracticeScroll
          techniques={data}
          selectedSlug={localSelected.slug}
          {purchasedSlugs}
          onSelect={(tech) => (localSelected = tech)}
        />
      </div>
      <div class="offers-container">
        <div
          class="offer-card single {isOwned ? 'owned-style' : ''} {isChecking &&
          currentType === 'single'
            ? 'checking-pulse'
            : ''}"
        >
          <div class="offer-header">
            <span class="offer-icon">{localSelected.icon}</span>
            <h3>{localSelected.name}</h3>
          </div>

          {#if isOwned}
            <p class="offer-desc" style="color: #10b981;">Доступно в вашей коллекции</p>
            <div class="price-tag small">✅</div>
            <button class="pay-btn secondary" on:click={close}> Использовать </button>
          {:else}
            <p class="offer-desc">Доступ на 30 дней к выбранной технике</p>
            <div class="price-tag small">{PRICE_SINGLE} ⭐</div>
            <button
              class="pay-btn secondary"
              on:click={() => {
                currentType = 'single';
                handlePayment('single');
              }}
              disabled={isChecking}
            >
              {#if isChecking && currentType === 'single'}
                <div class="spinner"></div>
              {:else}
                Выбрать
              {/if}
            </button>
          {/if}
        </div>

        <div
          class="offer-card ai-all active {isChecking && currentType === 'premium'
            ? 'checking-pulse'
            : ''}"
        >
          <div class="benefit-label">BEST VALUE</div>
          <div class="offer-header">
            <span class="offer-icon">🤖</span>
            <h3>AI + Все</h3>
          </div>
          <p class="offer-desc">Все практики и ИИ-инструктор</p>
          <div class="price-tag small">{PRICE_AI} ⭐</div>

          <button
            class="pay-btn"
            on:click={() => {
              currentType = 'premium';
              handlePayment('premium');
            }}
            disabled={isChecking}
          >
            {#if isChecking && currentType === 'premium'}
              <div class="spinner"></div>
            {:else}
              Открыть доступ
            {/if}
          </button>

          <p class="save-amount">Экономия составит ~{savings} ⭐</p>
        </div>
      </div>
      <div class="paywall-footer-info">
        <p>Все тарифы действуют 30 дней с момента оплаты.</p>
        <p>Подписка не продлевается автоматически. Вы сами решите, когда продлить доступ.</p>
      </div>

      <button class="close-txt" on:click={close}>{$t('paywall.leave_free')}</button>
    </div>
  </div>
{/if}

<style>
  /* Существующие стили [cite: 130, 133, 136, 140] */
  .paywall-wrapper {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
  }
  .backdrop-css {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    animation: fadeIn 0.4s ease-out forwards;
  }
  .modal-center-css {
    position: relative;
    width: 100%;
    max-width: 360px;
    background: linear-gradient(165deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 30px;
    padding: 30px 24px;
    text-align: center;
    animation: modalUp 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  }

  .price-tag {
    font-size: 1.8rem;
    font-weight: 800;
    color: #fbbf24;
    margin-top: 10px;
  }
  .pay-btn {
    width: 100%;
    margin-top: 20px;
    background: #fbbf24;
    color: #000;
    border: none;
    padding: 16px;
    border-radius: 18px;
    font-weight: 800;
    display: flex;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
  }

  .offers-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 20px 0;
  }

  .offer-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 15px 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    transition: transform 0.2s;
  }

  /* Выделение AI тарифа [cite: 29, 41] */
  .offer-card.active {
    border-color: rgba(251, 191, 36, 0.5);
    background: linear-gradient(165deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%);
    transform: scale(1.03);
  }

  .offer-header h3 {
    font-size: 0.85rem;
    color: white;
    margin: 5px 0;
  }

  .offer-icon {
    font-size: 1.8rem;
    display: block;
  }

  .offer-desc {
    font-size: 0.65rem;
    color: #64748b;
    line-height: 1.2;
    margin-bottom: 10px;
  }

  /* Маленький ценник для карточек [cite: 41] */
  .price-tag.small {
    font-size: 1.2rem;
    margin: 5px 0;
  }

  /* Переиспользование твоей кнопки [cite: 42] */
  .pay-btn {
    width: 100%;
    margin-top: 5px;
    padding: 10px;
    font-size: 0.75rem;
    border-radius: 12px;
  }

  .pay-btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  /* Твой класс benefit-label для бейджа [cite: 20] */
  .benefit-label {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    background: #fbbf24;
    color: #000;
    font-size: 0.55rem;
    font-weight: 900;
    padding: 2px 8px;
    border-radius: 8px;
    white-space: nowrap;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .pay-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    filter: grayscale(0.5);
  }

  /* Пульсация во время проверки платежа */
  .checking-pulse {
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
  .offer-card.owned-style {
    border-color: rgba(16, 185, 129, 0.3); /* Зеленоватый оттенок успеха */
    background: rgba(16, 185, 129, 0.05);
  }

  /* Если техника куплена, кнопка "Использовать" должна быть акцентной */
  .offer-card.owned-style .pay-btn.secondary {
    background: #10b981;
    color: white;
    opacity: 1;
  }
  .paywall-catalog-container {
    margin: 10px -24px; /* Чтобы скролл уходил в края модалки */
  }

  .paywall-footer-info {
    margin-top: 20px;
    text-align: center;
    padding: 0 10px;
  }

  .paywall-footer-info p {
    font-size: 0.6rem;
    color: #a9b7cc; /* Ненавязчивый серый цвет */
    line-height: 1.4;
    margin: 2px 0;
  }

  /* Пульсация всей карточки при проверке */
  .checking-pulse {
    animation: pulse 1.5s infinite ease-in-out;
    border-color: #fbbf24 !important;
  }
</style>
