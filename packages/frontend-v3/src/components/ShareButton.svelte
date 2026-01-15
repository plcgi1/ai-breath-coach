<script>
  export let botUsername = 'YOUR_BOT_USERNAME'; // Замени на юзернейм своего бота без @
  export let text = 'Посмотри на это крутое приложение для практик!';

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
  <span>Поделиться</span>
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
</style>
