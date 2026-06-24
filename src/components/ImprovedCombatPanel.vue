<template>
  <div v-if="combatInfo?.isActive" class="combat-panel">
    <!-- Header -->
    <div class="combat-header">
      <div class="header-left">
        <span class="combat-badge">&#9876;</span>
        <span class="round-label">Раунд {{ combatInfo.roundNumber }}</span>
      </div>
      <div class="turn-badge" :class="{ 'turn-player': combatInfo.isPlayerTurn }">
        {{ combatInfo.isPlayerTurn ? 'ВАШ ХОД' : 'ХОД ВРАГА' }}
      </div>
    </div>

    <!-- Participants Grid -->
    <div class="participants-grid">
      <div
        v-for="participant in sortedParticipants"
        :key="participant.id"
        class="participant-card"
        :class="{
          'card-player': participant.isPlayer,
          'card-enemy': !participant.isPlayer,
          'card-current': participant.isCurrentActor,
          'card-dead': participant.isDead,
          'card-selected': selectedTarget?.id === participant.id,
          'card-selectable': !participant.isPlayer && !participant.isDead && combatInfo.isPlayerTurn && !waitingForResult
        }"
        @click="selectTarget(participant)"
      >
        <!-- Current Turn Arrow -->
        <div v-if="participant.isCurrentActor" class="turn-arrow-badge">
          <span class="turn-arrow">&#9660;</span>
        </div>

        <!-- Avatar -->
        <div class="card-avatar" :class="{ 'avatar-dead': participant.isDead }">
          <span class="avatar-icon">{{ participant.isPlayer ? '&#129497;' : '&#128121;' }}</span>
          <div v-if="participant.isCurrentActor && !participant.isPlayer" class="attack-anim">
            &#9876;
          </div>
        </div>

        <!-- Name & Init -->
        <div class="card-info">
          <div class="card-name">{{ participant.name }}</div>
          <div class="card-init">&#9889; {{ participant.initiative }}</div>
        </div>

        <!-- HP Bar -->
        <div class="card-hp">
          <div class="hp-bar">
            <div
              class="hp-fill"
              :style="{ width: getHpPercent(participant) + '%' }"
              :class="getHpClass(participant)"
            ></div>
            <div class="hp-text">
              {{ participant.currentHp }}/{{ participant.maxHp }}
            </div>
          </div>
        </div>

        <!-- AC -->
        <div class="card-ac">
          <span class="ac-shield">&#128737;</span>
          <span class="ac-val">{{ participant.armorClass }}</span>
        </div>

        <!-- Behavior badge -->
        <div
          v-if="!participant.isPlayer && participant.behaviorType"
          class="behavior-badge"
          :class="`behavior-${participant.behaviorType.toLowerCase()}`"
        >
          {{ getBehaviorLabel(participant.behaviorType) }}
        </div>

        <!-- Selection ring -->
        <div v-if="selectedTarget?.id === participant.id" class="selection-ring"></div>
      </div>
    </div>

    <!-- Quick Potions -->
    <div
      v-if="availablePotions.length > 0 && combatInfo?.isPlayerTurn && !waitingForResult"
      class="quick-potions"
      role="toolbar"
      aria-label="Быстрое использование зелий"
    >
      <span class="potions-label">Зелья:</span>
      <button
        v-for="potion in availablePotions"
        :key="potion.id"
        class="potion-btn"
        :title="`Использовать ${potion.name}`"
        @click="usePotion(potion)"
      >
        <span class="potion-icon">&#129514;</span>
        <span class="potion-name">{{ potion.name }}</span>
        <span v-if="potion.quantity > 1" class="potion-qty">x{{ potion.quantity }}</span>
      </button>
    </div>

    <!-- Action Tabs -->
    <div v-if="combatInfo.isPlayerTurn && !waitingForResult" class="action-area">
      <!-- Step 1: Select Target -->
      <div v-if="!selectedTarget" class="target-prompt">
        <span class="prompt-icon">&#9757;</span>
        <span class="prompt-text">Выберите цель</span>
      </div>

      <!-- Step 2: Choose Action -->
      <div v-if="selectedTarget && !selectedAttackType" class="action-panel">
        <div class="target-bar">
          <span class="target-label">Цель:</span>
          <span class="target-name">{{ selectedTarget.name }}</span>
          <button class="cancel-btn" @click="cancelSelection">&#10005;</button>
        </div>

        <!-- Tab buttons -->
        <div class="tabs">
          <button
            class="tab tab-attack"
            :class="{ 'tab-active': activeTab === 'offensive' }"
            @click="activeTab = 'offensive'"
          >
            &#9876; Атака
          </button>
          <button
            class="tab tab-defense"
            :class="{ 'tab-active': activeTab === 'defensive' }"
            @click="activeTab = 'defensive'"
          >
            &#128737; Защита
          </button>
        </div>

        <!-- Offensive -->
        <div v-if="activeTab === 'offensive'" class="tab-content">
          <div class="actions-column">
            <button
              v-if="hasMeleeWeapon"
              class="action-btn action-melee"
              @click="selectAttackType('ATTACK')"
            >
              <div class="action-icon">&#9876;</div>
              <div class="action-info">
                <div class="action-name">Атака</div>
                <div class="action-detail">{{ meleeWeaponName }}</div>
              </div>
            </button>

            <button
              v-if="hasRangedWeapon"
              class="action-btn action-ranged"
              @click="selectAttackType('RANGED_ATTACK')"
            >
              <div class="action-icon">&#127993;</div>
              <div class="action-info">
                <div class="action-name">Стрельба</div>
                <div class="action-detail">{{ rangedWeaponName }}</div>
              </div>
            </button>

            <button
              v-if="canCastSpells"
              class="action-btn action-spell"
              :disabled="!hasEnoughMana"
              @click="selectAttackType('CAST_SPELL')"
            >
              <div class="action-icon">&#10024;</div>
              <div class="action-info">
                <div class="action-name">Заклинание</div>
                <div class="action-detail" :class="{ 'mana-low': !hasEnoughMana }">
                  Мана: {{ playerMana }}
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Defensive -->
        <div v-if="activeTab === 'defensive'" class="tab-content">
          <div class="actions-grid">
            <button class="action-btn-small action-defend" @click="selectAttackType('DEFEND')">
              <span class="small-icon">&#128737;</span>
              <span class="small-label">Защита</span>
            </button>
            <button class="action-btn-small action-dodge" @click="selectAttackType('DODGE')">
              <span class="small-icon">&#128168;</span>
              <span class="small-label">Уклонение</span>
            </button>
            <button class="action-btn-small action-disengage" @click="selectAttackType('DISENGAGE')">
              <span class="small-icon">&#128694;</span>
              <span class="small-label">Отход</span>
            </button>
            <button class="action-btn-small action-flee" @click="selectAttackType('FLEE')">
              <span class="small-icon">&#127939;</span>
              <span class="small-label">Бегство</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Enemy Turn Overlay -->
    <div v-if="!combatInfo.isPlayerTurn" class="overlay">
      <div class="overlay-content">
        <div class="overlay-spinner enemy-spinner"></div>
        <div class="overlay-text enemy-text">Враг действует...</div>
      </div>
    </div>

    <!-- Waiting Overlay -->
    <div v-if="waitingForResult" class="overlay">
      <div class="overlay-content">
        <div class="overlay-spinner"></div>
        <div class="overlay-text">Обработка...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { CombatInfo, CombatParticipant, InventoryItem } from '@/types/game';

const props = defineProps<{
  combatInfo?: CombatInfo;
  playerInventory?: InventoryItem[];
  playerMana?: number;
}>();

const emit = defineEmits<{
  (e: 'combatAction', payload: { action: string; targetId: string }): void;
  (e: 'rollDice', diceRoll: { requestId: string; diceType: string }): void;
  (e: 'usePotion', potion: InventoryItem): void;
}>();

const selectedTarget = ref<CombatParticipant | null>(null);
const selectedAttackType = ref<string | null>(null);
const waitingForResult = ref(false);
const activeTab = ref<'offensive' | 'defensive'>('offensive');

const sortedParticipants = computed(() => {
  if (!props.combatInfo?.participants) return [];
  return [...props.combatInfo.participants].sort((a, b) => b.initiative - a.initiative);
});

const hasMeleeWeapon = computed(() => {
  if (!props.playerInventory) return true;
  return props.playerInventory.some(item =>
    ['sword', 'axe', 'mace', 'dagger', 'staff', 'club', 'hammer', 'меч', 'топор', 'булава', 'кинжал', 'посох'].some(weapon =>
      item.type.toLowerCase().includes(weapon) || item.name.toLowerCase().includes(weapon)
    )
  ) || true;
});

const hasRangedWeapon = computed(() => {
  if (!props.playerInventory) return false;
  return props.playerInventory.some(item =>
    ['bow', 'crossbow', 'sling', 'dart', 'javelin', 'лук', 'арбалет'].some(weapon =>
      item.type.toLowerCase().includes(weapon) || item.name.toLowerCase().includes(weapon)
    )
  );
});

const canCastSpells = computed(() => (props.playerMana ?? 0) >= 0);
const hasEnoughMana = computed(() => (props.playerMana ?? 0) >= 1);

const availablePotions = computed<InventoryItem[]>(() => {
  if (!props.playerInventory) return [];
  return props.playerInventory.filter(item => {
    const type = (item.type ?? '').toUpperCase();
    const name = (item.name ?? '').toLowerCase();
    return (
      (type.includes('POTION') || name.includes('зелье') || name.includes('настойка') || name.includes('elixir')) &&
      item.quantity > 0
    );
  });
});

function getBehaviorLabel(behaviorType: string): string {
  const map: Record<string, string> = {
    COWARDLY: 'Трус',
    CUNNING: 'Хитрый',
    HOSTILE: 'Враждебный',
    AGGRESSIVE: 'Агрессивный',
    NEUTRAL: 'Нейтральный',
    FRIENDLY: 'Дружелюбный',
  };
  return map[behaviorType?.toUpperCase()] ?? behaviorType;
}

function usePotion(potion: InventoryItem): void {
  emit('usePotion', potion);
}

const meleeWeapon = computed(() => {
  if (!props.playerInventory) return null;
  return props.playerInventory.find(item =>
    ['sword', 'axe', 'mace', 'dagger', 'staff', 'club', 'hammer', 'меч', 'топор', 'булава', 'кинжал', 'посох'].some(w =>
      item.type.toLowerCase().includes(w) || item.name.toLowerCase().includes(w)
    )
  );
});

const rangedWeapon = computed(() => {
  if (!props.playerInventory) return null;
  return props.playerInventory.find(item =>
    ['bow', 'crossbow', 'sling', 'dart', 'javelin', 'лук', 'арбалет'].some(w =>
      item.type.toLowerCase().includes(w) || item.name.toLowerCase().includes(w)
    )
  );
});

const meleeWeaponName = computed(() => meleeWeapon.value?.name ?? 'Кулаки');
const rangedWeaponName = computed(() => rangedWeapon.value?.name ?? 'Дальнобойное');

function selectTarget(participant: CombatParticipant) {
  if (participant.isPlayer || participant.isDead || !props.combatInfo?.isPlayerTurn || waitingForResult.value) {
    return;
  }
  selectedTarget.value = participant;
  selectedAttackType.value = null;
  activeTab.value = 'offensive';
}

function selectAttackType(actionType: string) {
  selectedAttackType.value = actionType;
  if (selectedTarget.value) {
    emit('combatAction', {
      action: actionType,
      targetId: selectedTarget.value.id
    });
  }
}

function cancelSelection() {
  selectedTarget.value = null;
  selectedAttackType.value = null;
}

function resetCombatFlow() {
  selectedTarget.value = null;
  selectedAttackType.value = null;
  waitingForResult.value = false;
  activeTab.value = 'offensive';
}

defineExpose({ resetCombatFlow });

function getHpPercent(participant: CombatParticipant): number {
  if (participant.maxHp <= 0) return 0;
  return Math.max(0, Math.min(100, (participant.currentHp / participant.maxHp) * 100));
}

function getHpClass(participant: CombatParticipant): string {
  const percent = getHpPercent(participant);
  if (percent <= 25) return 'hp-critical';
  if (percent <= 50) return 'hp-low';
  return 'hp-normal';
}
</script>

<style scoped>
/* ===== COMBAT PANEL ===== */
.combat-panel {
  position: relative;
  background: var(--bg-base);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-top: 2px solid var(--combat-red);
  border-radius: 10px;
  padding: 1rem;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(220, 38, 38, 0.08);
}

/* ===== HEADER ===== */
.combat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-medium);
  border-radius: 8px;
  border: 1px solid rgba(220, 38, 38, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.combat-badge {
  font-size: 1.3rem;
  animation: pulseSubtle 2s ease-in-out infinite;
}

@keyframes pulseSubtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.round-label {
  font-family: 'Cinzel', serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--hp-low);
}

.turn-badge {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  background: rgba(220, 38, 38, 0.15);
  color: #f87171;
  border: 1px solid rgba(220, 38, 38, 0.25);
}

.turn-badge.turn-player {
  background: rgba(74, 222, 128, 0.12);
  color: #4ade80;
  border-color: rgba(74, 222, 128, 0.25);
  animation: playerGlow 2s ease-in-out infinite;
}

@keyframes playerGlow {
  0%, 100% { box-shadow: 0 0 8px rgba(74, 222, 128, 0.2); }
  50% { box-shadow: 0 0 16px rgba(74, 222, 128, 0.4); }
}

/* ===== PARTICIPANTS GRID ===== */
.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.participant-card {
  position: relative;
  background: var(--bg-medium);
  border: 1px solid var(--bg-surface);
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.25s ease;
  cursor: default;
}

.participant-card.card-player {
  border-color: rgba(96, 165, 250, 0.3);
}

.participant-card.card-enemy {
  border-color: rgba(220, 38, 38, 0.2);
}

.participant-card.card-current {
  border-color: var(--gold);
  box-shadow: 0 0 15px rgba(218, 165, 32, 0.2);
  animation: currentGlow 2.5s ease-in-out infinite;
}

@keyframes currentGlow {
  0%, 100% { box-shadow: 0 0 12px rgba(218, 165, 32, 0.15); }
  50% { box-shadow: 0 0 22px rgba(218, 165, 32, 0.35); }
}

.participant-card.card-dead {
  opacity: 0.35;
  filter: grayscale(0.8);
}

.participant-card.card-selectable {
  cursor: pointer;
}

.participant-card.card-selectable:hover {
  transform: translateY(-3px);
  border-color: var(--gold);
  box-shadow: 0 6px 20px rgba(218, 165, 32, 0.2);
}

.participant-card.card-selected {
  border-color: var(--gold-bright);
  background: rgba(218, 165, 32, 0.06);
  box-shadow: 0 0 24px rgba(218, 165, 32, 0.3);
  animation: selectedPulse 1.8s ease-in-out infinite;
}

@keyframes selectedPulse {
  0%, 100% { box-shadow: 0 0 20px rgba(218, 165, 32, 0.25); }
  50% { box-shadow: 0 0 30px rgba(218, 165, 32, 0.5); }
}

/* Turn arrow */
.turn-arrow-badge {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--gold), var(--gold-bright));
  color: var(--bg-abyss);
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.6rem;
  font-weight: 700;
}

.turn-arrow {
  display: block;
  animation: arrowBounce 1s ease-in-out infinite;
}

@keyframes arrowBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(2px); }
}

/* Avatar */
.card-avatar {
  position: relative;
  width: 50px;
  height: 50px;
  margin: 0 auto 0.5rem;
  background: var(--bg-abyss);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-surface);
}

.avatar-dead {
  filter: grayscale(1);
  opacity: 0.5;
}

.avatar-icon {
  font-size: 1.6rem;
}

.attack-anim {
  position: absolute;
  font-size: 1rem;
  animation: attackSwing 1.2s ease-in-out infinite;
}

@keyframes attackSwing {
  0%, 100% { transform: translateX(-15px) rotate(-30deg); opacity: 0; }
  50% { transform: translateX(15px) rotate(30deg); opacity: 1; }
}

/* Card info */
.card-info {
  text-align: center;
  margin-bottom: 0.5rem;
}

.card-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.15rem;
}

.card-init {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: var(--mana);
}

/* HP Bar */
.card-hp {
  margin-bottom: 0.5rem;
}

.hp-bar {
  position: relative;
  height: 16px;
  background: var(--bg-abyss);
  border-radius: 8px;
  overflow: hidden;
}

.hp-fill {
  height: 100%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
}

.hp-fill.hp-normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
  box-shadow: inset 0 0 6px rgba(74, 222, 128, 0.3);
}

.hp-fill.hp-low {
  background: linear-gradient(90deg, #d97706, #fbbf24);
  box-shadow: inset 0 0 6px rgba(251, 191, 36, 0.3);
}

.hp-fill.hp-critical {
  background: linear-gradient(90deg, #b91c1c, #ef4444);
  box-shadow: inset 0 0 6px rgba(239, 68, 68, 0.3);
  animation: hpFlash 0.5s ease-in-out infinite alternate;
}

@keyframes hpFlash {
  from { opacity: 1; }
  to   { opacity: 0.65; }
}

.hp-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

/* AC */
.card-ac {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  background: var(--bg-abyss);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: var(--mana);
}

.ac-shield { font-size: 0.85rem; }

/* Selection ring */
.selection-ring {
  position: absolute;
  inset: -3px;
  border: 2px solid var(--gold-bright);
  border-radius: 10px;
  pointer-events: none;
  animation: ringPulse 1.5s ease-in-out infinite;
}

@keyframes ringPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(218, 165, 32, 0.4); }
  50% { box-shadow: 0 0 16px rgba(218, 165, 32, 0.7); }
}

/* ===== BEHAVIOR BADGES ===== */
.behavior-badge {
  display: block;
  margin-top: 0.4rem;
  padding: 0.15rem 0.5rem;
  border-radius: 8px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-align: center;
  text-transform: uppercase;
}

.behavior-cowardly {
  background: rgba(218, 165, 32, 0.1);
  border: 1px solid rgba(218, 165, 32, 0.25);
  color: var(--gold-bright);
}

.behavior-cunning {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.25);
  color: #c084fc;
}

.behavior-hostile {
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.25);
  color: #f87171;
}

.behavior-aggressive {
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.25);
  color: #fb923c;
}

.behavior-neutral {
  background: rgba(156, 163, 175, 0.08);
  border: 1px solid rgba(156, 163, 175, 0.2);
  color: #9ca3af;
}

.behavior-friendly {
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

/* ===== QUICK POTIONS ===== */
.quick-potions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.6rem 0.75rem;
  background: rgba(74, 222, 128, 0.04);
  border: 1px solid rgba(74, 222, 128, 0.15);
  border-radius: 8px;
}

.potions-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #4ade80;
  flex-shrink: 0;
}

.potion-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: rgba(74, 222, 128, 0.06);
  border: 1px solid rgba(74, 222, 128, 0.2);
  border-radius: 6px;
  color: #86efac;
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.potion-btn:hover {
  background: rgba(74, 222, 128, 0.12);
  border-color: rgba(74, 222, 128, 0.35);
  transform: translateY(-1px);
}

.potion-icon { font-size: 0.95rem; }

.potion-name {
  white-space: nowrap;
  overflow: hidden;
  max-width: 110px;
  text-overflow: ellipsis;
}

.potion-qty {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: rgba(74, 222, 128, 0.6);
}

/* ===== ACTION AREA ===== */
.action-area {
  background: var(--bg-medium);
  border-radius: 8px;
  padding: 0.75rem;
  border: 1px solid rgba(218, 165, 32, 0.06);
}

.target-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1rem;
  background: rgba(218, 165, 32, 0.04);
  border: 1px dashed rgba(218, 165, 32, 0.2);
  border-radius: 8px;
  color: var(--gold);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
}

.prompt-icon {
  font-size: 1.3rem;
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.action-panel {
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Target bar */
.target-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: rgba(218, 165, 32, 0.06);
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.target-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.72rem;
  color: var(--text-dim);
}

.target-name {
  flex: 1;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gold);
}

.cancel-btn {
  padding: 0.2rem 0.6rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 4px;
  color: #f87171;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: rgba(220, 38, 38, 0.2);
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tab {
  flex: 1;
  padding: 0.6rem;
  border: none;
  border-radius: 6px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.5;
}

.tab-attack {
  background: rgba(220, 38, 38, 0.1);
  color: #f87171;
}

.tab-defense {
  background: rgba(96, 165, 250, 0.1);
  color: #93c5fd;
}

.tab.tab-active {
  opacity: 1;
  transform: translateY(-1px);
}

.tab-attack.tab-active {
  background: rgba(220, 38, 38, 0.2);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
}

.tab-defense.tab-active {
  background: rgba(96, 165, 250, 0.2);
  box-shadow: 0 2px 8px rgba(96, 165, 250, 0.15);
}

.tab-content {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Action buttons — offensive */
.actions-column {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.action-melee {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(220, 38, 38, 0.25));
  border: 1px solid rgba(220, 38, 38, 0.3);
}

.action-ranged {
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(74, 222, 128, 0.18));
  border: 1px solid rgba(74, 222, 128, 0.25);
}

.action-spell {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(168, 85, 247, 0.2));
  border: 1px solid rgba(168, 85, 247, 0.25);
}

.action-btn:hover:not(:disabled) {
  transform: translateX(3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.action-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.action-info {
  flex: 1;
  text-align: left;
}

.action-name {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
}

.action-detail {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.75rem;
  opacity: 0.8;
}

.action-detail.mana-low {
  color: #f87171;
}

/* Defensive grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.action-btn-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 0.75rem 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  color: white;
}

.action-defend {
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.2);
}

.action-dodge {
  background: rgba(218, 165, 32, 0.1);
  border: 1px solid rgba(218, 165, 32, 0.2);
}

.action-disengage {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.2);
}

.action-flee {
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.action-btn-small:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.small-icon { font-size: 1.3rem; }

.small-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.72rem;
}

/* ===== OVERLAYS ===== */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(4px);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.overlay-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--bg-surface);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.overlay-spinner.enemy-spinner {
  border-top-color: var(--combat-red);
}

@keyframes spin { to { transform: rotate(360deg); } }

.overlay-text {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.overlay-text.enemy-text {
  color: #f87171;
}
</style>
