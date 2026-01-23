<script>
  import { api } from '../lib/api';
  import { selectedTech } from '../lib/store/session';
  import { t, i18n } from '../lib/i18n';
  import { userProfile, loadProfile } from '../lib/store/user.js'
  import { UStatus } from '../lib/enums/user'
  import { tg } from '../lib/telegram';
  import { pricing } from '../lib/store/pricing';

  export let show = false;
  export let onPaymentSuccess;

  let isChecking = false;
  let pollingInterval;
  let isClosing = false;

  // Внутреннее состояние выбора в самом каталоге Paywall
  let localSelected = $selectedTech;
  let currentType = null; // Новый флаг для локального спиннера

  async function handlePayment(type) {
    if (isChecking) return;
    currentType = type; // Запоминаем, какая кнопка нажата
    try {
      const { invoiceUrl, orderId, status } = await api.createOrder(type, localSelected.id);
      if (status) {
        return;
      }
      // Открываем платежную ссылку (если API её возвращает)
      if (invoiceUrl) {
        tg.openInvoice(invoiceUrl, (status) => {
          startPolling(orderId, type);
          if (status === 'cancelled') {
            // Сюда попадаем, если нажали "Закрыть"
            // Вебхук на сервер НЕ отправляется
            // забьем эту тему - руками проверю если что
            alert(i18n('paywall.paymentCancelled'));
          } else if (status === 'failed') {
            // Ошибка (например, недостаточно звезд)
            alert(i18n('paywall.paymentError'));
          }          
        });
      }      
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
          loadProfile(true)
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
    }, 100);
  }
</script>

{#if show}
  <div class="paywall-wrapper {isClosing ? 'wrapper-exit' : ''}">
    <div class="backdrop-css" on:click={close}></div>

    <div class="modal-center-css glass {isClosing ? 'modal-exit' : ''}" on:click|stopPropagation>
      <div class="premium-star">⭐</div>
      <h2>{@html $t('paywall.title')}</h2>

      <div class="offers-container">
        <div
          class="offer-card single {isChecking && currentType === 'single' ? 'checking-pulse' : ''}"
        >
          <div class="offer-header">
            <span class="offer-icon">{localSelected.icon}</span>
            <h3>{localSelected.name}</h3>
          </div>

          <p class="offer-desc">{localSelected.description}</p>
          <div class="price-tag small">{localSelected.price} ⭐</div>
          <button
            class="pay-btn secondary"
            on:click={() => {
              currentType = 'single';
              handlePayment('single');
            }}
            disabled={isChecking || localSelected.status === 'unlocked' ||  $userProfile.status === UStatus.premium}
          >
            {#if isChecking && currentType === 'single'}
              <div class="spinner"></div>
            {:else}
              Выбрать
            {/if}
          </button>
        </div>

        <div
          class="offer-card ai-all active {isChecking && currentType === 'premium'
            ? 'checking-pulse'
            : ''}"
        >
          <div class="benefit-label">{@html $t('paywall.bestValue')}</div>
          <div class="offer-header">
            <span class="offer-icon">🤖</span>
            <h3>{@html $t('paywall.priceLabel')}</h3>
          </div>
          <p class="offer-desc">{@html $t('paywall.priceDescription')}</p>
          <div class="price-tag small">{$pricing.premiumAmount} ⭐</div>

          <button
            class="pay-btn"
            on:click={() => {
              currentType = 'premium';
              handlePayment('premium');
            }}
            disabled={isChecking || $userProfile.status === UStatus.premium}
          >
            {#if isChecking && currentType === 'premium'}
              <div class="spinner"></div>
            {:else}
              {@html $t('paywall.openAccess')}
            {/if}
          </button>

          <p class="save-amount">{@html $t('paywall.economyIs')} ~{$pricing.economyAmount} ⭐</p>
        </div>
      </div>
      <div class="paywall-footer-info">
        <p>{@html $t('paywall.30daysTip')}.</p>
        <p>{@html $t('paywall.tipSubscription')}</p>
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

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
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
