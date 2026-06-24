<template>
  <div class="character-sheet">
    <!-- Header -->
    <div class="sheet-header">
      <div class="sheet-header-top">
        <span class="sheet-label">&#1055;&#1077;&#1088;&#1089;&#1086;&#1085;&#1072;&#1078;</span>
        <span class="sheet-level" v-if="playerState?.core.level">Ур. {{ playerState.core.level }}</span>
      </div>
      <div class="character-name">{{ playerState?.core.name || '&#1047;&#1072;&#1075;&#1088;&#1091;&#1079;&#1082;&#1072;...' }}</div>
      <div class="character-meta" v-if="playerState?.core">
        <span class="meta-tag">{{ playerState.core.race }}</span>
        <span class="meta-separator">&#183;</span>
        <span class="meta-tag">{{ playerState.core.class }}</span>
      </div>
    </div>

    <div class="sheet-content">
      <!-- HP Bar -->
      <div class="vital-section">
        <div class="vital-row">
          <span class="vital-label">HP</span>
          <span class="vital-numbers">{{ playerState?.vitals.hp ?? 0 }} / {{ playerState?.vitals.maxHp ?? 0 }}</span>
        </div>
        <div class="vital-track">
          <div
            class="vital-fill"
            :class="hpBarClass"
            :style="{ width: `${hpPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- MP Bar -->
      <div class="vital-section">
        <div class="vital-row">
          <span class="vital-label vital-label-mana">MP</span>
          <span class="vital-numbers vital-numbers-mana">{{ playerState?.vitals.mana ?? 0 }} / {{ playerState?.vitals.maxMana ?? 0 }}</span>
        </div>
        <div class="vital-track">
          <div
            class="vital-fill vital-fill-mana"
            :style="{ width: `${mpPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Attributes Grid -->
      <div class="attributes-section">
        <div class="attributes-grid">
          <div
            v-for="attr in attributeList"
            :key="attr.key"
            class="attr-card"
            :class="{
              'attr-high': attr.value >= 14,
              'attr-low': attr.value <= 9
            }"
          >
            <span class="attr-name">{{ attr.label }}</span>
            <span class="attr-score">{{ attr.value }}</span>
            <span class="attr-mod">{{ formatModifier(attr.value) }}</span>
          </div>
        </div>
      </div>

      <!-- Inventory -->
      <div class="inventory-section">
        <div class="inventory-header">
          <span class="section-label">&#1048;&#1085;&#1074;&#1077;&#1085;&#1090;&#1072;&#1088;&#1100;</span>
          <button
            class="equipment-btn"
            @click="$emit('open-equipment')"
            :disabled="!playerState"
            title="&#1069;&#1082;&#1080;&#1087;&#1080;&#1088;&#1086;&#1074;&#1082;&#1072;"
          >
            &#9876; &#1069;&#1082;&#1080;&#1087;&#1080;&#1088;&#1086;&#1074;&#1082;&#1072;
          </button>
        </div>

        <div v-if="playerState?.inventory && playerState.inventory.length > 0" class="inventory-list">
          <div
            v-for="item in playerState.inventory"
            :key="item.id"
            class="inv-item"
            :class="{
              'inv-item-equipped': item.isEquipped,
              [`inv-rarity-${(item.rarity || 'common').toLowerCase()}`]: true
            }"
            :title="`${item.name} (${item.type})`"
          >
            <span class="inv-rarity-dot" :class="`rarity-${(item.rarity || 'common').toLowerCase()}`"></span>
            <span class="inv-name">{{ item.name }}</span>
            <span v-if="item.quantity > 1" class="inv-qty">x{{ item.quantity }}</span>
            <span v-if="item.isEquipped" class="inv-slot-badge">{{ formatSlotShort(item.slot) }}</span>
            <button
              v-if="isConsumable(item)"
              class="inv-use-btn"
              @click.stop="handleUseItem(item.name)"
              :aria-label="`Use ${item.name}`"
              title="&#1048;&#1089;&#1087;&#1086;&#1083;&#1100;&#1079;&#1086;&#1074;&#1072;&#1090;&#1100;"
            >&#10003;</button>
          </div>
        </div>
        <div v-else class="empty-inventory">
          <span class="empty-text">&#1048;&#1085;&#1074;&#1077;&#1085;&#1090;&#1072;&#1088;&#1100; &#1087;&#1091;&#1089;&#1090;</span>
        </div>
      </div>

      <!-- Position -->
      <div v-if="playerState?.position" class="position-section">
        <div class="position-row">
          <span class="position-label">&#1047;&#1086;&#1085;&#1072;</span>
          <span class="position-value">{{ playerState.position.zone }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/game.store';
import type { InventoryItem, PlayerState } from '@/types/game';

const props = defineProps<{
  playerState: PlayerState | null;
}>();

const emit = defineEmits<{
  (e: 'open-equipment'): void;
  (e: 'use-item', itemName: string): void;
}>();

const gameStore = useGameStore();

const hpPercentage = computed(() => {
  if (!props.playerState?.vitals) return 0;
  return (props.playerState.vitals.hp / props.playerState.vitals.maxHp) * 100;
});

const mpPercentage = computed(() => {
  if (!props.playerState?.vitals) return 0;
  return (props.playerState.vitals.mana / props.playerState.vitals.maxMana) * 100;
});

const hpBarClass = computed(() => {
  const pct = hpPercentage.value;
  if (pct > 80) return 'vital-fill-full';
  if (pct > 50) return 'vital-fill-high';
  if (pct > 25) return 'vital-fill-mid';
  return 'vital-fill-low';
});

const attributeList = computed(() => {
  if (!props.playerState?.attributes) return [];
  const a = props.playerState.attributes;
  return [
    { key: 'str', label: '\u0421\u0418\u041B', value: a.str },
    { key: 'dex', label: '\u041B\u041E\u0412', value: a.dex },
    { key: 'con', label: '\u0412\u042B\u041D', value: a.con },
    { key: 'int', label: '\u0418\u041D\u0422', value: a.int },
    { key: 'wis', label: '\u041C\u0414\u0420', value: a.wis },
    { key: 'cha', label: '\u0425\u0410\u0420', value: a.cha },
  ];
});

function formatModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function isConsumable(item: InventoryItem): boolean {
  const consumableTypes = ['POTION', 'SCROLL', 'FOOD', 'potion', 'scroll', 'food'];
  return consumableTypes.includes(item.type) || item.stats?.isConsumable === true;
}

const slotShortLabels: Record<string, string> = {
  HEAD: '\u0413\u041B', NECK: '\u0428\u0415\u042F', CHEST: '\u0422\u0423\u041B',
  CLOAK: '\u041F\u041B\u0429', MAIN_HAND: '\u041F\u0420', OFF_HAND: '\u041B\u0412',
  LEGS: '\u041D\u0413', FEET: '\u041E\u0411', RING_1: '\u041A\u041B', RING_2: '\u041A\u041B',
};

function formatSlotShort(slot?: string): string {
  return slotShortLabels[slot ?? ''] ?? '\u042D\u041A';
}

async function handleUseItem(itemName: string): Promise<void> {
  emit('use-item', itemName);
  try {
    await gameStore.useItem(itemName);
  } catch {
    // Errors handled inside
  }
}
</script>

<style scoped>
/* ===== CHARACTER SHEET — DARK PANEL ===== */
.character-sheet {
  background: var(--bg-base);
  border: 1px solid rgba(218, 165, 32, 0.08);
  border-radius: 10px;
  overflow: hidden;
}

/* Header */
.sheet-header {
  padding: 1rem 1.25rem;
  background: var(--bg-medium);
  border-bottom: 1px solid rgba(218, 165, 32, 0.1);
}

.sheet-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.sheet-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.sheet-level {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--gold);
  background: rgba(218, 165, 32, 0.1);
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
}

.character-name {
  font-family: 'Cinzel', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  text-shadow: 0 0 12px rgba(218, 165, 32, 0.15);
}

.character-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.2rem;
}

.meta-tag {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.meta-separator {
  color: var(--text-dim);
}

/* Content */
.sheet-content {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Vitals */
.vital-section {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.vital-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vital-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #ef4444;
}

.vital-label-mana {
  color: var(--mana);
}

.vital-numbers {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.vital-numbers-mana {
  color: var(--text-secondary);
}

.vital-track {
  height: 6px;
  background: var(--bg-deep);
  border-radius: 3px;
  overflow: hidden;
}

.vital-fill {
  height: 100%;
  border-radius: 3px;
  transition: all 0.5s ease-out;
}

.vital-fill-full {
  background: linear-gradient(90deg, #dc2626, #ef4444, #f87171);
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.3);
}

.vital-fill-high {
  background: linear-gradient(90deg, #b91c1c, #ef4444);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.35);
}

.vital-fill-mid {
  background: linear-gradient(90deg, #991b1b, #dc2626);
  box-shadow: 0 0 8px rgba(220, 38, 38, 0.4);
  animation: hp-pulse 2s ease-in-out infinite;
}

.vital-fill-low {
  background: linear-gradient(90deg, #7f1d1d, #b91c1c);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.5);
  animation: hp-pulse 1s ease-in-out infinite;
}

@keyframes hp-pulse {
  0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.3); }
  50%      { box-shadow: 0 0 16px rgba(239, 68, 68, 0.7); }
}

.vital-fill-mana {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  box-shadow: 0 0 6px rgba(96, 165, 250, 0.3);
}

/* Attributes */
.attributes-section {
  padding-top: 0.25rem;
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}

.attr-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.25rem;
  background: var(--bg-medium);
  border: 1px solid var(--bg-surface);
  border-radius: 6px;
  transition: border-color 0.2s ease;
}

.attr-card.attr-high {
  border-color: rgba(218, 165, 32, 0.25);
}

.attr-card.attr-low {
  border-color: rgba(239, 68, 68, 0.2);
}

.attr-name {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-dim);
  text-transform: uppercase;
}

.attr-score {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.attr-high .attr-score {
  color: var(--gold);
}

.attr-low .attr-score {
  color: var(--hp-low);
}

.attr-mod {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: var(--text-secondary);
}

.attr-high .attr-mod {
  color: var(--gold-muted);
}

.attr-low .attr-mod {
  color: rgba(239, 68, 68, 0.6);
}

/* Inventory */
.inventory-section {
  border-top: 1px solid rgba(218, 165, 32, 0.08);
  padding-top: 0.75rem;
}

.inventory-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.section-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.equipment-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.6rem;
  background: rgba(218, 165, 32, 0.08);
  border: 1px solid rgba(218, 165, 32, 0.2);
  border-radius: 4px;
  color: var(--gold);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}

.equipment-btn:hover:not(:disabled) {
  background: rgba(218, 165, 32, 0.15);
  border-color: rgba(218, 165, 32, 0.4);
  box-shadow: 0 0 8px rgba(218, 165, 32, 0.15);
}

.equipment-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Inventory list */
.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.inv-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  background: var(--bg-medium);
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  cursor: default;
}

.inv-item:hover {
  background: var(--bg-light);
  border-color: rgba(218, 165, 32, 0.15);
}

.inv-item-equipped {
  border-left: 2px solid var(--gold-muted);
  background: rgba(218, 165, 32, 0.04);
}

.inv-rarity-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.rarity-common    { background: var(--rarity-common); }
.rarity-uncommon  { background: var(--rarity-uncommon); box-shadow: 0 0 4px var(--rarity-uncommon); }
.rarity-rare      { background: var(--rarity-rare); box-shadow: 0 0 4px var(--rarity-rare); }
.rarity-epic      { background: var(--rarity-epic); box-shadow: 0 0 6px var(--rarity-epic); }
.rarity-legendary { background: var(--rarity-legendary); box-shadow: 0 0 8px var(--rarity-legendary); }

.inv-name {
  flex: 1;
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.9rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.inv-qty {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: var(--text-dim);
  flex-shrink: 0;
}

.inv-slot-badge {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 0.1rem 0.3rem;
  background: rgba(218, 165, 32, 0.12);
  border: 1px solid rgba(218, 165, 32, 0.25);
  border-radius: 3px;
  color: var(--gold);
  flex-shrink: 0;
}

.inv-use-btn {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.25);
  border-radius: 4px;
  color: var(--hp-high);
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.inv-use-btn:hover {
  background: rgba(74, 222, 128, 0.2);
  border-color: var(--hp-high);
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.25);
}

/* Empty inventory */
.empty-inventory {
  padding: 1.5rem 0;
  text-align: center;
}

.empty-text {
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.85rem;
  font-style: italic;
  color: var(--text-dim);
}

/* Position */
.position-section {
  border-top: 1px solid rgba(218, 165, 32, 0.08);
  padding-top: 0.75rem;
}

.position-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.position-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.position-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 1280px) {
  .attributes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
