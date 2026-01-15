<script>
  import { onMount } from 'svelte';
  import { launchConfetti } from './lib/confetti.js';
  import { CONFIG } from './config.js';
  import { api } from './lib/api';
  import { handleTouchStart, handleTouchMove, handleTouchEnd } from './lib/touch';
  import { session, selectedTech } from './lib/store/session';
  import AIPanel from './components/AIPanel.svelte';
  import Paywall from './components/Paywall.svelte';
  import Stats from './components/Stats.svelte';
  import ShareButton from './components/ShareButton.svelte';
  import { i18n, t } from './lib/i18n';
  import { initTelegram } from './lib/telegram.js';

  let data = { techniques: [], user: { purchased: [] } };
  let stats = { total: 0, today: 0, history: [] };
  let loading = true;
  let showPaywall = false;
  let showStats = false;

  let timerInterval;

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
    stats = await api.getStats();
    $selectedTech = data.techniques[0];
    loading = false;
  });

  async function startExercise() {
    const index = data.techniques.findIndex((t) => t.slug === $selectedTech.slug);
    const isLocked = index >= 3 && !data.user.purchased.includes($selectedTech.slug);
    if (isLocked) {
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

  function handlePaymentSuccess(slug) {
    // Обновляем локальные данные
    data.user.purchased = [...data.user.purchased, slug];
    showPaywall = false;
    // Можно запустить красивую анимацию конфетти здесь!
    launchConfetti();
  }

  function handleSelect(tech) {
    if ($session.isRunning) return;

    // Проверяем: это одна из первых 3-х или она есть в купленных?
    const isFree = data.techniques.indexOf(tech) < 3;
    const isPurchased = data.user.purchased.includes(tech.slug);

    if (isFree || isPurchased) {
      $selectedTech = tech;
    } else {
      // Если не куплено — открываем Paywall для этой конкретной техники
      $selectedTech = tech;
      showPaywall = true;
    }
  }

  $: scale =
    $session.phase === i18n('homepage.inhale')
      ? 1.25
      : $session.phase === i18n('homepage.exhale')
        ? 1.0
        : 1.15;
</script>

<main class="nebula">
  {#if loading}
    <div class="center">Загрузка...</div>
  {:else}
    <header>
      <button on:click={() => (showStats = true)} class="glass-btn">📈</button>

      <div class="logo">
        ETHER <span style="color: #fbbf24">AI</span>
      </div>

      <button on:click={() => (showPaywall = true)} class="stars-btn">99 ⭐</button>
    </header>

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
          <button class="main-btn" on:click={startExercise}>{@html $t('homepage.journey')}</button>

          <div class="ai-trigger-container">
            <AIPanel
              techniques={data.techniques}
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
      <div class="scroll-wrapper">
        <div class="slots-scroll">
          {#each data.techniques as tech}
            {@const isFree = data.techniques.indexOf(tech) < 3}
            {@const isPurchased = data.user.purchased.includes(tech.slug)}
            {@const isLocked = !isFree && !isPurchased}
            <button
              class="slot {$selectedTech.slug === tech.slug ? 'active' : ''} {isLocked
                ? 'locked'
                : ''}"
              on:click={() => handleSelect(tech)}
            >
              <span class="icon">{tech.icon}</span>

              {#if isLocked}
                <div class="lock-overlay">
                  <span class="lock-icon">🔒</span>
                </div>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </footer>
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

  <div class="actions-row">
    <ShareButton
      botUsername="my_cool_yoga_bot"
      text="Я использую это приложение для дыхательных практик. Присоединяйся! 🧘‍♂️"
    />
  </div>
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
    overflow: hidden; /* Контент внутри не должен толкать экран */
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
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

  .glass-btn {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 10px 14px;
    color: white;
    cursor: pointer;
    transition: 0.2s;
  }
  .glass-btn:active {
    background: rgba(255, 255, 255, 0.15);
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

  footer {
    background: rgba(10, 15, 30, 0.8);
    backdrop-filter: blur(25px);
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    padding: 15px 15px;
  }

  .slot {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 22px;
    font-size: 1.5rem;
    position: relative;
    transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: pointer;
  }

  .slot.active {
    border-color: #818cf8;
    background: rgba(99, 102, 241, 0.25);
    transform: translateY(-8px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
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

  .actions-row {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }

  footer {
    width: 100%;
    padding: 15px 0;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(15px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .scroll-wrapper {
    width: 100%;
    overflow: hidden;
    /* Мягкое затухание по краям, чтобы было видно, что можно скроллить */
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

  /* Скрываем полосу прокрутки */
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
    position: relative; /* Обязательно для позиционирования замка */
    scroll-snap-align: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }

  .slot.active {
    background: rgba(99, 102, 241, 0.2);
    border-color: #6366f1;
    transform: scale(1.1) translateY(-5px);
  }

  .lock-overlay {
    position: absolute;
    top: -7px; /* Выносим за пределы кнопки вверх */
    right: -7px; /* Выносим за пределы кнопки вправо */
    background: #fbbf24; /* Золотой фон */
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #0f172a; /* Темная обводка, чтобы отделять от фона */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    z-index: 2;
  }

  /* Эмодзи замка внутри бейджа */
  .lock-icon {
    font-size: 0.7rem;
    line-height: 1;
    filter: none !important; /* Отменяем grayscale родителя */
  }

  /* Скрываем скроллбар */
  .slots-scroll::-webkit-scrollbar {
    display: none;
  }

  .icon {
    font-size: 1.6rem;
  }
</style>
