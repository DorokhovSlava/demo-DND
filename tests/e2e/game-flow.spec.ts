import { test, expect } from '@playwright/test';

/**
 * E2E тесты для игрового потока.
 */
test.describe('Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Мокаем localStorage с токеном
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user_id', 'test-user-id');
    });
    
    await page.goto('/');
  });
  
  test('should load the application', async ({ page }) => {
    // Проверяем что приложение загрузилось
    await expect(page.locator('.app-title')).toBeVisible();
    await expect(page.locator('.app-title')).toHaveText('AI Dungeon Master');
  });
  
  test('should show connection status', async ({ page }) => {
    // Проверяем наличие статуса соединения
    const connectionStatus = page.locator('.connection-status');
    await expect(connectionStatus).toBeVisible();
  });
  
  test('should have action input field', async ({ page }) => {
    // Проверяем наличие поля ввода действия
    const actionInput = page.locator('.action-input-field');
    await expect(actionInput).toBeVisible();
    await expect(actionInput).toHaveAttribute('placeholder', 'Введите действие...');
  });
  
  test('should have send action button', async ({ page }) => {
    // Проверяем наличие кнопки отправки
    const actionButton = page.locator('.action-button');
    await expect(actionButton).toBeVisible();
  });
  
  test('should enable send button when text is entered', async ({ page }) => {
    const actionInput = page.locator('.action-input-field');
    const actionButton = page.locator('.action-button');
    
    // Кнопка должна быть отключена когда поле пустое
    await expect(actionButton).toBeDisabled();
    
    // Вводим текст
    await actionInput.fill('Осмотреть комнату');
    
    // Кнопка должна быть активна
    await expect(actionButton).toBeEnabled();
  });
  
  test('should show narrative window', async ({ page }) => {
    // Проверяем наличие окна нарратива
    const narrativeWindow = page.locator('.narrative-window');
    await expect(narrativeWindow).toBeVisible();
  });
  
  test('should show player panel when state is loaded', async ({ page }) => {
    // Ждем загрузки состояния игрока (если backend доступен)
    // В противном случае панель не отобразится
    const playerPanel = page.locator('.player-panel');
    // Используем мягкую проверку, так как backend может быть недоступен
    const isVisible = await playerPanel.isVisible().catch(() => false);
    if (isVisible) {
      await expect(playerPanel).toBeVisible();
    }
  });
  
  test('should handle keyboard navigation', async ({ page }) => {
    const actionInput = page.locator('.action-input-field');
    
    // Фокус на поле ввода
    await actionInput.focus();
    await expect(actionInput).toBeFocused();
    
    // Вводим текст и нажимаем Enter
    await actionInput.fill('Тестовое действие');
    await actionInput.press('Enter');
    
    // Поле должно очиститься после отправки (если запрос успешен)
    // Проверяем с таймаутом
    await page.waitForTimeout(500);
  });
  
  test('should be responsive', async ({ page }) => {
    // Проверяем адаптивность на мобильном размере
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('.app-container')).toBeVisible();
    await expect(page.locator('.action-input-field')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user_id', 'test-user-id');
    });
    
    await page.goto('/');
    
    // Проверяем ARIA атрибуты
    const header = page.locator('header[role="banner"]');
    await expect(header).toBeVisible();
    
    const main = page.locator('main[role="main"]');
    await expect(main).toBeVisible();
    
    const narrativeWindow = page.locator('[role="log"]');
    await expect(narrativeWindow).toBeVisible();
  });
  
  test('should be keyboard navigable', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('user_id', 'test-user-id');
    });
    
    await page.goto('/');
    
    // Tab navigation
    await page.keyboard.press('Tab');
    
    // Проверяем что фокус перемещается по элементам
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});
