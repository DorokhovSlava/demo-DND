<template>
  <div class="grimoire-input-wrapper">
    <!-- Лейбл -->
    <label 
      v-if="label" 
      :for="inputId" 
      class="block mb-2 font-accent font-bold text-parchment text-sm tracking-wide"
    >
      {{ label }}
      <span v-if="required" class="text-danger ml-1">*</span>
    </label>
    
    <!-- Инпут с иконкой -->
    <div class="relative">
      <!-- Иконка слева -->
      <span 
        v-if="icon" 
        class="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl pointer-events-none opacity-60"
      >
        {{ icon }}
      </span>
      
      <!-- Поле ввода -->
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <!-- Индикатор состояния справа -->
      <div 
        v-if="status" 
        class="absolute right-4 top-1/2 transform -translate-y-1/2"
      >
        <span v-if="status === 'success'" class="text-nature text-xl">✓</span>
        <span v-if="status === 'error'" class="text-danger text-xl">✕</span>
        <span v-if="status === 'loading'" class="text-wisdom text-xl animate-spin">⚗</span>
      </div>
    </div>
    
    <!-- Сообщение об ошибке/подсказка -->
    <transition name="slide-down">
      <p 
        v-if="errorMessage || hint" 
        :class="messageClasses"
        class="mt-2 text-sm"
      >
        {{ errorMessage || hint }}
      </p>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
  modelValue: string | number;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  label?: string;
  placeholder?: string;
  icon?: string;
  disabled?: boolean;
  required?: boolean;
  errorMessage?: string;
  hint?: string;
  status?: 'success' | 'error' | 'loading';
  glow?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  label: '',
  placeholder: '',
  icon: '',
  disabled: false,
  required: false,
  errorMessage: '',
  hint: '',
  glow: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  focus: [];
  blur: [];
}>();

const inputId = `grimoire-input-${Math.random().toString(36).substr(2, 9)}`;
const isFocused = ref(false);

const inputClasses = computed(() => {
  const baseClasses = [
    'w-full',
    'rounded-lg',
    'bg-grimoire-darker',
    'border',
    'text-parchment',
    'placeholder-parchment-dark',
    'transition-all',
    'duration-300',
    'ease-out',
    'focus:outline-none',
    props.icon ? 'pl-12 pr-4' : 'px-4',
    props.status ? 'pr-12' : '',
    'py-3',
  ];
  
  const stateClasses = [];
  
  if (props.disabled) {
    stateClasses.push('opacity-50', 'cursor-not-allowed');
  } else if (props.errorMessage || props.status === 'error') {
    stateClasses.push(
      'border-danger',
      'focus:border-danger',
      'focus:shadow-danger',
      'focus:ring-2',
      'focus:ring-danger',
      'focus:ring-opacity-50'
    );
  } else if (props.status === 'success') {
    stateClasses.push(
      'border-nature',
      'focus:border-nature',
      'focus:shadow-nature',
      'focus:ring-2',
      'focus:ring-nature',
      'focus:ring-opacity-50'
    );
  } else {
    stateClasses.push(
      'border-ink-dark',
      'focus:border-arcane',
      'focus:shadow-arcane',
      'focus:ring-2',
      'focus:ring-arcane',
      'focus:ring-opacity-50'
    );
    
    if (props.glow && isFocused.value) {
      stateClasses.push('animate-glow-arcane');
    }
  }
  
  return [...baseClasses, ...stateClasses];
});

const messageClasses = computed(() => {
  if (props.errorMessage || props.status === 'error') {
    return 'text-danger font-accent';
  }
  return 'text-parchment-dark font-body';
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = props.type === 'number' ? Number(target.value) : target.value;
  emit('update:modelValue', value);
};

const handleFocus = () => {
  isFocused.value = true;
  emit('focus');
};

const handleBlur = () => {
  isFocused.value = false;
  emit('blur');
};
</script>

<style scoped>
/* Анимация появления сообщения */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

