<script>
    export let t;
    export let onPayClick;
    export let onStatsClick;
</script>

<header>
    <div class="user-row">
        <h1>{t.welcome}</h1>
        <button class="icon-btn" on:click={onStatsClick}>📊</button>
    </div>
    <button class="pro-badge" on:click={onPayClick}>
        {t.buy_pro}
    </button>
</header>

<style>
    header {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .user-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    h1 {
        font-size: 24px;
        margin: 0;
        color: #222;
    }
    .icon-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
    }
    .pro-badge {
        background: linear-gradient(90deg, #ffcf33, #ff9233);
        color: white;
        border: none;
        padding: 10px;
        border-radius: 12px;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 4px 10px rgba(255, 146, 51, 0.3);
    }
</style>
