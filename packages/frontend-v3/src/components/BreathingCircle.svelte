<script>
  import { session } from '../lib/store/session';
  export let startExercise;
  export let stopExercise;

  $: scale = $session.phase === 'Вдох' ? 1.25 : $session.phase === 'Выдох' ? 1.0 : 1.15;
</script>

<section class="visualizer-area">
  <div class="breath-circle" style="transform: scale({scale})">
    <div class="glow"></div>
    <div class="content">
      <div class="timer">{$session.timer || 0}</div>
      <div class="phase">{$session.phase}</div>
    </div>
  </div>

  <div class="description-container">
    {#if !$session.isRunning && $session.tech.description}
      <p class="desc-text">{$session.tech.description}</p>
    {/if}
  </div>

  <div class="actions">
    {#if !$session.isRunning}
      <button class="main-btn" on:click={startExercise}>Путешествие</button>
    {:else}
      <button class="stop-btn" on:click={stopExercise}>Прервать</button>
    {/if}
  </div>
</section>

<style>
  .visualizer-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .breath-circle {
    width: 150px;
    height: 150px;
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
    margin-top: 80px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    align-items: center;
  }

  .main-btn {
    background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
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

  .description-container {
    margin-top: 30px;
    height: 60px; /* Фиксируем высоту, чтобы кнопка не прыгала */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 40px;
    text-align: center;
  }

  .desc-text {
    color: #a5b4fc;
    font-size: 0.9rem;
    line-height: 1.4;
    opacity: 0.8;
    margin: 0;
    /* Анимация появления */
    animation: fadeIn 0.4s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 0.8;
      transform: translateY(0);
    }
  }
</style>
