'use strict'
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up({ context: queryInterface }) {
    const priceFreeId = '10000000-0000-0000-0000-000000000001'
    const pricePId = ''

    const breathingPractices = [
      {
        slug: 'box-breathing',
        name: 'Квадрат',
        icon: '📦',
        description: 'Метод Navy SEALs (спецназа США). Применяется для мгновенной фокусировки и успокоения нервной системы в стрессовых ситуациях через балансировку симпатической и парасимпатической систем.',
        is_free: true,
        settings: [{ inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, rounds: 10 }],
        tags: ['focus', 'mental stability', 'composure', 'control', 'situational awareness'],
        symptoms: ['mind racing', 'panic', 'shaking hands', 'overwhelmed', 'chaotic thoughts', 'pounding heart', 'exam stress', 'high pressure']
      },
      {
        slug: '478-relax',
        name: 'Глубокий сон',
        icon: '🌙',
        description: 'Разработана доктором Эндрю Вейлом (Гарвард). Это естественный транквилизатор для нервной системы. Взята из практики пранаямы для борьбы с бессонницей и чувством тревоги.',
        is_free: false,
        settings: [{ inhale: 4, holdIn: 7, exhale: 8, holdOut: 0, rounds: 4 }],
        tags: ['sleep quality', 'sedation', 'deep relaxation', 'nervous system reset', 'peace of mind'],
        symptoms: ['can not sleep', 'tossing and turning', 'night anxiety', 'wide awake at night', 'restless legs', 'bedtime overthinking']
      },
      {
        slug: 'lion',
        name: 'Сила Льва',
        icon: '🦁',
        description: 'Техника "Симхасана" из Хатха-йоги. Используется для снятия напряжения в лицевых мышцах, горле и груди, а также для стимуляции миндалевидного тела, что помогает снизить агрессию и страх.',
        is_free: false,
        settings: [{ inhale: 5, holdIn: 2, exhale: 2, holdOut: 0, rounds: 8 }],
        tags: ['self-confidence', 'vocal power', 'facial relaxation', 'emotional release', 'assertiveness'],
        symptoms: ['feeling weak', 'throat lump', 'suppressed anger', 'scared to speak', 'jaw pain', 'shivering voice', 'social fear']
      },
      {
        slug: 'kapalbhati',
        name: 'Сияющий череп',
        icon: '⚡',
        description: 'Очищающая техника (шаткарма) из йоги. Короткие, мощные выдохи тонизируют органы брюшной полости, очищают носовые пазухи и насыщают мозг кислородом для ясности мыслей.',
        is_free: false,
        settings: [{ inhale: 1, holdIn: 0, exhale: 1, holdOut: 0, rounds: 30 }],
        tags: ['brain boost', 'detox', 'energy spike', 'mental clarity', 'digestive fire'],
        symptoms: ['brain fog', 'feeling lazy', 'stuffy nose', 'morning fatigue', 'mental clouds', 'slow thinking', 'drowsy']
      },
      {
        slug: 'coherent',
        name: 'Резонанс',
        icon: '🌊',
        description: 'Научно обоснованный метод когерентного дыхания. Выравнивает сердечный ритм (HRV), вводя организм в состояние максимальной биологической эффективности и спокойствия.',
        is_free: true,
        settings: [{ inhale: 6, holdIn: 0, exhale: 6, holdOut: 0, rounds: 15 }],
        tags: ['emotional balance', 'heart health', 'inner harmony', 'resilience', 'stable mood'],
        symptoms: ['feeling irritated', 'mood swings', 'heart skipping beats', 'nervous', 'mild tension', 'emotionally drained']
      },
      {
        slug: 'emotional-release',
        name: 'Эмоциональный сброс',
        icon: '🌋',
        description: 'Психосоматическая техника для работы с подавленным гневом. Сначала мы "раскачиваем" энергию быстрым темпом, а затем резко замедляемся для заземления и осознания.',
        is_free: false,
        settings: [
          { inhale: 1, holdIn: 0, exhale: 1, holdOut: 0, rounds: 20 }, // Фаза 1: Интенсивный выплеск
          { inhale: 4, holdIn: 4, exhale: 8, holdOut: 0, rounds: 5 }   // Фаза 2: Глубокое успокоение
        ],
        tags: ['catharsis', 'anger management', 'somatic release', 'emotional detox', 'tension relief'],
        symptoms: ['feeling like exploding', 'internal pressure', 'repressed rage', 'muscle tightness', 'frustration', 'stuck emotions']
      },
      {
        slug: 'ladder-to-calm',
        name: 'Лестница спокойствия',
        icon: '🪜',
        description: 'КПТ-техника для мягкого вывода из состояния высокой тревоги. Мы постепенно удлиняем выдох с каждым новым этапом, "обманывая" мозг и замедляя пульс без стресса.',
        is_free: true,
        settings: [
          { inhale: 3, holdIn: 0, exhale: 3, holdOut: 0, rounds: 4 }, // Уровень 1: Равный ритм
          { inhale: 3, holdIn: 0, exhale: 5, holdOut: 0, rounds: 4 }, // Уровень 2: Удлинение
          { inhale: 3, holdIn: 0, exhale: 7, holdOut: 0, rounds: 4 }  // Уровень 3: Глубокий транс
        ],
        tags: ['anxiety reduction', 'gradual relaxation', 'pacing', 'nervous system training', 'soft landing'],
        symptoms: ['high pulse', 'restlessness', 'nervous tension', 'can not settle down', 'jitters', 'worrying']
      },
      {
        slug: 'focus-shifter',
        name: 'Переключатель',
        icon: '🔄',
        description: 'Техника для борьбы с "зацикленным" мышлением. Резкая смена ритмов заставляет мозг переключиться с внутренних диалогов на контроль дыхания.',
        is_free: false,
        settings: [
          { inhale: 1, holdIn: 2, exhale: 1, holdOut: 2, rounds: 10 }, // Быстрые "задержки" для концентрации
          { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0, rounds: 5 }   // Плавный баланс
        ],
        tags: ['breaking loops', 'mental shift', 'adhd friendly', 'cognitive control', 'refocus'],
        symptoms: ['obsessive thoughts', 'looping mind', 'distraction', 'overthinking', 'stuck in the head', 'mental fatigue']
      },
      {
        slug: 'wim-hof-lite',
        name: 'Дух льда',
        icon: '❄️',
        description: 'Адаптированный метод Вима Хофа. Контролируемая гипервентиляция для повышения выносливости, укрепления иммунитета и выработки адреналина естественным путем.',
        is_free: false,
        settings: [{ inhale: 2, holdIn: 0, exhale: 1, holdOut: 15, rounds: 3 }],
        tags: ['immune boost', 'willpower', 'vitality', 'metabolic power', 'cold endurance'],
        symptoms: ['always cold', 'feeling weak', 'low motivation', 'burnout', 'sluggish', 'winter blues', 'stiff body']
      },
      {
        slug: 'bellows',
        name: 'Кузнечные мехи',
        icon: '🔥',
        description: 'Техника "Бхастрика". Мощное энергизирующее дыхание, которое раздувает "внутренний огонь", ускоряет метаболизм и помогает быстро согреться или проснуться без кофеина.',
        is_free: false,
        settings: [{ inhale: 2, holdIn: 0, exhale: 2, holdOut: 0, rounds: 20 }],
        tags: ['fire energy', 'caffeine alternative', 'inner heat', 'oxygen blast', 'power'],
        symptoms: ['low energy', 'cold hands', 'depressed mood', 'groggy', 'sleepy', 'slow metabolism', 'heavy body']
      },
      {
        slug: 'buteyko-calm',
        name: 'Метод Бутейко',
        icon: '🧘',
        description: 'Разработана советским врачом К.П. Бутейко. Учит организм эффективно использовать углекислый газ, устраняет гипервентиляцию и помогает при заложенности носа и астме.',
        is_free: true,
        settings: [{ inhale: 2, holdIn: 0, exhale: 3, holdOut: 5, rounds: 10 }],
        tags: ['breath control', 'nasal breathing', 'CO2 tolerance', 'efficient oxygen', 'lung health'],
        symptoms: ['short of breath', 'mouth breathing', 'snoring', 'blocked nose', 'heaving breathing', 'wheezing', 'air hunger']
      },
      {
        slug: 'anti-panic',
        name: 'Стоп Паника',
        icon: '🛡️',
        description: 'Клиническая техника когнитивно-поведенческой терапии. Удлиненный выдох сигнализирует мозгу, что опасности нет, быстро прерывая цикл панической атаки.',
        is_free: true,
        settings: [{ inhale: 3, holdIn: 0, exhale: 6, holdOut: 0, rounds: 20 }],
        tags: ['emergency calm', 'vagus nerve', 'grounding', 'instant relief', 'safety'],
        symptoms: ['feeling scared', 'fear of dying', 'trembling', 'claustrophobia', 'acute distress', 'chest pain', 'choking', 'dizzy']
      }
    ];

  },
}
