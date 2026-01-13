<script>
    import { onMount, onDestroy } from 'svelte';

    // Пропсы для гибкости (можно передавать извне)
    export let settings = { inhale: 4, hold1: 0, exhale: 7, hold2: 8 };
    export let description = null;
    export let rounds = 2;
    export let isLoading = true;
    export let onFinish = () => {};

    // Состояние (Реактивно в Svelte)
    let state = 'stopped'; // stopped, playing, paused
    let currentRound = 1;
    let secondsInPhase = 0;
    let phase = 'inhale';
    let expansion = 1;

    // Ссылки на элементы
    let canvas;
    let ctx;
    let worker;
    let audioCtx;
    let silenceAudio;

    const labels = {
        ru: {
            inhale: 'Вдох',
            hold1: 'Задержка',
            exhale: 'Выдох',
            hold2: 'Пауза',
            start: 'СТАРТ',
            hint: 'нажми на сферу'
        },
        en: {
            inhale: 'Inhale',
            hold1: 'Hold',
            exhale: 'Exhale',
            hold2: 'Hold',
            start: 'START',
            hint: 'tap to start'
        }
    };

    // Определяем язык (упрощенно)
    let t = labels.ru;

    // Класс частицы (оставляем логику как в оригинале)
    class Particle {
        constructor(w, h) {
            this.reset();
        }
        reset() {
            this.angle = Math.random() * Math.PI * 2;
            this.dist = Math.random() * 80 + 60;
            this.size = Math.random() * 2 + 0.5;
            this.speed = 0.002 + Math.random() * 0.005;
        }
        update(exp, isPaused) {
            if (!isPaused) this.angle += this.speed;
            this.currentDist = this.dist * exp;
        }
        draw(color, w, h) {
            const x = w / 2 + Math.cos(this.angle) * this.currentDist;
            const y = h / 2 + Math.sin(this.angle) * this.currentDist;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    let particles = [];

    onMount(() => {
        ctx = canvas.getContext('2d');
        resize();
        particles = Array.from({ length: 350 }, () => new Particle());

        // Инициализация воркера
        worker = new Worker('./timer.worker.js');
        worker.onmessage = (e) => {
            if (e.data.type === 'tick') handleTick();
        };

        // Анимационный цикл
        let frame = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(frame);
            worker.terminate();
            if (audioCtx) audioCtx.close();
        };
    });

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function playBell(freq) {
        if (state !== 'playing') return;
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
    }

    function handleTick() {
        if (state !== 'playing') return;
        secondsInPhase++;

        const duration = settings[phase];
        if (secondsInPhase >= duration) {
            if (phase === 'inhale') phase = 'hold1';
            else if (phase === 'hold1') phase = 'exhale';
            else if (phase === 'exhale') phase = 'hold2';
            else if (phase === 'hold2') {
                if (currentRound < rounds) {
                    currentRound++;
                    phase = 'inhale';
                } else {
                    stopSession();
                    onFinish();
                    return;
                }
            }
            secondsInPhase = 0;
            const freqs = { inhale: 880, hold1: 440, exhale: 220, hold2: 440 };
            playBell(freqs[phase]);
        }
    }

    function render() {
        ctx.fillStyle = 'rgba(5, 5, 16, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let color = 'rgba(255, 255, 255, 0.3)';
        const isPaused = state === 'paused';

        if (state === 'playing') {
            const targetScale = phase === 'inhale' ? 2.2 : phase === 'exhale' ? 0.7 : 1.4;
            expansion += (targetScale - expansion) * 0.02;
            color = phase === 'inhale' ? '#248bed' : phase === 'exhale' ? '#4caf50' : '#ff9800';
        } else {
            expansion += (1.0 - expansion) * 0.05;
            color = '#ffffff';
        }

        particles.forEach((p) => {
            p.update(expansion, isPaused);
            p.draw(color, canvas.width, canvas.height);
        });
        requestAnimationFrame(render);
    }

    function startSession() {
        console.info('state', state);
        if (state === 'stopped') {
            state = 'playing';
            silenceAudio.play();
            worker.postMessage({ action: 'start' });
            playBell(880);
        }
    }

    function togglePause() {
        if (state === 'playing') {
            state = 'paused';
            worker.postMessage({ action: 'pause' });
        } else {
            state = 'playing';
            worker.postMessage({ action: 'start' });
        }
    }

    function stopSession() {
        state = 'stopped';
        worker.postMessage({ action: 'stop' });
        silenceAudio.pause();
        silenceAudio.currentTime = 0;
        currentRound = 1;
        phase = 'inhale';
        secondsInPhase = 0;
    }    
</script>

<svelte:window on:resize={resize} />

<div class="nebula-wrapper">
    {#if isLoading}
        <div class="loading-state">
            <div class="spinner-large"></div>
            <p>Настраиваем ритм...</p>
        </div>
    {/if}
    {#if description}
            <div class="description-container">
                <p class="tech-description">{description}</p>
            </div>
    {/if}
    <canvas 
        bind:this={canvas} 
        on:click={startSession} 
        class:clickable={state === 'stopped'}></canvas>

    <div class="ui-layer">
        
        <div class="timer-num">
            {state === 'stopped' ? t.start : settings[phase] - secondsInPhase}
        </div>
        <div class="phase-text">
            {state === 'stopped' ? t.hint : `${t[phase]} (${currentRound}/${rounds})`}
        </div>
    </div>

    {#if state !== 'stopped'}
        <div class="controls">
            <button class="btn" on:click={togglePause}>
                {state === 'paused' ? 'ПРОДОЛЖИТЬ' : 'ПАУЗА'}
            </button>
            <button class="btn btn-stop" on:click={stopSession}>СТОП</button>
        </div>
    {/if}
</div>

<audio
    bind:this={silenceAudio}
    loop
    src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWEAAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAAAAAAAAAAAASAAK88AAAAAAAAD/84QAIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//OEBgAAAAA0gAAAAAAAAS8AAAAABAAALwAAAAAAAAAAAAAA"
></audio>

<style>
    .loading-state {
        height: 60vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #8e8e93;
    }
    .description-container {
        /* Абсолютное позиционирование относительно player-wrapper */
        position: absolute;
        top: 40px; /* Отступ от самого верха экрана */
        left: 0;
        right: 0;
        
        /* Слой выше, чем у canvas (у которого обычно z-index: 1) */
        z-index: 10; 
        
        /* Центрирование контента */
        display: flex;
        justify-content: center;
        padding: 0 20px;
        
        /* Чтобы клики проходили сквозь текст на сферу (если нужно) */
        pointer-events: none;
    }

    .tech-description {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.2rem;
        line-height: 1.4;
        text-align: center;
        max-width: 300px;
        margin: 0;
        
        /* Тень, чтобы текст читался, когда под ним пролетают частицы */
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
        
        /* Если нужно, чтобы текст был жирнее или тоньше */
        font-weight: 300;
        font-style: italic;
    }
    .spinner-large {
        width: 40px;
        height: 40px;
        border: 3px solid #f2f2f7;
        border-top-color: var(--tg-link);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
    }
    .nebula-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        background-color: #050510;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;        
    }

    canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
    }

    .clickable {
        cursor: pointer;
    }

    .ui-layer {
        position: relative;
        z-index: 10;
        text-align: center;
        pointer-events: none;
        color: white;
    }

    .timer-num {
        font-size: 5rem;
        font-weight: 200;
        margin: 0;
    }
    .phase-text {
        font-size: 1.2rem;
        text-transform: uppercase;
        letter-spacing: 4px;
        opacity: 0.8;
    }

    .controls {
        position: absolute;
        bottom: 60px;
        z-index: 20;
        display: flex;
        flex-direction: column;
        gap: 15px;
        width: 220px;
    }

    .btn {
        padding: 16px;
        border-radius: 35px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
        color: white;
        cursor: pointer;
        backdrop-filter: blur(10px);
        font-size: 1rem;
        transition: background 0.2s;
    }

    .btn:active {
        background: rgba(255, 255, 255, 0.2);
    }

    .btn-stop {
        color: #ff4444;
        border-color: rgba(255, 68, 68, 0.3);
        margin-top: 10px;
    }
</style>
