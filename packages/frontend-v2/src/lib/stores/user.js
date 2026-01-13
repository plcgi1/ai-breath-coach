import { writable, derived } from 'svelte/store'
import { getTgUser } from '../telegram.js'

// Данные пользователя Telegram
function createUserStore() {
    const tgUser = getTgUser()
    
    const { subscribe, set, update } = writable({
        id: tgUser?.id || 'guest',
        firstName: tgUser?.first_name || 'Гость',
        lastName: tgUser?.last_name || '',
        username: tgUser?.username || '',
        isPremium: false,
        premiumPlan: null,
        premiumActivated: null
    })
    
    return {
        subscribe,
        
        setFromTelegram() {
            const tgUser = getTgUser()
            if (tgUser) {
                update(u => ({
                    ...u,
                    id: tgUser.id,
                    firstName: tgUser.first_name || 'Пользователь',
                    lastName: tgUser.last_name || '',
                    username: tgUser.username || ''
                }))
            }
        },
        
        activatePremium(plan) {
            update(u => ({
                ...u,
                isPremium: true,
                premiumPlan: plan,
                premiumActivated: new Date().toISOString()
            }))
        },
        
        loadPremiumStatus(progress) {
            if (progress?.isPremium) {
                update(u => ({
                    ...u,
                    isPremium: true,
                    premiumPlan: progress.premiumPlan,
                    premiumActivated: progress.premiumActivated
                }))
            }
        }
    }
}

export const user = createUserStore()

// Инициалы пользователя
export const userInitials = derived(user, $user => {
    const first = $user.firstName?.[0] || ''
    const last = $user.lastName?.[0] || ''
    return (first + last).toUpperCase() || '🧘'
})

// Имя для отображения
export const displayName = derived(user, $user => {
    return $user.firstName || 'Гость'
})
