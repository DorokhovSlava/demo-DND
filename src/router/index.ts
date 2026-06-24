import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { authService } from '@/services/auth.service';

/**
 * Определение маршрутов приложения.
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      requiresAuth: false,
      title: 'Вход - AI Dungeon Master'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: {
      requiresAuth: false,
      title: 'Регистрация - AI Dungeon Master'
    }
  },
  {
    path: '/character-selection',
    name: 'CharacterSelection',
    component: () => import('@/views/CharacterSelectionView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Выбор персонажа - AI Dungeon Master'
    }
  },
  {
    path: '/character-creation',
    name: 'CharacterCreation',
    component: () => import('@/views/CharacterCreationView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Создание персонажа - AI Dungeon Master'
    }
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('@/views/GameView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Игра - AI Dungeon Master'
    }
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

/**
 * Создание экземпляра роутера.
 */
const router = createRouter({
  // BASE_URL = "/" в dev и "/<repo>/" при сборке под GitHub Pages (VITE_BASE).
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

/**
 * Navigation Guard для проверки авторизации.
 */
router.beforeEach((to, _from, next) => {
  const isAuthenticated = authService.isAuthenticated();
  const requiresAuth = to.meta.requiresAuth !== false;
  
  // Устанавливаем заголовок страницы
  document.title = (to.meta.title as string) || 'AI Dungeon Master';
  
  if (requiresAuth && !isAuthenticated) {
    // Нужна авторизация, но пользователь не авторизован
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else {
    // Разрешаем доступ к странице
    // Не перенаправляем автоматически с Login/Register, чтобы пользователь мог видеть форму входа
    // даже если у него есть токен в localStorage (токен может быть невалидным)
    next();
  }
});

export default router;

