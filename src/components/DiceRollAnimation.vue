<template>
  <div
    v-if="props.diceResult?.diceRoll"
    ref="canvasContainer"
    class="dice-container"
    role="img"
    :aria-label="diceAriaLabel"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as PIXI from 'pixi.js';
import type { MechanicsResult } from '@/types/game';

const props = defineProps<{
  diceResult: MechanicsResult | null;
}>();

const canvasContainer = ref<HTMLDivElement | null>(null);
let app: PIXI.Application | null = null;
let diceSprite: PIXI.Sprite | null = null;
let animationId: number | null = null;

/**
 * ARIA label для accessibility.
 */
const diceAriaLabel = computed(() => {
  if (!props.diceResult?.diceRoll) return 'Бросок кубика';
  return `Бросок кубика: ${props.diceResult.diceRoll}`;
});

/**
 * Инициализирует PixiJS приложение.
 */
async function initPixi(): Promise<void> {
  if (!canvasContainer.value) return;
  
  app = new PIXI.Application({
    width: 200,
    height: 200,
    backgroundColor: 0x1a1a1a,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  
  canvasContainer.value.appendChild(app.view as unknown as Node);
}

/**
 * Анимирует бросок кубика.
 * 
 * @param result результат броска
 */
function animateDiceRoll(result: MechanicsResult): void {
  if (!app || !result.diceRoll) return;
  
  // Очищаем предыдущую анимацию
  if (diceSprite) {
    app.stage.removeChild(diceSprite);
    diceSprite.destroy();
  }
  
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  // Создаем спрайт кубика
  const diceTexture = createDiceTexture(result.diceRoll);
  diceSprite = new PIXI.Sprite(diceTexture);
  diceSprite.anchor.set(0.5);
  diceSprite.x = app.screen.width / 2;
  diceSprite.y = app.screen.height / 2;
  diceSprite.scale.set(0.5);
  
  app.stage.addChild(diceSprite);
  
  // Анимация вращения
  const startTime = Date.now();
  const duration = 1000; // 1 секунда
  const targetRotation = Math.PI * 4; // 2 полных оборота
  
  function animate(): void {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing функция (ease-out cubic)
    const eased = 1 - Math.pow(1 - progress, 3);
    
    if (diceSprite) {
      diceSprite.rotation = targetRotation * eased;
      diceSprite.scale.set(0.5 + (eased * 0.3)); // Немного увеличиваем при вращении
    }
    
    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      // Финальное значение
      if (diceSprite) {
        diceSprite.rotation = 0;
        diceSprite.scale.set(0.5);
      }
      animationId = null;
    }
  }
  
  animate();
}

/**
 * Создает текстуру кубика с числом.
 * 
 * @param value значение на кубике (1-20)
 * @returns текстура
 */
function createDiceTexture(value: number): PIXI.Texture {
  if (!app) throw new Error('Pixi app not initialized');
  
  const graphics = new PIXI.Graphics();
  const size = 150;
  
  // Рисуем кубик (d20 - икосаэдр, упрощенная версия - квадрат)
  graphics.lineStyle(3, 0x000000);
  graphics.beginFill(0xffffff);
  graphics.drawRect(0, 0, size, size);
  graphics.endFill();
  
  // Рисуем число
  const text = new PIXI.Text(value.toString(), {
    fontFamily: 'Arial',
    fontSize: 48,
    fill: 0x000000,
    fontWeight: 'bold',
  });
  
  text.anchor.set(0.5);
  text.x = size / 2;
  text.y = size / 2;
  
  // Создаем контейнер
  const container = new PIXI.Container();
  container.addChild(graphics);
  container.addChild(text);
  
  return app.renderer.generateTexture(container);
}

watch(() => props.diceResult, (newResult) => {
  if (newResult && newResult.diceRoll) {
    animateDiceRoll(newResult);
  }
});

onMounted(() => {
  initPixi();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (diceSprite) {
    diceSprite.destroy();
  }
  if (app) {
    app.destroy(true);
  }
});
</script>

<style scoped>
.dice-container {
  @apply w-48 h-48 mx-auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
