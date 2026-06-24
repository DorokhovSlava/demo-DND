<template>
  <div
    class="player-panel"
    v-if="playerState"
    role="complementary"
    aria-label="Character Information"
  >
    <!-- Header -->
    <div class="panel-header">
      <h2 class="char-name">{{ playerState.core.name }}</h2>
      <div class="char-class">
        {{ playerState.core.class }} &bull; {{ playerState.core.race }}
      </div>
    </div>

    <!-- Level & XP -->
    <div class="level-row">
      <div class="level-box">
        <span class="box-label">LVL</span>
        <span class="box-value">{{ playerState.core.level }}</span>
      </div>
      <div class="level-box">
        <span class="box-label">XP</span>
        <span class="box-value">{{ playerState.core.xp }}</span>
      </div>
    </div>

    <!-- HP & Mana -->
    <div class="vitals-section">
      <div class="vital-row">
        <span class="vital-label">&#10084; HP</span>
        <div class="vital-bar">
          <div
            class="vital-fill"
            :class="hpColorClass"
            :style="{ width: `${hpPercentage}%` }"
            role="progressbar"
            :aria-valuenow="playerState.vitals.hp"
            :aria-valuemin="0"
            :aria-valuemax="playerState.vitals.maxHp"
          ></div>
        </div>
        <span class="vital-numbers">{{ playerState.vitals.hp }}/{{ playerState.vitals.maxHp }}</span>
      </div>

      <div class="vital-row">
        <span class="vital-label">&#10022; MP</span>
        <div class="vital-bar">
          <div
            class="vital-fill mana-fill"
            :style="{ width: `${manaPercentage}%` }"
            role="progressbar"
            :aria-valuenow="playerState.vitals.mana"
            :aria-valuemin="0"
            :aria-valuemax="playerState.vitals.maxMana"
          ></div>
        </div>
        <span class="vital-numbers">{{ playerState.vitals.mana }}/{{ playerState.vitals.maxMana }}</span>
      </div>
    </div>

    <!-- Attributes -->
    <div class="attributes-section">
      <div class="section-label">Abilities</div>
      <div class="attributes-grid">
        <div
          v-for="(value, key) in playerState.attributes"
          :key="key"
          class="attr-box"
          :class="{
            'attr-high': value >= 14,
            'attr-low': value <= 9
          }"
        >
          <div class="attr-name">{{ (key as string).toUpperCase() }}</div>
          <div class="attr-value">{{ value }}</div>
          <div class="attr-mod">{{ getModifier(value) }}</div>
        </div>
      </div>
    </div>

    <!-- Inventory -->
    <div v-if="playerState.inventory?.length" class="inventory-section">
      <div class="section-label">Inventory ({{ playerState.inventory.length }})</div>
      <div class="inventory-list">
        <div
          v-for="item in playerState.inventory.slice(0, 3)"
          :key="item.id"
          class="inventory-item"
        >
          <span class="item-name">{{ item.name }}</span>
          <span v-if="item.quantity > 1" class="item-qty">x{{ item.quantity }}</span>
        </div>
        <div v-if="playerState.inventory.length > 3" class="inventory-more">
          +{{ playerState.inventory.length - 3 }} more...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/game.store';

const gameStore = useGameStore();

const playerState = computed(() => gameStore.playerState);
const hpPercentage = computed(() => gameStore.playerHpPercentage);
const manaPercentage = computed(() => gameStore.playerManaPercentage);

const hpColorClass = computed(() => {
  const pct = hpPercentage.value;
  if (pct <= 25) return 'hp-critical';
  if (pct <= 50) return 'hp-mid';
  return 'hp-high';
});

function getModifier(value: number): string {
  const modifier = Math.floor((value - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}
</script>

<style scoped>
.player-panel {
  padding: 1.25rem;
  background: var(--bg-base);
  border: 1px solid rgba(218, 165, 32, 0.1);
  border-radius: 8px;
  min-width: 260px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Header */
.panel-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(218, 165, 32, 0.08);
  text-align: center;
}

.char-name {
  font-family: 'Cinzel', serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.char-class {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.72rem;
  color: var(--text-dim);
  letter-spacing: 0.05em;
}

/* Level */
.level-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.level-box {
  flex: 1;
  padding: 0.5rem;
  text-align: center;
  background: var(--bg-medium);
  border-radius: 6px;
  border: 1px solid var(--bg-surface);
}

.box-label {
  display: block;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-dim);
}

.box-value {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gold);
}

/* Vitals */
.vitals-section {
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.vital-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vital-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-secondary);
  width: 40px;
  flex-shrink: 0;
}

.vital-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-abyss);
  border-radius: 3px;
  overflow: hidden;
}

.vital-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease-out;
}

.hp-high {
  background: linear-gradient(90deg, #22c55e, #4ade80);
  box-shadow: 0 0 6px rgba(74, 222, 128, 0.4);
}

.hp-mid {
  background: linear-gradient(90deg, #d97706, #fbbf24);
  box-shadow: 0 0 6px rgba(251, 191, 36, 0.4);
}

.hp-critical {
  background: linear-gradient(90deg, #b91c1c, #ef4444);
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
  animation: hpPulse 1s ease-in-out infinite alternate;
}

@keyframes hpPulse {
  from { opacity: 1; }
  to   { opacity: 0.6; }
}

.mana-fill {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  box-shadow: 0 0 6px rgba(96, 165, 250, 0.4);
}

.vital-numbers {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--text-secondary);
  width: 48px;
  text-align: right;
  flex-shrink: 0;
}

/* Attributes */
.attributes-section {
  margin-bottom: 0.75rem;
}

.section-label {
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold-muted);
  text-align: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid rgba(218, 165, 32, 0.06);
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.35rem;
}

.attr-box {
  padding: 0.4rem;
  text-align: center;
  background: var(--bg-medium);
  border-radius: 5px;
  border: 1px solid var(--bg-surface);
}

.attr-box.attr-high {
  border-color: rgba(218, 165, 32, 0.2);
}

.attr-box.attr-low {
  border-color: rgba(239, 68, 68, 0.2);
}

.attr-name {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.55rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-dim);
}

.attr-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.attr-mod {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--gold-muted);
}

.attr-box.attr-high .attr-mod {
  color: var(--gold);
}

.attr-box.attr-low .attr-mod {
  color: var(--hp-low);
}

/* Inventory */
.inventory-section {
  padding-top: 0.5rem;
  border-top: 1px solid rgba(218, 165, 32, 0.06);
}

.inventory-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.inventory-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0.5rem;
  background: rgba(0, 0, 0, 0.15);
  border-left: 2px solid var(--gold-muted);
  border-radius: 0 3px 3px 0;
  font-size: 0.8rem;
}

.item-name {
  color: var(--text-primary);
  font-family: 'Cormorant Garamond', serif;
}

.item-qty {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: var(--text-dim);
}

.inventory-more {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.7rem;
  font-style: italic;
  color: var(--text-dim);
  text-align: center;
  padding-top: 0.25rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .player-panel {
    min-width: 0;
  }

  .attributes-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
