import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { loadRuntimeConfig } from './runtime-config';
import './style.css';

/**
 * Точка входа. Сначала загружаем runtime-конфиг (URL бэкенда из config.json),
 * затем монтируем приложение — чтобы первые же REST/WS-запросы шли на правильный адрес.
 */
async function bootstrap(): Promise<void> {
  await loadRuntimeConfig();

  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  app.use(router);
  app.mount('#app');
}

void bootstrap();
