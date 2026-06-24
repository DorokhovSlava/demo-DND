import axios, { AxiosInstance } from 'axios';
import { getAuthBaseUrl } from '@/runtime-config';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth';

/**
 * Сервис для работы с авторизацией.
 * 
 * Обрабатывает регистрацию, вход и выход пользователей.
 */
export class AuthService {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      // baseURL задаётся динамически в request-интерсепторе из runtime-config
      // (config.json грузится асинхронно после конструирования этого синглтона).
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 секунд
    });

    this.client.interceptors.request.use((config) => {
      config.baseURL = getAuthBaseUrl();
      return config;
    });
  }
  
  /**
   * Регистрирует нового пользователя.
   * 
   * @param request данные регистрации
   * @returns ответ с токеном
   * @throws Error если регистрация не удалась
   */
  async register(request: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>('/register', request);
      
      // Сохраняем токен в localStorage
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_id', response.data.userId);
        localStorage.setItem('username', response.data.username);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Ошибка при регистрации. Попробуйте снова.');
    }
  }
  
  /**
   * Выполняет вход пользователя в систему.
   * 
   * @param request данные для входа
   * @returns ответ с токеном
   * @throws Error если вход не удался
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>('/login', request);
      
      // Сохраняем токен в localStorage
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_id', response.data.userId);
        localStorage.setItem('username', response.data.username);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Неверное имя пользователя или пароль.');
    }
  }
  
  /**
   * Выполняет выход пользователя из системы.
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
  }
  
  /**
   * Проверяет, авторизован ли пользователь.
   * 
   * @returns true если токен существует
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
  
  /**
   * Получает текущий токен авторизации.
   * 
   * @returns токен или null
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  
  /**
   * Получает ID текущего пользователя.
   * 
   * @returns user ID или null
   */
  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }
  
  /**
   * Получает имя текущего пользователя.
   * 
   * @returns username или null
   */
  getUsername(): string | null {
    return localStorage.getItem('username');
  }
}

export const authService = new AuthService();

