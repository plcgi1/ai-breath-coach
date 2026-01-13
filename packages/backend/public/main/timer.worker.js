// timer.worker.js
let timerId = null;

self.onmessage = (e) => {
    if (e.data.action === 'start') {
        // Запускаем бесконечный цикл тиков
        timerId = setInterval(() => {
            self.postMessage({ type: 'tick' });
        }, 1000);
    } else if (e.data.action === 'stop') {
        clearInterval(timerId);
    }
};