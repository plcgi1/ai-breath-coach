export const breathingPractices = [
  {
    slug: 'emotional-release',
    name: 'Эмоциональный сброс',
    icon: '🌋',
    description:
      'Психосоматическая техника для работы с подавленным гневом. Сначала мы "раскачиваем" энергию быстрым темпом, а затем резко замедляемся для заземления и осознания.',
    is_free: false,
    settings: [
      { inhale: 1, holdIn: 0, exhale: 1, holdOut: 0, rounds: 20 }, // Фаза 1: Интенсивный выплеск
      { inhale: 4, holdIn: 4, exhale: 8, holdOut: 0, rounds: 5 } // Фаза 2: Глубокое успокоение
    ],
    tags: ['catharsis', 'anger management', 'somatic release', 'emotional detox', 'tension relief'],
    symptoms: [
      'feeling like exploding',
      'internal pressure',
      'repressed rage',
      'muscle tightness',
      'frustration',
      'stuck emotions'
    ]
  },
  {
    slug: 'ladder-to-calm',
    name: 'Лестница спокойствия',
    icon: '🪜',
    description:
      'КПТ-техника для мягкого вывода из состояния высокой тревоги. Мы постепенно удлиняем выдох с каждым новым этапом, "обманывая" мозг и замедляя пульс без стресса.',
    is_free: true,
    settings: [
      { inhale: 3, holdIn: 0, exhale: 3, holdOut: 0, rounds: 4 }, // Уровень 1: Равный ритм
      { inhale: 3, holdIn: 0, exhale: 5, holdOut: 0, rounds: 4 }, // Уровень 2: Удлинение
      { inhale: 3, holdIn: 0, exhale: 7, holdOut: 0, rounds: 4 } // Уровень 3: Глубокий транс
    ],
    tags: [
      'anxiety reduction',
      'gradual relaxation',
      'pacing',
      'nervous system training',
      'soft landing'
    ],
    symptoms: [
      'high pulse',
      'restlessness',
      'nervous tension',
      'can not settle down',
      'jitters',
      'worrying'
    ]
  },
  {
    slug: 'focus-shifter',
    name: 'Переключатель',
    icon: '🔄',
    description:
      'Техника для борьбы с "зацикленным" мышлением. Резкая смена ритмов заставляет мозг переключиться с внутренних диалогов на контроль дыхания.',
    is_free: false,
    settings: [
      { inhale: 1, holdIn: 2, exhale: 1, holdOut: 2, rounds: 10 }, // Быстрые "задержки" для концентрации
      { inhale: 5, holdIn: 0, exhale: 5, holdOut: 0, rounds: 5 } // Плавный баланс
    ],
    tags: ['breaking loops', 'mental shift', 'adhd friendly', 'cognitive control', 'refocus'],
    symptoms: [
      'obsessive thoughts',
      'looping mind',
      'distraction',
      'overthinking',
      'stuck in the head',
      'mental fatigue'
    ]
  },
  {
    slug: 'lion',
    name: 'Сила Льва',
    icon: '🦁',
    description:
      'Психологическая работа со страхом проявления. Мощный выдох с голосом помогает "выпустить" зажатые социальные страхи.',
    is_free: false,
    settings: [{ inhale: 5, holdIn: 2, exhale: 2, holdOut: 0, rounds: 8 }],
    tags: [
      'self-confidence',
      'vocal power',
      'facial relaxation',
      'emotional release',
      'assertiveness'
    ],
    symptoms: [
      'feeling weak',
      'throat lump',
      'scared to speak',
      'jaw pain',
      'shivering voice',
      'social fear'
    ]
  },
  {
    slug: 'box-breathing',
    name: 'Квадрат',
    icon: '📦',
    description:
      'Золотой стандарт тактического спокойствия. Используется для сохранения хладнокровия под огнем или в конфликте.',
    is_free: true,
    settings: [{ inhale: 4, holdIn: 4, exhale: 4, holdOut: 4, rounds: 10 }],
    tags: ['focus', 'mental stability', 'composure', 'control', 'situational awareness'],
    symptoms: [
      'panic',
      'shaking hands',
      'overwhelmed',
      'chaotic thoughts',
      'pounding heart',
      'exam stress'
    ]
  },
  {
    slug: '478-relax',
    name: 'Глубокий сон',
    icon: '🌙',
    description:
      'Метод для борьбы с предсонной тревогой. Задержка в 7 секунд отключает поток мыслей.',
    is_free: false,
    settings: [{ inhale: 4, holdIn: 7, exhale: 8, holdOut: 0, rounds: 4 }],
    tags: ['sleep quality', 'sedation', 'deep relaxation', 'peace of mind'],
    symptoms: [
      'can not sleep',
      'night anxiety',
      'wide awake at night',
      'restless legs',
      'bedtime overthinking'
    ]
  },
  {
    slug: 'humming-bee',
    name: 'Гул Пчелы',
    icon: '🐝',
    description:
      'Звуковая терапия для снятия сенсорной перегрузки. Вибрация работает как внутренний массаж для мозга.',
    is_free: false,
    settings: [{ inhale: 4, holdIn: 0, exhale: 8, holdOut: 0, rounds: 10 }],
    tags: ['vibration therapy', 'internal silence', 'sensory withdrawal', 'anxiety reduction'],
    symptoms: [
      'headache',
      'constant buzzing in ears',
      'mental noise',
      'overstimulated',
      'can not quiet the mind'
    ]
  },
  {
    slug: 'bellows',
    name: 'Кузнечные мехи',
    icon: '🔥',
    description:
      'Энергетическая "подзарядка". Быстрый темп повышает уровень готовности к действию.',
    is_free: false,
    settings: [{ inhale: 2, holdIn: 0, exhale: 2, holdOut: 0, rounds: 20 }],
    tags: ['fire energy', 'caffeine alternative', 'inner heat', 'invigoration'],
    symptoms: ['low energy', 'cold hands', 'groggy', 'sleepy', 'slow metabolism', 'heavy body']
  },
  {
    slug: 'buteyko-calm',
    name: 'Метод Бутейко',
    icon: '🧘',
    description: 'Психология контроля дефицита. Учит не впадать в панику, когда дыхания "мало".',
    is_free: true,
    settings: [{ inhale: 2, holdIn: 0, exhale: 3, holdOut: 5, rounds: 10 }],
    tags: ['breath control', 'nasal breathing', 'CO2 tolerance', 'lung health'],
    symptoms: ['short of breath', 'mouth breathing', 'blocked nose', 'air hunger', 'snoring']
  },
  {
    slug: 'anti-panic',
    name: 'Стоп Паника',
    icon: '🛡️',
    description:
      'Техника "Заземление". Длинный выдох через узкую щель губ физически прерывает выброс адреналина.',
    is_free: true,
    settings: [{ inhale: 3, holdIn: 0, exhale: 6, holdOut: 0, rounds: 20 }],
    tags: ['emergency calm', 'vagus nerve', 'grounding', 'instant relief'],
    symptoms: [
      'feeling scared',
      'fear of dying',
      'trembling',
      'claustrophobia',
      'chest pain',
      'choking'
    ]
  }
];
