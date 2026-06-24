import axios, { AxiosInstance, AxiosError } from 'axios';
import { getApiBaseUrl } from '@/runtime-config';
import type {
  NarrativePayload,
  PlayerState,
  PlayerActionRequest,
  PlayerCreationRequest,
  DungeonGenerationRequest,
  DungeonResponse,
  DungeonMap,
  DiceRollResult,
} from '@/types/game';

/**
 * Сервис для REST API запросов.
 * 
 * Обрабатывает все HTTP запросы к backend, добавляет JWT токены,
 * обрабатывает ошибки и ретраи.
 */
export class ApiService {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      // baseURL задаётся динамически в request-интерсепторе из runtime-config
      // (config.json грузится асинхронно после конструирования этого синглтона).
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 180000, // 3 минуты
    });

    // Добавляем JWT токен и актуальный baseURL к каждому запросу
    this.client.interceptors.request.use(
      (config) => {
        config.baseURL = getApiBaseUrl();
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Обработка ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Токен истек или невалиден
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
  
  private normalizeNarrativePayload(data: unknown): NarrativePayload {
    const raw = (data ?? {}) as Record<string, any>;

    type VisualMood = NonNullable<NarrativePayload['atmosphere']>['visualMood'];

    const coerceStringArray = (value: unknown): string[] => {
      if (!Array.isArray(value)) return [];
      return value.map((v) => String(v)).filter((v) => v.trim().length > 0);
    };

    const coerceVisualMood = (value: unknown): VisualMood => {
      const mood = typeof value === 'string' ? value : 'DEEP_DARK';
      if (
        mood === 'DEEP_DARK' ||
        mood === 'FLICKERING_TORCHLIGHT' ||
        mood === 'EERIE_GLOW' ||
        mood === 'DUSTY_SUNBEAM'
      ) {
        return mood;
      }
      return 'DEEP_DARK';
    };

    const narration = typeof raw.narration === 'string'
      ? raw.narration
      : (typeof raw.text === 'string' ? raw.text : '');

    const rawOptions = Array.isArray(raw.playerOptions)
      ? raw.playerOptions
      : (Array.isArray(raw.player_options) ? raw.player_options : []);

    const playerOptions: NarrativePayload['playerOptions'] = rawOptions
      .filter((opt: any) => opt && typeof opt === 'object')
      .map((opt: any, index: number) => ({
        id: typeof opt.id === 'string' ? opt.id : `opt_${index}`,
        text: typeof opt.text === 'string' ? opt.text : String(opt.text ?? ''),
        actionType: typeof opt.actionType === 'string'
          ? opt.actionType
          : (typeof opt.action_type === 'string' ? opt.action_type : undefined),
      }))
      .filter((opt: any) => typeof opt.text === 'string' && opt.text.trim().length > 0)
      .slice(0, 4);

    if (playerOptions.length === 0) {
      while (playerOptions.length < 3) {
        const index = playerOptions.length;
        const fallbackTexts = [
          'Осмотреться',
          'Продолжить путь',
          'Проверить инвентарь',
        ];
        playerOptions.push({
          id: `fallback_${index + 1}`,
          text: fallbackTexts[index] ?? '',
          actionType: undefined,
        });
      }
    }

    const rawAtmosphere = (raw.atmosphere ?? {}) as Record<string, any>;
    const atmosphere = raw.atmosphere
      ? {
        sounds: coerceStringArray(rawAtmosphere.sounds),
        smells: coerceStringArray(rawAtmosphere.smells),
        visualMood: coerceVisualMood(rawAtmosphere.visualMood ?? rawAtmosphere.visual_mood),
      }
      : undefined;

    const hiddenWorldFlag = raw.hiddenWorldFlag && typeof raw.hiddenWorldFlag === 'object'
      ? raw.hiddenWorldFlag
      : (raw.hidden_world_flag && typeof raw.hidden_world_flag === 'object' ? raw.hidden_world_flag : undefined);

    // Валидация combatInfo - проверяем минимальную структуру
    const rawCombatInfo = raw.combatInfo;
    const combatInfo = rawCombatInfo && typeof rawCombatInfo === 'object'
      ? {
          isActive: rawCombatInfo.isActive === true,
          roundNumber: typeof rawCombatInfo.roundNumber === 'number' ? rawCombatInfo.roundNumber : 0,
          isPlayerTurn: rawCombatInfo.isPlayerTurn === true,
          participants: Array.isArray(rawCombatInfo.participants) ? rawCombatInfo.participants : [],
          availableActions: Array.isArray(rawCombatInfo.availableActions) ? rawCombatInfo.availableActions : [],
          sceneId: typeof rawCombatInfo.sceneId === 'string' ? rawCombatInfo.sceneId : '',
        }
      : undefined;

    // Валидация pendingDiceRoll - проверяем обязательное поле requestId
    const rawDiceRoll = raw.pendingDiceRoll;
    const pendingDiceRoll = rawDiceRoll && typeof rawDiceRoll === 'object' && typeof rawDiceRoll.requestId === 'string'
      ? rawDiceRoll
      : undefined;

    // Scene description (deterministic, from DB — Block 1 of 3-block narrative architecture)
    const sceneDescription = typeof raw.sceneDescription === 'string' ? raw.sceneDescription : undefined;
    const sceneId = typeof raw.sceneId === 'string' ? raw.sceneId : undefined;
    const isNewScene = raw.isNewScene === true;

    return {
      narration,
      sceneDescription,
      sceneId,
      isNewScene,
      atmosphere,
      player_options: playerOptions,
      playerOptions,
      hiddenWorldFlag,
      // Критические поля для combat и dice roll:
      pendingDiceRoll,
      combatInfo,
      isNpcTurn: raw.isNpcTurn === true,
      actingEntityId: typeof raw.actingEntityId === 'string' ? raw.actingEntityId : undefined,
      allNpcTurnsProcessed: raw.allNpcTurnsProcessed === true,
      language: typeof raw.language === 'string' ? raw.language : 'ru',
    };
  }
  
  /**
   * Отправляет действие игрока на сервер.
   * 
   * @param actionText текстовое описание действия
   * @returns нарративный ответ
   * @throws Error если запрос не удался
   */
  async sendAction(actionText: string): Promise<NarrativePayload> {
    try {
      const response = await this.client.post<unknown>('/game/action', {
        actionText,
      } as PlayerActionRequest);
      return this.normalizeNarrativePayload(response.data);
    } catch (error) {
      console.error('Failed to send action', error);
      throw error;
    }
  }
  
  /**
   * Получает текущее состояние игрока.
   * 
   * @returns состояние игрока
   * @throws Error если запрос не удался
   */
  async getPlayerState(): Promise<PlayerState> {
    try {
      const response = await this.client.get<PlayerState>('/player/state');
      return response.data;
    } catch (error) {
      console.error('Failed to get player state', error);
      throw error;
    }
  }

  async getDungeonMap(): Promise<DungeonMap> {
    try {
      const response = await this.client.get<DungeonMap>('/player/dungeon-map');
      return response.data;
    } catch (error) {
      console.error('Failed to get dungeon map', error);
      throw error;
    }
  }
  
  /**
   * Создает нового персонажа.
   * 
   * @param request данные персонажа
   * @returns созданное состояние
   * @throws Error если запрос не удался
   */
  async createPlayer(request: PlayerCreationRequest): Promise<PlayerState> {
    try {
      const response = await this.client.post<PlayerState>('/player/create', request);
      return response.data;
    } catch (error) {
      console.error('Failed to create player', error);
      throw error;
    }
  }
  
  /**
   * Генерирует новое подземелье.
   * 
   * @param request параметры генерации
   * @returns созданное подземелье
   */
  async generateDungeon(request: DungeonGenerationRequest): Promise<DungeonResponse> {
    try {
      const response = await this.client.post<DungeonResponse>('/dungeon/generate', request);
      return response.data;
    } catch (error) {
      console.error('Failed to generate dungeon', error);
      throw error;
    }
  }
  
  /**
   * Проверяет, существует ли персонаж у текущего пользователя.
   * 
   * @returns true если персонаж существует
   */
  async checkCharacterExists(): Promise<boolean> {
    try {
      const response = await this.client.get<boolean>('/game/character/exists');
      return response.data;
    } catch (error) {
      console.error('Failed to check character existence', error);
      return false;
    }
  }
  
  /**
   * Создает персонажа и подземелье.
   * 
   * @param request параметры создания
   * @returns результат создания с приветствием
   */
  async createCharacter(request: CharacterCreationRequest): Promise<CharacterCreationResponse> {
    try {
      const response = await this.client.post<CharacterCreationResponse>('/game/character/create', request);
      return response.data;
    } catch (error) {
      console.error('Failed to create character', error);
      throw error;
    }
  }
  
  /**
   * Получает приветственное сообщение.
   * 
   * @returns приветственное сообщение
   */
  async getWelcomeMessage(): Promise<NarrativePayload> {
    try {
      const response = await this.client.get<unknown>('/game/welcome');
      return this.normalizeNarrativePayload(response.data);
    } catch (error) {
      console.error('Failed to get welcome message', error);
      throw error;
    }
  }
  
  /**
   * Получает список всех персонажей текущего пользователя.
   * 
   * @returns список персонажей
   */
  async getCharacters(): Promise<CharacterSummary[]> {
    try {
      const response = await this.client.get<CharacterSummary[]>('/game/characters');
      return response.data;
    } catch (error) {
      console.error('Failed to get characters', error);
      throw error;
    }
  }
  
  /**
   * Получает информацию о конкретном персонаже.
   * 
   * @param playerId ID персонажа
   * @returns информация о персонаже
   */
  async getCharacter(playerId: string): Promise<CharacterSummary> {
    try {
      const response = await this.client.get<CharacterSummary>(`/game/character/${playerId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get character', error);
      throw error;
    }
  }
  
  /**
   * Удаляет персонажа.
   * 
   * @param playerId ID персонажа
   */
  async deleteCharacter(playerId: string): Promise<void> {
    try {
      await this.client.delete(`/game/character/${playerId}`);
    } catch (error) {
      console.error('Failed to delete character', error);
      throw error;
    }
  }
  
  /**
   * Выбирает персонажа для игры (устанавливает активного персонажа).
   *
   * @param playerId ID персонажа
   */
  async selectCharacter(playerId: string): Promise<void> {
    try {
      await this.client.post(`/game/character/${playerId}/select`);
    } catch (error) {
      console.error('Failed to select character', error);
      throw error;
    }
  }

  /**
   * Надевает предмет из инвентаря.
   *
   * @param inventoryId ID предмета в инвентаре (InventoryItem.id)
   * @returns обновлённое состояние игрока
   */
  async equipItem(inventoryId: string): Promise<PlayerState> {
    try {
      const response = await this.client.post<PlayerState>(
        `/player/inventory/${inventoryId}/equip`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to equip item', error);
      throw error;
    }
  }

  /**
   * Снимает экипированный предмет.
   *
   * @param inventoryId ID предмета в инвентаре (InventoryItem.id)
   * @returns обновлённое состояние игрока
   */
  async unequipItem(inventoryId: string): Promise<PlayerState> {
    try {
      const response = await this.client.post<PlayerState>(
        `/player/inventory/${inventoryId}/unequip`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to unequip item', error);
      throw error;
    }
  }

  /**
   * Отправляет результат броска кубика (Client-Side Dice).
   *
   * @param result результат броска от клиента
   * @returns нарративный ответ с результатом действия
   */
  async submitDiceRoll(result: DiceRollResult): Promise<NarrativePayload> {
    try {
      console.log('[ApiService] 🎲 Submitting dice roll:', result);
      const response = await this.client.post<unknown>('/game/dice-result', result);
      return this.normalizeNarrativePayload(response.data);
    } catch (error) {
      console.error('Failed to submit dice roll', error);
      throw error;
    }
  }
}

export interface CharacterCreationRequest {
  characterName: string;
  race: string;
  characterClass: string;
  dungeonTheme: string;
  difficulty: string;
  seed?: number;
}

export interface CharacterCreationResponse {
  playerId: string;
  dungeonId: string;
  seed: number;
  welcomeNarrative: NarrativePayload;
}

export interface CharacterSummary {
  playerId: string;
  name: string;
  race: string;
  characterClass: string;
  level: number;
  createdAt: string;
  updatedAt: string;
  dungeonId: string;
  zone: string;
}

export const apiService = new ApiService();
