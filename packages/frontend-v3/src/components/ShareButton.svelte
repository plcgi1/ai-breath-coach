<script>
  import { t } from '../lib/i18n';
  import { CONFIG } from '../config.js';

  export let text = 'Посмотри на это крутое приложение для практик!';

  const botUsername = CONFIG.botName; // Замени на юзернейм своего бота без @

  function handleShare() {
    // Проверяем наличие Telegram WebApp SDK
    if (window.Telegram?.WebApp) {
      // Метод открывает выбор чата и вставляет инлайн-запрос
      // Если оставить строку пустой, просто откроется поиск чатов
      Telegram.WebApp.switchInlineQuery(text, ['users', 'groups', 'channels']);

      // Также можно вызвать легкую вибрацию
      if (Telegram.WebApp.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
    } else {
      // Резервный вариант для браузера
      const url = `https://t.me/share/url?url=https://t.me/${botUsername}&text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  }
</script>

<button class="share-btn glass" on:click={handleShare}>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line
      x1="15.41"
      y1="6.51"
      x2="8.59"
      y2="10.49"
    />
  </svg>
  <span>{@html $t('share.share')}</span>
</button>

<style>
  .share-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 12px 20px;
    border-radius: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    width: fit-content;
  }

  .share-btn:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.2);
  }

  .glass {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .share-btn {
    /* Сбрасываем стандартные и старые стили */
    background: none;
    border: none;
    outline: none;
    box-shadow: none;

    /* Сетка для nav-bar: иконка сверху, текст снизу */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    /* Размеры и отступы */
    flex: 1;
    height: 100%;
    padding: 0;
    gap: 4px;

    /* Цвета и шрифт */
    color: #94a3b8; /* Цвет неактивных табов */
    font-size: 0.65rem; /* Маленький текст как у остальных вкладок */
    font-weight: 500;

    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  /* SVG иконка */
  .share-btn svg {
    width: 24px; /* Стандартный размер для иконок меню */
    height: 24px;
    margin-bottom: 2px;
    stroke: currentColor;
    transition: transform 0.2s ease;
  }

  /* Эффект при нажатии */
  .share-btn:active {
    transform: scale(0.9);
    opacity: 0.7;
  }

  /* Опционально: если хочешь выделить кнопку золотистым цветом */
  .share-btn {
    color: #fbbf24;
  }

  /* Убираем старые glass-эффекты, если они были в глобальных стилях */
  :global(.share-btn.glass) {
    background: none !important;
    border: none !important;
    backdrop-filter: none !important;
  }
</style>
