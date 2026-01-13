<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import { user } from '../lib/stores/user.js';
    import { haptic } from '../lib/telegram.js';
    import { api } from '../lib/api.js';
    import { baseTechniques } from '../lib/stores/techniques.js';
    import { t, i18n } from "../lib/i18n.js";
    
    export let mood = 'stress';
    
    const dispatch = createEventDispatcher();
    
    let techniques = [];
    let loading = true;
    let currentView = 'all'; // 'all', 'free', 'premium'
    let showSlotSelector = false;
    let selectedTechForSlot = null;
    
    onMount(async () => {
        loadTechniques();
    });
    
    async function loadTechniques() {
        try {
            // Получаем все техники из store
            baseTechniques.subscribe(data => {
                if (data && Array.isArray(data)) {
                    techniques = data;
                } else {
                    // Fallback техники
                    techniques = [
                        { id: 'relaxing', name: '4-7-8', icon: '😌', premium: false, pattern: '4-7-8' },
                        { id: 'box', name: 'Квадрат', icon: '📦', premium: false, pattern: '4-4-4-4' },
                        { id: 'energizing', name: 'Энергия', icon: '⚡', premium: false, pattern: '2-0-2-0' },
                        { id: 'sleep', name: 'Сон', icon: '🌙', premium: false, pattern: '4-0-8-2' },
                        { id: 'wim', name: 'Вим Хоф', icon: '❄️', premium: true, pattern: '30 вдохов' },
                        { id: 'coherent', name: 'Когерентность', icon: '💓', premium: true, pattern: '6-0-6-0' },
                        { id: 'panic', name: 'Антипаника', icon: '🆘', premium: true, pattern: '2-0-8-1' }
                    ];
                }
            })();
        } catch (error) {
            console.error('Error loading techniques:', error);
            techniques = [
                { id: 'relaxing', name: '4-7-8', icon: '😌', premium: false, pattern: '4-7-8' },
                { id: 'box', name: 'Квадрат', icon: '📦', premium: false, pattern: '4-4-4-4' },
                { id: 'energizing', name: 'Энергия', icon: '⚡', premium: false, pattern: '2-0-2-0' }
            ];
        } finally {
            loading = false;
        }
    }
    
    // Фильтрация техник по типу
    $: filteredTechniques = techniques.filter(tech => {
        if (currentView === 'free') return !tech.premium;
        if (currentView === 'premium') return tech.premium;
        return true; // 'all'
    });
    
    function selectMode(tech) {
        haptic('light');
        
        if (tech.premium && !$user.isPremium) {
            dispatch('purchase');
            return;
        }
        
        dispatch('select', { mode: tech });
    }
    
    function close() {
        dispatch('close');
    }
    
    // Функция для изменения слота (доступна только для пользователей с правами)
    async function changeSlot(tech, slotIndex) {
        if ($user.isPremium) {
            try {
                const result = await api.updateSlot(slotIndex, tech.id);
                if (result.success) {
                    // Обновляем layout на клиенте или показываем уведомление
                    console.log(`Slot ${slotIndex} updated to technique ${tech.id}`);
                    dispatch('slotChanged', { slotIndex, technique: tech });
                    // Закрываем панель выбора слота
                    showSlotSelector = false;
                } else {
                    console.error('Failed to update slot:', result.error);
                }
            } catch (error) {
                console.error('Error updating slot:', error);
            }
        }
    }

    // Функция для отображения модального окна изменения слотов
    function showSlotChangeOptions(tech) {
        if ($user.isPremium) {
            selectedTechForSlot = tech;
            showSlotSelector = true;
        } else {
            selectMode(tech);
        }
    }
    
    // Закрыть модальное окно выбора слота
    function closeSlotSelector() {
        showSlotSelector = false;
        selectedTechForSlot = null;
    }
    
    // Подтвердить изменение слота
    function confirmSlotChange(slotIndex) {
        if (selectedTechForSlot) {
            changeSlot(selectedTechForSlot, slotIndex);
        }
    }
</script>

<div 
    class="fixed inset-0 bg-black/70 z-50 flex items-end justify-center"
    on:click={close}
>
    <div 
        class="w-full max-w-lg bg-gray-900 rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto"
        on:click|stopPropagation
    >
        <div class="w-12 h-1 bg-white/30 rounded-full mx-auto mb-4"></div>
        
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">
                Все режимы
            </h3>
            
            {#if $user.isPremium}
                <span class="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">PRO</span>
            {/if}
        </div>
        
        <!-- Переключатели видов -->
        <div class="flex gap-2 mb-4">
            <button 
                class="flex-1 py-2 rounded-lg text-sm {currentView === 'all' ? 'bg-white/20' : 'bg-white/5'}"
                on:click={() => currentView = 'all'}
            >
                Все
            </button>
            <button 
                class="flex-1 py-2 rounded-lg text-sm {currentView === 'free' ? 'bg-white/20' : 'bg-white/5'}"
                on:click={() => currentView = 'free'}
            >
                Бесплатные
            </button>
            <button 
                class="flex-1 py-2 rounded-lg text-sm {currentView === 'premium' ? 'bg-white/20' : 'bg-white/5'}"
                on:click={() => currentView = 'premium'}
            >
                PRO
            </button>
        </div>
        
        {#if loading}
            <div class="text-center py-8">
                <div class="inline-block animate-spin">⏳</div>
                <p class="text-sm opacity-60 mt-2">Загрузка режимов...</p>
            </div>
        {:else}
            <div class="space-y-3">
                {#each filteredTechniques as tech}
                    <div class="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <span class="text-3xl">{tech.icon}</span>
                        <div class="flex-1 text-left">
                            <p class="font-semibold">{tech.name}</p>
                            <p class="text-xs opacity-60">{tech.pattern}</p>
                        </div>
                        
                        {#if tech.premium && !$user.isPremium}
                            <span class="px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold">
                                PRO
                            </span>
                        {:else if tech.premium}
                            <span class="text-green-400 text-sm">✓ PRO</span>
                        {:else}
                            <span class="text-xs opacity-60 bg-blue-500/20 px-2 py-1 rounded">FREE</span>
                        {/if}
                        
                        <button
                            on:click={() => selectMode(tech)}
                            class="ml-2 px-3 py-1 rounded-lg text-sm bg-blue-500 hover:bg-blue-600 active:scale-95 transition-transform"
                        >
                            Выбрать
                        </button>
                        
                        {#if $user.isPremium}
                            <button
                                title="Изменить слот"
                                on:click={() => showSlotChangeOptions(tech)}
                                class="w-8 h-8 rounded-full bg-purple-500/30 flex items-center justify-center text-xs hover:bg-purple-500/50 active:scale-95 transition-transform"
                            >
                                🔄
                            </button>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
        
        <!-- Модальное окно выбора слота -->
        {#if showSlotSelector}
            <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                 on:click={closeSlotSelector}>
                <div class="w-full max-w-md bg-gray-800 rounded-2xl p-6"
                     on:click|stopPropagation>
                    <h3 class="text-lg font-bold mb-4 text-center">Выберите слот</h3>
                    
                    <p class="text-sm opacity-70 mb-4 text-center">
                        Заменить слот на: <strong>{selectedTechForSlot?.name}</strong>
                    </p>
                    
                    <div class="grid grid-cols-3 gap-3 mb-6">
                        {#each [0, 1, 2] as index}
                            <button
                                on:click={() => confirmSlotChange(index)}
                                class="py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-transform flex flex-col items-center"
                            >
                                <span class="text-lg">#{index + 1}</span>
                                <span class="text-xs opacity-60">слот</span>
                            </button>
                        {/each}
                    </div>
                    
                    <button
                        on:click={closeSlotSelector}
                        class="w-full py-3 rounded-xl bg-white/10 font-medium"
                    >
                        Отмена
                    </button>
                </div>
            </div>
        {/if}
        
        <button
            on:click={close}
            class="w-full mt-4 py-3 rounded-xl bg-white/10 font-medium"
        >
            Закрыть
        </button>
    </div>
</div>

<style>
    @keyframes slide-up {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
    .animate-slide-up {
        animation: slide-up 0.3s ease-out;
    }
</style>