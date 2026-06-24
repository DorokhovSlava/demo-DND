import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';
import { authService } from '@/services/auth.service';

/**
 * Store для управления авторизацией.
 * 
 * Централизованное хранилище для:
 * - Информации о текущем пользователе
 * - Статуса авторизации
 * - Регистрации и входа
 */
export const useAuthStore = defineStore('auth', () => {
  // ========== STATE ==========
  
  /**
   * Текущий пользователь.
   */
  const currentUser = ref<User | null>(null);
  
  /**
   * Флаг загрузки (для отображения spinner).
   */
  const isLoading = ref(false);
  
  /**
   * Сообщение об ошибке.
   */
  const error = ref<string | null>(null);
  
  // ========== GETTERS ==========
  
  /**
   * Проверяет, авторизован ли пользователь.
   */
  const isAuthenticated = computed(() => {
    return !!currentUser.value || authService.isAuthenticated();
  });
  
  /**
   * Возвращает имя текущего пользователя.
   */
  const username = computed(() => {
    return currentUser.value?.username || authService.getUsername() || null;
  });
  
  // ========== ACTIONS ==========
  
  /**
   * Регистрирует нового пользователя.
   * 
   * @param request данные регистрации
   */
  async function register(request: RegisterRequest): Promise<void> {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response: AuthResponse = await authService.register(request);
      
      currentUser.value = {
        id: response.userId,
        username: response.username,
        role: response.role,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка при регистрации';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Выполняет вход в систему.
   * 
   * @param request данные для входа
   */
  async function login(request: LoginRequest): Promise<void> {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response: AuthResponse = await authService.login(request);
      
      currentUser.value = {
        id: response.userId,
        username: response.username,
        role: response.role,
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка при входе';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Выполняет выход из системы.
   */
  function logout(): void {
    authService.logout();
    currentUser.value = null;
    error.value = null;
  }
  
  /**
   * Очищает ошибку.
   */
  function clearError(): void {
    error.value = null;
  }
  
  /**
   * Инициализирует пользователя из localStorage (при загрузке приложения).
   */
  function initializeUser(): void {
    const userId = authService.getUserId();
    const username = authService.getUsername();
    
    if (userId && username && authService.isAuthenticated()) {
      currentUser.value = {
        id: userId,
        username: username,
        role: 'USER' as any, // Роль будет загружена при первом запросе к API
      };
    }
  }
  
  return {
    // State
    currentUser,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    username,
    
    // Actions
    register,
    login,
    logout,
    clearError,
    initializeUser,
  };
});

