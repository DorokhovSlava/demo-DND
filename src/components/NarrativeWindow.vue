<template>
  <div
    class="narrative-scroll"
    ref="scrollContainer"
    role="log"
    aria-live="polite"
    aria-label="Adventure Narrative"
    :aria-atomic="false"
  >
    <div class="scroll-content">
      <!-- Scene Description Block (deterministic, from DB) — word-by-word reveal -->
      <div
        v-if="sceneDescription"
        class="scene-block"
        :class="{ 'scene-new': props.narrative?.isNewScene, 'scene-typing': isSceneTyping }"
        role="region"
        aria-label="Location description"
      >
        <div class="scene-header">
          <span class="scene-header-icon" aria-hidden="true">&#9678;</span>
          <span class="scene-header-label">&#1051;&#1086;&#1082;&#1072;&#1094;&#1080;&#1103;</span>
        </div>
        <p class="scene-text">
          <span class="scene-revealed-text">{{ revealedSceneText }}</span><span v-if="isSceneTyping" class="scene-typing-cursor">|</span>
        </p>
      </div>

      <!-- NPC Turn Indicator -->
      <div v-if="props.narrative?.isNpcTurn" class="npc-turn-indicator" role="status">
        <span class="npc-turn-icon" aria-hidden="true">&#9876;</span>
        <span class="npc-turn-text">&#1061;&#1054;&#1044; &#1055;&#1056;&#1054;&#1058;&#1048;&#1042;&#1053;&#1048;&#1050;&#1040;</span>
        <span class="npc-turn-icon" aria-hidden="true">&#9876;</span>
      </div>

      <!-- Action Block (LLM-generated narration) — word-by-word reveal -->
      <div class="narrative-action-block">
        <p class="narrative-text" v-if="revealedText || isTyping">
          <span class="drop-cap-letter" v-if="revealedText.length > 0">{{ revealedText[0] }}</span><span class="revealed-text">{{ revealedText.slice(1) }}</span><span v-if="isTyping" class="typing-cursor">|</span>
        </p>
      </div>
    </div>

    <!-- Player Options (shown only after text fully revealed) -->
    <div v-if="!isTyping && playerOptions.length" class="action-choices" role="group" aria-label="Available actions">
      <div class="choices-divider" aria-hidden="true"></div>
      <p class="choices-label">&#1055;&#1086;&#1076;&#1079;&#1077;&#1084;&#1077;&#1083;&#1100;&#1077; &#1078;&#1076;&#1105;&#1090;. &#1063;&#1090;&#1086; &#1076;&#1072;&#1083;&#1100;&#1096;&#1077;?</p>
      <div class="choices-list">
        <button
          v-for="(option, index) in playerOptions"
          :key="option.id"
          @click="selectOption(option)"
          class="choice-card"
          :class="{ 'choice-focused': focusedOptionId === option.id }"
          :aria-label="`Option ${index + 1}: ${option.text}`"
          @keydown.enter.prevent="selectOption(option)"
          @keydown.arrow-down.prevent="focusNextOption"
          @keydown.arrow-up.prevent="focusPreviousOption"
        >
          <span class="choice-hotkey" aria-hidden="true">{{ index + 1 }}</span>
          <span class="choice-content">
            <span class="choice-icon" aria-hidden="true">{{ getOptionIcon(option) }}</span>
            <span class="choice-text">{{ option.text }}</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import type { NarrativePayload, PlayerOption } from '@/types/game';

const props = defineProps<{
  narrative: NarrativePayload | null;
}>();

const emit = defineEmits<{
  optionSelected: [option: PlayerOption];
}>();

const isTyping = ref(false);
const isSceneTyping = ref(false);
const revealedText = ref('');
const revealedSceneText = ref('');
const focusedOptionId = ref<string | null>(null);
const scrollContainer = ref<HTMLElement | null>(null);
let revealTimer: ReturnType<typeof setTimeout> | null = null;
let sceneRevealTimer: ReturnType<typeof setTimeout> | null = null;

const sceneDescription = computed(() => {
  return props.narrative?.sceneDescription || '';
});

const fullNarration = computed(() => {
  if (!props.narrative?.narration) return '';
  return props.narrative.narration.trim();
});

const playerOptions = computed(() => {
  return props.narrative?.player_options || props.narrative?.playerOptions || [];
});

function getOptionIcon(option: PlayerOption): string {
  const actionType = (option.actionType ?? option.action_type ?? '').toLowerCase();
  if (actionType.includes('attack')) return '\u2694';
  if (actionType.includes('talk')) return '\u{1F4AC}';
  if (actionType.includes('move')) return '\u{1F463}';
  if (actionType.includes('examine') || actionType.includes('investigate')) return '\u{1F50E}';
  if (actionType.includes('cast') || actionType.includes('spell')) return '\u2728';
  if (actionType.includes('use')) return '\u{1F9EA}';
  if (actionType.includes('take')) return '\u{1F392}';
  return '\u2726';
}

function selectOption(option: PlayerOption): void {
  emit('optionSelected', option);
  focusedOptionId.value = null;
}

function focusNextOption(): void {
  const options = playerOptions.value;
  if (options.length === 0) return;
  const currentIndex = options.findIndex(opt => opt.id === focusedOptionId.value);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % options.length;
  focusedOptionId.value = options[nextIndex].id;
}

function focusPreviousOption(): void {
  const options = playerOptions.value;
  if (options.length === 0) return;
  const currentIndex = options.findIndex(opt => opt.id === focusedOptionId.value);
  const prevIndex = currentIndex === -1
    ? options.length - 1
    : (currentIndex - 1 + options.length) % options.length;
  focusedOptionId.value = options[prevIndex].id;
}

// Scene description word-by-word reveal (faster pace — 25ms/word)
function startSceneReveal(text: string, onComplete: () => void): void {
  if (sceneRevealTimer) clearTimeout(sceneRevealTimer);
  revealedSceneText.value = '';
  isSceneTyping.value = true;

  const words = text.split(/(\s+)/);
  let wordIndex = 0;

  function revealNext(): void {
    if (wordIndex >= words.length) {
      isSceneTyping.value = false;
      onComplete();
      return;
    }
    revealedSceneText.value += words[wordIndex];
    wordIndex++;

    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
      }
    });

    const delay = words[wordIndex - 1].trim() === '' ? 0 : 25;
    sceneRevealTimer = setTimeout(revealNext, delay);
  }

  revealNext();
}

// Action narration word-by-word reveal (normal pace — 40ms/word)
function startReveal(text: string): void {
  if (revealTimer) clearTimeout(revealTimer);
  revealedText.value = '';
  isTyping.value = true;

  const words = text.split(/(\s+)/);
  let wordIndex = 0;

  function revealNext(): void {
    if (wordIndex >= words.length) {
      isTyping.value = false;
      if (playerOptions.value.length > 0) {
        focusedOptionId.value = playerOptions.value[0].id;
      }
      return;
    }
    revealedText.value += words[wordIndex];
    wordIndex++;

    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
      }
    });

    const delay = words[wordIndex - 1].trim() === '' ? 0 : 40;
    revealTimer = setTimeout(revealNext, delay);
  }

  revealNext();
}

watch(() => props.narrative, (newNarrative) => {
  if (!newNarrative) return;

  const sceneText = newNarrative.sceneDescription || '';
  const narrationText = (newNarrative.narration || '').trim();

  if (newNarrative.isNewScene && sceneText) {
    // New scene: reveal scene first, then narration
    startSceneReveal(sceneText, () => {
      if (narrationText) startReveal(narrationText);
    });
  } else {
    // Same scene: show scene instantly, reveal narration
    revealedSceneText.value = sceneText;
    isSceneTyping.value = false;
    if (narrationText) startReveal(narrationText);
  }
});

onMounted(() => {
  // Show everything immediately on mount (page load)
  revealedSceneText.value = sceneDescription.value;
  isSceneTyping.value = false;
  if (fullNarration.value) {
    revealedText.value = fullNarration.value;
    isTyping.value = false;
    if (playerOptions.value.length > 0) {
      focusedOptionId.value = playerOptions.value[0].id;
    }
  }
});
</script>

<style scoped>
/* ===== NARRATIVE SCROLL ===== */
.narrative-scroll {
  position: relative;
  padding: 1.75rem 2rem;
  background: var(--bg-base);
  border: 1px solid rgba(218, 165, 32, 0.1);
  border-top: 2px solid var(--gold-muted);
  border-radius: 10px;
  min-height: 300px;
  max-height: 72vh;
  overflow-y: auto;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(218, 165, 32, 0.04);
  animation: narrative-enter 0.5s ease-out;
}

@keyframes narrative-enter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.scroll-content {
  margin-bottom: 1rem;
}

/* ===== SCENE BLOCK ===== */
.scene-block {
  margin-bottom: 1.75rem;
  padding: 1.25rem 1.5rem;
  background: rgba(26, 26, 46, 0.6);
  border: 1px solid rgba(218, 165, 32, 0.12);
  border-left: 3px solid var(--gold-muted);
  border-radius: 6px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-secondary);
}

.scene-block.scene-new {
  border-left-color: var(--gold);
  animation: scene-reveal 0.6s ease-out;
  box-shadow: 0 0 20px rgba(218, 165, 32, 0.08);
}

@keyframes scene-reveal {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

.scene-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.scene-header-icon {
  color: var(--gold);
  font-size: 1rem;
}

.scene-header-label {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
}

.scene-text {
  margin-bottom: 0.35rem;
  white-space: pre-wrap;
}
.scene-text:last-child {
  margin-bottom: 0;
}

.scene-revealed-text {
  white-space: pre-wrap;
}

.scene-typing-cursor {
  display: inline;
  color: var(--gold-muted);
  animation: blink 0.7s step-end infinite;
  font-weight: 300;
}

.scene-block.scene-typing {
  border-left-color: var(--gold);
  box-shadow: 0 0 12px rgba(218, 165, 32, 0.06);
}

/* ===== NPC TURN INDICATOR ===== */
.npc-turn-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(135deg,
    rgba(220, 38, 38, 0.1) 0%,
    rgba(102, 0, 17, 0.15) 100%);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: 6px;
  animation: npc-pulse 2s ease-in-out infinite;
}

@keyframes npc-pulse {
  0%, 100% { box-shadow: 0 0 10px rgba(220, 38, 38, 0.1); }
  50%      { box-shadow: 0 0 20px rgba(220, 38, 38, 0.25); }
}

.npc-turn-text {
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--hp-low);
  text-shadow: 0 0 8px rgba(220, 38, 38, 0.3);
}

.npc-turn-icon {
  font-size: 1.1rem;
  color: var(--hp-low);
  filter: drop-shadow(0 0 4px rgba(220, 38, 38, 0.4));
}

/* ===== NARRATIVE TEXT (word-by-word reveal) ===== */
.narrative-action-block {
  min-height: 2rem;
}

.narrative-text {
  margin-bottom: 1rem;
  color: var(--text-primary);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  line-height: 1.9;
  text-indent: 0;
}

.revealed-text {
  white-space: pre-wrap;
}

.drop-cap-letter {
  float: left;
  font-family: 'Cinzel', serif;
  font-size: 3.4em;
  line-height: 0.78;
  padding-right: 0.1em;
  color: var(--gold);
  text-shadow: 0 0 18px rgba(218, 165, 32, 0.3);
  font-weight: 700;
}

.typing-cursor {
  display: inline;
  color: var(--gold);
  animation: blink 0.7s step-end infinite;
  font-weight: 300;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}

/* ===== PLAYER OPTIONS ===== */
.action-choices {
  padding-top: 0.75rem;
  animation: options-enter 0.4s ease-out;
}

@keyframes options-enter {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.choices-divider {
  height: 1px;
  margin-bottom: 0.75rem;
  background: linear-gradient(90deg, transparent, var(--gold-muted), transparent);
}

.choices-label {
  font-family: 'Cormorant Garamond', serif;
  font-size: 0.95rem;
  font-style: italic;
  color: var(--text-dim);
  margin-bottom: 0.75rem;
}

.choices-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.choice-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-medium);
  border: 1px solid var(--bg-surface);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.choice-card:hover {
  border-color: rgba(218, 165, 32, 0.35);
  background: rgba(218, 165, 32, 0.06);
  transform: translateX(4px);
  box-shadow: 0 2px 12px rgba(218, 165, 32, 0.1);
}

.choice-card.choice-focused {
  border-color: rgba(218, 165, 32, 0.4);
  background: rgba(218, 165, 32, 0.08);
  box-shadow: 0 0 12px rgba(218, 165, 32, 0.12);
}

.choice-hotkey {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 5px;
  background: rgba(218, 165, 32, 0.12);
  border: 1px solid rgba(218, 165, 32, 0.25);
  color: var(--gold);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.choice-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.choice-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.choice-text {
  flex: 1;
  line-height: 1.4;
}

/* ===== SCROLLBAR ===== */
.narrative-scroll::-webkit-scrollbar {
  width: 6px;
}

.narrative-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.narrative-scroll::-webkit-scrollbar-thumb {
  background: var(--bg-surface);
  border-radius: 3px;
}

.narrative-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--gold-muted);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .narrative-scroll {
    padding: 1.25rem;
    max-height: 60vh;
  }

  .narrative-text {
    font-size: 1.05rem;
    line-height: 1.75;
  }

  .drop-cap-letter {
    font-size: 2.8em;
  }
}
</style>
