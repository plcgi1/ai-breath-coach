import { writable, get } from 'svelte/store';
import { haptic } from '../telegram.js';

const STORAGE_KEY = 'breathing_state';
const TIMER_INTERVAL = 1000; // ms

export const currentMood = writable('focus');
export const isBreathing = writable(false);
export const isPaused = writable(false);
export const currentPhase = writable('idle'); // inhale, holdIn, exhale, holdOut
export const phaseTimeLeft = writable(0);
export const currentRound = writable(1);

let timer = null;
let countdown = null;
let sessionQueue = [];
let currentSegmentIdx = 0;
let currentPhases = [];
let currentPhaseIdx = 0;

const buildPhases = (segment) => [
    { type: 'inhale', duration: segment.inhale },
    { type: 'holdIn', duration: segment.onHold },
    { type: 'exhale', duration: segment.exhale },
    { type: 'holdOut', duration: segment.outHold }
].filter(p => p.duration > 0);

export const breathingController = {
    setMood(mood) {
        currentMood.set(mood);
    },

    start(patterns) {
        if (!patterns || patterns.length === 0) return;
        sessionQueue = patterns;
        currentSegmentIdx = 0;
        isBreathing.set(true);
        isPaused.set(false);
        this.runSegment(0);
    },

    runSegment(idx) {
        if (idx >= sessionQueue.length) return this.stop();
        
        currentSegmentIdx = idx;
        const segment = sessionQueue[idx];
        currentRound.set(1);
        currentPhases = buildPhases(segment);
        currentPhaseIdx = 0;
        this.playNextPhase();
    },

    playNextPhase() {
        if (!get(isBreathing) || get(isPaused)) return;

        if (currentPhaseIdx >= currentPhases.length) {
            const nextR = get(currentRound) + 1;
            const segment = sessionQueue[currentSegmentIdx];
            
            if (nextR <= segment.rounds) {
                currentRound.set(nextR);
                currentPhaseIdx = 0;
                this.playNextPhase();
            } else {
                this.runSegment(currentSegmentIdx + 1);
            }
            return;
        }

        const active = currentPhases[currentPhaseIdx];
        currentPhase.set(active.type);
        
        if (get(phaseTimeLeft) <= 0) {
            phaseTimeLeft.set(active.duration);
        }

        this.startTimers();
    },

    startTimers() {
        this.clearTimers();
        
        countdown = setInterval(() => {
            phaseTimeLeft.update(n => {
                if (n <= 1) {
                    clearInterval(countdown);
                    return 0;
                }
                return n - 1;
            });
        }, TIMER_INTERVAL);

        timer = setTimeout(() => {
            currentPhaseIdx++;
            phaseTimeLeft.set(0);
            this.playNextPhase();
        }, get(phaseTimeLeft) * TIMER_INTERVAL);
    },

    pause() {
        if (!get(isBreathing) || get(isPaused)) return;
        isPaused.set(true);
        this.clearTimers();
        haptic('light');
    },

    resume() {
        if (!get(isPaused)) return;
        isPaused.set(false);
        this.playNextPhase();
        haptic('light');
    },

    stop() {
        isBreathing.set(false);
        isPaused.set(false);
        currentPhase.set('idle');
        phaseTimeLeft.set(0);
        this.clearTimers();
        haptic('success');
    },

    clearTimers() {
        if (timer) clearTimeout(timer);
        if (countdown) clearInterval(countdown);
    }
};