<template>
  <GrimoireModal
    :model-value="isVisible"
    @update:model-value="$emit('close')"
    title="Подземелье пройдено!"
    icon="⚔"
    size="lg"
    variant="grimoire"
    :closable="true"
  >
    <!-- Victory narration -->
    <div class="victory-narration">
      <p class="narration-text">{{ victory.narration }}</p>
    </div>

    <!-- Rewards -->
    <div v-if="hasRewards" class="rewards-section">
      <h3 class="rewards-title">Награды</h3>
      <div class="rewards-grid">
        <div v-if="victory.xpReward > 0" class="reward-item">
          <span class="reward-icon">✦</span>
          <span class="reward-label">Опыт:</span>
          <span class="reward-value">+{{ victory.xpReward }} XP</span>
        </div>
        <div v-if="victory.goldReward > 0" class="reward-item">
          <span class="reward-icon">●</span>
          <span class="reward-label">Золото:</span>
          <span class="reward-value">+{{ victory.goldReward }}</span>
        </div>
        <div v-for="item in (victory.itemRewards || [])" :key="item" class="reward-item">
          <span class="reward-icon">◆</span>
          <span class="reward-value">{{ item }}</span>
        </div>
      </div>
    </div>

    <!-- Next dungeon -->
    <template #footer>
      <div class="victory-actions">
        <button
          v-if="victory.nextDungeonTitle && victory.nextDungeonKey"
          class="next-dungeon-btn"
          @click="$emit('next-dungeon', victory.nextDungeonKey!)"
        >
          Следующее подземелье: {{ victory.nextDungeonTitle }}
        </button>
        <button class="close-btn" @click="$emit('close')">
          Закрыть
        </button>
      </div>
    </template>
  </GrimoireModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import GrimoireModal from '@/components/ui/GrimoireModal.vue';
import type { VictoryPayload } from '@/types/game';

interface Props {
  isVisible: boolean;
  victory: VictoryPayload;
}

const props = defineProps<Props>();

defineEmits<{
  close: [];
  'next-dungeon': [key: string];
}>();

const hasRewards = computed(() =>
  props.victory.xpReward > 0 ||
  props.victory.goldReward > 0 ||
  (props.victory.itemRewards && props.victory.itemRewards.length > 0)
);
</script>

<style scoped>
.victory-narration {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-left: 3px solid var(--arcane);
  background: rgba(186, 104, 200, 0.05);
  border-radius: 0 0.5rem 0.5rem 0;
}

.narration-text {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--parchment);
}

.rewards-section {
  margin-top: 1rem;
}

.rewards-title {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  color: var(--arcane-light);
  margin-bottom: 0.75rem;
}

.rewards-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(186, 104, 200, 0.08);
  border-radius: 0.375rem;
  color: var(--parchment);
}

.reward-icon {
  color: var(--arcane-light);
  font-size: 1rem;
}

.reward-label {
  color: var(--parchment-dark);
}

.reward-value {
  font-weight: 600;
  color: var(--arcane-light);
}

.victory-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: flex-end;
}

.next-dungeon-btn {
  padding: 0.75rem 1.5rem;
  background: var(--arcane);
  color: var(--parchment);
  border: 1px solid var(--arcane-light);
  border-radius: 0.5rem;
  font-family: var(--font-heading);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.next-dungeon-btn:hover {
  background: var(--arcane-light);
  box-shadow: 0 0 12px var(--arcane-glow);
}

.close-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--parchment-dark);
  border: 1px solid var(--ink-dark);
  border-radius: 0.5rem;
  font-family: var(--font-heading);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  color: var(--parchment);
  border-color: var(--parchment-dark);
}
</style>
