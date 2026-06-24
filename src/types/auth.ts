/**
 * Типы для аутентификации и авторизации.
 */

/**
 * Роль пользователя.
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

/**
 * Запрос на регистрацию.
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Запрос на вход в систему.
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Ответ после успешной авторизации.
 */
export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  role: UserRole;
}

/**
 * Информация о текущем пользователе.
 */
export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
}

