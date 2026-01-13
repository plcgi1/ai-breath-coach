import { writable, derived, get } from 'svelte/store'
import { user } from './user.js'
import { ACHIEVEMENTS } from '../config.js'

// Ключ для localStorage
function getStorageKey() {
    const $user = get(user)
    return `breathflow_${$user.id}`
}

// Начальные данные
const defaultProgress = {
    totalMinutes: 0,
    totalSessions: 0,
    streak: 0,
    maxStreak: 0,
    lastPractice: null,
    achievements: {},
    usedTechniques: [],
    weeklyData: {},
    onboardingCompleted: false,
    onboardingData: null,
    segment: null
}

// Загрузка из localStorage
function loadFromStorage() {
    try {
        const data = localStorage.getItem(getStorageKey())
        if (data) {
            return { ...defaultProgress, ...JSON.parse(data) }
        }
    } catch (e) {
        console.error('Load error:', e)
    }
    return { ...defaultProgress }
}

// Стор прогресса
function createProgressStore() {
    const { subscribe, set, update } = writable(loadFromStorage())
    
    return {
        subscribe,
        
        // Загрузить данные
        load() {
            set(loadFromStorage())
        },
        
        // Сохранить сессию
        saveSession(minutes, technique) {
            update(p => {
                const sessionMinutes = Math.max(1, minutes)
                const today = new Date().toDateString()
                const lastPractice = p.lastPractice 
                    ? new Date(p.lastPractice).toDateString() 
                    : null
                
                // Обновляем streak
                let newStreak = p.streak
                if (lastPractice !== today) {
                    const yesterday = new Date(Date.now() - 86400000).toDateString()
                    if (lastPractice === yesterday) {
                        newStreak += 1
                    } else {
                        newStreak = 1
                    }
                }
                
                // Обновляем недельные данные
                const dayOfWeek = new Date().getDay()
                const weeklyData = { ...p.weeklyData }
                weeklyData[dayOfWeek] = (weeklyData[dayOfWeek] || 0) + sessionMinutes
                
                // Добавляем технику
                const usedTechniques = [...new Set([...p.usedTechniques, technique])]
                
                const newProgress = {
                    ...p,
                    totalMinutes: p.totalMinutes + sessionMinutes,
                    totalSessions: p.totalSessions + 1,
                    streak: newStreak,
                    maxStreak: Math.max(p.maxStreak, newStreak),
                    lastPractice: new Date().toISOString(),
                    usedTechniques,
                    weeklyData
                }
                
                // Сохраняем в localStorage
                try {
                    localStorage.setItem(getStorageKey(), JSON.stringify(newProgress))
                } catch (e) {
                    console.error('Save error:', e)
                }
                
                return newProgress
            })
        },
        
        // Разблокировать достижение
        unlockAchievement(id) {
            update(p => {
                if (p.achievements[id]) return p
                
                const newProgress = {
                    ...p,
                    achievements: { ...p.achievements, [id]: true }
                }
                
                try {
                    localStorage.setItem(getStorageKey(), JSON.stringify(newProgress))
                } catch (e) {
                    console.error('Save error:', e)
                }
                
                return newProgress
            })
        },
        
        // Проверить достижения
        checkAchievements() {
            const p = get(this)
            const unlocks = []
            
            if (p.totalMinutes >= 10 && !p.achievements.minutes10) unlocks.push('minutes10')
            if (p.totalSessions >= 10 && !p.achievements.sessions10) unlocks.push('sessions10')
            if (p.streak >= 3 && !p.achievements.streak3) unlocks.push('streak3')
            if (p.streak >= 7 && !p.achievements.streak7) unlocks.push('streak7')
            if (p.streak >= 30 && !p.achievements.streak30) unlocks.push('streak30')
            if (p.totalMinutes >= 100 && p.streak >= 14 && !p.achievements.master) unlocks.push('master')
            
            unlocks.forEach(id => this.unlockAchievement(id))
            
            return unlocks
        },
        
        // Сохранить онбординг
        completeOnboarding(data) {
            update(p => {
                const segment = determineSegment(data)
                
                const newProgress = {
                    ...p,
                    onboardingCompleted: true,
                    onboardingData: data,
                    segment
                }
                
                try {
                    localStorage.setItem(getStorageKey(), JSON.stringify(newProgress))
                } catch (e) {
                    console.error('Save error:', e)
                }
                
                return newProgress
            })
        },
        
        // Активировать премиум
        savePremium(plan) {
            update(p => {
                const newProgress = {
                    ...p,
                    isPremium: true,
                    premiumPlan: plan,
                    premiumActivated: new Date().toISOString()
                }
                
                try {
                    localStorage.setItem(getStorageKey(), JSON.stringify(newProgress))
                } catch (e) {
                    console.error('Save error:', e)
                }
                
                return newProgress
            })
        }
    }
}

// Определение сегмента пользователя
function determineSegment(data) {
    if (!data?.goal) return 'general'
    
    const segments = {
        anxiety: 'anxious_user',
        sleep: 'sleep_seeker',
        focus: 'productivity_focused',
        energy: 'energy_seeker'
    }
    
    return segments[data.goal] || 'general'
}

export const progress = createProgressStore()

// Производные сторы
export const streak = derived(progress, $p => $p.streak)
export const totalMinutes = derived(progress, $p => $p.totalMinutes)
export const totalSessions = derived(progress, $p => $p.totalSessions)
export const maxStreak = derived(progress, $p => $p.maxStreak)

export const avgMinutes = derived(progress, $p => {
    if ($p.totalSessions === 0) return 0
    return ($p.totalMinutes / $p.totalSessions).toFixed(1)
})

export const currentDay = derived(progress, $p => {
    if (!$p.lastPractice) return 1
    const firstDay = new Date($p.lastPractice)
    firstDay.setDate(firstDay.getDate() - $p.streak + 1)
    return Math.max(1, Math.ceil((Date.now() - firstDay.getTime()) / 86400000))
})

export const unlockedAchievements = derived(progress, $p => {
    return Object.keys(ACHIEVEMENTS).filter(id => $p.achievements[id])
})

export const achievementCount = derived(unlockedAchievements, $unlocked => {
    return `${$unlocked.length}/${Object.keys(ACHIEVEMENTS).length}`
})

export const weeklyData = derived(progress, $p => $p.weeklyData || {})

export const needsOnboarding = derived(progress, $p => !$p.onboardingCompleted)
