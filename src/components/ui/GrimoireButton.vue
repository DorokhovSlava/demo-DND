<template>
  <button
    :class="buttonClasses"
    :type="type"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="animate-spin mr-2">⚗</span>
    <span v-if="icon && !loading" class="mr-2">{{ icon }}</span>
    <span class="button-content">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'wisdom' | 'nature' | 'arcane';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  glow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  icon: '',
  glow: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
  const baseClasses = [
    'relative',
    'inline-flex',
    'items-center',
    'justify-center',
    'font-heading',
    'font-semibold',
    'rounded-lg',
    'transition-all',
    'duration-300',
    'ease-out',
    'focus:outline-none',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'disabled:transform-none',
  ];
  
  // Размеры
  const sizeClasses = {
    sm: ['px-4', 'py-2', 'text-sm'],
    md: ['px-6', 'py-3', 'text-base'],
    lg: ['px-8', 'py-4', 'text-lg'],
  };
  
  // Варианты
  const variantClasses = {
    primary: [
      'bg-gradient-to-br',
      'from-arcane',
      'to-arcane-dark',
      'text-parchment',
      'shadow-arcane',
      'hover:shadow-wisdom',
      'hover:scale-105',
      'active:scale-100',
      'focus:ring-2',
      'focus:ring-arcane',
      'focus:ring-offset-2',
      'focus:ring-offset-grimoire-primary',
      props.glow ? 'animate-glow-arcane' : '',
    ],
    secondary: [
      'bg-ink-light',
      'text-parchment',
      'border',
      'border-ink-dark',
      'hover:bg-ink',
      'hover:border-arcane',
      'hover:shadow-arcane',
      'active:scale-95',
      'focus:ring-2',
      'focus:ring-ink',
    ],
    danger: [
      'bg-gradient-to-br',
      'from-danger',
      'to-danger-dark',
      'text-parchment',
      'shadow-danger',
      'hover:scale-105',
      'active:scale-100',
      props.glow ? 'animate-glow-danger' : '',
    ],
    wisdom: [
      'bg-gradient-to-br',
      'from-wisdom',
      'to-wisdom-dark',
      'text-grimoire-primary',
      'shadow-wisdom',
      'hover:scale-105',
      'active:scale-100',
      props.glow ? 'animate-glow-wisdom' : '',
    ],
    nature: [
      'bg-gradient-to-br',
      'from-nature',
      'to-nature-dark',
      'text-grimoire-primary',
      'shadow-nature',
      'hover:scale-105',
      'active:scale-100',
      props.glow ? 'animate-glow-nature' : '',
    ],
    arcane: [
      'bg-gradient-to-br',
      'from-arcane',
      'to-arcane-dark',
      'text-parchment',
      'shadow-arcane',
      'hover:scale-105',
      'active:scale-100',
      props.glow ? 'animate-glow-arcane' : '',
    ],
  };
  
  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...variantClasses[props.variant],
  ];
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<style scoped>
.button-content {
  position: relative;
  z-index: 1;
}

/* Эффект мерцания при загрузке */
button[disabled] {
  pointer-events: none;
}
</style>

