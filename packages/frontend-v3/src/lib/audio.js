//     import { session } from './store/session';
// // тихая аудиодорожка для обхода политики автозапуска
//     let silentAudio;
//     let timerInterval;

//     function setupMediaSession() {
//         if ('mediaSession' in navigator) {
//             navigator.mediaSession.metadata = new MediaMetadata({
//                 title: 'ETHER AI: Breathing & Abundance',
//                 artist: 'Nebula',
//                 album: $session.tech?.name || 'Медитация',
//                 artwork: [
//                     { src: '512x512.png', sizes: '512x512', type: 'image/png' }
//                 ]
//             });

//             // Обработчики для пульта управления на заблокированном экране
//             navigator.mediaSession.setActionHandler('play', () => {
//                 if (!$session.isRunning) startExercise();
//             });
//             navigator.mediaSession.setActionHandler('pause', () => {
//                 stopExercise();
//             });
//         }
//     }

//     // Функция для инициализации "держателя" фона
//     function enableBackgroundAudio() {
//         if (!silentAudio) {
//             silentAudio = new Audio();
//             // Маленький base64 MP3 файл (1 секунда тишины)
//             silentAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
//             silentAudio.loop = true;
//         }
//         silentAudio.play().catch(e => console.log("Фоновый режим ожидает клика"));
//         setupMediaSession();
//     }
//     let audioCtx;
//     const playTone = (freq) => {
//         if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//         if (audioCtx.state === 'suspended') audioCtx.resume();
//         const osc = audioCtx.createOscillator();
//         const gain = audioCtx.createGain();
//         osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
//         gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
//         gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1);
//         osc.connect(gain); gain.connect(audioCtx.destination);
//         osc.start(); osc.stop(audioCtx.currentTime + 1);
//     };
//     async function startExercise() {
//         const isLocked = !selectedTech.is_free && !data.user.purchased_slugs.includes(selectedTech.slug);
//         if (isLocked) { showPaywall = true; return; }

//         // ЗАПУСКАЕМ ТИШИНУ ДЛЯ ФОНА
//         enableBackgroundAudio();

//         session.update(s => ({ ...s, isRunning: true, tech: selectedTech }));
//         for (const s of selectedTech.settings) {
//             for (let r = 0; r < s.rounds; r++) {
//                 if (!$session.isRunning) return;
//                 await runPhase('Вдох', s.inhale, 440);
//                 await runPhase('Задержка', s.holdIn, 554);
//                 await runPhase('Выдох', s.exhale, 330);
//                 if (s.holdOut > 0) await runPhase('Пауза', s.holdOut, 220);
//             }
//         }
//         api.logSession(selectedTech.slug);
//         stats = api.getStats();
//         scheduleReminder(); // Планируем уведомление после успеха
//         stopExercise();
//     }

//     async function runPhase(name, duration, freq) {
//         if (duration <= 0 || !$session.isRunning) return;
//         playTone(freq);
//         session.update(s => ({ ...s, phase: name, timer: duration }));
//         return new Promise(resolve => {
//             timerInterval = setInterval(() => {
//                 session.update(s => {
//                     if (s.timer <= 1 || !s.isRunning) {
//                         clearInterval(timerInterval);
//                         resolve();
//                         return { ...s, timer: 0 };
//                     }
//                     return { ...s, timer: s.timer - 1 };
//                 });
//             }, 1000);
//         });
//     }

//     function stopExercise() {
//         if (silentAudio) {
//             silentAudio.pause();
//         }
//         clearInterval(timerInterval);
//         session.set({ isRunning: false, phase: 'Завершено', timer: 0, tech: null });
//     }
// let audioCtx;
// let silentTag;

// export const initAudio = () => {
//     if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//     if (!silentTag) {
//         silentTag = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFRm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=");
//         silentTag.loop = true;
//         silentTag.play().catch(() => {});
//     }
//     if (audioCtx.state === 'suspended') audioCtx.resume();
// };

// const playCrystalTone = (freq) => {
//     const osc = audioCtx.createOscillator();
//     const gain = audioCtx.createGain();

//     osc.type = 'sine';
//     osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

//     gain.gain.setValueAtTime(0, audioCtx.currentTime);
//     gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.1);
//     gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

//     osc.connect(gain);
//     gain.connect(audioCtx.destination);
//     osc.start();
//     osc.stop(audioCtx.currentTime + 1.5);
// };

// export const sounds = {
//     inhale: () => { playCrystalTone(440); haptic('light'); },
//     hold: () => { playCrystalTone(554); haptic('medium'); },
//     exhale: () => { playCrystalTone(330); haptic('heavy'); }
// };

// function haptic(style) {
//     if (window.Telegram?.WebApp?.HapticFeedback) {
//         window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
//     }
// }
