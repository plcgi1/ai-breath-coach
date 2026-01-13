<script>
    export let t;
    export let isLoading;

    function handleSubscribe() {
        // Вызов нативной функции Telegram для платежей
        window.Telegram?.WebApp?.MainButton.setText(t.pay_button);
        window.Telegram?.WebApp?.MainButton.show();
        // В реальности здесь будет вызов вашего бэкенда для создания инвойса
    }
</script>

<div class="paywall-container">
    <div class="icon">💎</div>
    <h2>{t.pay_title}</h2>
    <p class="desc">{t.pay_desc}</p>

    <ul class="features">
        <li>✅ Безлимитный ИИ-тренер</li>
        <li>✅ Все дыхательные техники</li>
        <li>✅ Подробная аналитика стресса</li>
    </ul>

    <button class="pay-btn" disabled={isLoading} on:click={handleSubscribe}>
        {isLoading ? '...' : t.pay_button}
    </button>
</div>

<style>
    .paywall-container {
        padding: 10px;
        text-align: center;
    }
    .icon {
        font-size: 60px;
        margin-bottom: 10px;
    }
    .desc {
        color: #666;
        margin-bottom: 25px;
    }
    .features {
        text-align: left;
        list-style: none;
        padding: 0;
        margin: 20px auto;
        max-width: 250px;
    }
    .features li {
        margin-bottom: 10px;
        font-size: 15px;
    }
    .pay-btn {
        width: 100%;
        background: #0088cc;
        color: white;
        border: none;
        padding: 18px;
        border-radius: 16px;
        font-size: 18px;
        font-weight: bold;
        box-shadow: 0 4px 15px rgba(0, 136, 204, 0.3);
    }
    .pay-btn:active {
        transform: scale(0.98);
    }
</style>
