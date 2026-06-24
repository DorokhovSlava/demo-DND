<template>
  <div class="login-page">
    <!-- Floating symbols -->
    <div class="floating-symbols" aria-hidden="true">
      <span class="symbol symbol-1">&#9670;</span>
      <span class="symbol symbol-2">&#10022;</span>
      <span class="symbol symbol-3">&#10070;</span>
    </div>

    <div class="login-container">
      <!-- Header -->
      <div class="login-header">
        <h1 class="login-title">
          <span class="title-ornament">&#10022;</span>
          AI Dungeon Master
          <span class="title-ornament">&#10022;</span>
        </h1>
        <p class="login-subtitle">Enter the Realm of Infinite Stories</p>
        <div class="gold-divider"></div>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Username -->
        <GrimoireInput
          v-model="formData.username"
          type="text"
          label="Adventurer Name or Email"
          icon="&#9876;"
          placeholder="Enter your name or email..."
          :error-message="errors.username"
          :disabled="authStore.isLoading"
          :status="errors.username ? 'error' : undefined"
          required
          glow
        />

        <!-- Password -->
        <GrimoireInput
          v-model="formData.password"
          type="password"
          label="Secret Passphrase"
          icon="&#128477;"
          placeholder="Enter your passphrase..."
          :error-message="errors.password"
          :disabled="authStore.isLoading"
          :status="errors.password ? 'error' : undefined"
          required
          glow
        />

        <!-- Error message -->
        <transition name="slide-down">
          <div v-if="authStore.error" class="error-banner">
            <span class="error-icon">&#9888;</span>
            <span class="error-text">{{ authStore.error }}</span>
          </div>
        </transition>

        <!-- Submit button -->
        <GrimoireButton
          type="submit"
          variant="primary"
          size="lg"
          :loading="authStore.isLoading"
          :disabled="authStore.isLoading || !isFormValid"
          icon="&#10022;"
          glow
          class="w-full"
        >
          <span v-if="authStore.isLoading">Opening the Portal...</span>
          <span v-else>Enter the Realm</span>
        </GrimoireButton>

        <!-- Link to register -->
        <div class="login-footer">
          <span class="footer-text">New to the realm?</span>
          <button
            type="button"
            @click="$emit('switch-to-register')"
            class="footer-link"
            :disabled="authStore.isLoading"
          >
            Create Character &#8594;
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginRequest } from '@/types/auth';
import { GrimoireInput, GrimoireButton } from '@/components/ui';

const emit = defineEmits<{
  'switch-to-register': []
  'login-success': []
}>();

const authStore = useAuthStore();

const formData = ref<LoginRequest>({
  username: '',
  password: '',
});

const errors = ref<Record<string, string>>({});

const isFormValid = computed(() => {
  return formData.value.username.length >= 3 && formData.value.password.length >= 6;
});

function validateForm(): boolean {
  errors.value = {};

  if (formData.value.username.length < 3) {
    errors.value.username = 'Name must be at least 3 characters';
  }

  if (formData.value.password.length < 6) {
    errors.value.password = 'Passphrase must be at least 6 characters';
  }

  return Object.keys(errors.value).length === 0;
}

async function handleLogin(): Promise<void> {
  if (!validateForm()) {
    return;
  }

  authStore.clearError();

  try {
    await authStore.login(formData.value);
    emit('login-success');
  } catch (error) {
    console.error('Login failed', error);
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Floating symbols */
.floating-symbols {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.symbol {
  position: absolute;
  font-size: 2rem;
  opacity: 0.08;
  color: var(--gold);
  animation: symbolFloat 8s ease-in-out infinite;
}

.symbol-1 { top: 15%; left: 10%; animation-delay: 0s; }
.symbol-2 { top: 25%; right: 15%; animation-delay: 2s; }
.symbol-3 { bottom: 20%; left: 15%; animation-delay: 4s; }

@keyframes symbolFloat {
  0%, 100% { transform: translateY(0); opacity: 0.08; }
  50% { transform: translateY(-12px); opacity: 0.15; }
}

/* Container */
.login-container {
  position: relative;
  z-index: 1;
  max-width: 440px;
  width: 100%;
  padding: 2.5rem;
  background: var(--bg-base);
  border: 1px solid rgba(218, 165, 32, 0.12);
  border-top: 2px solid var(--gold-muted);
  border-radius: 12px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(218, 165, 32, 0.05);
  animation: cardEnter 0.6s ease-out;
}

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(15px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
}

.login-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-family: 'Cinzel', serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  margin: 0 0 0.5rem 0;
}

.title-ornament {
  color: var(--gold);
  font-size: 1.3rem;
  animation: pulseSubtle 3s ease-in-out infinite;
}

@keyframes pulseSubtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.login-subtitle {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
  color: var(--text-secondary);
  letter-spacing: 0.08em;
  margin: 0 0 1.25rem 0;
}

.gold-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-muted), var(--gold), var(--gold-muted), transparent);
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Error banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 8px;
}

.error-icon {
  font-size: 1.3rem;
  color: var(--hp-low);
}

.error-text {
  color: #f87171;
  font-family: 'Cormorant Garamond', serif;
}

/* Footer */
.login-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(218, 165, 32, 0.08);
}

.footer-text {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.8rem;
  color: var(--text-dim);
}

.footer-link {
  background: none;
  border: none;
  padding: 0;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gold);
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-link:hover:not(:disabled) {
  color: var(--gold-bright);
  text-shadow: 0 0 8px rgba(218, 165, 32, 0.3);
}

.footer-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    padding: 1.5rem;
  }

  .login-title {
    font-size: 1.4rem;
    flex-direction: column;
    gap: 0.3rem;
  }

  .title-ornament {
    font-size: 1rem;
  }
}
</style>
