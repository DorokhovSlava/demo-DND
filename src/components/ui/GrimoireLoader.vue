<template>
  <div :class="loaderWrapperClasses">
    <div class="loader-content">
      <!-- Анимированный символ алхимии -->
      <div :class="loaderIconClasses">
        <span class="alchemy-symbol">{{ symbol }}</span>
      </div>
      
      <!-- Текст загрузки -->
      <p v-if="text" :class="loaderTextClasses">
        {{ text }}
      </p>
      
      <!-- Прогресс бар (опционально) -->
      <div v-if="showProgress && progress !== null" class="loader-progress mt-4">
        <div class="progress-bar-wrapper">
          <div 
            class="progress-bar-fill"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <p class="progress-text mt-2 text-sm text-parchment-dark">
          {{ progress }}%
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'wisdom' | 'arcane' | 'nature' | 'danger';
  text?: string;
  symbol?: string;
  fullscreen?: boolean;
  showProgress?: boolean;
  progress?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'arcane',
  text: '',
  symbol: '⚗',
  fullscreen: false,
  showProgress: false,
  progress: null,
});

const loaderWrapperClasses = computed(() => {
  const baseClasses = [
    'loader-wrapper',
    'flex',
    'items-center',
    'justify-center',
  ];
  
  if (props.fullscreen) {
    baseClasses.push(
      'fixed',
      'inset-0',
      'z-50',
      'bg-grimoire-primary',
      'bg-opacity-95',
      'backdrop-blur-sm'
    );
  } else {
    baseClasses.push('p-8');
  }
  
  return baseClasses;
});

const loaderIconClasses = computed(() => {
  const sizeClasses = {
    sm: ['text-4xl', 'w-16', 'h-16'],
    md: ['text-6xl', 'w-24', 'h-24'],
    lg: ['text-8xl', 'w-32', 'h-32'],
    xl: ['text-9xl', 'w-40', 'h-40'],
  };
  
  const variantClasses = {
    wisdom: ['text-wisdom', 'animate-glow-wisdom'],
    arcane: ['text-arcane', 'animate-glow-arcane'],
    nature: ['text-nature', 'animate-glow-nature'],
    danger: ['text-danger', 'animate-glow-danger'],
  };
  
  return [
    'loader-icon',
    'flex',
    'items-center',
    'justify-center',
    'animate-spin-slow',
    ...sizeClasses[props.size],
    ...variantClasses[props.variant],
  ];
});

const loaderTextClasses = computed(() => {
  return [
    'mt-6',
    'text-center',
    'font-accent',
    'text-parchment',
    'animate-pulse-subtle',
  ];
});
</script>

<style scoped>
.alchemy-symbol {
  display: inline-block;
  animation: rotate-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes rotate-pulse {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(90deg) scale(1.1);
  }
  50% {
    transform: rotate(180deg) scale(1);
  }
  75% {
    transform: rotate(270deg) scale(1.1);
  }
}

.animate-spin-slow {
  animation: spin 4s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.progress-bar-wrapper {
  width: 100%;
  height: 8px;
  background: var(--grimoire-darker);
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid var(--ink-dark);
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--arcane), var(--wisdom));
  border-radius: 9999px;
  transition: width 0.3s ease-out;
  box-shadow: 0 0 10px var(--arcane-glow);
}

.progress-text {
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
}
</style>

