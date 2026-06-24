<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        @click="handleOverlayClick"
      >
        <Transition name="modal-slide">
          <div
            v-if="modelValue"
            :class="modalClasses"
            @click.stop
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
          >
            <!-- Заголовок -->
            <div v-if="$slots.header || title" class="modal-header">
              <slot name="header">
                <div class="flex items-center justify-between">
                  <h2 :id="titleId" class="text-2xl font-heading font-bold text-parchment flex items-center gap-3">
                    <span v-if="icon" class="text-3xl">{{ icon }}</span>
                    {{ title }}
                  </h2>
                  <button
                    v-if="closable"
                    type="button"
                    class="close-button text-parchment-dark hover:text-parchment transition-colors text-2xl"
                    @click="handleClose"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                </div>
              </slot>
            </div>
            
            <!-- Контент -->
            <div class="modal-content">
              <slot></slot>
            </div>
            
            <!-- Футер -->
            <div v-if="$slots.footer" class="modal-footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

interface Props {
  modelValue: boolean;
  title?: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  closeOnOverlay?: boolean;
  variant?: 'grimoire' | 'parchment';
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  icon: '',
  size: 'md',
  closable: true,
  closeOnOverlay: true,
  variant: 'grimoire',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;

const modalClasses = computed(() => {
  const baseClasses = [
    'modal-container',
    'relative',
    'rounded-lg',
    'shadow-grimoire-lg',
    'overflow-hidden',
    'w-full',
    'max-h-[90vh]',
    'overflow-y-auto',
  ];
  
  const sizeClasses = {
    sm: ['max-w-md'],
    md: ['max-w-2xl'],
    lg: ['max-w-4xl'],
    xl: ['max-w-6xl'],
    full: ['max-w-7xl', 'h-[90vh]'],
  };
  
  const variantClasses = {
    grimoire: [
      'bg-grimoire-light',
      'border-2',
      'border-arcane',
      'grimoire-texture',
      'text-parchment',
    ],
    parchment: [
      'bg-parchment-light',
      'border-2',
      'border-ink',
      'parchment-texture',
      'text-ink',
    ],
  };
  
  return [
    ...baseClasses,
    ...sizeClasses[props.size],
    ...variantClasses[props.variant],
  ];
});

const handleClose = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleOverlayClick = () => {
  if (props.closeOnOverlay && props.closable) {
    handleClose();
  }
};

// Блокировка скролла body при открытии модального окна
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});
</script>

<style scoped>
.modal-overlay {
  background: rgba(26, 15, 29, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--ink-dark);
}

.modal-content {
  padding: 2rem;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--ink-dark);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.close-button:hover {
  background: var(--highlight);
}

/* Анимации */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-slide-leave-active {
  transition: all 0.3s ease;
}

.modal-slide-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.modal-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

/* Кастомный скроллбар для модального окна */
.modal-container::-webkit-scrollbar {
  width: 8px;
}

.modal-container::-webkit-scrollbar-track {
  background: var(--grimoire-darker);
}

.modal-container::-webkit-scrollbar-thumb {
  background: var(--arcane);
  border-radius: 4px;
}

.modal-container::-webkit-scrollbar-thumb:hover {
  background: var(--wisdom);
}
</style>

