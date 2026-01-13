<script>
    import { onMount, onDestroy, tick } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    import { apiService } from '../api.service.js';

    Chart.register(...registerables);

    export let t;
    
    let isLoading = true;
    let stats = [];
    let canvas;
    let chart;
    let aggregatedData = []; // Данные для стекового графика
    let techStats = [];      // Данные для списка техник под графиком
    let maxDaySessions = 1;

    // Конфигурация категорий и цветов
    const CATEGORIES = {
        calm: { color: '#0088cc', label: 'Успокоение' },
        focus: { color: '#34c759', label: 'Фокус' },
        energy: { color: '#ff9500', label: 'Энергия' },
        default: { color: '#8e8e93', label: 'Другое' }
    };

    // Определяем основную категорию по тегам
    function getTagKey(tags = []) {
        if (tags.includes('calm')) return 'calm';
        if (tags.includes('focus')) return 'focus';
        if (tags.includes('energy')) return 'energy';
        return 'default';
    }
    async function initChart() {
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - 6);
        isLoading = true
        try {
            const response = await apiService.getStatistics(300, dateFrom.toISOString().split('T')[0]);
            stats = response.data;
isLoading = false; 
            // 2. Ждем, пока Svelte обновит DOM (уберет лоадер и покажет canvas)
            await tick();   
            // 3. Проверяем, привязался ли canvas
            if (!canvas) {
                console.error("Canvas element not found");
                return;
            }

            // Подготовка меток (дней недели)
            const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
            const labels = [];
            const datasets = {
                calm: { label: 'Успокоение', data: [], backgroundColor: CATEGORIES.calm.color, borderRadius: 4 },
                focus: { label: 'Фокус', data: [], backgroundColor: CATEGORIES.focus.color, borderRadius: 4 },
                energy: { label: 'Энергия', data: [], backgroundColor: CATEGORIES.energy.color, borderRadius: 4 },
                default: { label: 'Другое', data: [], backgroundColor: CATEGORIES.default.color, borderRadius: 4 }
            };

            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                labels.push(days[d.getDay()]);

                const daySessions = stats.filter(s => s.createdAt.startsWith(dateStr));
                
                // Распределяем по категориям для этого дня
                ['calm', 'focus', 'energy', 'default'].forEach(key => {
                    const count = daySessions.filter(s => getTagKey(s.technique?.tags) === key).length;
                    datasets[key].data.push(count);
                });
            }

            if (chart) chart.destroy();

            chart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels,
                    datasets: Object.values(datasets)
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { stacked: true, grid: { display: false } },
                        y: { 
                            stacked: true, 
                            beginAtZero: true,
                            ticks: { precision: 0 } // Только целые числа
                        }
                    }
                }
            });
        } catch (e) {
            console.error('Stats error:', e);
        }
         isLoading = false; 
    }
    onMount(initChart);
    onDestroy(() => { if (chart) chart.destroy(); });
</script>

<div class="stats-container">
    <h2>{t.stats_title}</h2>

    {#if isLoading}
        <div class="loader-box">
            <div class="skeleton-loader"></div>
        </div>
    {:else if stats.length === 0}
        <div class="empty-state">
            <p>Вы еще не провели ни одной сессии. Начните практику прямо сейчас!</p>
        </div>
    {:else}
        <div class="stats-grid">
            <div class="stat-card">
                <span class="value">{stats.length}</span>
                <span class="label">Сессий</span>
            </div>
            <div class="stat-card">
                <span class="value">{Math.round(stats.length * 4)}м</span>
                <span class="label">Минут</span>
            </div>
        </div>

        <div class="chart-box">
            <canvas bind:this={canvas}></canvas>
        </div>

        <div class="legend">
            {#each Object.entries(CATEGORIES) as [id, cat]}
                <div class="legend-item">
                    <span class="dot {id}"></span>
                    <span>{cat.label}</span>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .stats-container {
        padding: 10px;
        color: var(--tg-text-color);
    }

    .stats-container { padding: 16px; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .stat-card { background: #f1f1f7; padding: 16px; border-radius: 20px; text-align: center; }
    .value { display: block; font-size: 24px; font-weight: 800; color: #0088cc; }
    .label { font-size: 12px; color: #8e8e93; }

    .chart-box {
        height: 220px; /* Фиксированная высота, Chart.js сам впишет данные */
        position: relative;
        margin-bottom: 16px;
    }

    .legend { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; }
    .dot { width: 10px; height: 10px; border-radius: 3px; }
    .dot.calm { background: #0088cc; }
    .dot.focus { background: #34c759; }
    .dot.energy { background: #ff9500; }
    .dot.default { background: #8e8e93; }

    .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 20px;
    }

    .stat-card {
        background: var(--tg-secondary-bg-color, #f1f1f1);
        padding: 16px;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .value { font-size: 24px; font-weight: 800; color: var(--tg-link-color); }
    .label { font-size: 11px; color: var(--tg-hint-color); text-transform: uppercase; margin-top: 4px; }

    .chart-section {
        background: var(--tg-secondary-bg-color, #f1f1f1);
        padding: 20px 10px;
        border-radius: 24px;
        margin-bottom: 24px;
    }

    .stacked-bar-chart {
        display: flex;
        justify-content: space-around;
        align-items: flex-end;
        height: 150px;
        padding-bottom: 10px;
    }

    .bar-column {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 32px;
    }

    .stack-container {
        display: flex;
        flex-direction: column-reverse;
        width: 14px;
        border-radius: 7px;
        overflow: hidden;
        background: rgba(0,0,0,0.05);
        min-height: 2px;
    }

    .bar-segment {
        width: 100%;
        height: var(--segment-height);
        transition: height 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        border-bottom: 1px solid rgba(255,255,255,0.15);
    }

    /* Цвета сегментов */
    .bar-segment.calm, .dot.calm { background-color: #0088cc; }
    .bar-segment.focus, .dot.focus { background-color: #34c759; }
    .bar-segment.energy, .dot.energy { background-color: #ff9500; }
    .bar-segment.default, .dot.default { background-color: #8e8e93; }

    .day-label { font-size: 10px; margin-top: 8px; color: var(--tg-hint-color); }
    .day-label.today { color: var(--tg-link-color); font-weight: bold; }

    .legend {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 16px;
        flex-wrap: wrap;
    }

    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }

    .tech-list { text-align: left; padding: 0 8px; }
    .tech-list h3 { font-size: 17px; margin-bottom: 16px; }

    .tech-row { margin-bottom: 20px; }
    .tech-info { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .name-wrapper { display: flex; align-items: center; gap: 10px; }
    .tech-name { font-size: 14px; font-weight: 500; }
    .tech-count { font-size: 14px; color: var(--tg-hint-color); }

    .progress-bg { height: 6px; background: rgba(0,0,0,0.05); border-radius: 3px; }
    .progress-fill { height: 100%; border-radius: 3px; transition: width 0.8s ease; }

    .empty-state { padding: 40px 20px; color: var(--tg-hint-color); }
    .skeleton-loader { 
        height: 200px; 
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 16px;
    }

    .stacked-bar-chart {
        display: flex;
        justify-content: space-around;
        align-items: flex-end;
        height: 180px; /* Фиксированная высота "окна" графика */
        padding-bottom: 10px;
    }

    .stack-container {
        display: flex;
        flex-direction: column-reverse;
        width: 16px;
        height: 100%; /* Контейнер занимает всю высоту .stacked-bar-chart */
        border-radius: 8px;
        overflow: hidden;
        background: rgba(0,0,0,0.03); /* Легкая подложка, чтобы видеть пустые дни */
        justify-content: flex-start; /* Начинаем строить сегменты снизу */
    }

    .bar-segment {
        width: 100%;
        /* Теперь переменная передает проценты, а не пиксели */
        height: var(--segment-height); 
        transition: height 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
</style>