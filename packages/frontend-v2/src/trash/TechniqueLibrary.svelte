<script>
    import { createEventDispatcher } from 'svelte';
    import { api } from '../lib/api.js';
    import { user } from '../lib/stores/user.js';
    import { haptic, tg } from '../lib/telegram.js';
    
    const dispatch = createEventDispatcher();
    
    const freeTechniques = [
        { slug: 'box-breathing', name: 'Квадратное дыхание', icon: '📦', desc: 'Баланс и спокойствие', color: 'from-blue-400 to-purple-500' },
        { slug: 'relaxing-478', name: '4-7-8 Расслабление', icon: '😌', desc: 'Снятие стресса', color: 'from-green-400 to-teal-500' },
        { slug: 'simple-deep', name: 'Глубокое дыхание', icon: '🌬️', desc: 'Для новичков', color: 'from-cyan-400 to-blue-500' }
    ];
    
    const proTechniques = [
        { slug: 'wim-hof', name: 'Метод Вим Хофа', icon: '❄️', desc: 'Энергия и иммунитет', price: 199, productId: 'technique_wim-hof', color: 'from-cyan-400 to-blue-600' },
        { slug: 'anti-panic', name: 'Антипаника 911', icon: '🆘', desc: 'При панических атаках', price: 99, productId: 'technique_anti-panic', color: 'from-red-400 to-pink-500' },
        { slug: 'sleep-pro', name: 'Глубокий сон PRO', icon: '🌙', desc: 'Засыпание за 10 минут', price: 149, productId: 'technique_sleep-pro', color: 'from-indigo-400 to-purple-600' },
        { slug: 'energizer', name: 'Энерджайзер', icon: '⚡', desc: 'Замена кофе', price: 99, productId: 'technique_energizer', color: 'from-orange-400 to-red-500' },
        { slug: 'coherent', name: 'Когерентное 365', icon: '💓', desc: 'Здоровье сердца', price: 99, productId: 'technique_coherent', color: 'from-pink-400 to-rose-500' }
    ];
    
    let selectedTechnique = null;
    let loading = false;
    
    async function selectTechnique(tech) {
        haptic('light');
        loading = true;
        
        const data = await api.getTechnique(tech.slug);
        
        if (data?.error === 'premium_required') {
            loading = false;
            dispatch('openPremium', { productId: tech.productId, price: tech.price });
            return;
        }
        
        selectedTechnique = { ...tech, ...data };
        loading = false;
    }
    
    async function buyTechnique(tech) {
        haptic('medium');
        
        if (!tg) {
            alert('Оплата доступна только в Telegram');
            return;
        }
        
        const result = await api.createInvoice($user.id, tech.productId);
        
        if (result.invoice_link) {
            tg.openInvoice(result.invoice_link, (status) => {
                if (status === 'paid') {
                    haptic('success');
                    selectTechnique(tech);
                }
            });
        }
    }
    
    function startPractice() {
        if (!selectedTechnique?.technique) return;
        dispatch('startPractice', selectedTechnique);
        selectedTechnique = null;
    }
    
    function closeModal() {
        selectedTechnique = null;
    }
</script>

<div class="px-4 py-4">
    <h2 class="text-lg font-bold mb-4">📚 Библиотека техник</h2>
    
    <!-- Free -->
    <div class="mb-6">
        <h3 class="text-sm font-semibold mb-3 opacity-60">🆓 БЕСПЛАТНЫЕ</h3>
        <div class="space-y-3">
            {#each freeTechniques as tech}
                <button
                    on:click={() => selectTechnique(tech)}
                    class="w-full bg-white/5 rounded-xl p-4 flex items-center gap-3 border border-white/10 active:scale-[0.99] transition-transform"
                >
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br {tech.color} flex items-center justify-center text-2xl">
                        {tech.icon}
                    </div>
                    <div class="flex-1 text-left">
                        <h4 class="font-bold">{tech.name}</h4>
                        <p class="text-xs opacity-60">{tech.desc}</p>
                    </div>
                    <span class="text-lg">→</span>
                </button>
            {/each}
        </div>
    </div>
    
    <!-- PRO -->
    <div class="mb-6">
        <h3 class="text-sm font-semibold mb-3 opacity-60 flex items-center gap-2">
            💎 ПРЕМИУМ
            <span class="px-2 py-0.5 rounded text-xs bg-gradient-to-r from-amber-500 to-orange-500">PRO</span>
        </h3>
        <div class="space-y-3">
            {#each proTechniques as tech}
                <div class="bg-white/5 rounded-xl p-4 flex items-center gap-3 border border-amber-500/30">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br {tech.color} flex items-center justify-center text-2xl">
                        {tech.icon}
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold">{tech.name}</h4>
                        <p class="text-xs opacity-60">{tech.desc}</p>
                    </div>
                    {#if $user.isPremium}
                        <button
                            on:click={() => selectTechnique(tech)}
                            class="px-3 py-1.5 rounded-lg bg-blue-500 text-sm"
                        >
                            Открыть
                        </button>
                    {:else}
                        <button
                            on:click={() => buyTechnique(tech)}
                            class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-sm font-bold"
                        >
                            {tech.price} ⭐
                        </button>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
</div>

<!-- Modal -->
{#if selectedTechnique}
    <div 
        class="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
        on:click={closeModal}
    >
        <div 
            class="w-full max-w-lg bg-gray-900 rounded-t-3xl p-6"
            on:click|stopPropagation
        >
            <div class="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4"></div>
            
            <div class="text-center mb-4">
                <span class="text-5xl mb-3 block">{selectedTechnique.icon}</span>
                <h3 class="text-xl font-bold">{selectedTechnique.name}</h3>
            </div>
            
            {#if selectedTechnique.description}
                <p class="text-sm opacity-80 mb-4 bg-white/5 rounded-xl p-4">
                    {selectedTechnique.description}
                </p>
            {/if}
            
            {#if selectedTechnique.technique}
                <div class="grid grid-cols-4 gap-2 mb-4 text-center">
                    <div class="bg-white/5 rounded-lg p-2">
                        <p class="text-lg font-bold">{selectedTechnique.technique.settings.inhale}</p>
                        <p class="text-xs opacity-60">Вдох</p>
                    </div>
                    <div class="bg-white/5 rounded-lg p-2">
                        <p class="text-lg font-bold">{selectedTechnique.technique.settings.holdIn || 0}</p>
                        <p class="text-xs opacity-60">Задерж.</p>
                    </div>
                    <div class="bg-white/5 rounded-lg p-2">
                        <p class="text-lg font-bold">{selectedTechnique.technique.settings.exhale}</p>
                        <p class="text-xs opacity-60">Выдох</p>
                    </div>
                    <div class="bg-white/5 rounded-lg p-2">
                        <p class="text-lg font-bold">{selectedTechnique.technique.settings.holdOut || 0}</p>
                        <p class="text-xs opacity-60">Пауза</p>
                    </div>
                </div>
                
                <button
                    on:click={startPractice}
                    class="w-full py-4 rounded-xl font-bold text-lg bg-blue-500"
                >
                    ▶️ Начать практику
                </button>
            {:else}
                <div class="text-center py-4">
                    <span class="text-2xl">⏳</span>
                    <p class="text-sm opacity-60">Загрузка...</p>
                </div>
            {/if}
        </div>
    </div>
{/if}