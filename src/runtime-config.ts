/**
 * Runtime-конфигурация фронтенда.
 *
 * URL бэкенда (REST + WebSocket) читаются из внешнего `config.json`, который копируется
 * в корень собранного сайта (`dist/config.json`) как есть. Это позволяет менять адрес
 * бэкенда (например, при смене URL Cloudflare Tunnel) БЕЗ пересборки фронта — достаточно
 * отредактировать один маленький файл в деплое.
 *
 * Дефолты ниже соответствуют локальной разработке (vite-прокси `/api` → :8080,
 * WS → ws://localhost:8080/ws). Если `config.json` отсутствует или не загрузился —
 * используются дефолты, и приложение продолжает работать локально.
 */

export interface RuntimeConfig {
  /** Базовый URL REST API, например "/api" (dev) или "https://<tunnel>/api" (prod). */
  apiBaseUrl: string;
  /** URL WebSocket/STOMP, например "ws://localhost:8080/ws" или "wss://<tunnel>/ws". */
  wsUrl: string;
}

const DEFAULT_CONFIG: RuntimeConfig = {
  apiBaseUrl: '/api',
  wsUrl: 'ws://localhost:8080/ws',
};

// Текущая конфигурация (мутируется один раз при загрузке).
let config: RuntimeConfig = { ...DEFAULT_CONFIG };
let loaded = false;

/**
 * Загружает `config.json` из корня сайта (с учётом base-пути сборки).
 * Вызывать один раз при старте приложения (в main.ts) ДО монтирования.
 * Идемпотентна и никогда не бросает — при ошибке остаются дефолты.
 */
export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (loaded) return config;

  // import.meta.env.BASE_URL = "/" в dev и "/<repo>/" при сборке под GitHub Pages.
  const url = `${import.meta.env.BASE_URL}config.json`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (response.ok) {
      const data = (await response.json()) as Partial<RuntimeConfig>;
      config = {
        apiBaseUrl: typeof data.apiBaseUrl === 'string' && data.apiBaseUrl.trim()
          ? data.apiBaseUrl.trim()
          : DEFAULT_CONFIG.apiBaseUrl,
        wsUrl: typeof data.wsUrl === 'string' && data.wsUrl.trim()
          ? data.wsUrl.trim()
          : DEFAULT_CONFIG.wsUrl,
      };
      console.log('[runtime-config] Загружен config.json:', config);
    } else {
      console.warn(`[runtime-config] config.json недоступен (HTTP ${response.status}) — дефолты.`);
    }
  } catch (e) {
    console.warn('[runtime-config] Не удалось загрузить config.json — используются дефолты.', e);
  }

  loaded = true;
  return config;
}

/** Базовый URL REST API (без завершающего слэша). */
export function getApiBaseUrl(): string {
  return config.apiBaseUrl.replace(/\/+$/, '');
}

/** Базовый URL auth-эндпоинтов (= apiBaseUrl + "/auth"). */
export function getAuthBaseUrl(): string {
  return `${getApiBaseUrl()}/auth`;
}

/** URL WebSocket/STOMP-брокера. */
export function getWsUrl(): string {
  return config.wsUrl;
}
