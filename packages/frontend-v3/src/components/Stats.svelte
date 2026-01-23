<script>
  import { fly, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { t } from '../lib/i18n';
  import { todayStats, stats } from '../lib/store/stats';
  export let show = false;

  export let handleTouchStart;
  export let handleTouchMove;
  export let handleTouchEnd;
</script>

<div class="overlay" on:click={() => (show = false)} transition:fade={{ duration: 250 }}>
  <div
    class="modal glass"
    on:click|stopPropagation
    transition:fly={{ y: 500, duration: 600, easing: quintOut }}
    on:touchstart={handleTouchStart}
    on:touchmove={handleTouchMove}
    on:touchend={() => handleTouchEnd(() => (show = false))}
  >
    <h3>{@html $t('stats.yourEnergy')}</h3>
    <div class="stats-grid">
      <div class="stat-item">
        <small>{@html $t('stats.today')}</small>
        <b>{$todayStats}</b>
      </div>
      <div class="stat-item">
        <small>{@html $t('stats.total')}</small>
        <b>{$stats.length}</b>
      </div>
    </div>

    <div class="history">
      <p>{@html $t('stats.recentPractices')}</p>
      {#each $stats as item}
        <div class="history-row">
          <span>{item.technique.icon} {item.technique.slug}</span>
          <span
            >{new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}</span
          >
        </div>
      {:else}
        <small>{@html $t('stats.noHistory')}</small>
      {/each}
    </div>

    <button class="close-lite" on:click={() => (show = false)}>{@html $t('stats.close')}</button>
  </div>
</div>

<style>
  .overlay {
    align-items: center;
    padding: 20px;

    position: fixed;
    inset: 0; /* Растягиваем на весь экран */
    background: rgba(0, 0, 0, 0.8);
    z-index: 999; /* Максимальный приоритет */
    display: flex;
    justify-content: center;
    backdrop-filter: blur(10px);
    pointer-events: auto; /* Убеждаемся, что клики ловятся */

    /*align-items: flex-end; /* Важно: прижимаем к низу */
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
  }
  .modal {
    background: #0a0c1a;
    border: 1px solid #312e81;
    padding: 35px;
    border-radius: 35px;
    width: 100%;
    max-width: 340px;
    text-align: center;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
    padding: 30px 25px;
    touch-action: pan-y;
  }
  .modal::before {
    content: '';
    display: block;
    width: 40px;
    height: 5px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    margin: -12px auto 20px auto; /* Поднимаем чуть выше над контентом */
  }

  .stats-grid {
    display: flex;
    justify-content: space-around;
    margin: 30px 0;
  }
  .stat-item {
    display: flex;
    flex-direction: column;
  }
  .stat-item small {
    color: #94a3b8;
    text-transform: uppercase;
    font-size: 0.65rem;
    letter-spacing: 1.5px;
  }
  .stat-item b {
    font-size: 2.2rem;
    color: #818cf8;
    text-shadow: 0 0 15px rgba(129, 140, 248, 0.4);
  }

  .history {
    text-align: left;
    background: rgba(255, 255, 255, 0.04);
    padding: 20px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    /* v1 */
    text-align: left;
    background: rgba(255, 255, 255, 0.04);
    padding: 20px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    /* Скролл и высота */
    max-height: 260px;
    overflow-y: auto;
    /* Эффект затухания (маска) */
    -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
    /* Для того чтобы маска работала корректно при скролле */
    mask-size: 100% 100%;
    mask-repeat: no-repeat;
    /* Настройки скроллбара */
    scrollbar-width: thin;
    scrollbar-color: rgba(129, 140, 248, 0.5) transparent;
  }
  .history::-webkit-scrollbar {
    width: 0px;
  }
  .history p {
    margin: 0 0 12px 0;
    font-size: 0.75rem;
    color: #818cf8;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .history-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 0.95rem;
  }

  .close-lite {
    margin-top: 25px;
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    text-decoration: underline;
    font-size: 0.85rem;
  }
</style>
