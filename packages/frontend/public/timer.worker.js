let interval = null;

self.onmessage = (e) => {
    if (e.data.action === 'start') {
        if (!interval) {
            interval = setInterval(() => self.postMessage({ type: 'tick' }), 1000);
        }
    } else if (e.data.action === 'pause' || e.data.action === 'stop') {
        clearInterval(interval);
        interval = null;
    }
};