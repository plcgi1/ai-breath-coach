# 🚀 BreathFlow API — Cloudflare Workers

**Zero-cost serverless API** для дыхательного приложения с Telegram Stars оплатой.

## 💰 Стоимость

| Ресурс | Лимит (бесплатно) | Ваше использование |
|--------|-------------------|-------------------|
| **Requests** | 100,000/день | ~1,000/день при старте |
| **KV reads** | 100,000/день | ~500/день |
| **KV writes** | 1,000/день | ~50/день |
| **CPU time** | 10ms/request | ~2ms/request |

**Итого: $0/месяц** до 100K пользователей!

---

## 📦 Структура

```
cloudflare-worker/
├── wrangler.toml       # Конфигурация Worker
├── package.json        # Зависимости
├── README.md           # Документация
└── src/
    └── index.js        # Весь код API
```

---

## 🛠 Установка

### 1. Установите Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 2. Создайте KV Namespaces

```bash
# Для хранения пользователей
wrangler kv:namespace create "USERS"
# Запомните ID!

# Для платежей
wrangler kv:namespace create "PAYMENTS"

# Для аналитики
wrangler kv:namespace create "ANALYTICS"
```

### 3. Обновите wrangler.toml

```toml
[[kv_namespaces]]
binding = "USERS"
id = "ваш-id-из-шага-2"

[[kv_namespaces]]
binding = "PAYMENTS"
id = "ваш-id-payments"

[[kv_namespaces]]
binding = "ANALYTICS"
id = "ваш-id-analytics"
```

### 4. Добавьте секреты

```bash
# Токен бота (от @BotFather)
wrangler secret put BOT_TOKEN
# Введите: 123456:ABC-DEF...

# Секрет для webhook
wrangler secret put WEBHOOK_SECRET
# Введите: любая_случайная_строка

# URL вашего WebApp (опционально)
wrangler secret put WEBAPP_URL
# Введите: https://your-app.pages.dev
```

### 5. Деплой

```bash
cd cloudflare-worker
npm install
wrangler deploy
```

Получите URL: `https://breathflow-api.your-account.workers.dev`

### 6. Настройте Webhook

Откройте в браузере:
```
https://breathflow-api.your-account.workers.dev/api/setup-webhook?url=https://breathflow-api.your-account.workers.dev/webhook/telegram
```

---

## 📡 API Endpoints

### Техники дыхания

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/breathing/:slug` | Получить технику |
| POST | `/api/breathing/ai` | AI рекомендация |
| GET | `/api/products` | Список продуктов |

### Платежи

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/api/payments/create-invoice` | Создать invoice |
| GET | `/api/payments/status/:userId` | Статус покупок |

### Аналитика

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/api/analytics/event` | Отправить событие |
| GET | `/api/analytics/dashboard` | Дашборд метрик |

### Напоминания

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/api/reminders/set` | Установить напоминание |
| GET | `/api/cron/send-reminders` | Отправить напоминания |

### Telegram

| Method | Endpoint | Описание |
|--------|----------|----------|
| POST | `/webhook/telegram` | Webhook для Telegram |
| GET | `/api/setup-webhook?url=` | Настроить webhook |

---

## 📊 Примеры запросов

### Получить технику

```bash
curl https://your-worker.workers.dev/api/breathing/box-breathing \
  -H "X-User-Id: 123456789"
```

### AI рекомендация

```bash
curl -X POST https://your-worker.workers.dev/api/breathing/ai \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 123456789" \
  -d '{"query": "Не могу уснуть"}'
```

### Создать invoice

```bash
curl -X POST https://your-worker.workers.dev/api/payments/create-invoice \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123456789, "product_id": "technique_anti-panic"}'
```

### Аналитика

```bash
curl https://your-worker.workers.dev/api/analytics/dashboard
```

---

## ⏰ Cron для напоминаний

Добавьте в `wrangler.toml`:

```toml
[triggers]
crons = ["0 * * * *"]  # Каждый час
```

Или вызывайте вручную:
```bash
curl https://your-worker.workers.dev/api/cron/send-reminders
```

---

## 🔐 Безопасность

1. **Webhook подпись** — проверяется `X-Telegram-Bot-Api-Secret-Token`
2. **User ID** — передаётся в заголовке, проверяется на сервере
3. **Секреты** — хранятся в Cloudflare Secrets, не в коде

---

## 📈 Масштабирование

При росте до 100K+ пользователей:

1. **Переход на Durable Objects** — для stateful операций
2. **Cloudflare D1** — SQL база вместо KV
3. **Переход на платный план** — $5/мес за 10M requests

---

## 🐛 Отладка

```bash
# Локальная разработка
wrangler dev

# Логи в реальном времени
wrangler tail

# Проверка KV
wrangler kv:key list --binding=USERS
```

---

## 💡 Советы

1. **Кэширование** — техники можно кэшировать на клиенте
2. **Батчинг аналитики** — отправляйте события пачками
3. **Graceful degradation** — если API недоступен, используйте локальные данные

---

## 📞 Поддержка

- Telegram: @your_support_bot
- GitHub Issues: [создать issue]
