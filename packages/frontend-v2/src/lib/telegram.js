/**
 * Telegram WebApp API wrapper
 */

export const tg = window.Telegram?.WebApp

/**
 * Инициализация Telegram WebApp
 */
export function initTelegram() {
    if (!tg) {
        console.log('⚠️ Running outside Telegram')
        return null
    }
    
    tg.expand()
    tg.enableClosingConfirmation()
    tg.ready()
    
    console.log('✅ Telegram WebApp initialized')
    return tg
}

export const initUserAuthData = window.Telegram?.WebApp?.initData || ''

/**
 * Получить данные пользователя
 */
export function getTgUser() {
    const tgUser = tg?.initDataUnsafe?.user || null
    return tgUser
}

/**
 * Применить тему Telegram
 */
export function applyTgTheme() {
    if (!tg?.themeParams) return
    
    const params = tg.themeParams
    const root = document.documentElement.style
    
    root.setProperty('--tg-theme-bg-color', params.bg_color || '#1a1a2e')
    root.setProperty('--tg-theme-text-color', params.text_color || '#ffffff')
    root.setProperty('--tg-theme-hint-color', params.hint_color || '#7d8590')
    root.setProperty('--tg-theme-link-color', params.link_color || '#63b3ed')
    root.setProperty('--tg-theme-button-color', params.button_color || '#3b82f6')
    root.setProperty('--tg-theme-button-text-color', params.button_text_color || '#ffffff')
    root.setProperty('--tg-theme-secondary-bg-color', params.secondary_bg_color || '#16213e')
}

/**
 * Вибрация
 */
export function haptic(type = 'light') {
    if (!tg?.HapticFeedback) return
    
    if (['light', 'medium', 'heavy'].includes(type)) {
        tg.HapticFeedback.impactOccurred(type)
    } else if (['success', 'warning', 'error'].includes(type)) {
        tg.HapticFeedback.notificationOccurred(type)
    }
}

/**
 * Главная кнопка
 */
export const mainButton = {
    show(text, color) {
        if (!tg) return
        tg.MainButton.setText(text)
        if (color) tg.MainButton.color = color
        tg.MainButton.show()
    },
    
    hide() {
        tg?.MainButton.hide()
    },
    
    onClick(callback) {
        tg?.MainButton.onClick(callback)
    },
    
    offClick(callback) {
        tg?.MainButton.offClick(callback)
    }
}

/**
 * Кнопка назад
 */
export const backButton = {
    show() {
        tg?.BackButton.show()
    },
    
    hide() {
        tg?.BackButton.hide()
    },
    
    onClick(callback) {
        tg?.BackButton.onClick(callback)
    }
}

/**
 * Показать popup
 */
export function showPopup(options) {
    return new Promise(resolve => {
        if (!tg) {
            resolve(null)
            return
        }
        tg.showPopup(options, resolve)
    })
}

/**
 * Показать alert
 */
export function showAlert(message) {
    if (tg) {
        tg.showAlert(message)
    } else {
        alert(message)
    }
}

/**
 * Открыть invoice для оплаты
 */
export function openInvoice(invoiceLink) {
    return new Promise(resolve => {
        if (!tg) {
            resolve('failed')
            return
        }
        tg.openInvoice(invoiceLink, resolve)
    })
}

/**
 * Поделиться через Telegram
 */
export function share(url, text) {
    if (tg) {
        tg.openTelegramLink(
            `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
        )
    } else {
        navigator.share?.({ url, text })
    }
}
