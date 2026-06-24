# AI Dungeon Master - Frontend

Фронтенд приложение для AI-DMaaS (AI Dungeon Master as a Service), построенное на Vue 3 + TypeScript.

## Технологический стек

- **Vue 3** - прогрессивный JavaScript фреймворк
- **TypeScript** - типизированный JavaScript
- **Vite** - современный инструмент сборки
- **Pinia** - state management для Vue
- **Tailwind CSS** - utility-first CSS фреймворк
- **PixiJS** - 2D WebGL рендерер для анимаций
- **STOMP** - протокол для WebSocket коммуникации
- **Playwright** - E2E тестирование
- **Vitest** - unit тестирование

## Требования

- Node.js 18+
- npm или yarn

## Установка

```bash
npm install
```

## Разработка

Запуск dev сервера:

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## Сборка

```bash
npm run build
```

## Тестирование

Unit тесты:
```bash
npm run test:unit
```

E2E тесты:
```bash
npm run test:e2e
```

## Форматирование кода

```bash
npm run format
npm run lint
```

## Структура проекта

```
frontend/
├── src/
│   ├── components/      # Vue компоненты
│   │   ├── NarrativeWindow.vue
│   │   ├── PlayerPanel.vue
│   │   └── DiceRollAnimation.vue
│   ├── services/        # API и WebSocket сервисы
│   │   ├── api.service.ts
│   │   └── websocket.service.ts
│   ├── stores/          # Pinia stores
│   │   └── game.store.ts
│   ├── types/           # TypeScript типы
│   │   └── game.ts
│   ├── App.vue          # Главный компонент
│   ├── main.ts          # Точка входа
│   └── style.css        # Глобальные стили
├── tests/
│   └── e2e/             # E2E тесты
└── public/              # Статичные ресурсы
```

## Функциональность

### Реализованные фичи:
- ✅ WebSocket соединение с автоматическим реконнектом
- ✅ Отображение нарративного контента с эффектом печатающегося текста
- ✅ Панель состояния игрока (HP, MP, характеристики)
- ✅ Анимация бросков кубиков с PixiJS
- ✅ Keyboard navigation для accessibility
- ✅ Адаптивный дизайн
- ✅ Retro terminal стилистика

### Accessibility:
- WCAG 2.1 AA совместимость
- Полная keyboard navigation
- ARIA labels и roles
- Screen reader поддержка

## API

Frontend подключается к backend по адресу:
- REST API: http://localhost:8080/api
- WebSocket: ws://localhost:8080/ws

## Переменные окружения

Создайте файл `.env.local`:

```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

## Лицензия

MIT
