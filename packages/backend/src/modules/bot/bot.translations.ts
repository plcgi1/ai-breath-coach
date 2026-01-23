export const i18n = {
    'start.welcome': {
        en: '<b>Welcome!</b>\nStart your training by clicking the button below or in the menu.',
        ru: '<b>Добро пожаловать!</b>\nНачните тренировку, нажав кнопку ниже или в меню.'
    },
    'start.launchCoach': {
        en: 'Launch Coach',
        ru: 'Запустить тренера'
    },
    'help.howto': {
        en: (supportChannel: string): string => {
            const result =  `How to use application:\n` +
      `1. Open Mini App with button below.\n` +
      `2. Make your choise with breathing technique.\n` +
      `3. Follow up screen instactions.\n\n` +
      `Ask Payment questions with STARS to support (${supportChannel}).`
            return result
        },

        ru: (supportChannel: string): string => {
            const result = `Как пользоваться приложением:\n` +
      `1. Откройте Mini App через кнопку внизу.\n` +
      `2. Выберите подходящую технику дыхания.\n` +
      `3. Следуйте инструкциям на экране.\n\n` +
      `По вопросам оплаты Stars пишите в поддержку(${supportChannel}).` 
            return result
        }
    }
}