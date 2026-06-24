import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import type { GameEvent } from '@/types/game';
import { useGameStore } from '@/stores/game.store';
import { getWsUrl } from '@/runtime-config';

/**
 * Сервис для WebSocket соединения.
 * 
 * Использует STOMP протокол для обмена сообщениями с backend.
 * Реализует автоматический реконнект с экспоненциальной задержкой.
 * 
 * Каналы:
 * - /topic/narrative - нарративные обновления
 * - /topic/player-state/{userId} - обновления состояния игрока
 * - /topic/dice-rolls - результаты бросков кубиков
 */
export class WebSocketService {
  private client: Client | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private subscriptions: StompSubscription[] = [];
  private userId: string | null = null;
  
  /**
   * Подключается к WebSocket серверу.
   * 
   * @param userId ID пользователя для подписки на персональные каналы
   */
  connect(userId: string): void {
    if (this.client?.active) {
      console.warn('WebSocket already connected');
      return;
    }
    
    this.userId = userId;
    
    this.client = new Client({
      brokerURL: getWsUrl(),
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.subscribeToChannels(userId);
        useGameStore().setConnectionStatus('connected');
      },
      
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        useGameStore().setConnectionStatus('disconnected');
        this.handleReconnect();
      },
      
      onWebSocketClose: () => {
        console.log('WebSocket closed');
        useGameStore().setConnectionStatus('disconnected');
        this.handleReconnect();
      },
      
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.subscriptions = [];
      },
    });
    
    this.client.activate();
    useGameStore().setConnectionStatus('connecting');
  }
  
  /**
   * Подписывается на каналы событий.
   * 
   * @param userId ID пользователя
   */
  private subscribeToChannels(userId: string): void {
    if (!this.client) return;
    
    // Канал нарратива
    const narrativeSub = this.client.subscribe('/topic/narrative', (message: IMessage) => {
      try {
        const event: GameEvent = JSON.parse(message.body);
        useGameStore().handleNarrativeEvent(event);
      } catch (error) {
        console.error('Failed to parse narrative event', error);
      }
    });
    this.subscriptions.push(narrativeSub);
    
    // Канал обновлений состояния
    const stateSub = this.client.subscribe(`/topic/player-state/${userId}`, (message: IMessage) => {
      try {
        const event: GameEvent = JSON.parse(message.body);
        useGameStore().handleStateUpdate(event);
      } catch (error) {
        console.error('Failed to parse state update event', error);
      }
    });
    this.subscriptions.push(stateSub);
    
    // Канал бросков кубиков
    const diceSub = this.client.subscribe('/topic/dice-rolls', (message: IMessage) => {
      try {
        const event: GameEvent = JSON.parse(message.body);
        useGameStore().handleDiceRoll(event);
      } catch (error) {
        console.error('Failed to parse dice roll event', error);
      }
    });
    this.subscriptions.push(diceSub);
  }
  
  /**
   * Обрабатывает переподключение с экспоненциальной задержкой.
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      useGameStore().setConnectionStatus('disconnected');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId);
      }
    }, delay);
  }
  
  /**
   * Отключается от WebSocket сервера.
   */
  disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions = [];
      this.client.deactivate();
      this.client = null;
      this.userId = null;
      useGameStore().setConnectionStatus('disconnected');
    }
  }
  
  /**
   * Проверяет, подключен ли WebSocket.
   * 
   * @returns true если подключен
   */
  isConnected(): boolean {
    return this.client?.active ?? false;
  }
}

export const websocketService = new WebSocketService();
