<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Header -->
      <div class="register-header">
        <h1 class="register-title">AI Dungeon Master</h1>
        <p class="register-subtitle">Create Your Character</p>
        <div class="gold-divider"></div>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Username -->
        <div class="form-field">
          <label for="username" class="field-label">
            <span class="label-icon">&#9876;</span>
            Character Name
          </label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            class="field-input"
            :class="{ 'input-error': errors.username }"
            placeholder="3-50 characters"
            required
            autocomplete="username"
            :disabled="authStore.isLoading"
            @blur="validateField('username')"
          />
          <span v-if="errors.username" class="error-text">
            {{ errors.username }}
          </span>
        </div>

        <!-- Email -->
        <div class="form-field">
          <label for="email" class="field-label">
            <span class="label-icon">&#128220;</span>
            Messenger Scroll
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            class="field-input"
            :class="{ 'input-error': errors.email }"
            placeholder="your@email.com"
            required
            autocomplete="email"
            :disabled="authStore.isLoading"
            @blur="validateField('email')"
          />
          <span v-if="errors.email" class="error-text">
            {{ errors.email }}
          </span>
        </div>

        <!-- Password -->
        <div class="form-field">
          <label for="password" class="field-label">
            <span class="label-icon">&#128477;</span>
            Secret Passphrase
          </label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            class="field-input"
            :class="{ 'input-error': errors.password }"
            placeholder="Minimum 6 characters"
            required
            autocomplete="new-password"
            :disabled="authStore.isLoading"
            @blur="validateField('password')"
          />
          <span v-if="errors.password" class="error-text">
            {{ errors.password }}
          </span>
        </div>

        <!-- Confirm Password -->
        <div class="form-field">
          <label for="confirmPassword" class="field-label">
            <span class="label-icon">&#128274;</span>
            Confirm Passphrase
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="field-input"
            :class="{ 'input-error': errors.confirmPassword }"
            placeholder="Repeat your passphrase"
            required
            autocomplete="new-password"
            :disabled="authStore.isLoading"
            @blur="validateField('confirmPassword')"
          />
          <span v-if="errors.confirmPassword" class="error-text">
            {{ errors.confirmPassword }}
          </span>
        </div>

        <!-- Error message -->
        <div v-if="authStore.error" class="error-banner">
          <span class="error-icon">&#9888;</span>
          <span>{{ authStore.error }}</span>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          class="btn-submit"
          :disabled="authStore.isLoading || !isFormValid"
        >
          <span v-if="authStore.isLoading" class="btn-loading">Forging Character...</span>
          <span v-else>Begin Adventure</span>
        </button>

        <!-- Link to login -->
        <div class="register-footer">
          <span class="footer-text">Already an adventurer?</span>
          <button
            type="button"
            @click="$emit('switch-to-login')"
            class="footer-link"
            :disabled="authStore.isLoading"
          >
            Enter Dungeon &#8594;
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import type { RegisterRequest } from '@/types/auth';

const emit = defineEmits<{
  'switch-to-login': []
  'register-success': []
}>();

const authStore = useAuthStore();

const formData = ref<RegisterRequest>({
  username: '',
  email: '',
  password: '',
});

const confirmPassword = ref('');
const errors = ref<Record<string, string>>({});

const isFormValid = computed(() => {
  return (
    formData.value.username.length >= 3 &&
    formData.value.username.length <= 50 &&
    formData.value.email.length > 0 &&
    isValidEmail(formData.value.email) &&
    formData.value.password.length >= 6 &&
    formData.value.password === confirmPassword.value
  );
});

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateField(field: string): void {
  switch (field) {
    case 'username':
      if (formData.value.username.length < 3) {
        errors.value.username = 'Minimum 3 characters';
      } else if (formData.value.username.length > 50) {
        errors.value.username = 'Maximum 50 characters';
      } else {
        delete errors.value.username;
      }
      break;

    case 'email':
      if (!formData.value.email) {
        errors.value.email = 'Email is required';
      } else if (!isValidEmail(formData.value.email)) {
        errors.value.email = 'Invalid email format';
      } else {
        delete errors.value.email;
      }
      break;

    case 'password':
      if (formData.value.password.length < 6) {
        errors.value.password = 'Minimum 6 characters';
      } else {
        delete errors.value.password;
      }

      if (confirmPassword.value && formData.value.password !== confirmPassword.value) {
        errors.value.confirmPassword = 'Passphrases do not match';
      } else {
        delete errors.value.confirmPassword;
      }
      break;

    case 'confirmPassword':
      if (formData.value.password !== confirmPassword.value) {
        errors.value.confirmPassword = 'Passphrases do not match';
      } else {
        delete errors.value.confirmPassword;
      }
      break;
  }
}

function validateForm(): boolean {
  errors.value = {};

  validateField('username');
  validateField('email');
  validateField('password');
  validateField('confirmPassword');

  return Object.keys(errors.value).length === 0;
}

async function handleRegister(): Promise<void> {
  if (!validateForm()) {
    return;
  }

  authStore.clearError();

  try {
    await authStore.register(formData.value);
    emit('register-success');
  } catch (error) {
    console.error('Registration failed', error);
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
}

.register-container {
  position: relative;
  max-width: 460px;
  width: 100%;
  padding: 2.5rem;
  background: var(--bg-base);
  border: 1px solid rgba(218, 165, 32, 0.12);
  border-top: 2px solid var(--gold-muted);
  border-radius: 12px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(218, 165, 32, 0.05);
  animation: cardEnter 0.5s ease-out;
}

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(15px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Header */
.register-header {
  text-align: center;
  margin-bottom: 1.75rem;
  padding-bottom: 1.25rem;
}

.register-title {
  font-family: 'Cinzel', serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  margin: 0 0 0.4rem 0;
}

.register-subtitle {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.8rem;
  color: var(--text-dim);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0 0 1.25rem 0;
}

.gold-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-muted), var(--gold), var(--gold-muted), transparent);
}

/* Form */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--gold-muted);
}

.label-icon {
  font-size: 0.85rem;
  color: var(--gold);
}

.field-input {
  width: 100%;
  padding: 0.7rem 1rem;
  background: var(--bg-deep);
  border: 1px solid var(--bg-surface);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
  transition: all 0.25s ease;
}

.field-input::placeholder {
  color: var(--text-dim);
}

.field-input:focus {
  outline: none;
  border-color: rgba(218, 165, 32, 0.4);
  box-shadow: 0 0 12px rgba(218, 165, 32, 0.15);
}

.field-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.field-input.input-error {
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.15);
}

.error-text {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.7rem;
  font-style: italic;
  color: #f87171;
}

/* Error banner */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 6px;
  color: #f87171;
  font-family: 'Cormorant Garamond', serif;
}

.error-icon {
  font-size: 1.2rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Submit */
.btn-submit {
  width: 100%;
  padding: 0.85rem;
  background: linear-gradient(135deg, var(--gold-dark), var(--gold));
  border: none;
  border-radius: 8px;
  color: var(--bg-abyss);
  font-family: 'Cinzel', serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(218, 165, 32, 0.3);
  margin-top: 0.5rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(218, 165, 32, 0.45);
  filter: brightness(1.1);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loading {
  animation: pulse 1.5s infinite;
}

/* Footer */
.register-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.75rem;
  padding-top: 1rem;
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

/* Responsive */
@media (max-width: 480px) {
  .register-container {
    padding: 1.5rem;
  }

  .register-title {
    font-size: 1.4rem;
  }
}
</style>
