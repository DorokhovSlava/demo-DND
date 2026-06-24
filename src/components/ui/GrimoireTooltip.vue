<template>
  <div 
    class="tooltip-wrapper inline-block relative"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
    @focus="showTooltip"
    @blur="hideTooltip"
  >
    <!-- Триггер элемент -->
    <slot></slot>
    
    <!-- Тултип -->
    <Transition name="tooltip-fade">
      <div
        v-if="isVisible && (text || $slots.content)"
        :class="tooltipClasses"
        role="tooltip"
      >
        <slot name="content">
          {{ text }}
        </slot>
        
        <!-- Стрелка -->
        <div :class="arrowClasses"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  text?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'dark' | 'light' | 'wisdom' | 'arcane';
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  position: 'top',
  variant: 'dark',
  delay: 200,
});

const isVisible = ref(false);
let timeoutId: number | null = null;

const showTooltip = () => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = window.setTimeout(() => {
    isVisible.value = true;
  }, props.delay);
};

const hideTooltip = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  isVisible.value = false;
};

const tooltipClasses = computed(() => {
  const baseClasses = [
    'tooltip',
    'absolute',
    'z-50',
    'px-3',
    'py-2',
    'rounded-lg',
    'text-sm',
    'font-body',
    'whitespace-nowrap',
    'pointer-events-none',
    'shadow-grimoire',
  ];
  
  // Позиционирование
  const positionClasses = {
    top: ['bottom-full', 'left-1/2', 'transform', '-translate-x-1/2', 'mb-2'],
    bottom: ['top-full', 'left-1/2', 'transform', '-translate-x-1/2', 'mt-2'],
    left: ['right-full', 'top-1/2', 'transform', '-translate-y-1/2', 'mr-2'],
    right: ['left-full', 'top-1/2', 'transform', '-translate-y-1/2', 'ml-2'],
  };
  
  // Варианты
  const variantClasses = {
    dark: ['bg-grimoire-darker', 'text-parchment', 'border', 'border-ink-dark'],
    light: ['bg-parchment-light', 'text-ink', 'border', 'border-ink-dark'],
    wisdom: ['bg-wisdom', 'bg-opacity-90', 'text-grimoire-primary', 'shadow-wisdom'],
    arcane: ['bg-arcane', 'bg-opacity-90', 'text-parchment', 'shadow-arcane'],
  };
  
  return [
    ...baseClasses,
    ...positionClasses[props.position],
    ...variantClasses[props.variant],
  ];
});

const arrowClasses = computed(() => {
  const baseClasses = [
    'tooltip-arrow',
    'absolute',
    'w-2',
    'h-2',
    'transform',
    'rotate-45',
  ];
  
  // Позиция стрелки
  const arrowPositionClasses = {
    top: ['bottom-[-4px]', 'left-1/2', '-translate-x-1/2'],
    bottom: ['top-[-4px]', 'left-1/2', '-translate-x-1/2'],
    left: ['right-[-4px]', 'top-1/2', '-translate-y-1/2'],
    right: ['left-[-4px]', 'top-1/2', '-translate-y-1/2'],
  };
  
  // Цвет стрелки
  const arrowVariantClasses = {
    dark: ['bg-grimoire-darker', 'border-r', 'border-b', 'border-ink-dark'],
    light: ['bg-parchment-light', 'border-r', 'border-b', 'border-ink-dark'],
    wisdom: ['bg-wisdom', 'bg-opacity-90'],
    arcane: ['bg-arcane', 'bg-opacity-90'],
  };
  
  return [
    ...baseClasses,
    ...arrowPositionClasses[props.position],
    ...arrowVariantClasses[props.variant],
  ];
});
</script>

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}

.tooltip-fade-enter-from {
  transform: translateY(5px);
}

.tooltip-fade-leave-to {
  transform: translateY(-5px);
}
</style>

