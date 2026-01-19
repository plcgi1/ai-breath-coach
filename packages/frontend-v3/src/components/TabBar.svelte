<script>
  import { t } from '../lib/i18n';
  import ShareButton from './ShareButton.svelte';
  export let switchTab;
  export let activeTab = 'home';
</script>

<nav class="tab-bar">
  <button class:active={activeTab === 'home'} on:click={() => switchTab('home')}>
    <span class="nav-icon">🧘</span>
    <span>{@html $t('tabbar.main')}</span>
  </button>

  <div class="actions-row">
    <ShareButton />
  </div>

  <button class:active={activeTab === 'library'} on:click={() => switchTab('library')}>
    <span class="nav-icon">📚</span>
    <span>{@html $t('tabbar.practices')}</span>
  </button>
</nav>

<style>
  .tab-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-around;
    padding-bottom: env(safe-area-inset-bottom);
    z-index: 100;
  }

  .tab-bar button {
    background: none;
    border: none;
    color: #94a3b8;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    gap: 4px;
    transition: 0.2s;
  }

  .tab-bar button.active {
    color: #6366f1;
    border: #a5b4fc;
  }
</style>
