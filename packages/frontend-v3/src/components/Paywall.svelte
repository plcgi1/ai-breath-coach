<script>
  import { api } from '../lib/api';
  import { selectedTech } from '../lib/store/session';
  import { t } from '../lib/i18n';
  import { breathingPractices } from '../lib/practices.js'; // Добавлен импорт всех техник

  export let show = false;
  export let purchasedSlugs = []; // Передаем список купленных из App.svelte
  export let onPaymentSuccess;

  let isChecking = false;
  let pollingInterval;
  let isClosing = false;
  let activeTab = 'single';

  // Внутреннее состояние выбора в самом каталоге Paywall
  let localSelected = $selectedTech;

  async function handlePayment() {
    if (isChecking) return;
    try {
      // Если выбран "Весь доступ", используем спец. слаг, иначе слаг выбранной в каталоге техники
      const productSlug = activeTab === 'all' ? 'all_access' : localSelected.slug;
      const { paymentUrl, orderId } = await api.createOrder(productSlug);
      startPolling(orderId, productSlug);
    } catch (e) {
      console.error('Error:', e);
    }
  }

  function startPolling(orderId, slug) {
    isChecking = true;
    pollingInterval = setInterval(async () => {
      try {
        const status = await api.checkPaymentStatus(orderId);
        if (status.paid) {
          clearInterval(pollingInterval);
          isChecking = false;
          onPaymentSuccess(slug);
          close();
        }
      } catch (e) {
        console.error(e);
      }
    }, 3000);
  }

  function selectFromCatalog(tech) {
    localSelected = tech;
    $selectedTech = tech; // Синхронизируем с главным экраном
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
    <div class="backdrop-css" on:click={close}></div>

    <div class="modal-center-css glass {isClosing ? 'modal-exit' : ''}" on:click|stopPropagation>
      <div class="premium-star">⭐</div>

      <h2>{$t('paywall.title')}</h2>

      <div class="catalog-list">
        {#each breathingPractices as tech, i}
          <div
            class="catalog-item {localSelected.slug === tech.slug ? 'active' : ''}"
            on:click={() => selectFromCatalog(tech)}
          >
            <span class="item-icon">{tech.icon}</span>
            <span class="item-status">
              {i < 3 ? 'FREE' : purchasedSlugs.includes(tech.slug) ? '✅' : '🔒'}
            </span>
          </div>
        {/each}
      </div>

      <div class="tabs-ui">
        <button class:active={activeTab === 'single'} on:click={() => (activeTab = 'single')}>
          {$t('paywall.tab_single')}
        </button>
        <button class:active={activeTab === 'all'} on:click={() => (activeTab = 'all')}>
          {$t('paywall.tab_all')}
          <span class="benefit-label">{$t('paywall.benefit')}</span>
        </button>
      </div>

      <div class="content-box">
        <div class="item-info">
          <span class="icon-large">
            {activeTab === 'all' ? '💎' : localSelected.icon}
          </span>
          <h3>
            {activeTab === 'all' ? 'All Access' : localSelected.name}
          </h3>
          <p>
            {@html activeTab === 'all'
              ? $t('paywall.all_desc')
              : $t('paywall.single_desc', { name: localSelected.name })}
          </p>
          <div class="price-tag">
            {activeTab === 'all' ? $t('paywall.price_all') : $t('paywall.price_single')} ⭐
          </div>
        </div>
      </div>

      <button class="pay-btn" on:click={handlePayment}>
        <span>{activeTab === 'single' ? $t('paywall.btn_single') : $t('paywall.btn_all')}</span>
        <span class="star-icon">⭐</span>
      </button>

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

  /* НОВЫЕ СТИЛИ КАТАЛОГА */
  .catalog-list {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 15px;
    margin: 10px -10px;
    -webkit-overflow-scrolling: touch;
  }
  .catalog-list::-webkit-scrollbar {
    display: none;
  }

  .catalog-item {
    min-width: 60px;
    height: 70px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px solid transparent;
    transition: 0.2s;
    flex-shrink: 0;
  }

  .catalog-item.active {
    border-color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
  }

  .item-icon {
    font-size: 1.5rem;
  }
  .item-status {
    font-size: 0.5rem;
    font-weight: 800;
    opacity: 0.6;
    margin-top: 4px;
  }

  /* Остальные стили из вашего кода [cite: 136-146] */
  .tabs-ui {
    display: flex;
    background: rgba(0, 0, 0, 0.2);
    padding: 4px;
    border-radius: 14px;
    margin: 15px 0;
  }
  .tabs-ui button {
    flex: 1;
    border: none;
    background: none;
    color: #64748b;
    padding: 8px;
    font-size: 0.8rem;
    cursor: pointer;
    border-radius: 10px;
  }
  .tabs-ui button.active {
    background: #1e293b;
    color: white;
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
</style>
