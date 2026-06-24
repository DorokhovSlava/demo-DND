<template>
  <div class="dungeon-chamber">
    <!-- Ambient vignette overlay -->
    <div class="vignette-overlay" aria-hidden="true"></div>

    <!-- CSS-only ember particles -->
    <div class="ember-container" aria-hidden="true">
      <div class="ember ember-1"></div>
      <div class="ember ember-2"></div>
      <div class="ember ember-3"></div>
      <div class="ember ember-4"></div>
    </div>

    <!-- Header -->
    <header class="chamber-header" role="banner">
      <div class="header-content">
        <div class="header-left">
          <h1 class="dungeon-title">
            <span class="title-text">AI Dungeon Master</span>
          </h1>
        </div>

        <div class="header-right">
          <!-- User badge -->
          <div class="user-badge">
            <span class="user-icon">&#9876;</span>
            <span class="user-name">{{ authStore.username }}</span>
          </div>

          <!-- Back to characters -->
          <button @click="goToCharacterSelection" class="header-btn" title="Back to Character Selection">
            &#8592; &#1055;&#1077;&#1088;&#1089;&#1086;&#1085;&#1072;&#1078;&#1080;
          </button>

          <!-- Logout -->
          <button @click="handleLogout" class="header-btn header-btn-danger" title="Logout">
            &#1042;&#1099;&#1081;&#1090;&#1080;
          </button>
        </div>
      </div>
      <div class="header-border" aria-hidden="true"></div>
    </header>

    <!-- Main Content -->
    <main class="chamber-main" role="main">
      <!-- Narrative Area -->
      <div class="narrative-area">
        <!-- Promoted scene description (new room + combat) -->
        <div
          v-if="gameStore.currentNarrative?.isNewScene && gameStore.currentNarrative?.combatInfo?.isActive && gameStore.currentNarrative?.sceneDescription"
          class="scene-description-promoted"
          role="region"
          aria-label="Scene Description"
        >
          <p
            v-for="(line, idx) in promotedSceneLines"
            :key="'promoted-scene-' + idx"
            class="promoted-scene-text"
          >{{ line }}</p>
        </div>

        <!-- Combat Panel -->
        <ImprovedCombatPanel
          v-if="gameStore.currentNarrative?.combatInfo?.isActive"
          :combat-info="gameStore.currentNarrative.combatInfo"
          :player-inventory="gameStore.playerState?.inventory"
          :player-mana="gameStore.playerState?.vitals?.mana"
          @combat-action="handleCombatAction"
          @use-potion="handleUsePotionInCombat"
        />

        <!-- Narrative Window -->
        <NarrativeWindow
          :narrative="gameStore.currentNarrative"
          @option-selected="handleOptionSelected"
        />

        <!-- Loot panel -->
        <Transition name="loot-panel">
          <div v-if="lootItems.length > 0" class="loot-panel" role="region" aria-label="Loot">
            <div class="loot-header">
              <span class="loot-icon" aria-hidden="true">&#9876;</span>
              <span class="loot-title">&#1044;&#1086;&#1073;&#1099;&#1095;&#1072;</span>
            </div>
            <ul class="loot-list" aria-label="Loot list">
              <li
                v-for="(item, idx) in lootItems"
                :key="idx"
                class="loot-item"
              >
                <span class="loot-item-icon" aria-hidden="true">{{ getItemIcon(item.itemType) }}</span>
                <span class="loot-item-name">{{ item.nameRu }}</span>
                <span v-if="item.quantity > 1" class="loot-item-qty">x{{ item.quantity }}</span>
                <span v-if="item.goldValue > 0" class="loot-item-gold">{{ item.goldValue }} gp</span>
              </li>
            </ul>
          </div>
        </Transition>

        <!-- Action Input -->
        <div class="action-panel" role="form" aria-label="Action Input">
          <div class="action-input-wrapper" :class="{ 'is-processing': gameStore.isProcessingAction }">
            <input
              v-model="actionText"
              @keydown.enter.prevent="sendAction"
              type="text"
              :placeholder="gameStore.isProcessingAction ? 'DM &#1086;&#1073;&#1076;&#1091;&#1084;&#1099;&#1074;&#1072;&#1077;&#1090; &#1074;&#1072;&#1096; &#1093;&#1086;&#1076;...' : '&#1063;&#1090;&#1086; &#1074;&#1099; &#1076;&#1077;&#1083;&#1072;&#1077;&#1090;&#1077;?..'"
              class="action-input"
              :disabled="gameStore.isProcessingAction"
              :aria-label="gameStore.isProcessingAction ? 'Processing action...' : 'Enter your action'"
            />
            <button
              @click="sendAction"
              :disabled="gameStore.isProcessingAction || !actionText.trim()"
              class="action-button"
              :class="{ 'is-processing': gameStore.isProcessingAction }"
              aria-label="Send action"
            >
              <span v-if="gameStore.isProcessingAction" class="action-spinner"></span>
              <span v-else class="action-arrow">&#10148;</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Character Panel -->
      <aside class="character-area" role="complementary" aria-label="Character Information">
        <CharacterSheet
          :player-state="gameStore.playerState"
          @open-equipment="showEquipmentScreen = true"
          @use-item="handleUseItemFromSheet"
        />
        <MiniMap :player-state="gameStore.playerState" :dungeon-map="gameStore.dungeonMap" />
        <DiceRollAnimation :dice-result="gameStore.lastDiceRoll" />
      </aside>
    </main>

    <!-- Client-Side Dice Roll Modal -->
    <ThreeD20Dice
      :is-visible="gameStore.showDiceRollUI"
      :dice-type="gameStore.pendingDiceRoll?.diceType || 'd20'"
      :dice-count="gameStore.pendingDiceRoll?.diceCount || 1"
      :modifier="gameStore.pendingDiceRoll?.modifier || 0"
      :description="gameStore.pendingDiceRoll?.description || 'Brosok kubika'"
      :action-description="gameStore.pendingDiceRoll?.actionDescription"
      :target-dc="gameStore.pendingDiceRoll?.targetDC"
      :target-name="gameStore.pendingDiceRoll?.targetName"
      :roll-type="gameStore.pendingDiceRoll?.rollType || 'SKILL_CHECK'"
      :request-id="gameStore.pendingDiceRoll?.requestId || ''"
      @rolled="handleDiceRolled"
      @close="handleDiceClose"
    />

    <!-- Equipment Screen Modal -->
    <EquipmentScreen
      :is-open="showEquipmentScreen"
      :player-state="gameStore.playerState"
      @close="showEquipmentScreen = false"
    />

    <!-- Quest Update Notification -->
    <Transition name="quest-notification">
      <div v-if="questNotification" class="quest-notification" :class="{ 'quest-completed': questNotification.completed }">
        <span class="quest-icon">{{ questNotification.completed ? '&#10022;' : '&#9670;' }}</span>
        <span class="quest-label">{{ questNotification.title }}</span>
        <span class="quest-stage">{{ questNotification.completed ? 'Kvest vypolnen!' : questNotification.stage }}</span>
      </div>
    </Transition>

    <!-- Victory Screen -->
    <VictoryScreen
      :is-visible="showVictoryScreen"
      :victory="victoryData"
      @close="showVictoryScreen = false"
      @next-dungeon="handleNextDungeon"
    />

    <!-- Game Toasts -->
    <GameToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/game.store';
import { useAuthStore } from '@/stores/auth.store';
import NarrativeWindow from '@/components/NarrativeWindow.vue';
import CharacterSheet from '@/components/CharacterSheet.vue';
import MiniMap from '@/components/MiniMap.vue';
import DiceRollAnimation from '@/components/DiceRollAnimation.vue';
import ImprovedCombatPanel from '@/components/ImprovedCombatPanel.vue';
import ThreeD20Dice from '@/components/ThreeD20Dice.vue';
import EquipmentScreen from '@/components/EquipmentScreen.vue';
import VictoryScreen from '@/components/VictoryScreen.vue';
import GameToastContainer from '@/components/GameToastContainer.vue';
import type { PlayerOption, VictoryPayload, LootItem, InventoryItem } from '@/types/game';
import { useGameToasts } from '@/composables/useGameToasts';
import { apiService } from '@/services/api.service';

const router = useRouter();
const gameStore = useGameStore();
const authStore = useAuthStore();
const actionText = ref('');

const showEquipmentScreen = ref(false);

const { showLoot, showQuestUpdate, showNpcFlee, showItemPickup, getItemIcon } = useGameToasts();

const lootItems = ref<LootItem[]>([]);

const questNotification = ref<{ title: string; stage: string; completed: boolean } | null>(null);
let questNotificationTimer: ReturnType<typeof setTimeout> | null = null;

const showVictoryScreen = ref(false);
const victoryData = ref<VictoryPayload>({
  narration: '',
  xpReward: 0,
  goldReward: 0,
});

const promotedSceneLines = computed<string[]>(() => {
  const desc = gameStore.currentNarrative?.sceneDescription;
  if (!desc) return [];
  return desc.split('\n').map(l => l.trim()).filter(l => l.length > 0);
});

async function sendAction(): Promise<void> {
  if (!actionText.value.trim() || gameStore.isProcessingAction) return;
  const text = actionText.value.trim();
  actionText.value = '';
  try {
    await gameStore.sendAction(text);
  } catch (error) {
    console.error('Failed to send action', error);
  }
}

function handleOptionSelected(option: PlayerOption): void {
  const actionText = (option.metadata?.actionText as string) || option.text;
  gameStore.sendAction(actionText);
}

function handleDiceRolled(result: { requestId: string; roll: number; total: number }): void {
  console.log('[GameView] Dice rolled:', result);
  gameStore.submitDiceRollResult(result.roll);
}

function handleDiceClose(): void {
  if (gameStore.showDiceRollUI) {
    gameStore.showDiceRollUI = false;
  }
}

function handleCombatAction(payload: { action: string; targetId: string }): void {
  const { action, targetId } = payload;
  const target = gameStore.currentNarrative?.combatInfo?.participants.find(p => p.id === targetId);
  const targetName = target?.name || 'цель';

  const actionMap: Record<string, string> = {
    ATTACK: `атакую ${targetName}`,
    RANGED_ATTACK: `стреляю в ${targetName}`,
    CAST_SPELL: `применяю заклинание на ${targetName}`,
    DEFEND: 'защищаюсь',
    DODGE: 'уклоняюсь',
    DISENGAGE: 'отхожу',
    FLEE: 'убегаю',
    USE_ITEM: 'использую предмет',
  };

  const actionText = actionMap[action] || `${action.toLowerCase()} ${targetName}`;
  console.log('[GameView] Combat action:', actionText);
  gameStore.sendAction(actionText);
}

function handleUseItemFromSheet(_itemName: string): void {
  // CharacterSheet calls gameStore.useItem internally
}

function handleUsePotionInCombat(potion: InventoryItem): void {
  console.log('[GameView] Quick-use potion:', potion.name);
  gameStore.useItem(potion.name);
}

function handleNextDungeon(dungeonKey: string): void {
  showVictoryScreen.value = false;
  console.log('[GameView] Next dungeon:', dungeonKey);
}

watch(() => gameStore.currentNarrative, (narrative) => {
  if (!narrative) return;

  if (narrative.questUpdate) {
    questNotification.value = {
      title: narrative.questUpdate.questTitleRu,
      stage: narrative.questUpdate.stageName,
      completed: narrative.questUpdate.isCompleted,
    };
    if (questNotificationTimer) clearTimeout(questNotificationTimer);
    questNotificationTimer = setTimeout(() => {
      questNotification.value = null;
    }, 5000);
    showQuestUpdate(narrative.questUpdate);
  }

  if (narrative.dungeonCompleted && narrative.victoryPayload) {
    victoryData.value = narrative.victoryPayload;
    showVictoryScreen.value = true;
  }

  if (narrative.lootItems && narrative.lootItems.length > 0) {
    lootItems.value = narrative.lootItems;
    showLoot(narrative.lootItems);
  } else {
    lootItems.value = [];
  }

  if (narrative.npcFleeMessage) {
    showNpcFlee(narrative.npcFleeMessage);
  }

  if (narrative.itemPickupMessage) {
    showItemPickup(narrative.itemPickupMessage);
  }
});

function goToCharacterSelection(): void {
  gameStore.clearGameState();
  router.push({ name: 'CharacterSelection' });
}

function handleLogout(): void {
  gameStore.clearGameState();
  authStore.logout();
  router.push({ name: 'Login' });
}

onMounted(async () => {
  if (!gameStore.selectedPlayerId) {
    console.warn('No character selected, redirecting');
    router.push({ name: 'CharacterSelection' });
    return;
  }

  try {
    await gameStore.initializeGame(gameStore.selectedPlayerId);
    if (!gameStore.currentNarrative) {
      try {
        const welcomeMessage = await apiService.getWelcomeMessage();
        gameStore.currentNarrative = welcomeMessage;
      } catch (error) {
        console.error('Failed to get welcome message', error);
      }
    }
  } catch (error) {
    console.error('Failed to initialize game', error);
    router.push({ name: 'CharacterSelection' });
  }
});

onUnmounted(() => {
  gameStore.clearGameState();
});
</script>

<style scoped>
/* ===== DUNGEON CHAMBER — ROOT ===== */
.dungeon-chamber {
  min-height: 100vh;
  position: relative;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(218, 165, 32, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 20% 70%, rgba(96, 165, 250, 0.02) 0%, transparent 40%),
    radial-gradient(ellipse at 80% 70%, rgba(168, 85, 247, 0.02) 0%, transparent 40%),
    linear-gradient(180deg, var(--bg-abyss) 0%, var(--bg-base) 100%);
}

/* ===== VIGNETTE OVERLAY ===== */
.vignette-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.55) 100%);
  z-index: 50;
}

/* ===== EMBER PARTICLES (CSS only) ===== */
.ember-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.ember {
  position: absolute;
  bottom: -10px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--gold);
  opacity: 0;
  filter: blur(1px);
}

.ember-1 {
  left: 15%;
  animation: ember-rise 5s ease-out 0s infinite;
}

.ember-2 {
  left: 45%;
  animation: ember-rise 7s ease-out 2s infinite;
}

.ember-3 {
  left: 75%;
  animation: ember-rise 6s ease-out 1s infinite;
}

.ember-4 {
  left: 60%;
  animation: ember-rise 8s ease-out 3.5s infinite;
}

@keyframes ember-rise {
  0%   { opacity: 0; transform: translateY(0) scale(0.5); }
  15%  { opacity: 0.7; }
  100% { opacity: 0; transform: translateY(-100vh) scale(0); }
}

/* ===== HEADER ===== */
.chamber-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(10, 10, 15, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  height: 48px;
  max-width: 1600px;
  margin: 0 auto;
}

.header-border {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-muted), var(--gold), var(--gold-muted), transparent);
  background-size: 200% 100%;
  animation: border-flow 4s linear infinite;
}

@keyframes border-flow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.header-left {
  display: flex;
  align-items: center;
}

.dungeon-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.title-text {
  color: var(--gold);
  text-shadow: 0 0 20px rgba(218, 165, 32, 0.3);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.75rem;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.user-icon {
  color: var(--gold-muted);
  font-size: 0.9rem;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
}

.header-btn {
  padding: 0.3rem 0.75rem;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.02em;
}

.header-btn:hover {
  color: var(--gold);
  background: rgba(218, 165, 32, 0.08);
  border-color: rgba(218, 165, 32, 0.2);
}

.header-btn-danger:hover {
  color: var(--hp-low);
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
}

/* ===== MAIN CONTENT ===== */
.chamber-main {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.25rem;
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  min-height: calc(100vh - 50px);
  position: relative;
  z-index: 2;
}

.narrative-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.character-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ===== PROMOTED SCENE DESCRIPTION ===== */
.scene-description-promoted {
  padding: 1rem 1.25rem;
  background: var(--bg-medium);
  border: 1px solid rgba(218, 165, 32, 0.15);
  border-left: 3px solid var(--gold);
  border-radius: 8px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-secondary);
  font-style: italic;
  animation: scene-promote 0.5s ease-out;
}

.promoted-scene-text {
  margin-bottom: 0.25rem;
}

.promoted-scene-text:last-child {
  margin-bottom: 0;
}

@keyframes scene-promote {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ===== ACTION PANEL ===== */
.action-panel {
  position: sticky;
  bottom: 0;
  padding-top: 0.75rem;
  padding-bottom: 0.25rem;
  background: linear-gradient(to bottom, transparent 0%, var(--bg-abyss) 30%);
  z-index: 5;
}

.action-input-wrapper {
  display: flex;
  align-items: stretch;
  background: var(--bg-deep);
  border: 1px solid var(--bg-surface);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.action-input-wrapper:focus-within {
  border-color: rgba(218, 165, 32, 0.4);
  box-shadow: 0 0 20px rgba(218, 165, 32, 0.1);
}

.action-input-wrapper.is-processing {
  border-color: rgba(218, 165, 32, 0.3);
  animation: pulse-gold-border 2s ease-in-out infinite;
}

@keyframes pulse-gold-border {
  0%, 100% { border-color: rgba(218, 165, 32, 0.15); box-shadow: none; }
  50%      { border-color: rgba(218, 165, 32, 0.4); box-shadow: 0 0 15px rgba(218, 165, 32, 0.1); }
}

.action-input {
  flex: 1;
  padding: 1rem 1.25rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem;
  line-height: 1.5;
  outline: none;
}

.action-input::placeholder {
  color: var(--text-dim);
  font-style: italic;
}

.action-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  background: transparent;
  border: none;
  border-left: 1px solid var(--bg-surface);
  color: var(--gold);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.3rem;
}

.action-button:hover:not(:disabled) {
  background: rgba(218, 165, 32, 0.1);
  color: var(--gold-bright);
  text-shadow: 0 0 10px rgba(218, 165, 32, 0.4);
}

.action-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-arrow {
  display: inline-block;
  transition: transform 0.2s ease;
}

.action-button:hover:not(:disabled) .action-arrow {
  transform: translateX(2px);
}

.action-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(218, 165, 32, 0.2);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== LOOT PANEL ===== */
.loot-panel {
  padding: 0.875rem 1rem;
  background: var(--bg-medium);
  border: 1px solid rgba(218, 165, 32, 0.25);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(218, 165, 32, 0.08);
}

.loot-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(218, 165, 32, 0.15);
}

.loot-icon {
  font-size: 1rem;
  color: var(--gold);
  filter: drop-shadow(0 0 4px var(--gold-glow));
}

.loot-title {
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--gold-bright);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.loot-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.loot-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.95rem;
}

.loot-item-icon {
  font-size: 0.95rem;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.loot-item-name {
  flex: 1;
  color: var(--text-primary);
}

.loot-item-qty {
  color: var(--gold);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: 'Inter', system-ui, sans-serif;
}

.loot-item-gold {
  color: var(--gold-bright);
  font-size: 0.75rem;
  font-family: 'Inter', system-ui, sans-serif;
  background: rgba(218, 165, 32, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid rgba(218, 165, 32, 0.2);
  white-space: nowrap;
}

/* Loot panel transition */
.loot-panel-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.loot-panel-leave-active {
  transition: all 0.25s ease-in;
}
.loot-panel-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.97);
}
.loot-panel-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ===== QUEST NOTIFICATION ===== */
.quest-notification {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1.25rem;
  background: rgba(10, 10, 15, 0.95);
  border: 1px solid var(--gold-muted);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(218, 165, 32, 0.15);
  font-family: 'Cinzel', serif;
  font-size: 0.85rem;
}

.quest-notification.quest-completed {
  border-color: var(--hp-high);
  box-shadow: 0 4px 20px rgba(74, 222, 128, 0.2);
}

.quest-icon {
  font-size: 1.1rem;
  color: var(--gold);
}

.quest-completed .quest-icon {
  color: var(--hp-high);
}

.quest-label {
  font-weight: 600;
  color: var(--text-primary);
}

.quest-stage {
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-family: 'Inter', system-ui, sans-serif;
}

.quest-completed .quest-stage {
  color: var(--hp-high);
}

.quest-notification-enter-active {
  transition: all 0.4s ease-out;
}
.quest-notification-leave-active {
  transition: all 0.3s ease-in;
}
.quest-notification-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
.quest-notification-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1440px) {
  .chamber-main {
    grid-template-columns: 1fr 300px;
  }
}

@media (max-width: 1280px) {
  .chamber-main {
    grid-template-columns: 1fr 280px;
    gap: 1rem;
  }
}

@media (max-width: 1024px) {
  .chamber-main {
    grid-template-columns: 1fr;
  }
  .narrative-area {
    max-width: 100%;
  }
  .character-area {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 0.5rem;
    height: auto;
    padding: 0.75rem 1rem;
  }
  .header-right {
    width: 100%;
    justify-content: flex-end;
    flex-wrap: wrap;
  }
  .dungeon-title {
    font-size: 0.9rem;
  }
  .chamber-main {
    padding: 1rem;
  }
  .vignette-overlay {
    display: none;
  }
}
</style>
