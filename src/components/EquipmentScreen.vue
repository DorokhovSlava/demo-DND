<template>
  <!-- Modal overlay -->
  <Teleport to="body">
    <Transition name="equipment-fade">
      <div
        v-if="isOpen"
        class="equipment-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Экипировка персонажа"
        @click.self="$emit('close')"
      >
        <div class="equipment-modal" @click.stop>
          <!-- Header -->
          <div class="equipment-header">
            <h2 class="equipment-title">Экипировка</h2>
            <span class="equipment-character-name">{{ playerState?.core.name }}</span>
            <button
              class="close-button"
              @click="$emit('close')"
              aria-label="Закрыть экипировку"
            >
              &times;
            </button>
          </div>

          <!-- Error message -->
          <div v-if="errorMessage" class="equipment-error" role="alert">
            {{ errorMessage }}
          </div>

          <!-- Body -->
          <div class="equipment-body">
            <!-- Left: Equipment slots silhouette -->
            <div class="slots-panel" role="region" aria-label="Слоты экипировки">
              <h3 class="panel-title">Надета</h3>

              <div class="slots-grid">
                <div
                  v-for="slot in equipmentSlots"
                  :key="slot.key"
                  class="slot-item"
                  :class="{ 'slot-filled': getSlotItem(slot.key) }"
                  :aria-label="`Слот ${slot.label}`"
                >
                  <div class="slot-label">{{ slot.label }}</div>
                  <div
                    v-if="getSlotItem(slot.key)"
                    class="slot-equipped-item"
                    :class="rarityClass(getSlotItem(slot.key)!.rarity)"
                  >
                    <span class="slot-item-icon">{{ getItemIcon(getSlotItem(slot.key)!.type) }}</span>
                    <span class="slot-item-name">{{ getSlotItem(slot.key)!.name }}</span>
                    <button
                      class="unequip-button"
                      :disabled="isLoading"
                      @click="handleUnequip(getSlotItem(slot.key)!.id)"
                      :aria-label="`Снять ${getSlotItem(slot.key)!.name}`"
                    >
                      Снять
                    </button>
                  </div>
                  <div v-else class="slot-empty">
                    <span class="slot-empty-icon">{{ slot.icon }}</span>
                    <span class="slot-empty-label">Пусто</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Backpack inventory -->
            <div class="backpack-panel" role="region" aria-label="Рюкзак">
              <h3 class="panel-title">Рюкзак</h3>

              <div v-if="backpackItems.length > 0" class="backpack-grid">
                <div
                  v-for="item in backpackItems"
                  :key="item.id"
                  class="backpack-item"
                  :class="rarityClass(item.rarity)"
                >
                  <div class="backpack-item-header">
                    <span class="backpack-item-icon">{{ getItemIcon(item.type) }}</span>
                    <div class="backpack-item-info">
                      <span class="backpack-item-name">{{ item.name }}</span>
                      <div class="backpack-item-meta">
                        <span
                          class="rarity-badge"
                          :class="rarityBadgeClass(item.rarity)"
                        >{{ formatRarity(item.rarity) }}</span>
                        <span class="item-type-badge">{{ formatItemType(item.type) }}</span>
                        <span v-if="item.quantity > 1" class="item-quantity-badge">x{{ item.quantity }}</span>
                      </div>
                    </div>
                  </div>

                  <div v-if="item.stats" class="item-stats">
                    <span v-if="item.stats.damageDice" class="stat-chip">
                      Урон: {{ item.stats.damageDice }}
                      <span v-if="item.stats.damageType"> ({{ item.stats.damageType }})</span>
                    </span>
                    <span v-if="item.stats.armorClass" class="stat-chip">
                      КЗ: {{ item.stats.armorClass }}
                    </span>
                    <span v-if="item.stats.magicBonus" class="stat-chip stat-chip--magic">
                      +{{ item.stats.magicBonus }}
                    </span>
                  </div>

                  <div class="backpack-item-actions">
                    <!-- Equipable items -->
                    <button
                      v-if="isEquipable(item)"
                      class="action-button action-button--equip"
                      :disabled="isLoading"
                      @click="handleEquip(item.id)"
                      :aria-label="`Надеть ${item.name}`"
                    >
                      Надеть
                    </button>
                    <!-- Consumable items -->
                    <button
                      v-if="isConsumable(item)"
                      class="action-button action-button--use"
                      :disabled="isLoading"
                      @click="handleUse(item.name)"
                      :aria-label="`Использовать ${item.name}`"
                    >
                      Использовать
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="backpack-empty">
                <span class="backpack-empty-icon">🎒</span>
                <span class="backpack-empty-text">Рюкзак пуст</span>
              </div>
            </div>
          </div>

          <!-- Footer: Stats summary -->
          <div class="equipment-footer" role="region" aria-label="Итоговые характеристики">
            <div class="stats-summary">
              <div class="stat-summary-item">
                <span class="stat-summary-label">КЗ</span>
                <span class="stat-summary-value">{{ totalAC }}</span>
              </div>
              <div class="stat-summary-item">
                <span class="stat-summary-label">Оружие</span>
                <span class="stat-summary-value">{{ weaponDamage }}</span>
              </div>
              <div class="stat-summary-item">
                <span class="stat-summary-label">Предметов</span>
                <span class="stat-summary-value">{{ equippedCount }} / {{ totalCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/stores/game.store';
import type { InventoryItem, PlayerState } from '@/types/game';

// ============ PROPS / EMITS ============

interface Props {
  isOpen: boolean;
  playerState: PlayerState | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// Lock body scroll when modal is open
watch(() => props.isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
}, { immediate: true });

// ============ STORE ============

const gameStore = useGameStore();
const { equippedItems, backpackItems } = storeToRefs(gameStore);

// ============ STATE ============

const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

// ============ EQUIPMENT SLOT DEFINITIONS ============

interface EquipmentSlot {
  key: string;
  label: string;
  icon: string;
}

const equipmentSlots: EquipmentSlot[] = [
  { key: 'HEAD',      label: 'Голова',       icon: '🪖' },
  { key: 'NECK',      label: 'Шея',          icon: '📿' },
  { key: 'CHEST',     label: 'Туловище',     icon: '🛡️' },
  { key: 'CLOAK',     label: 'Плащ',         icon: '🧥' },
  { key: 'MAIN_HAND', label: 'Правая рука',  icon: '⚔️' },
  { key: 'OFF_HAND',  label: 'Левая рука',   icon: '🗡️' },
  { key: 'LEGS',      label: 'Ноги',         icon: '👖' },
  { key: 'FEET',      label: 'Обувь',        icon: '👢' },
  { key: 'RING_1',    label: 'Кольцо 1',     icon: '💍' },
  { key: 'RING_2',    label: 'Кольцо 2',     icon: '💍' },
];

// ============ COMPUTED ============

/**
 * Finds the equipped item for a given slot.
 * Falls back to inferring slot from item type for legacy data without explicit slot.
 */
function getSlotItem(slotKey: string): InventoryItem | undefined {
  // Direct slot match first
  const directMatch = equippedItems.value.find(item => item.slot === slotKey);
  if (directMatch) return directMatch;

  // Fallback: infer slot from item type for equipped items without explicit slot
  return equippedItems.value.find(item => {
    if (item.slot) return false; // already has a slot, skip
    return inferSlotFromType(item.type) === slotKey;
  });
}

function inferSlotFromType(itemType: string): string | null {
  switch (itemType?.toUpperCase()) {
    case 'WEAPON': return 'MAIN_HAND';
    case 'ARMOR': return 'CHEST';
    case 'HELMET': return 'HEAD';
    case 'BOOTS': return 'FEET';
    case 'RING': return 'RING_1';
    case 'CLOAK': return 'CLOAK';
    case 'SHIELD': return 'OFF_HAND';
    default: return null;
  }
}

const totalAC = computed<number>(() => {
  // Base AC 10, add equipped armor
  const armorAC = equippedItems.value
    .filter(item => item.stats?.armorClass)
    .reduce((sum, item) => sum + (item.stats?.armorClass ?? 0), 0);
  const magicBonus = equippedItems.value
    .filter(item => item.stats?.magicBonus)
    .reduce((sum, item) => sum + (item.stats?.magicBonus ?? 0), 0);
  return armorAC > 0 ? armorAC + magicBonus : 10 + magicBonus;
});

const weaponDamage = computed<string>(() => {
  const mainHand = getSlotItem('MAIN_HAND');
  if (!mainHand?.stats?.damageDice) return '-';
  const bonus = mainHand.stats.magicBonus ? `+${mainHand.stats.magicBonus}` : '';
  return `${mainHand.stats.damageDice}${bonus}`;
});

const equippedCount = computed(() => equippedItems.value.length);
const totalCount = computed(() => props.playerState?.inventory.length ?? 0);

// ============ HELPERS ============

function getItemIcon(itemType: string): string {
  const icons: Record<string, string> = {
    WEAPON:   '⚔️',
    ARMOR:    '🛡️',
    POTION:   '🧪',
    SCROLL:   '📜',
    RING:     '💍',
    CLOAK:    '🧥',
    HELMET:   '🪖',
    BOOTS:    '👢',
    FOOD:     '🍖',
    KEY:      '🔑',
    TREASURE: '💎',
  };
  return icons[itemType?.toUpperCase()] ?? '📦';
}

function formatRarity(rarity?: string): string {
  const labels: Record<string, string> = {
    COMMON:    'Обычный',
    UNCOMMON:  'Необычный',
    RARE:      'Редкий',
    VERY_RARE: 'Очень редкий',
    LEGENDARY: 'Легендарный',
  };
  return labels[rarity ?? ''] ?? rarity ?? '';
}

function formatItemType(type: string): string {
  const labels: Record<string, string> = {
    WEAPON:   'Оружие',
    ARMOR:    'Броня',
    POTION:   'Зелье',
    SCROLL:   'Свиток',
    RING:     'Кольцо',
    CLOAK:    'Плащ',
    HELMET:   'Шлем',
    BOOTS:    'Обувь',
    FOOD:     'Еда',
    KEY:      'Ключ',
    TREASURE: 'Сокровище',
  };
  return labels[type?.toUpperCase()] ?? type ?? '';
}

function rarityClass(rarity?: string): string {
  const map: Record<string, string> = {
    COMMON:    'rarity-common',
    UNCOMMON:  'rarity-uncommon',
    RARE:      'rarity-rare',
    VERY_RARE: 'rarity-very-rare',
    LEGENDARY: 'rarity-legendary',
  };
  return map[rarity ?? ''] ?? '';
}

function rarityBadgeClass(rarity?: string): string {
  const map: Record<string, string> = {
    COMMON:    'badge-common',
    UNCOMMON:  'badge-uncommon',
    RARE:      'badge-rare',
    VERY_RARE: 'badge-very-rare',
    LEGENDARY: 'badge-legendary',
  };
  return map[rarity ?? ''] ?? 'badge-common';
}

function isEquipable(item: InventoryItem): boolean {
  const equipableTypes = ['WEAPON', 'ARMOR', 'RING', 'CLOAK', 'HELMET', 'BOOTS'];
  return equipableTypes.includes(item.type?.toUpperCase());
}

function isConsumable(item: InventoryItem): boolean {
  const consumableTypes = ['POTION', 'SCROLL', 'FOOD'];
  return (
    consumableTypes.includes(item.type?.toUpperCase()) ||
    item.stats?.isConsumable === true
  );
}

// ============ ACTIONS ============

async function handleEquip(inventoryId: string): Promise<void> {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    await gameStore.equipItem(inventoryId);
  } catch {
    errorMessage.value = 'Не удалось надеть предмет. Попробуйте снова.';
  } finally {
    isLoading.value = false;
  }
}

async function handleUnequip(inventoryId: string): Promise<void> {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    await gameStore.unequipItem(inventoryId);
  } catch {
    errorMessage.value = 'Не удалось снять предмет. Попробуйте снова.';
  } finally {
    isLoading.value = false;
  }
}

async function handleUse(itemName: string): Promise<void> {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    await gameStore.useItem(itemName);
    emit('close');
  } catch {
    errorMessage.value = 'Не удалось использовать предмет. Попробуйте снова.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* ===========================
   OVERLAY & MODAL SHELL
=========================== */
.equipment-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 10, 15, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 1rem;
}

.equipment-modal {
  position: relative;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-base);
  border: 1px solid rgba(218, 165, 32, 0.12);
  border-top: 2px solid var(--gold);
  border-radius: 10px;
  box-shadow:
    0 0 60px rgba(0, 0, 0, 0.7),
    0 0 30px rgba(218, 165, 32, 0.08);
  overflow: hidden;
}

/* ===========================
   HEADER
=========================== */
.equipment-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  background: var(--bg-medium);
  border-bottom: 1px solid rgba(218, 165, 32, 0.1);
  flex-shrink: 0;
}

.equipment-title {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-shadow: 0 0 12px rgba(218, 165, 32, 0.3);
  margin: 0;
}

.equipment-character-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
  color: var(--text-secondary);
  flex: 1;
}

.close-button {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--text-dim);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-button:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: var(--hp-low);
}

/* ===========================
   ERROR
=========================== */
.equipment-error {
  padding: 0.5rem 1.25rem;
  background: rgba(239, 68, 68, 0.08);
  border-bottom: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--hp-low);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.8rem;
  flex-shrink: 0;
}

/* ===========================
   BODY - TWO PANELS
=========================== */
.equipment-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.panel-title {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(218, 165, 32, 0.08);
}

/* ===========================
   LEFT PANEL: EQUIPMENT SLOTS
=========================== */
.slots-panel {
  padding: 1rem 1.25rem;
  border-right: 1px solid rgba(218, 165, 32, 0.08);
  overflow-y: auto;
}

.slots-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slot-item {
  border: 1px solid var(--bg-surface);
  background: var(--bg-medium);
  border-radius: 6px;
  transition: border-color 0.2s ease;
  overflow: hidden;
}

.slot-item.slot-filled {
  border-color: rgba(218, 165, 32, 0.15);
}

.slot-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-dim);
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--bg-surface);
}

.slot-empty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  opacity: 0.35;
}

.slot-empty-icon {
  font-size: 1rem;
  filter: grayscale(1);
}

.slot-empty-label {
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.875rem;
  color: var(--text-dim);
  font-style: italic;
}

.slot-equipped-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
}

.slot-item-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.slot-item-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.9rem;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unequip-button {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: var(--hp-low);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  white-space: nowrap;
}

.unequip-button:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15);
  border-color: var(--hp-low);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.2);
}

.unequip-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===========================
   RIGHT PANEL: BACKPACK
=========================== */
.backpack-panel {
  padding: 1rem 1.25rem;
  overflow-y: auto;
}

.backpack-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.backpack-item {
  padding: 0.6rem 0.75rem;
  background: var(--bg-medium);
  border: 1px solid var(--bg-surface);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.backpack-item:hover {
  border-color: rgba(218, 165, 32, 0.15);
  background: var(--bg-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.backpack-item-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.backpack-item-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.backpack-item-info {
  flex: 1;
  min-width: 0;
}

.backpack-item-name {
  display: block;
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.95rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.backpack-item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.2rem;
}

/* Rarity badges */
.rarity-badge,
.item-type-badge,
.item-quantity-badge {
  display: inline-block;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
}

.item-type-badge {
  background: var(--bg-surface);
  border: 1px solid var(--bg-overlay);
  color: var(--text-dim);
}

.item-quantity-badge {
  background: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.2);
  color: var(--mana);
}

/* Rarity badge colors */
.badge-common    { background: rgba(156, 163, 175, 0.1); border: 1px solid rgba(156, 163, 175, 0.3); color: var(--rarity-common); }
.badge-uncommon  { background: rgba(34, 197, 94, 0.1);   border: 1px solid rgba(34, 197, 94, 0.3);   color: var(--rarity-uncommon); }
.badge-rare      { background: rgba(59, 130, 246, 0.1);  border: 1px solid rgba(59, 130, 246, 0.3);  color: var(--rarity-rare); }
.badge-very-rare { background: rgba(168, 85, 247, 0.1);  border: 1px solid rgba(168, 85, 247, 0.3);  color: var(--rarity-epic); }
.badge-legendary { background: rgba(249, 115, 22, 0.1);  border: 1px solid rgba(249, 115, 22, 0.3);  color: var(--rarity-legendary); }

/* Rarity border accents on backpack items */
.rarity-uncommon  { border-left: 2px solid var(--rarity-uncommon); }
.rarity-rare      { border-left: 2px solid var(--rarity-rare); }
.rarity-very-rare { border-left: 2px solid var(--rarity-epic); }
.rarity-legendary { border-left: 2px solid var(--rarity-legendary); }

/* Item stats chips */
.item-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.4rem;
}

.stat-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  background: rgba(100, 181, 246, 0.08);
  border: 1px solid rgba(100, 181, 246, 0.2);
  color: #90caf9;
}

.stat-chip--magic {
  background: rgba(186, 104, 200, 0.12);
  border-color: rgba(186, 104, 200, 0.3);
  color: #ce93d8;
}

/* Item action buttons */
.backpack-item-actions {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.action-button {
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.2s ease;
}

.action-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-button--equip {
  background: rgba(201, 162, 39, 0.1);
  border-color: rgba(201, 162, 39, 0.35);
  color: #c9a227;
}

.action-button--equip:hover:not(:disabled) {
  background: rgba(201, 162, 39, 0.22);
  border-color: #c9a227;
  box-shadow: 0 0 8px rgba(201, 162, 39, 0.3);
}

.action-button--use {
  background: rgba(129, 199, 132, 0.1);
  border-color: rgba(129, 199, 132, 0.3);
  color: #81c784;
}

.action-button--use:hover:not(:disabled) {
  background: rgba(129, 199, 132, 0.22);
  border-color: #81c784;
  box-shadow: 0 0 8px rgba(129, 199, 132, 0.3);
}

/* Empty backpack */
.backpack-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  opacity: 0.4;
}

.backpack-empty-icon {
  font-size: 2.5rem;
}

.backpack-empty-text {
  font-family: 'Crimson Text', serif;
  font-size: 1rem;
  color: #a89580;
  font-style: italic;
}

/* ===========================
   FOOTER: STATS SUMMARY
=========================== */
.equipment-footer {
  padding: 0.75rem 1.25rem;
  background: var(--bg-medium);
  border-top: 1px solid rgba(218, 165, 32, 0.08);
  flex-shrink: 0;
}

.stats-summary {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.stat-summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-summary-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.stat-summary-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: var(--gold);
  text-shadow: 0 0 8px rgba(218, 165, 32, 0.25);
}

/* ===========================
   SCROLLBAR STYLING
=========================== */
.slots-panel::-webkit-scrollbar,
.backpack-panel::-webkit-scrollbar {
  width: 4px;
}

.slots-panel::-webkit-scrollbar-track,
.backpack-panel::-webkit-scrollbar-track {
  background: transparent;
}

.slots-panel::-webkit-scrollbar-thumb,
.backpack-panel::-webkit-scrollbar-thumb {
  background: var(--bg-surface);
  border-radius: 2px;
}

/* ===========================
   TRANSITION
=========================== */
.equipment-fade-enter-active,
.equipment-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.equipment-fade-enter-from,
.equipment-fade-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(-8px);
}

/* ===========================
   RESPONSIVE
=========================== */
@media (max-width: 640px) {
  .equipment-body {
    grid-template-columns: 1fr;
  }

  .slots-panel {
    border-right: none;
    border-bottom: 2px solid #3a2b3d;
    max-height: 40vh;
  }
}
</style>
