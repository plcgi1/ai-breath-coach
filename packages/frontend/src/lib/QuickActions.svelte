<script>
    export let t;
    export let isLoading;
    export let onSelect;
</script>

<div class="grid">
    <button class="card orange" disabled={isLoading} on:click={() => onSelect('calm')}>
        <span class="icon">🔥</span>
        <span class="label">{t.burnout}</span>
    </button>

    <button class="card blue" disabled={isLoading} on:click={() => onSelect('energy')}>
        <span class="icon">🔋</span>
        <span class="label">{t.low_energy}</span>
    </button>

    <button class="card purple" disabled={isLoading} on:click={() => onSelect('focus')}>
        <span class="icon">🎤</span>
        <span class="label">{t.call}</span>
    </button>
</div>
<style>
    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        padding: 20px;
    }
    .card {
        border: none;
        border-radius: 28px;
        height: 130px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        gap: 8px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }
    .card:disabled {
        opacity: 0.6;
    }
    .orange {
        background: linear-gradient(135deg, #ff8c42, #f56038);
    }
    .blue {
        background: linear-gradient(135deg, #4a90e2, #357abd);
    }
    .purple {
        background: linear-gradient(135deg, #9b51e0, #7e3ff2);
        grid-column: span 2;
        height: 90px;
        flex-direction: row;
    }
    .icon {
        font-size: 32px;
    }
</style>
