<template>
  <span :class="badgeClasses">
    <span v-if="icon" class="badge-icon">{{ icon }}</span>
    <span class="badge-text">
      <slot></slot>
    </span>
    <button
      v-if="removable"
      type="button"
      class="badge-remove ml-1.5 hover:opacity-80 transition-opacity"
      @click="handleRemove"
      aria-label="Remove"
    >
      ✕
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'wisdom' | 'danger' | 'nature' | 'arcane' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  removable?: boolean;
  glow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
  icon: '',
  removable: false,
  glow: false,
});

const emit = defineEmits<{
  remove: [];
}>();

const badgeClasses = computed(() => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'gap-1',
    'rounded-full',
    'font-accent',
    'font-bold',
    'border',
    'transition-all',
    'duration-200',
  ];
  
  // Размеры
  const sizeClasses = {
    sm: ['px-2', 'py-0.5', 'text-xs'],
    md: ['px-3', 'py-1', 'text-sm'],
    lg: ['px-4', 'py-1.5', 'text-base'],
  };
  
  // Варианты
  const variantClasses = {
    wisdom: [
      'bg-wisdom',
      'bg-opacity-20',
      'text-wisdom',
      'border-wisdom',
      props.glow ? 'shadow-wisdom' : '',
    ],
    danger: [
      'bg-danger',
      'bg-opacity-20',
      'text-danger',
      'border-danger',
      props.glow ? 'shadow-danger' : '',
    ],
    nature: [
      'bg-nature',
      'bg-opacity-20',
      'text-nature',
      'border-nature',
      props.glow ? 'shadow-nature' : '',
    ],
    arcane: [
      'bg-arcane',
      'bg-opacity-20',
      'text-arcane',
      'border-arcane',
      props.glow ? 'shadow-arcane' : '',
    ],
    neutral: [
      'bg-parchment',
      'bg-opacity-10',
      'text-parchment',
      'border-parchment-dark',
    ],
  };
  
  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...variantClasses[props.variant],
  ];
});

const handleRemove = () => {
  emit('remove');
};
</script>

<style scoped>
.badge-icon {
  display: inline-flex;
  align-items: center;
  font-size: 1.1em;
}

.badge-text {
  line-height: 1;
}

.badge-remove {
  display: inline-flex;
  align-items: center;
  font-size: 1em;
  line-height: 1;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: inherit;
}
</style>

