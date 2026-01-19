<script>
  import { onMount } from 'svelte';
  import { launchConfetti } from './lib/confetti.js';
  import { CONFIG } from './config.js';
  import { api } from './lib/api';
  import { handleTouchStart, handleTouchMove, handleTouchEnd } from './lib/touch';
  import { session, selectedTech } from './lib/store/session';
  import { pricing } from './lib/store/pricing';
  import { techniques, sortedTechniques, lockedTechniques, unlockedTechniques } from './lib/store/techniques';
  import PracticeLibrary from './components/PracticeLibrary.svelte';
  import AIPanel from './components/AIPanel.svelte';
  import Paywall from './components/Paywall.svelte';
  import Stats from './components/Stats.svelte';
  import PracticeScroll from './components/PracticeScroll.svelte';

  import { i18n, t } from './lib/i18n';
  import { initTelegram } from './lib/telegram.js';
  import TabBar from './components/TabBar.svelte';

  let data = { techniques: [] };
  let stats = { total: 0, today: 0, history: [] };
  let loading = true;
  let showPaywall = false;
  let showStats = false;

  let activeTab = 'home'; // 'home' или 'library'
  let timerInterval;

  let scrollY = 0;

  // notification logic
  let notificationsEnabled = false;
  async function requestNotificationPermission() {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    notificationsEnabled = permission === 'granted';
    if (notificationsEnabled) {
      new Notification(CONFIG.appName, {
        body: 'Уведомления активированы. Мы напомним вам подышать.',
        icon: '/icon-192.png'
      });
    }
  }

  function scheduleReminder() {
    if (!notificationsEnabled) return;
    // Напоминание через 4 часа после практики
    const delay = 4 * 60 * 60 * 1000;
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification(`Время ${CONFIG.appName}`, {
          body: 'Пора восстановить энергию. Сделайте короткую практику.',
          icon: '/favicon.png'
        });
      }
    }, delay);
  }
  // END  notification logic

  // тихая аудиодорожка для обхода политики автозапуска
  let silentAudio;

  // Функция для инициализации "держателя" фона
  function enableBackgroundAudio() {
    if (!silentAudio) {
      silentAudio = new Audio();
      // Маленький base64 MP3 файл (1 секунда тишины)
      silentAudio.src =
        'data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
      silentAudio.loop = true;
    }
    silentAudio.play().catch((e) => console.log('Фоновый режим ожидает клика'));
    setupMediaSession();
  }
  // END тихая аудиодорожка для обхода политики автозапуска

  // Функция для управления метаданными и фоновым режимом - для поддержки Media Session API
  function setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: CONFIG.appFullName,
        artist: CONFIG.appName,
        album: $session.tech?.name || 'Медитация',
        artwork: [{ src: '512x512.png', sizes: '512x512', type: 'image/png' }]
      });

      // Обработчики для пульта управления на заблокированном экране
      navigator.mediaSession.setActionHandler('play', () => {
        if (!$session.isRunning) startExercise();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        stopExercise();
      });
    }
  }

  let audioCtx;
  const playTone = (freq) => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1);
  };

  onMount(async () => {
    initTelegram();
    data = await api.getData();
    $pricing = await api.getPricing();

    $techniques = data.techniques;

    stats = await api.getStats();
    $selectedTech = data.techniques[0];
    loading = false;
  });

  async function startExercise() {
    if ($selectedTech.status === 'locked') {
      showPaywall = true;
      return;
    }

    // ЗАПУСКАЕМ ТИШИНУ ДЛЯ ФОНА
    enableBackgroundAudio();

    session.update((s) => ({ ...s, isRunning: true, tech: selectedTech }));
    for (const s of $selectedTech.settings) {
      for (let r = 0; r < s.rounds; r++) {
        if (!$session.isRunning) return;
        await runPhase(i18n('homepage.inhale'), s.inhale, 440);
        await runPhase(i18n('homepage.holdIn'), s.holdIn, 554);
        await runPhase(i18n('homepage.exhale'), s.exhale, 330);
        if (s.holdOut > 0) await runPhase(i18n('homepage.holdOut'), s.holdOut, 220);
      }
    }
    await api.logSession($selectedTech.slug);
    stats = await api.getStats();
    scheduleReminder(); // Планируем уведомление после успеха
    stopExercise();
  }

  async function runPhase(name, duration, freq) {
    if (duration <= 0 || !$session.isRunning) return;
    playTone(freq);
    session.update((s) => ({ ...s, phase: name, timer: duration }));
    return new Promise((resolve) => {
      timerInterval = setInterval(() => {
        session.update((s) => {
          if (s.timer <= 1 || !s.isRunning) {
            clearInterval(timerInterval);
            resolve();
            return { ...s, timer: 0 };
          }
          return { ...s, timer: s.timer - 1 };
        });
      }, 1000);
    });
  }

  function stopExercise() {
    if (silentAudio) {
      silentAudio.pause();
    }
    clearInterval(timerInterval);
    session.set({
      isRunning: false,
      phase: i18n('homepage.areYouReady'),
      timer: 0,
      tech: null
    });
  }

  async function handlePaymentSuccess(slug) {
    showPaywall = false;
    data = await api.getData();
    techniques.set(data.techniques);
    launchConfetti();
  }

  function handleSelect(tech) {
    if ($session.isRunning) return;

    selectedTech.set(tech);

    const isPurchased = tech.status === 'unlocked';

    if (isPurchased) {
      showPaywall = false;
    } else {
      showPaywall = true;
    }
  }

  function handleStart(tech) {
    $selectedTech = tech;
    activeTab = 'home';
  }

  function onSelectLibrary(tech) {
    $selectedTech = tech;
    showPaywall = tech.status === 'locked';
  }

  function switchTab(tab) {
    activeTab = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  $: scale = (() => {
    let scale = 1.0;
    switch ($session.phase) {
      case i18n('homepage.inhale'):
        scale = 1.25;
        break;
      case i18n('homepage.holdIn'):
        scale = 1.25;
        break;
      case i18n('homepage.exhale'):
        scale = 1.0;
        break;
      case i18n('homepage.holdOut'):
        scale = 1.0;
        break;
      default:
        scale = 1.0;
    }
    return scale;
  })();

  $: isCompact = activeTab === 'library' && scrollY > 20;
</script>

<svelte:window bind:scrollY />
<main class="nebula">
  {#if loading}
    <div class="center">Загрузка...</div>
  {:else}
    <header class="sticky-header" class:shrunk={isCompact}>
      <button on:click={() => (showStats = true)} class="glass-btn">📈</button>

      <div class="logo">
        ETHER <span style="color: #fbbf24">AI</span>
      </div>

      <button on:click={() => (showPaywall = true)} class="stars-btn">99 ⭐</button>
    </header>
    {#if activeTab === 'home'}
      <section class="visualizer-area">
        <div class="breath-circle" style="transform: scale({scale})">
          <div class="glow"></div>
          <div class="content">
            <div class="timer">{$session.timer || 0}</div>
            <div class="phase">{$session.phase}</div>
          </div>
        </div>

        <div class="actions">
          {#if !$session.isRunning}
            <button class="main-btn" on:click={startExercise}>{@html $t('homepage.journey')}</button
            >

            <div class="ai-trigger-container">
              <AIPanel
                techniques={$sortedTechniques}
                {handleTouchStart}
                {handleTouchMove}
                {handleTouchEnd}
              />
            </div>
          {:else}
            <button class="stop-btn" on:click={stopExercise}>{@html $t('homepage.stop')}</button>
          {/if}
        </div>
      </section>

      <footer>
        <PracticeScroll
          techniques={$unlockedTechniques}
          selectedSlug={$selectedTech.slug}
          onSelect={handleSelect}
        />
      </footer>
    {:else}
      <PracticeLibrary
        techniques={$lockedTechniques}
        selectedSlug={$selectedTech.slug}
        onSelect={onSelectLibrary}
        onStart={handleStart}
      />
    {/if}
  {/if}

  {#if showStats}
    <Stats bind:show={showStats} {stats} {handleTouchStart} {handleTouchMove} {handleTouchEnd} />
  {/if}

  {#if showPaywall}
    <Paywall
      bind:show={showPaywall}
      {handleTouchStart}
      {handleTouchMove}
      {handleTouchEnd}
      onPaymentSuccess={handlePaymentSuccess}
    />
  {/if}

  <TabBar {switchTab} {activeTab} />
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background: #020617;
    color: white;
    user-select: none;

    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
  }

  .nebula {
    background: radial-gradient(circle at 50% 30%, #1e1b4b 0%, #080a1a 70%, #02040a 100%);
    height: 100vh;
    width: 100vw;
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;

    overflow-y: auto; /* Позволяем скролл всему приложению */
    -webkit-overflow-scrolling: touch; /* Плавный скролл для iOS */
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    letter-spacing: 4px;
    font-weight: 200;
    font-size: 0.9rem;
    opacity: 0.8;
    color: #818cf8;
  }

  .stars-btn {
    background: #fbbf24;
    color: #000;
    border: none;
    padding: 8px 18px;
    border-radius: 20px;
    font-weight: 800;
    box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
  }

  .visualizer-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: -70px;
    width: 100%;
  }

  .breath-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    /* Более яркая граница круга [cite: 58] */
    border: 3px solid rgba(99, 102, 241, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: transform 3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 50px rgba(99, 102, 241, 0.2);
    margin-bottom: 20px;
  }

  .glow {
    position: absolute;
    inset: -30px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 75%);
    border-radius: 50%;
    pointer-events: none;
  }

  .content {
    text-align: center;
    z-index: 2;
  }

  .timer {
    font-size: 4rem;
    font-weight: 150;
    line-height: 1;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }

  .phase {
    text-transform: uppercase;
    font-size: 0.6rem;
    letter-spacing: 3px;
    color: #a5b4fc;
    margin-top: 10px;
    font-weight: 500;
  }

  .actions {
    margin-top: 60px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    align-items: center;
  }

  .main-btn {
    background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
    border: none;
    padding: 10px 70px;
    border-radius: 40px;
    color: white;
    font-size: 1.2rem;
    font-weight: 700;
    /* Усиленное свечение кнопки [cite: 64] */
    box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
    cursor: pointer;
    transition: 0.2s;
    width: 255px;
  }
  .main-btn:active {
    transform: scale(0.96);
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
  }

  .stop-btn {
    background: linear-gradient(135deg, #ae0225 0%, #f214cd 100%);
    border: none;
    padding: 20px 70px;
    border-radius: 40px;
    color: white;
    font-size: 1.2rem;
    font-weight: 700;
    /* Усиленное свечение кнопки [cite: 64] */
    box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
    cursor: pointer;
    transition: 0.2s;
    width: 263px;
  }
  .stop-btn:active {
    background: rgba(239, 68, 68, 0.25);
  }

  .ai-trigger-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  :global(.ai-trigger-container .logo) {
    background: rgba(129, 140, 248, 0.1);
    border: 1px solid rgba(129, 140, 248, 0.2);
    padding: 12px 30px;
    border-radius: 20px;
    font-size: 0.8rem;
    transition: all 0.3s ease;
  }

  :global(.ai-trigger-container .logo:active) {
    transform: scale(0.95);
    background: rgba(129, 140, 248, 0.2);
  }

  footer {
    width: 100%;
    height: 170px;
    padding: 15px 0;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(15px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Стили твоих кнопок */
  .glass-btn,
  .stars-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 8px 12px;
    border-radius: 12px;
    font-weight: 600;
  }

  .stars-btn {
    border-color: #fbbf24;
    color: #fbbf24;
  }

  /* Стили логотипа для компактности в один ряд */
  .logo {
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: 1px;
    margin: 0 10px;
  }

  .glass-btn,
  .stars-btn {
    cursor: pointer;
    position: relative;
    z-index: 102;
    pointer-events: auto !important; /* Принудительно включаем клики */
  }

  .sticky-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: #0f172a;
    display: flex;
    flex-direction: row; /* Горизонтально */
    align-items: center;
    justify-content: space-between;
    padding: 5px 15px;
    /* Убираем pointer-events: none отсюда, если он мешает кликам */
    pointer-events: auto;
    transition: all 0.3s ease;
  }
  /* Если хедер shrunk, добавляем блюр */
  .sticky-header.shrunk {
    background: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(15px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
</style>
