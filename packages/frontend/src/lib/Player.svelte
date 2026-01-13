<script>
    export let t;
    let phase = 'inhale'; // inhale, hold, exhale

    // Простая логика анимации фаз (для примера)
    let timer = setInterval(() => {
        if (phase === 'inhale') phase = 'hold';
        else if (phase === 'hold') phase = 'exhale';
        else phase = 'inhale';
    }, 4000);
</script>

<div class="player-container">
    <div class="circle {phase}">
        <span class="phase-text">{t[phase]}</span>
    </div>

    <div class="timer">02:45</div>
</div>

<style>
    .player-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 60vh;
    }

    .circle {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        background: rgba(74, 144, 226, 0.2);
        border: 4px solid #4a90e2;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 4s ease-in-out;
    }

    /* Анимация круга */
    .inhale {
        transform: scale(1.4);
        background: rgba(74, 144, 226, 0.4);
    }
    .hold {
        transform: scale(1.4);
        background: rgba(155, 81, 224, 0.4);
        border-color: #9b51e0;
    }
    .exhale {
        transform: scale(1);
        background: rgba(74, 144, 226, 0.1);
    }

    .phase-text {
        font-size: 20px;
        font-weight: bold;
        color: #333;
    }
    .timer {
        margin-top: 50px;
        font-size: 32px;
        font-family: monospace;
        color: #888;
    }
</style>
