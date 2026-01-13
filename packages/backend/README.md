## Запуск

```
supabase start
cd packages/backend
yarn run start:local
```

## Форматы пользователей

### Telegram
```
    id: NUMBERS,
    first_name: 'email-if-possible',
    last_name: '',
    username: 'username',
    language_code: 'ru',
    photo_url: 'https://t.me/i/userpic/path-to-userpic'
```

### VK
### Facebook
### OK

```
src/
├── database/
│   ├── schemas/
├── ├── scripts/
├── common/
│   ├── decorators/
│   │   ├── roles.decorator.ts       # @Roles(Role.PREMIUM)
│   │   └── user.decorator.ts        # @GetUser()
│   ├── guards/
│   │   ├── telegram-auth.guard.ts   # Валидация initData (Crypto check) OK
│   │   └── roles.guard.ts           # Проверка прав (Free vs Premium)
│   └── types/
│       └── roles.enum.ts            # Enum: USER, PREMIUM, ADMIN
│
├── modules/                   # Бизнес-логика приложения
│   ├── bot/                   # Интеграция с Telegram API (Telegraf/Nestjs-telegraf)
│   │   ├── bot.module.ts
│   │   └── bot.update.ts      # Обработка команд /start и Web App событий
│   ├── breathing/             # Основная логика дыхания
│   │   ├── breathing.module.ts                             OK
│   │   ├── breathing.controller.ts # Эндпоинты для TWA     OK
│   │   └── breathing.service.ts    # Оркестрация MCP и БД  OK
├   |── statistics/             # Статистика использования упражнений пользователями
│   │   ├── statistics.module.ts
│   │   ├── statistics.controller.ts # Эндпоинты для TWA
│   │   └── statistics.service.ts    # Оркестрация MCP и БД
│   └── payments/              # Модуль оплаты (bePaid / Prodamus)
│       ├── payments.module.ts
│       ├── payments.controller.ts # Webhooks от эквайринга
│       └── payments.service.ts    # Управление статусами (НПД логика)
```

### .env
```
NODE_ENV=development
PORT=PORT-NUMBER
MONGO_URI=mongodb://host:27017/ai_coach
TELEGRAM_BOT_TOKEN=<>
OLLAMA_URL
OLLAMA_MODEL
```

### TODO - к выяснению проверка идей

стоит ли нам также передавать в промпт историю последних 3-5 сессий пользователя из этой статистики - Это помогло бы AI не предлагать одну и ту же технику два раза подряд?

### Работа с BotFather

2. Регистрация в BotFather
   У одного бота может быть несколько Web Apps:

Пиши /mybots -> Выбери бота.
Bot Settings -> Menu Button (это основная кнопка слева от ввода сообщения).
ИЛИ (лучший способ для нескольких TWA) — Inline Mode или создание Web App Direct Link.
Выбери Edit Bot -> Edit Commands.
Добавь команду, например stats.
Но проще всего сделать Inline Button через BotFather -> New Attachment Application (но это для более сложных штук).


объем падает
цена растет
монета упадет - short

объем падает
цена падает
монета неинтересна

BC растет - все монеты растут - низзя
BC падает - все монеты растут - 100% short делаем

усреднять на 120%

памп - кратковременное поднятие монеты вверх

зона консолдидации - когда вершина примерно на 50% по длине как  подъем
разобраться с усреднениями
