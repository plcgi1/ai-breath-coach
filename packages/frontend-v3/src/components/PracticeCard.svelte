<script>
  export let tech;
  export let isActive = false;
  export let onSelect;
  export let onStart;

  // $: status = tech.status === 'unlocked' ? 'paid' : 'locked';
</script>

<div class="card {isActive ? 'active' : ''}" on:click={() => onSelect(tech)}>
  <div class="icon-box">
    <span class="icon">{tech.icon}</span>
    {#if tech.status === 'locked'}
      <div class="lock-badge">⭐️ 45</div>
    {/if}
  </div>

  <div class="info">
    <h4>{tech.name}</h4>
    <p>{tech.description}</p>
  </div>

  <div class="actions">
    {#if tech.status === 'unlocked'}
      <button class="start-btn" on:click|stopPropagation={() => onStart(tech)}> ▶ </button>
    {:else}
      <button class="buy-btn">Купить</button>
    {/if}
  </div>
</div>

<style>
  .card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 18px;
    padding: 12px;
    margin-bottom: 10px;
    transition: all 0.2s;
  }
  .card.active {
    background: rgba(99, 102, 241, 0.1);
    border-color: #6366f1;
  }
  .icon-box {
    position: relative;
    width: 50px;
    height: 50px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }
  .lock-badge {
    position: absolute;
    bottom: -5px;
    right: -5px;
    background: #fbbf24;
    color: #000;
    font-size: 0.6rem;
    font-weight: 800;
    padding: 2px 4px;
    border-radius: 4px;
  }
  .info {
    flex: 1;
  }
  .info h4 {
    margin: 0;
    font-size: 0.9rem;
    color: #fff;
  }
  .info p {
    margin: 2px 0 0;
    font-size: 0.75rem;
    color: #94a3b8;
    line-height: 1.2;
  }

  .start-btn,
  .buy-btn {
    border: none;
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
  }
  .start-btn {
    background: #6366f1;
    color: white;
  }
  .buy-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
</style>
