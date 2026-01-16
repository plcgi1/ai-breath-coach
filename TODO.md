  - [ ] сделать такое автоматом
        пользователь видит ссылку - кликает по ней - и ссылка на бота устанавливается у пользователя на вкладке

Чтобы сделать установку бота во вкладку (Attachment Menu) автоматической при клике по ссылке, нужно использовать специальный формат ссылки **Direct Mini App Link**.

Когда пользователь переходит по такой ссылке, Telegram сам открывает диалоговое окно с вопросом: **«Добавить бота в меню вложений?»**.

### 1. Формат ссылки

Вам не нужно писать сложный код, достаточно правильно сформировать URL. Формат выглядит так:

`https://t.me/YOUR_BOT_USERNAME/APP_NAME?startapp=install`

* **YOUR_BOT_USERNAME**: Юзернейм вашего бота (например, `zen_practice_bot`).
* **APP_NAME**: Короткое название вашего WebApp, которое вы задали в BotFather при создании (например, `app`).
* **startapp=install**: (Опционально) параметр, который поможет вам на стороне сервера или фронтенда понять, что переход был именно по рекламной ссылке.

### 2. Подготовка в BotFather (Обязательно)

Чтобы эта ссылка сработала как «установщик», нужно включить соответствующую настройку:

1. Зайдите в **@BotFather**.
2. Выберите вашего бота через `/mybots`.
3. Перейдите в **Bot Settings** -> **Web App**.
4. Найдите пункт **"Allow users to add the bot to attachment menu"** и убедитесь, что он **Включен** (Enabled).

---

### 3. Как это работает для пользователя

1. Пользователь кликает по вашей ссылке в любом канале или чате.
2. Вместо обычного открытия сайта, Telegram показывает системное окно с иконкой вашего бота.
3. Пользователь нажимает **"Добавить"** (или "Add").
4. Иконка бота навсегда появляется в меню «скрепки» и в главном меню настроек пользователя.

---

### 4. Добавляем кнопку "Установить" в ваш интерфейс

Вы можете добавить кнопку прямо внутрь вашего Svelte-приложения, чтобы пользователи могли «закрепить» его, пока пользуются им.

**Компонент InstallTabButton.svelte:**

```html
<script>
    const botUser = "YOUR_BOT_USERNAME";
    const appName = "app";
    const installUrl = `https://t.me/${botUser}/${appName}?startapp=install`;

    function handleInstall() {
        // Открываем нативную ссылку Telegram
        // Внутри WebApp это спровоцирует диалог добавления
        window.open(installUrl, '_blank');
    }
</script>

<button class="install-btn" on:click={handleInstall}>
    <div class="icon">➕</div>
    <div class="text">
        <span>Добавить во вкладку</span>
        <small>Бот всегда будет под рукой</small>
    </div>
</button>

<style>
    .install-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border: none;
        padding: 14px 20px;
        border-radius: 20px;
        cursor: pointer;
        width: 100%;
        max-width: 320px;
        box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
    }

    .icon { font-size: 1.2rem; }
    .text { display: flex; flex-direction: column; align-items: flex-start; }
    .text span { font-weight: 700; font-size: 0.9rem; }
    .text small { opacity: 0.8; font-size: 0.7rem; }
</style>

```

### Преимущество этого метода:

* **Виральность**: Вы можете разместить эту ссылку в описании профиля бота или в рекламных постах.
* **Retention**: Пользователю не нужно искать бота в списке чатов, он всегда доступен через кнопку вложений (там же, где «Галерея» или «Локация»).
