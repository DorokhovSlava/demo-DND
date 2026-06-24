import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  PlayerState,
  NarrativePayload,
  GameEvent,
  MechanicsResult,
  DungeonMap,
  DiceRollRequest,
  DiceRollResult,
} from '@/types/game';
import { apiService } from '@/services/api.service';
import { websocketService } from '@/services/websocket.service';

/**
 * Store для управления игровым состоянием.
 * 
 * Централизованное хранилище для всех игровых данных:
 * - Состояние игрока
 * - Текущий нарратив
 * - История нарративов
 * - Результаты бросков кубиков
 * - Статус соединения
 */
export const useGameStore = defineStore('game', () => {
  // ========== STATE ==========
  
  /**
   * Текущее состояние игрока.
   */
  const playerState = ref<PlayerState | null>(null);

  const dungeonMap = ref<DungeonMap | null>(null);
  
  /**
   * ID выбранного персонажа.
   */
  const selectedPlayerId = ref<string | null>(null);
  
  /**
   * Текущий нарративный ответ.
   */
  const currentNarrative = ref<NarrativePayload | null>(null);
  
  /**
   * История нарративных ответов.
   */
  const narrativeHistory = ref<NarrativePayload[]>([]);
  
  /**
   * Последний результат броска кубика.
   */
  const lastDiceRoll = ref<MechanicsResult | null>(null);
  
  /**
   * Флаг обработки действия (предотвращает дублирование запросов).
   */
  const isProcessingAction = ref(false);

  /**
   * Ожидающий запрос на бросок кубика (Client-Side Dice).
   * Если не null - UI должен показать компонент ThreeD20Dice.
   */
  const pendingDiceRoll = ref<DiceRollRequest | null>(null);

  /**
   * Флаг показа UI броска кубика.
   */
  const showDiceRollUI = ref(false);

  /**
   * Статус WebSocket соединения.
   */
  const connectionStatus = ref<'connected' | 'disconnected' | 'connecting'>('disconnected');
  
  // ========== GETTERS ==========
  
  /**
   * Процент HP игрока (0-100).
   */
  const playerHpPercentage = computed(() => {
    if (!playerState.value) return 0;
    const { hp, maxHp } = playerState.value.vitals;
    return maxHp > 0 ? (hp / maxHp) * 100 : 0;
  });
  
  /**
   * Процент MP игрока (0-100).
   */
  const playerManaPercentage = computed(() => {
    if (!playerState.value) return 0;
    const { mana, maxMana } = playerState.value.vitals;
    return maxMana > 0 ? (mana / maxMana) * 100 : 0;
  });
  
  /**
   * Проверяет, жив ли игрок.
   */
  const isPlayerAlive = computed(() => {
    return (playerState.value?.vitals?.hp ?? 0) > 0;
  });

  /**
   * Список экипированных предметов.
   */
  const equippedItems = computed(() =>
    playerState.value?.inventory.filter(item => item.isEquipped) ?? []
  );

  /**
   * Список предметов в рюкзаке (не экипированных).
   */
  const backpackItems = computed(() =>
    playerState.value?.inventory.filter(item => !item.isEquipped) ?? []
  );
  
  // ========== ACTIONS ==========
  
  /**
   * Инициализирует игровую сессию.
   * 
   * Загружает состояние игрока и подключается к WebSocket.
   * 
   * @param playerId ID персонажа
   */
  async function initializeGame(playerId: string): Promise<void> {
    try {
      // Сохраняем выбранного персонажа
      selectedPlayerId.value = playerId;
      
      // Загружаем состояние игрока
      playerState.value = await apiService.getPlayerState();

      try {
        dungeonMap.value = await apiService.getDungeonMap();
      } catch (mapError) {
        console.warn('[GameStore] Failed to load dungeon map during initialization', mapError);
      }
      
      // Подключаемся к WebSocket - ВРЕМЕННО ОТКЛЮЧЕНО (WebSocket не реализован на бэкенде)
      // websocketService.connect(playerId);
      setConnectionStatus('connected'); // Симулируем статус "подключено" для REST API
      
    } catch (error) {
      console.error('Failed to initialize game', error);
      throw error;
    }
  }
  
  /**
   * Отправляет действие игрока.
   * 
   * @param actionText текстовое описание действия
   */
  async function sendAction(actionText: string): Promise<void> {
    if (isProcessingAction.value) {
      console.warn('Action already processing, ignoring');
      return;
    }
    
    if (!actionText.trim()) {
      console.warn('Empty action text');
      return;
    }
    
    isProcessingAction.value = true;
    
    try {
      console.log('[GameStore] Sending action:', actionText);
      const response = await apiService.sendAction(actionText);

      // Детальное логирование ответа от backend
      console.log('[GameStore] ===== RESPONSE RECEIVED =====');
      console.log('[GameStore] Response:', response);
      console.log('[GameStore] Narration length:', response.narration?.length || 0);
      console.log('[GameStore] Scene description length:', response.sceneDescription?.length || 0);
      console.log('[GameStore] isNewScene:', response.isNewScene);
      console.log('[GameStore] Options count:', response.player_options?.length || 0);
      console.log('[GameStore] Has combatInfo:', !!response.combatInfo);
      console.log('[GameStore] isNpcTurn:', response.isNpcTurn);
      console.log('[GameStore] actingEntityId:', response.actingEntityId);
      console.log('[GameStore] pendingDiceRoll:', response.pendingDiceRoll);

      if (response.combatInfo) {
        console.log('[GameStore] CombatInfo:', {
          isActive: response.combatInfo.isActive,
          round: response.combatInfo.roundNumber,
          isPlayerTurn: response.combatInfo.isPlayerTurn,
          participants: response.combatInfo.participants?.length || 0
        });
      }
      console.log('[GameStore] ============================');

      // Проверяем, требуется ли бросок кубика от клиента
      if (response.pendingDiceRoll) {
        console.log('[GameStore] 🎲 Dice roll required!', response.pendingDiceRoll);
        pendingDiceRoll.value = response.pendingDiceRoll;
        showDiceRollUI.value = true;
        // Сохраняем нарратив даже при ожидании броска кубика,
        // чтобы пользователь видел контекст действия
        currentNarrative.value = response;
        narrativeHistory.value.push(response);
        return; // Ждем броска кубика
      }

      currentNarrative.value = response;
      narrativeHistory.value.push(response);

      try {
        playerState.value = await apiService.getPlayerState();
      } catch (stateError) {
        console.warn('[GameStore] Failed to refresh player state after action', stateError);
      }

      try {
        dungeonMap.value = await apiService.getDungeonMap();
      } catch (mapError) {
        console.warn('[GameStore] Failed to refresh dungeon map after action', mapError);
      }
      console.log('[GameStore] Updated currentNarrative:', currentNarrative.value);
      console.log('[GameStore] Action processing completed successfully');
    } catch (error) {
      console.error('[GameStore] Failed to send action', error);
      console.error('[GameStore] Error details:', error);
      throw error;
    } finally {
      console.log('[GameStore] Setting isProcessingAction to false');
      isProcessingAction.value = false;
      console.log('[GameStore] isProcessingAction:', isProcessingAction.value);
    }
  }
  
  /**
   * Обрабатывает событие нарратива из WebSocket.
   * 
   * @param event игровое событие
   */
  function handleNarrativeEvent(event: GameEvent): void {
    if (event.type === 'NARRATIVE') {
      const narrative = event.payload as NarrativePayload;
      currentNarrative.value = narrative;
      narrativeHistory.value.push(narrative);
    }
  }
  
  /**
   * Обрабатывает обновление состояния из WebSocket.
   * 
   * @param event игровое событие
   */
  function handleStateUpdate(event: GameEvent): void {
    if (event.type === 'STATE_UPDATE') {
      playerState.value = event.payload as PlayerState;
    }
  }
  
  /**
   * Обрабатывает бросок кубика из WebSocket.
   *
   * @param event игровое событие
   */
  function handleDiceRoll(event: GameEvent): void {
    if (event.type === 'DICE_ROLL') {
      lastDiceRoll.value = event.payload as MechanicsResult;
    }
  }

  /**
   * Отправляет результат броска кубика на сервер (Client-Side Dice).
   *
   * ASYNC FLOW: Результат отправляется сразу после броска анимации,
   * пока игрок ещё смотрит на результат. Это позволяет сэкономить время
   * на реагирование системы.
   *
   * @param naturalRoll натуральный результат броска d20 (1-20)
   */
  async function submitDiceRollResult(naturalRoll: number): Promise<void> {
    if (!pendingDiceRoll.value) {
      console.error('[GameStore] No pending dice roll to submit');
      return;
    }

    console.log('[GameStore] 🎲 Submitting dice roll result (async flow):', naturalRoll);

    const currentRequestId = pendingDiceRoll.value.requestId;

    try {
      const result: DiceRollResult = {
        requestId: currentRequestId,
        naturalRoll,
        timestamp: Date.now(),
      };

      // Отправляем результат на сервер (UI остаётся видимым, показывая "Обработка...")
      const response = await apiService.submitDiceRoll(result);

      console.log('[GameStore] 🎲 Dice roll response received:', response);

      // Сохраняем ответ, но НЕ скрываем UI сразу - пусть игрок насладится моментом
      // UI скроется когда игрок нажмёт "Продолжить" или когда истечёт таймаут

      // Обновляем нарратив с результатом действия
      currentNarrative.value = response;
      narrativeHistory.value.push(response);

      // Обновляем состояние игрока параллельно
      Promise.all([
        apiService.getPlayerState().then(state => {
          playerState.value = state;
        }).catch(err => {
          console.warn('[GameStore] Failed to refresh player state after dice roll', err);
        }),
        apiService.getDungeonMap().then(map => {
          dungeonMap.value = map;
        }).catch(err => {
          console.warn('[GameStore] Failed to refresh dungeon map after dice roll', err);
        })
      ]);

      console.log('[GameStore] 🎲 Dice roll processing completed, waiting for user confirmation');

      // Скрываем UI кубика и сбрасываем pending roll
      // Игрок уже видел результат и анимацию
      showDiceRollUI.value = false;
      pendingDiceRoll.value = null;

    } catch (error) {
      console.error('[GameStore] Failed to submit dice roll', error);
      // В случае ошибки - скрываем UI и сбрасываем pending roll
      showDiceRollUI.value = false;
      pendingDiceRoll.value = null;
      throw error;
    } finally {
      isProcessingAction.value = false;
    }
  }

  /**
   * Отменяет текущий бросок кубика.
   */
  function cancelDiceRoll(): void {
    console.log('[GameStore] 🎲 Dice roll cancelled');
    showDiceRollUI.value = false;
    pendingDiceRoll.value = null;
    isProcessingAction.value = false;
  }
  
  /**
   * Надевает предмет из инвентаря.
   * Оптимистично обновляет локальное состояние, затем синхронизирует с сервером.
   *
   * @param inventoryId ID предмета в инвентаре
   */
  async function equipItem(inventoryId: string): Promise<void> {
    // Оптимистичное обновление
    if (playerState.value) {
      playerState.value.inventory = playerState.value.inventory.map(item =>
        item.id === inventoryId ? { ...item, isEquipped: true } : item
      );
    }
    try {
      const updatedState = await apiService.equipItem(inventoryId);
      playerState.value = updatedState;
    } catch (error) {
      console.error('[GameStore] Failed to equip item', error);
      // Откатываем оптимистичное обновление
      try {
        playerState.value = await apiService.getPlayerState();
      } catch {
        // Игнорируем ошибку при откате
      }
      throw error;
    }
  }

  /**
   * Снимает экипированный предмет.
   * Оптимистично обновляет локальное состояние, затем синхронизирует с сервером.
   *
   * @param inventoryId ID предмета в инвентаре
   */
  async function unequipItem(inventoryId: string): Promise<void> {
    // Оптимистичное обновление
    if (playerState.value) {
      playerState.value.inventory = playerState.value.inventory.map(item =>
        item.id === inventoryId ? { ...item, isEquipped: false, slot: undefined } : item
      );
    }
    try {
      const updatedState = await apiService.unequipItem(inventoryId);
      playerState.value = updatedState;
    } catch (error) {
      console.error('[GameStore] Failed to unequip item', error);
      // Откатываем оптимистичное обновление
      try {
        playerState.value = await apiService.getPlayerState();
      } catch {
        // Игнорируем ошибку при откате
      }
      throw error;
    }
  }

  /**
   * Использует расходный предмет, отправляя игровое действие.
   *
   * @param itemName название предмета (для отправки в нарративный движок)
   */
  async function useItem(itemName: string): Promise<void> {
    await sendAction(`использовать ${itemName}`);
  }

  /**
   * Устанавливает статус соединения.
   *
   * @param status новый статус
   */
  function setConnectionStatus(status: 'connected' | 'disconnected' | 'connecting'): void {
    connectionStatus.value = status;
  }
  
  /**
   * Очищает состояние игры (при выходе).
   */
  function clearGameState(): void {
    playerState.value = null;
    dungeonMap.value = null;
    currentNarrative.value = null;
    narrativeHistory.value = [];
    lastDiceRoll.value = null;
    isProcessingAction.value = false;
    websocketService.disconnect();
  }
  
  return {
    // State
    playerState,
    dungeonMap,
    selectedPlayerId,
    currentNarrative,
    narrativeHistory,
    lastDiceRoll,
    isProcessingAction,
    connectionStatus,
    pendingDiceRoll,
    showDiceRollUI,

    // Getters
    playerHpPercentage,
    playerManaPercentage,
    isPlayerAlive,
    equippedItems,
    backpackItems,

    // Actions
    initializeGame,
    sendAction,
    submitDiceRollResult,
    cancelDiceRoll,
    handleNarrativeEvent,
    handleStateUpdate,
    handleDiceRoll,
    setConnectionStatus,
    clearGameState,
    equipItem,
    unequipItem,
    useItem,
  };
});
