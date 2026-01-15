

Чтобы при нажатии кнопки «Поделиться» в Telegram появлялась красивая карточка (с заголовком, описанием и картинкой), ваш NestJS сервер должен обрабатывать **Inline Query**.

Когда пользователь выбирает чат через `switchInlineQuery`, Telegram отправляет вашему боту запрос, на который сервер должен ответить списком результатов (в нашем случае — одной красивой карточкой).

### 1. Подготовка DTO

Для начала создадим простую структуру для входящего обновления от Telegram.

```typescript
// telegram-update.dto.ts
export class TelegramUpdateDto {
  update_id: number;
  inline_query?: {
    id: string;
    query: string;
    from: { id: number; first_name: string };
  };
}

```

### 2. Реализация в NestJS контроллере

Основная магия происходит в методе `answerInlineQuery`. Вам понадобится библиотека `telegraf` или прямой вызов API Telegram.

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import axios from 'axios';

@Controller('telegram')
export class TelegramController {
  private readonly botToken = 'YOUR_BOT_TOKEN';
  private readonly apiUrl = `https://api.telegram.org/bot${this.botToken}/answerInlineQuery`;

  @Post('webhook')
  async handleWebhook(@Body() update: any) {
    if (update.inline_query) {
      return this.handleInlineQuery(update.inline_query);
    }
  }

  private async handleInlineQuery(inlineQuery: any) {
    const results = [
      {
        type: 'article',
        id: 'share-app',
        title: '🧘 Практики осознанности',
        description: 'Присоединяйся к моим ежедневным практикам в Telegram!',
        thumb_url: 'https://your-domain.com/preview-image.jpg', // Ссылка на картинку
        input_message_content: {
          message_text: `<b>Я практикую осознанность в этом приложении!</b>\n\nПрисоединяйся по ссылке ниже 👇`,
          parse_mode: 'HTML',
        },
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть приложение',
                url: `https://t.me/YOUR_BOT_USERNAME/app_name`,
              },
            ],
          ],
        },
      },
    ];

    try {
      await axios.post(this.apiUrl, {
        inline_query_id: inlineQuery.id,
        results: results,
        cache_time: 300, // Кэширование результата на 5 минут
      });
    } catch (error) {
      console.error('Error answering inline query:', error.response?.data);
    }
  }
}

```

### 3. Как это работает (схема взаимодействия)

1. **Frontend**: Пользователь нажимает вашу кнопку «Поделиться», срабатывает `switchInlineQuery`.
2. **Telegram App**: Открывает список чатов. Пользователь выбирает друга.
3. **Telegram Server**: Отправляет запрос `inline_query` на ваш NestJS Webhook.
4. **NestJS**: Возвращает структуру `answerInlineQuery` с `thumb_url`, текстом и кнопкой.
5. **Результат**: Друг получает сообщение, которое выглядит как полноценная рекламная карточка с кнопкой запуска.

### Что нужно заменить:

* `YOUR_BOT_TOKEN`: Токен из BotFather.
* `YOUR_BOT_USERNAME/app_name`: Прямая ссылка на запуск вашего WebApp.
* `thumb_url`: Прямая ссылка на картинку (рекомендуемый размер 1200x630 для четкости или квадрат 600x600).

### Важный совет по UX

Не забудьте включить Inline Mode в **@BotFather**:
`/mybots` -> `Ваш Бот` -> `Bot Settings` -> `Inline Mode` -> `Turn on`.

Без этого шага Telegram даже не попытается отправить запрос вашему серверу.
