/**
 * useGameToasts — Composable для игровых уведомлений (toasts).
 *
 * Стек тостов в правом верхнем углу экрана.
 * Автодисмисс через 4 секунды.
 * Grimoire dark-тема, никаких внешних библиотек.
 *
 * Использование:
 *   const { toasts, showLoot, showQuestUpdate, showNpcFlee, showItemPickup } = useGameToasts()
 */

import { ref } from 'vue';
import type { LootItem, QuestUpdate } from '@/types/game';

export type ToastType = 'loot' | 'quest' | 'flee' | 'pickup' | 'info';

export interface GameToast {
  id: number;
  type: ToastType;
  title: string;
  lines: string[];
  icon: string;
  /** Таймер для автоудаления */
  _timer?: ReturnType<typeof setTimeout>;
}

const AUTO_DISMISS_MS = 4000;

let _nextId = 1;

/**
 * Singleton ref — все компоненты, использующие useGameToasts, работают
 * с одним и тем же массивом тостов.
 */
const toasts = ref<GameToast[]>([]);

function dismiss(id: number): void {
  const idx = toasts.value.findIndex(t => t.id === id);
  if (idx !== -1) {
    const toast = toasts.value[idx];
    if (toast._timer) clearTimeout(toast._timer);
    toasts.value.splice(idx, 1);
  }
}

function push(type: ToastType, icon: string, title: string, lines: string[]): void {
  const id = _nextId++;
  const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
  toasts.value.push({ id, type, title, lines, icon, _timer: timer });
}

/**
 * Золотой тост с добычей — показывает список предметов.
 */
function showLoot(items: LootItem[]): void {
  if (!items || items.length === 0) return;

  const lines = items.map(item => {
    const qty = item.quantity > 1 ? ` x${item.quantity}` : '';
    const gold = item.goldValue > 0 ? ` (${item.goldValue} зм)` : '';
    return `${getItemIcon(item.itemType)} ${item.nameRu}${qty}${gold}`;
  });

  push('loot', '💰', 'Добыча получена', lines);
}

/**
 * Фиолетовый тост с обновлением квеста.
 */
function showQuestUpdate(quest: QuestUpdate): void {
  const lines: string[] = [];
  if (quest.stageName) lines.push(quest.stageName);
  if (quest.objectiveDescription) lines.push(quest.objectiveDescription);

  const title = quest.isCompleted ? 'Квест выполнен!' : 'Квест обновлён';
  push('quest', quest.isCompleted ? '✦' : '◆', `${title}: ${quest.questTitleRu}`, lines);
}

/**
 * Жёлтый тост — NPC бежит из боя.
 */
function showNpcFlee(message: string): void {
  push('flee', '🏃', 'Противник бежит!', [message]);
}

/**
 * Зелёный тост — игрок подобрал предмет.
 */
function showItemPickup(message: string): void {
  push('pickup', '🎒', 'Предмет подобран', [message]);
}

/**
 * Возвращает иконку предмета по типу.
 */
function getItemIcon(itemType: string): string {
  const type = (itemType ?? '').toUpperCase();
  if (type.includes('WEAPON') || type === 'SWORD' || type === 'AXE' || type === 'DAGGER') return '⚔️';
  if (type.includes('ARMOR') || type === 'SHIELD') return '🛡️';
  if (type.includes('POTION')) return '🧪';
  if (type.includes('SCROLL') || type.includes('SPELL')) return '📜';
  if (type.includes('RING')) return '💍';
  if (type.includes('CLOAK')) return '🧥';
  if (type.includes('GOLD') || type.includes('COIN')) return '🪙';
  if (type.includes('KEY')) return '🗝️';
  if (type.includes('FOOD') || type.includes('RATION')) return '🍖';
  return '🎁';
}

export function useGameToasts() {
  return {
    toasts,
    dismiss,
    showLoot,
    showQuestUpdate,
    showNpcFlee,
    showItemPickup,
    getItemIcon,
  };
}
