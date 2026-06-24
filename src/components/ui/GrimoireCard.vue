<template>
  <div :class="cardClasses" @click="handleClick">
    <!-- Заголовок карточки -->
    <div v-if="$slots.header || title" class="card-header mb-4">
      <slot name="header">
        <h3 class="text-xl font-heading font-semibold flex items-center gap-2">
          <span v-if="icon" class="text-2xl">{{ icon }}</span>
          {{ title }}
        </h3>
      </slot>
    </div>
    
    <!-- Основной контент -->
    <div class="card-content">
      <slot></slot>
    </div>
    
    <!-- Футер карточки -->
    <div v-if="$slots.footer" class="card-footer mt-4 pt-4 border-t border-ink-dark/30">
      <slot name="footer"></slot>
    </div>
    
    <!-- Магическое свечение по краю (опционально) -->
    <div v-if="glow" :class="glowClasses"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'grimoire' | 'parchment' | 'glass';
  title?: string;
  icon?: string;
  glow?: boolean;
  glowColor?: 'wisdom' | 'danger' | 'nature' | 'arcane';
  hoverable?: boolean;
  clickable?: boolean;
  animated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'grimoire',
  title: '',
  icon: '',
  glow: false,
  glowColor: 'arcane',
  hoverable: true,
  clickable: false,
  animated: false,
});

const emit = defineEmits<{
  click: [];
}>();

const cardClasses = computed(() => {
  const baseClasses = [
    'relative',
    'overflow-hidden',
    'rounded-lg',
    'transition-all',
    'duration-300',
    'ease-out',
  ];
  
  const variantClasses = {
    grimoire: [
      'bg-grimoire-light',
      'border',
      'border-ink-dark',
      'shadow-grimoire',
      'grimoire-texture',
      props.hoverable ? 'hover:shadow-grimoire-lg hover:transform hover:-translate-y-1' : '',
    ],
    parchment: [
      'bg-parchment-light',
      'text-ink',
      'shadow-parchment',
      'parchment-texture',
      props.hoverable ? 'hover:shadow-parchment-hover' : '',
    ],
    glass: [
      'glass',
      props.hoverable ? 'hover:bg-opacity-60' : '',
    ],
  };
  
  const interactionClasses = [
    props.clickable ? 'cursor-pointer' : '',
    props.animated ? 'animate-card-enter' : '',
  ];
  
  return [
    ...baseClasses,
    ...variantClasses[props.variant],
    ...interactionClasses,
  ];
});

const glowClasses = computed(() => {
  const glowColors = {
    wisdom: 'animate-glow-wisdom',
    danger: 'animate-glow-danger',
    nature: 'animate-glow-nature',
    arcane: 'animate-glow-arcane',
  };
  
  return [
    'absolute',
    'inset-0',
    'pointer-events-none',
    'rounded-lg',
    glowColors[props.glowColor],
  ];
});

const handleClick = () => {
  if (props.clickable) {
    emit('click');
  }
};
</script>

<style scoped>
.card-header {
  user-select: none;
}

/* Эффект появления контента */
.card-content {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

