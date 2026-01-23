<script>
  import { api } from '../lib/api';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { userProfile } from '../lib/store/user.js'
  import { UStatus } from '../lib/enums/user'
  import { selectedTech } from '../lib/store/session';
  import { t } from '../lib/i18n';

  let showAIModal = false;
  let userMood = '';
  let isAILoading = false;
  let aiRecommendation = null; // Для хранения ответа от ИИ

  export let techniques = [];
  export let onShowPanelButtonClick = () => {}
  export let handleTouchStart = () => {};
  export let handleTouchMove = () => {};
  export let handleTouchEnd = () => {};

  const MAX_CHARS = 100;

  async function askAI() {
    if (!userMood.trim()) return;

    isAILoading = true;
    try {
      // Отправляем запрос на сервер
      const result = await api.askAI(userMood);
      // Допустим, сервер возвращает { tech_slug: "calm", message: "Попробуйте это..." }
      aiRecommendation = result;
    } catch (e) {
      console.error('Ошибка ИИ:', e);
    } finally {
      isAILoading = false;
    }
  }

  function applyAIRecommendation() {
    const tech = techniques.find((t) => t.slug === aiRecommendation.slug);

    if (tech) {
      $selectedTech = tech;
      showAIModal = false;
      aiRecommendation = null;
      userMood = '';
    }
  }

  function onShowPanel() {
    if($userProfile.status !== UStatus.premium) {
      onShowPanelButtonClick()
      return
    }
    showAIModal = true
  }
</script>

{#if showAIModal}
  <div class="overlay" on:click={() => (showAIModal = false)} transition:fade={{ duration: 250 }}>
    <div
      class="modal glass bottom-sheet"
      on:click|stopPropagation
      transition:fly={{ y: 500, duration: 600, easing: quintOut }}
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={() => handleTouchEnd(() => (showAIModal = false))}
    >
      <div class="ai-header">
        <span class="ai-spark">✨</span>
        <h2>{@html $t('aipanel.etherIntellect')}</h2>
      </div>
      <button
        class="close-x"
        on:click={() => (showAIModal = false)}
        aria-label={$t('aipanel.close')}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      {#if !aiRecommendation}
        <div class="input-wrapper">
          <textarea
            bind:value={userMood}
            placeholder={$t('aipanel.placeholder')}
            class="ai-input"
            rows="1"
            maxlength={MAX_CHARS}
          ></textarea>

          <div class="char-counter {userMood.length >= MAX_CHARS ? 'limit' : ''}">
            {userMood.length} / {MAX_CHARS}
          </div>
        </div>
        <button class="main-btn ai-btn" on:click={askAI} disabled={isAILoading || !userMood}>
          {isAILoading ? $t('aipanel.loading') : $t('aipanel.recommending')}
        </button>
      {:else}
        <div class="ai-result" in:fade>
          <p>{aiRecommendation.message}</p>
          <button class="main-btn" on:click={applyAIRecommendation}>
            {@html $t('aipanel.acceptPractice')}
          </button>
        </div>
      {/if}

      <button class="close-lite" on:click={() => (showAIModal = false)}
        >{@html $t('aipanel.close')}</button
      >
    </div>
  </div>
{:else}
  <button 
    on:click={onShowPanel} 
    style="cursor: pointer">
    {@html $t('aipanel.mindStream')}
  </button>
{/if}

<style>
  .ai-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .ai-spark {
    font-size: 1.5rem;
    filter: drop-shadow(0 0 10px #fbbf24);
  }

  .ai-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(129, 140, 248, 0.3);
    border-radius: 15px;
    color: white;
    padding: 15px;
    font-family: inherit;
    font-size: 0.9rem;
    margin-bottom: 20px;
    outline: none;
    resize: none;
  }
  .ai-input:focus {
    border-color: #818cf8;
    background: rgba(129, 140, 248, 0.1);
  }

  /* Стили overlay и modal должны быть идентичны App.svelte для бесшовности */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    z-index: 1000;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    backdrop-filter: blur(12px) brightness(0.5); /* Затемняем всё, что сзади */
    background: rgba(0, 0, 0, 0.7);
  }

  .modal.glass {
    /* 1. Делаем фон чуть светлее основного (Deep Navy) */
    background: linear-gradient(180deg, #111827 0%, #020617 100%);

    /* 2. Добавляем яркую верхнюю границу (золото или индиго) */
    border-top: 1px solid rgba(251, 191, 36, 0.4);

    /* 3. Внешнее свечение, чтобы "приподнять" модалку над фоном */
    box-shadow:
      0 -15px 50px -10px rgba(0, 0, 0, 0.8),
      0 -5px 20px -5px rgba(251, 191, 36, 0.15);

    /* Остальные параметры без изменений */
    width: 100%;
    max-width: 500px;
    border-radius: 32px 32px 0 0;
    padding: 30px 25px 40px;
  }

  .modal {
    background: #0a0c1a;
    width: 100%;
    max-width: 500px;
    border-radius: 32px 32px 0 0;
    padding: 30px 25px 40px;
    box-shadow: 0 -10px 50px rgba(0, 0, 0, 0.5);
    touch-action: pan-y;
    position: relative;
  }

  .ai-btn {
    width: 100%;
    padding: 15px;
    font-size: 1rem;
  }
  .ai-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    filter: grayscale(1);
  }

  .ai-result p {
    font-size: 1rem;
    line-height: 1.5;
    color: #e2e8f0;
    margin-bottom: 25px;
    font-style: italic;
  }

  /* Адаптация под Bottom Sheet из прошлых шагов */
  .bottom-sheet {
    align-self: flex-end;
    border-radius: 32px 32px 0 0 !important;
    max-width: 100% !important;
    margin: 0;
  }

  .close-x {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    color: #94a3b8;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
  }

  .close-x:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .close-x:active {
    transform: scale(0.9);
  }

  /* Убираем старую кнопку, если она больше не нужна */
  .close-lite {
    display: none;
  }
  .input-wrapper {
    position: relative;
    margin-bottom: 20px;
  }

  .char-counter {
    position: absolute;
    bottom: 12px;
    right: 15px;
    font-size: 0.7rem;
    color: #64748b; /* Спокойный серый */
    font-family: monospace;
    pointer-events: none; /* Чтобы не мешал кликать по textarea */
    transition: color 0.2s ease;
  }

  /* Подсветка, когда лимит достигнут */
  .char-counter.limit {
    color: #fbbf24; /* Золотой цвет ETHER AI */
    font-weight: bold;
  }

  .ai-input {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(129, 140, 248, 0.3);
    border-radius: 15px;
    color: white;
    padding: 15px;
    padding-bottom: 30px; /* Место для счетчика */
    font-family: inherit;
    font-size: 0.9rem;
    outline: none;
    resize: none;
    box-sizing: border-box;
  }
</style>
