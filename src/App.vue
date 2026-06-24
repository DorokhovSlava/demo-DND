<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();

/**
 * Инициализируем пользователя при загрузке приложения.
 */
onMounted(() => {
  authStore.initializeUser();
});
</script>

<style>
/* Глобальные стили остаются в style.css */
</style>
