/**
 * Типы для игровых данных.
 * Соответствуют DTO на backend.
 */

/**
 * Результат парсинга действия игрока.
 */
export interface PerceptionResult {
  action: 'attack' | 'cast' | 'move' | 'take' | 'use' | 'talk' | 'examine' | 'equip' | 'wait';
  target: string | null;
  valid: boolean;
  reason?: string;
}

/**
 * Участник боя.
 */
export interface CombatParticipant {
  id: string;
  name: string;
  isPlayer: boolean;
  currentHp: number;
  maxHp: number;
  armorClass: number;
  isCurrentActor: boolean;
  isDead: boolean;
  initiative: number;
  /** v17.1: Поведенческий тип NPC: COWARDLY, CUNNING, HOSTILE, AGGRESSIVE */
  behaviorType?: string;
}

/**
 * v17.1: Предмет из лута (добыча с побеждённого NPC).
 */
export interface LootItem {
  nameRu: string;
  itemType: string;
  quantity: number;
  goldValue: number;
  itemTemplateId?: string;
}

/**
 * Информация о текущем состоянии боя.
 */
export interface CombatInfo {
  isActive: boolean;
  roundNumber: number;
  isPlayerTurn: boolean;
  participants: CombatParticipant[];
  availableActions: string[];
  sceneId: string;
}

/**
 * Запрос на бросок кубика (Client-Side Dice).
 *
 * Отправляется сервером когда действие требует броска кубика от игрока.
 * Клиент показывает 3D UI кубика и отправляет результат на /api/game/dice-result.
 */
export interface DiceRollRequest {
  /** Уникальный ID запроса */
  requestId: string;
  /** Тип броска: ATTACK, SKILL_CHECK, SAVE_THROW, CONTESTED, DAMAGE */
  rollType: 'ATTACK' | 'SKILL_CHECK' | 'SAVE_THROW' | 'CONTESTED' | 'DAMAGE';
  /** Навык (для SKILL_CHECK): Stealth, Perception и т.д. */
  skill?: string;
  /** Характеристика (для SAVE_THROW): STR, DEX, CON, INT, WIS, CHA */
  stat?: string;
  /** Модификатор к броску (добавляется к d20) */
  modifier?: number;
  /** Целевое значение (DC или AC) */
  targetDC?: number;
  /** Название цели */
  targetName?: string;
  /** Описание броска для UI (краткое: "Бросок атаки") */
  description?: string;
  /**
   * Контекстное описание действия для отображения в модальном окне.
   * Примеры: "Атака по Гоблин-разведчик", "Проверка Скрытности", "Спасбросок Ловкости".
   * Заполняется бэкендом в DiceRollService.
   */
  actionDescription?: string;
  /** Минимальный бросок для успеха (targetDC - modifier) */
  minimumRollNeeded?: number;
  /** Информация о противостоянии (для CONTESTED) */
  opposingRoll?: {
    naturalRoll: number;
    modifier: number;
    total: number;
    actorName: string;
  };
  /** Тип кубика (по умолчанию d20) */
  diceType?: string;
  /** Количество кубиков (для урона) */
  diceCount?: number;
  /** Преимущество (2d20, взять лучший) */
  advantage?: boolean;
  /** Помеха (2d20, взять худший) */
  disadvantage?: boolean;
  /** Timestamp создания */
  createdAt?: number;
  /** ID игрока */
  playerId?: string;
}

/**
 * Результат броска кубика от клиента.
 */
export interface DiceRollResult {
  /** ID запроса (связка с DiceRollRequest) */
  requestId: string;
  /** Натуральный результат броска (1-20 для d20) */
  naturalRoll: number;
  /** Timestamp броска */
  timestamp?: number;
}

/**
 * Нарративный ответ от сервера.
 */
export interface NarrativePayload {
  narration: string;
  /** Deterministic scene description (room, NPCs, furniture, exits, sensory). */
  sceneDescription?: string;
  /** Current scene ID for tracking transitions. */
  sceneId?: string;
  /** True when player just entered a new room — frontend should prominently display sceneDescription. */
  isNewScene?: boolean;
  atmosphere?: {
    sounds: string[];
    smells: string[];
    visualMood: 'DEEP_DARK' | 'FLICKERING_TORCHLIGHT' | 'EERIE_GLOW' | 'DUSTY_SUNBEAM';
  };
  player_options: PlayerOption[];
  playerOptions: PlayerOption[]; // Deprecated, use player_options
  hiddenWorldFlag?: {
    flagKey: string;
    flagValue: string | number | boolean;
  };
  combatInfo?: CombatInfo;
  /**
   * Флаг, указывающий что это ход NPC, а не игрока.
   * Если true - UI должен показать "Ход противника" и нарратив описывает действия NPC.
   */
  isNpcTurn?: boolean;
  /**
   * ID сущности, которая выполняла действие (для отладки и детального отображения).
   */
  actingEntityId?: string;
  /**
   * Флаг, указывающий что все ходы NPC в этом раунде были обработаны сервером.
   * Если true и isNpcTurn=false - это ход игрока, можно выбирать действие.
   * Используется для предотвращения зависания UI на "Враг действует...".
   */
  allNpcTurnsProcessed?: boolean;
  /**
   * [v16] Список обработанных NPC-ходов в Phase 9.5.
   * Каждый элемент описывает один ход NPC: имя, действие, урон, HP игрока.
   */
  npcTurnsProcessed?: NpcTurnSummary[];
  /**
   * Запрос на бросок кубика (Client-Side Dice).
   *
   * Если это поле не null, клиент должен:
   * 1. Показать UI броска кубика (ThreeD20Dice)
   * 2. Отобразить targetDC, modifier и minimumRollNeeded
   * 3. После броска отправить результат на POST /api/game/dice-result
   *
   * При наличии pendingDiceRoll поля narration и player_options могут быть пустыми.
   */
  pendingDiceRoll?: DiceRollRequest;
  /**
   * Язык нарратива (ru/en).
   */
  language?: string;
  /**
   * v17: Quest update notification (stage advance, completion).
   */
  questUpdate?: QuestUpdate;
  /**
   * v17: True when all dungeon completion conditions are met.
   */
  dungeonCompleted?: boolean;
  /**
   * v17: Victory data (narration, rewards, next dungeon) when dungeon is completed.
   */
  victoryPayload?: VictoryPayload;
  /**
   * v17.1: Список добычи (лут) с побеждённого NPC.
   */
  lootItems?: LootItem[];
  /**
   * v17.1: Сообщение о побеге NPC из боя, например "Гоблин-разведчик бежит из боя!"
   */
  npcFleeMessage?: string;
  /**
   * v17.1: Сообщение о подборе предмета, например "Вы подобрали: Ржавый кинжал"
   */
  itemPickupMessage?: string;
}

/**
 * [v16] Краткая сводка одного NPC-хода в бою.
 */
export interface NpcTurnSummary {
  npcId: string;
  npcName: string;
  actionType: string;
  damageDealt: number;
  playerHpAfter: number;
  narration?: string;
}

/**
 * v17: Quest update notification.
 */
export interface QuestUpdate {
  questTitleRu: string;
  stageName: string;
  isCompleted: boolean;
  objectiveDescription?: string;
}

/**
 * v17: Victory payload when dungeon is completed.
 */
export interface VictoryPayload {
  narration: string;
  xpReward: number;
  goldReward: number;
  itemRewards?: string[];
  nextDungeonTitle?: string;
  nextDungeonKey?: string;
}

/**
 * Вариант действия для игрока.
 */
export interface PlayerOption {
  id: string;
  text: string;
  actionType?: string;
  action_type?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Состояние персонажа.
 */
export interface PlayerState {
  id: string;
  core: {
    name: string;
    race: string;
    class: string;
    level: number;
    xp: number;
  };
  vitals: {
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
  };
  attributes: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };
  position: {
    locationId: string;
    coordinates: [number, number];
    zone: string;
  };
  dungeonContext?: {
    roomId?: string;
    visitedRooms?: string[];
  };
  inventory: InventoryItem[];
}

/**
 * Предмет в инвентаре.
 */
export interface InventoryItem {
  /** inventoryId — уникальный ID экземпляра предмета в инвентаре */
  id: string;
  /** itemTemplateId — ID шаблона предмета в game_content.items */
  templateId: string;
  name: string;
  /** WEAPON, ARMOR, POTION, SCROLL, RING, CLOAK, и т.д. */
  type: string;
  /** Слот экипировки: MAIN_HAND, OFF_HAND, HEAD, CHEST, LEGS, FEET, CLOAK, NECK, RING_1, RING_2 */
  slot?: string;
  isEquipped: boolean;
  quantity: number;
  /** COMMON, UNCOMMON, RARE, VERY_RARE, LEGENDARY */
  rarity?: string;
  stats?: {
    damageDice?: string;
    damageType?: string;
    armorClass?: number;
    magicBonus?: number;
    weaponType?: string;
    armorType?: string;
    isMagical?: boolean;
    isConsumable?: boolean;
  };
}

/**
 * Результат механики (броски кубиков).
 */
export interface MechanicsResult {
  resolutionRequired: boolean;
  checkType?: 'SKILL_CHECK' | 'ATTACK_ROLL' | 'SAVE_THROW' | 'NONE';
  diceRoll?: number;
  totalResult?: number;
  outcome?: 'CRITICAL_SUCCESS' | 'SUCCESS' | 'FAILURE' | 'CRITICAL_FAILURE';
  mechanicalNarration?: string;
}

/**
 * Игровое событие через WebSocket.
 */
export interface GameEvent {
  type: 'NARRATIVE' | 'STATE_UPDATE' | 'DICE_ROLL' | 'COMBAT' | 'DIALOGUE';
  payload: NarrativePayload | PlayerState | MechanicsResult;
  timestamp: string;
}

/**
 * Запрос на действие игрока.
 */
export interface PlayerActionRequest {
  actionText: string;
}

/**
 * Запрос на создание персонажа.
 */
export interface PlayerCreationRequest {
  name: string;
  race: string;
  class: string;
}

/**
 * Запрос на генерацию подземелья.
 */
export interface DungeonGenerationRequest {
  difficulty: number;
  theme?: string;
}

/**
 * Ответ с данными подземелья.
 */
export interface DungeonResponse {
  id: string;
  name: string;
  description: string;
}

export interface DungeonMap {
  mapId: string | null;
  width: number;
  height: number;
  grid: number[][];
  rooms: MapRoom[];
  objects: MapObject[];
  explored: boolean[][];
  visible: boolean[][];
}

export interface MapRoom {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  tags: string[];
}

export interface MapObject {
  id: string;
  type: string;
  x: number;
  y: number;
  sprite: string;
  interactable: boolean;
}
