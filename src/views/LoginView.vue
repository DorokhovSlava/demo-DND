<template>
  <LoginForm
    @switch-to-register="goToRegister"
    @login-success="handleLoginSuccess"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import LoginForm from '@/components/LoginForm.vue';

const router = useRouter();

/**
 * Переключает на страницу регистрации.
 */
function goToRegister(): void {
  router.push({ name: 'Register' });
}

/**
 * Обрабатывает успешный вход.
 */
async function handleLoginSuccess(): Promise<void> {
  const redirect = router.currentRoute.value.query.redirect as string;
  
  // Если есть редирект, используем его
  if (redirect) {
    router.push(redirect);
    return;
  }
  
  // Всегда переходим на экран выбора персонажей
  // Там пользователь может выбрать существующего персонажа или создать нового
  router.push({ name: 'CharacterSelection' });
}
</script>

