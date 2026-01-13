<script>
    import { currentMood, currentPhase, phaseTimeLeft, isPaused, isBreathing, breathingController } from '../lib/stores/breathing.js';
    import { FALLBACK_TECHNIQUES } from '../lib/data/fallbackTechniques.js';
    import { haptic } from '../lib/telegram.js';
    import { i18n } from "../lib/i18n";
    
    let silenceAudio;

    const moodColors = {
        focus: 'from-indigo-400 to-purple-500',
        calm: 'from-rose-400 to-pink-500',
        energy: 'from-amber-400 to-orange-500'
    };

    const phaseLabels = {
        idle: i18n('breathingCircle.idle'),
        inhale: i18n('breathingCircle.inhale'),
        holdIn: i18n('breathingCircle.holdIn'),
        exhale: i18n('breathingCircle.exhale'),
        holdOut: i18n('breathingCircle.holdOut')
    };
    
    function getTechniqueForMood(moodId) {
        return FALLBACK_TECHNIQUES.find(t => t.slug === moodId) || FALLBACK_TECHNIQUES[0];
    }

    function convertTechniqueToPattern(tech) {
        return {
            inhale: tech.inhale || 4,
            onHold: tech.onHold || 0,
            exhale: tech.exhale || 4,
            outHold: tech.outHold || 0,
            rounds: tech.rounds || 5
        };
    }

    function handleToggle() {
        haptic('medium');
        if (!$isBreathing) {
            const tech = getTechniqueForMood($currentMood);
            const pattern = convertTechniqueToPattern(tech);
            breathingController.start([pattern]);
        } else if ($isPaused) {
            breathingController.resume();
        } else {
            breathingController.pause();
        }
    }
    
    $: colorClass = moodColors[$currentMood] || moodColors.stress;
    $: circleScale = $currentPhase === 'inhale' ? 'scale-125' : 'scale-100';
    $: transitionSpeed = $isPaused ? '0s' : `${$phaseTimeLeft}s`;
</script>
<!-- Бесшумный звук - для воспроизведения пиков при выключенном мобильном экране -->
<audio
    bind:this={silenceAudio}
    loop
    src="data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjIwLjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWEAAAAATGF2YzU4LjM1AAAAAAAAAAAAAAAAJAAAAAAAAAAAASAAK88AAAAAAAAD/84QAIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//OEBgAAAAA0gAAAAAAAAS8AAAAABAAALwAAAAAAAAAAAAAA"
></audio>

<div class="relative flex flex-col items-center">
    <button
        on:click={handleToggle}
        class="w-48 h-48 rounded-full transition-transform ease-in-out {circleScale}"
        style="transition-duration: {transitionSpeed};"
    >
        <div class="text-white">
            {#if !$isBreathing} СТАРТ 
            {:else if $isPaused} ПАУЗА
            {:else} {$phaseTimeLeft}
            {/if}
        </div>
    </button>

    {#if $isBreathing}
        <button on:click={() => breathingController.stop()} class="mt-8 opacity-50 text-xs">
            СТОП (СБРОСИТЬ)
        </button>
    {/if}
</div>