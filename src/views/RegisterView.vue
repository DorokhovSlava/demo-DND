<template>
  <RegisterForm
    @switch-to-login="goToLogin"
    @register-success="handleRegisterSuccess"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import RegisterForm from '@/components/RegisterForm.vue';

const router = useRouter();

/**
 * Переключает на страницу входа.
 */
function goToLogin(): void {
  router.push({ name: 'Login' });
}

/**
 * Обрабатывает успешную регистрацию.
 */
function handleRegisterSuccess(): void {
  // После регистрации перенаправляем на логин
  router.push({ name: 'Login' });
}
</script>

