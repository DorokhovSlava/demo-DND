# Установка THREE.js для 3D кубика

## Шаг 1: Установить зависимости

```bash
cd frontend
npm install three@latest
npm install --save-dev @types/three
```

## Шаг 2: Проверить установку

После установки в `package.json` должны появиться:

```json
{
  "dependencies": {
    "three": "^0.160.0"  // или новее
  },
  "devDependencies": {
    "@types/three": "^0.160.0"
  }
}
```

## Шаг 3: Использование компонента

### Вариант A: Заменить существующий D20DiceRoller

В `GameView.vue` или другом компоненте где используется `D20DiceRoller`:

```vue
<script setup lang="ts">
// Было:
// import D20DiceRoller from '@/components/D20DiceRoller.vue';

// Стало:
import ThreeD20Dice from '@/components/ThreeD20Dice.vue';
</script>

<template>
  <!-- Было:
  <D20DiceRoller ... />
  -->

  <!-- Стало: -->
  <ThreeD20Dice
    :isVisible="showDiceRoller"
    :diceType="pendingRoll?.diceType || 'd20'"
    :modifier="pendingRoll?.modifier || 0"
    :description="pendingRoll?.description || 'Бросок кубика'"
    :targetDc="pendingRoll?.targetDc"
    :targetName="pendingRoll?.targetName"
    :rollType="pendingRoll?.rollType || 'ATTACK'"
    :requestId="pendingRoll?.requestId || ''"
    @rolled="handleDiceRolled"
    @close="showDiceRoller = false"
  />
</template>
```

### Вариант B: Использовать оба компонента (переключение)

```vue
<script setup lang="ts">
import D20DiceRoller from '@/components/D20DiceRoller.vue';
import ThreeD20Dice from '@/components/ThreeD20Dice.vue';
import { ref } from 'vue';

const use3DDice = ref(true); // Настройка пользователя
</script>

<template>
  <ThreeD20Dice v-if="use3DDice" ... />
  <D20DiceRoller v-else ... />
</template>
```

## Шаг 4: Настройка производительности

### Для слабых устройств

ThreeD20Dice автоматически определяет качество, но можно задать вручную:

```vue
<!-- Компонент показывает переключатель качества в футере -->
<!-- Клик на "🔥 HIGH" / "⚡ FAST" меняет качество -->
```

Или через props (если добавить):

```typescript
// В ThreeD20Dice.vue можно добавить prop:
const props = defineProps<{
  // ... existing props
  forceQuality?: 'high' | 'fast'; // NEW
}>();
```

## Шаг 5: Отладка

Если возникают проблемы:

### Проблема: Canvas пустой / черный экран

**Решение**: Проверить консоль браузера на ошибки THREE.js

### Проблема: Медленная анимация

**Решение**: Переключить на FAST mode (кнопка в футере кубика)

### Проблема: TypeScript ошибки

**Решение**:
```bash
npm install --save-dev @types/three
```

## Шаг 6: Дополнительные улучшения (опционально)

### Добавить звуковые эффекты

```vue
<script setup lang="ts">
const rollSound = new Audio('/sounds/dice-roll.mp3');
const critSound = new Audio('/sounds/critical-hit.mp3');

async function rollDice() {
  rollSound.play();
  // ... existing roll logic

  if (isCritical.value) {
    critSound.play();
  }
}
</script>
```

### Добавить вибрацию (mobile)

```typescript
function rollDice() {
  if ('vibrate' in navigator) {
    navigator.vibrate(200); // 200ms vibration
  }
  // ... existing logic
}
```

## Проверка работоспособности

После установки:

1. Запустить dev server: `npm run dev`
2. Открыть игру в браузере
3. Начать бой
4. Нажать "БРОСИТЬ КУБИК"
5. Должен появиться 3D икосаэдр с плавной анимацией

### Ожидаемый результат:

- ✅ 3D кубик вращается в пространстве
- ✅ Плавная анимация броска (2 секунды)
- ✅ Частицы при критическом успехе/провале
- ✅ Подсветка для nat 20 (золотой) / nat 1 (красный)
- ✅ Переключатель качества работает

## Устранение проблем

### THREE.js не найден

```bash
rm -rf node_modules package-lock.json
npm install
```

### Ошибки TypeScript

Добавить в `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["three"]
  }
}
```

### Canvas не отображается

Проверить CSS:

```css
.dice-canvas {
  width: 100%;
  height: 100%;
  display: block; /* ВАЖНО */
}
```
