<script>
  export let techniques = [];
  export let selectedSlug = '';
  export let purchasedSlugs = [];
  export let onSelect; // Callback функция при клике

  // Вспомогательная функция для определения статуса (как в App.svelte)
  function getStatus(tech, index) {
    if (index < 3) return 'free';
    if (purchasedSlugs.includes(tech.slug)) return 'paid';
    return 'locked';
  }
</script>

<div class="scroll-wrapper">
  <div class="slots-scroll">
    {#each techniques as tech, i}
      {@const status = getStatus(tech, i)}
      <button
        class="slot {selectedSlug === tech.slug ? 'active' : ''} {status === 'locked'
          ? 'locked'
          : ''}"
        on:click={() => onSelect(tech)}
      >
        <span class="icon">{tech.icon}</span>

        {#if status === 'locked'}
          <div class="lock-overlay">
            <span class="lock-icon">🔒</span>
          </div>
        {:else if status === 'paid' && i >= 3}
          <div class="status-badge success">✅</div>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .scroll-wrapper {
    width: 100%;
    overflow: hidden;
    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  }

  .slots-scroll {
    display: flex;
    gap: 14px;
    padding: 15px 40px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
  }

  .slots-scroll::-webkit-scrollbar {
    display: none;
  }

  .slot {
    flex: 0 0 65px;
    height: 65px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid transparent;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    scroll-snap-align: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    flex-shrink: 0;
  }

  .slot.active {
    background: rgba(99, 102, 241, 0.2);
    border-color: #6366f1;
    transform: scale(1.1) translateY(-5px);
  }

  .lock-overlay,
  .status-badge {
    position: absolute;
    top: -7px;
    right: -7px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #0f172a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    z-index: 2;
  }

  .lock-overlay {
    background: #fbbf24;
  }
  .status-badge.success {
    background: #10b981;
    font-size: 0.6rem;
  }

  .lock-icon {
    font-size: 0.7rem;
    line-height: 1;
  }
  .icon {
    font-size: 1.6rem;
  }

  .slot.locked .icon {
    opacity: 0.5;
    filter: grayscale(0.8);
  }
</style>
