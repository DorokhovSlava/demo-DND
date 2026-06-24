<template>
  <Teleport to="body">
    <Transition name="dice-modal">
      <div v-if="isVisible" class="dice-overlay" @click.self="handleBackdropClick">
        <div class="dice-card" :class="cardClass">

          <!-- Header -->
          <div class="dice-header">
            <div class="dice-header-top">
              <span class="roll-type-badge">{{ rollTypeBadge }}</span>
            </div>
            <h3 class="dice-title" v-html="title"></h3>
            <div v-if="actionDescription || description" class="dice-subtitle">
              {{ actionDescription || description }}
            </div>
            <div v-if="targetName" class="target-badge">
              <span class="target-icon">&#127919;</span>
              <span>{{ targetName }}</span>
            </div>
          </div>

          <!-- Dice Stage -->
          <div class="dice-stage">
            <!-- Die Circle -->
            <div
              class="die-circle"
              :class="{
                'die-rolling': isRolling,
                'die-landed': hasRolled && !isRolling,
                'die-critical': isCritical && hasRolled,
                'die-fumble': isFumble && hasRolled
              }"
              @click="!hasRolled && !isRolling ? rollDice() : null"
            >
              <span class="die-number" :class="{ 'number-cycling': isRolling }">
                {{ displayNumber }}
              </span>
              <!-- d20 label inside the die -->
              <span v-if="!hasRolled && !isRolling" class="die-label">d20</span>
            </div>

            <!-- Modifier Badge (always visible if non-zero) -->
            <div v-if="(modifier ?? 0) !== 0" class="mod-badge" :class="{ 'mod-positive': (modifier ?? 0) > 0 }">
              {{ (modifier ?? 0) > 0 ? '+' : '' }}{{ modifier ?? 0 }}
            </div>

            <!-- Click hint (before roll) -->
            <div v-if="!hasRolled && !isRolling" class="click-hint">
              &#1053;&#1072;&#1078;&#1084;&#1080;&#1090;&#1077; &#1085;&#1072; &#1082;&#1091;&#1073;&#1080;&#1082;
            </div>
          </div>

          <!-- Result Section (after roll) -->
          <Transition name="result-reveal">
            <div v-if="hasRolled && !isRolling" class="result-section">
              <!-- Critical / Fumble banner -->
              <div v-if="isCritical" class="banner banner-critical">
                &#9889; &#1050;&#1056;&#1048;&#1058;&#1048;&#1063;&#1045;&#1057;&#1050;&#1048;&#1049; &#1059;&#1057;&#1055;&#1045;&#1061;! &#9889;
              </div>
              <div v-if="isFumble" class="banner banner-fumble">
                &#128128; &#1050;&#1056;&#1048;&#1058;&#1048;&#1063;&#1045;&#1057;&#1050;&#1048;&#1049; &#1055;&#1056;&#1054;&#1042;&#1040;&#1051; &#128128;
              </div>

              <!-- Calculation -->
              <div class="calc-block">
                <div class="calc-row">
                  <span class="calc-label">d20:</span>
                  <span class="calc-value" :class="{ 'nat-20': rollResult === 20, 'nat-1': rollResult === 1 }">{{ rollResult }}</span>
                </div>
                <div v-if="(modifier ?? 0) !== 0" class="calc-row calc-modifier">
                  <span class="calc-label">&#1052;&#1086;&#1076;&#1080;&#1092;&#1080;&#1082;&#1072;&#1090;&#1086;&#1088;:</span>
                  <span class="calc-value">{{ (modifier ?? 0) > 0 ? '+' : '' }}{{ modifier ?? 0 }}</span>
                </div>
                <div class="calc-divider"></div>
                <div class="calc-row calc-total">
                  <span class="calc-label">&#1048;&#1058;&#1054;&#1043;&#1054;:</span>
                  <span class="calc-value total-value" :class="resultClass">{{ totalResult }}</span>
                </div>
              </div>

              <!-- DC Check -->
              <div v-if="targetDc" class="dc-section">
                <span class="dc-label">DC {{ targetDc }}</span>
                <span class="dc-result" :class="totalResult >= targetDc ? 'dc-success' : 'dc-failure'">
                  {{ totalResult >= targetDc ? '&#10003; &#1059;&#1057;&#1055;&#1045;&#1061;' : '&#10007; &#1055;&#1056;&#1054;&#1042;&#1040;&#1051;' }}
                </span>
              </div>
            </div>
          </Transition>

          <!-- Action Button -->
          <div class="dice-actions">
            <button
              v-if="!hasRolled"
              class="roll-btn"
              :class="{ 'roll-btn-pulse': !isRolling }"
              :disabled="isRolling"
              @click="rollDice"
            >
              &#127922; {{ isRolling ? '&#1041;&#1056;&#1054;&#1057;&#1054;&#1050;...' : '&#1041;&#1056;&#1054;&#1057;&#1048;&#1058;&#1068; D20' }}
            </button>
            <button
              v-else
              class="confirm-btn"
              :disabled="isWaitingForServer"
              @click="confirmRoll"
            >
              <span v-if="isWaitingForServer" class="spinner-inline"></span>
              {{ isWaitingForServer ? '&#1054;&#1046;&#1048;&#1044;&#1040;&#1053;&#1048;&#1045;...' : '&#10003; &#1055;&#1056;&#1054;&#1044;&#1054;&#1051;&#1046;&#1048;&#1058;&#1068;' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  isVisible: boolean;
  diceType: string;
  diceCount?: number;
  modifier?: number;
  description: string;
  actionDescription?: string;
  targetDc?: number;
  targetName?: string;
  rollType: string;
  requestId: string;
}>();

const emit = defineEmits<{
  (e: 'rolled', result: { requestId: string; roll: number; total: number }): void;
  (e: 'close'): void;
}>();

const isRolling = ref(false);
const hasRolled = ref(false);
const rollResult = ref(0);
const displayNumber = ref(20);
const isWaitingForServer = ref(false);
let cycleTimer: ReturnType<typeof setTimeout> | null = null;

const title = computed(() => {
  const titles: Record<string, string> = {
    'ATTACK': '\u2694\uFE0F \u0411\u0440\u043E\u0441\u043E\u043A \u0430\u0442\u0430\u043A\u0438',
    'DAMAGE': '\u{1F4A5} \u0411\u0440\u043E\u0441\u043E\u043A \u0443\u0440\u043E\u043D\u0430',
    'SAVE': '\u{1F6E1}\uFE0F \u0421\u043F\u0430\u0441\u0431\u0440\u043E\u0441\u043E\u043A',
    'SAVE_THROW': '\u{1F6E1}\uFE0F \u0421\u043F\u0430\u0441\u0431\u0440\u043E\u0441\u043E\u043A',
    'SKILL': '\u{1F3AF} \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0430\u0432\u044B\u043A\u0430',
    'SKILL_CHECK': '\u{1F3AF} \u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u043D\u0430\u0432\u044B\u043A\u0430',
  };
  return titles[props.rollType] || '\u{1F3B2} \u0411\u0440\u043E\u0441\u043E\u043A \u043A\u0443\u0431\u0438\u043A\u0430';
});

const rollTypeBadge = computed(() => {
  const types: Record<string, string> = {
    'ATTACK': '\u0410\u0422\u0410\u041A\u0410', 'DAMAGE': '\u0423\u0420\u041E\u041D',
    'SAVE': '\u0421\u041F\u0410\u0421\u0411\u0420\u041E\u0421\u041E\u041A', 'SAVE_THROW': '\u0421\u041F\u0410\u0421\u0411\u0420\u041E\u0421\u041E\u041A',
    'SKILL': '\u041D\u0410\u0412\u042B\u041A', 'SKILL_CHECK': '\u041D\u0410\u0412\u042B\u041A',
  };
  return types[props.rollType] || 'D20';
});

const isCritical = computed(() => rollResult.value === 20);
const isFumble = computed(() => rollResult.value === 1);
const totalResult = computed(() => rollResult.value + (props.modifier ?? 0));

const resultClass = computed(() => {
  if (isCritical.value) return 'critical';
  if (isFumble.value) return 'fumble';
  if (props.targetDc && totalResult.value >= props.targetDc) return 'success';
  if (props.targetDc && totalResult.value < props.targetDc) return 'failure';
  return '';
});

const cardClass = computed(() => {
  if (!hasRolled.value || isRolling.value) return '';
  if (isCritical.value) return 'card-critical';
  if (isFumble.value) return 'card-fumble';
  return '';
});

// Number cycling animation (slot-machine effect)
function rollDice(): void {
  if (isRolling.value || hasRolled.value) return;
  isRolling.value = true;

  // Generate the actual result
  const actualResult = Math.floor(Math.random() * 20) + 1;

  // Slot-machine cycling: fast at start, decelerating
  const duration = 1200;
  const startTime = performance.now();

  function cycle(): void {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic for deceleration
    const eased = 1 - Math.pow(1 - progress, 3);

    if (progress < 1) {
      displayNumber.value = Math.floor(Math.random() * 20) + 1;
      const delay = 30 + eased * 200; // 30ms → 230ms
      cycleTimer = setTimeout(cycle, delay);
    } else {
      // Land on actual result
      displayNumber.value = actualResult;
      rollResult.value = actualResult;
      isRolling.value = false;
      hasRolled.value = true;
    }
  }

  cycle();
}

function confirmRoll(): void {
  if (isWaitingForServer.value) return;
  isWaitingForServer.value = true;

  emit('rolled', {
    requestId: props.requestId,
    roll: rollResult.value,
    total: totalResult.value,
  });
}

function handleBackdropClick(): void {
  if (!isRolling.value && !isWaitingForServer.value) {
    if (!hasRolled.value) {
      emit('close');
    }
  }
}

// Lock body scroll + reset on visibility change
watch(() => props.isVisible, (visible) => {
  document.body.style.overflow = visible ? 'hidden' : '';
  if (visible) {
    isRolling.value = false;
    hasRolled.value = false;
    rollResult.value = 0;
    displayNumber.value = 20;
    isWaitingForServer.value = false;
  } else {
    if (cycleTimer) clearTimeout(cycleTimer);
  }
});
</script>

<style scoped>
/* ===== OVERLAY ===== */
.dice-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 12, 18, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

/* ===== CARD ===== */
.dice-card {
  background: linear-gradient(180deg, var(--bg-medium) 0%, var(--bg-base) 100%);
  border: 1px solid var(--gold-muted);
  border-radius: 16px;
  padding: 1.75rem 2rem;
  width: 380px;
  max-width: 90vw;
  box-shadow:
    0 0 60px rgba(0, 0, 0, 0.6),
    0 0 2px rgba(218, 165, 32, 0.2),
    inset 0 1px 0 rgba(218, 165, 32, 0.06);
  animation: cardEnter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-critical {
  border-color: var(--gold);
  box-shadow:
    0 0 60px rgba(0, 0, 0, 0.6),
    0 0 30px rgba(218, 165, 32, 0.25);
}

.card-fumble {
  border-color: var(--combat-red);
  box-shadow:
    0 0 60px rgba(0, 0, 0, 0.6),
    0 0 30px rgba(220, 38, 38, 0.2);
}

@keyframes cardEnter {
  0% { opacity: 0; transform: translateY(30px) scale(0.92); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* ===== HEADER ===== */
.dice-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.dice-header-top {
  margin-bottom: 0.5rem;
}

.roll-type-badge {
  display: inline-block;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--gold);
  background: rgba(218, 165, 32, 0.1);
  border: 1px solid rgba(218, 165, 32, 0.2);
  padding: 0.2rem 0.75rem;
  border-radius: 4px;
}

.dice-title {
  font-family: 'Cinzel', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
}

.dice-subtitle {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
  font-style: italic;
  color: var(--text-secondary);
}

.target-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.5rem;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.8rem;
  color: var(--combat-red);
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
}

.target-icon { font-size: 0.9rem; }

/* ===== DICE STAGE ===== */
.dice-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 0;
  position: relative;
}

/* Die Circle */
.die-circle {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, var(--bg-overlay), var(--bg-medium) 50%, var(--bg-deep));
  border: 2px solid var(--gold-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.5),
    inset 0 2px 8px rgba(218, 165, 32, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.3s ease;
}

.die-circle:hover:not(.die-rolling):not(.die-landed) {
  transform: scale(1.05);
  border-color: var(--gold);
  box-shadow: 0 0 30px rgba(218, 165, 32, 0.2), 0 4px 24px rgba(0, 0, 0, 0.5);
}

/* Rolling shake */
.die-rolling {
  animation: diceShake 0.08s linear infinite;
  border-color: var(--gold);
  box-shadow: 0 0 30px rgba(218, 165, 32, 0.3);
  cursor: default;
}

@keyframes diceShake {
  0%  { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(-3px, 1px) rotate(-2deg); }
  50% { transform: translate(2px, -2px) rotate(1.5deg); }
  75% { transform: translate(-1px, 3px) rotate(-1deg); }
  100%{ transform: translate(3px, -1px) rotate(0.5deg); }
}

/* Landed */
.die-landed {
  cursor: default;
  animation: diceLand 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes diceLand {
  0% { transform: scale(1.3) rotate(5deg); }
  40% { transform: scale(0.95); }
  70% { transform: scale(1.05); }
  100% { transform: scale(1) rotate(0deg); }
}

/* Critical glow */
.die-critical {
  border-color: var(--gold-bright);
  box-shadow:
    0 0 20px rgba(218, 165, 32, 0.5),
    0 0 60px rgba(218, 165, 32, 0.25);
  animation: diceLand 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), critGlow 2s ease-in-out 0.5s infinite;
}

@keyframes critGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(218, 165, 32, 0.5), 0 0 60px rgba(218, 165, 32, 0.2); }
  50%      { box-shadow: 0 0 35px rgba(218, 165, 32, 0.7), 0 0 80px rgba(218, 165, 32, 0.35); }
}

/* Fumble glow */
.die-fumble {
  border-color: var(--combat-red);
  box-shadow: 0 0 20px rgba(220, 38, 38, 0.4), 0 0 50px rgba(220, 38, 38, 0.15);
}

/* Die Number */
.die-number {
  font-family: 'Cinzel', serif;
  font-size: 3rem;
  font-weight: 700;
  color: var(--gold-bright);
  text-shadow: 0 0 15px rgba(218, 165, 32, 0.4);
  user-select: none;
  line-height: 1;
}

.die-landed .die-number {
  animation: numberReveal 0.4s ease-out;
}

.die-critical .die-number {
  color: #fff;
  text-shadow: 0 0 10px #fff, 0 0 25px var(--gold-bright), 0 0 50px var(--gold);
}

.die-fumble .die-number {
  color: var(--combat-red);
  text-shadow: 0 0 10px rgba(220, 38, 38, 0.6), 0 0 30px rgba(220, 38, 38, 0.3);
}

@keyframes numberReveal {
  0% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.die-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  text-transform: uppercase;
  margin-top: 0.15rem;
}

/* Modifier Badge */
.mod-badge {
  position: absolute;
  top: 0.5rem;
  right: calc(50% - 100px);
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  background: var(--bg-surface);
  border: 1px solid var(--bg-overlay);
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.mod-positive {
  color: var(--gold);
  border-color: rgba(218, 165, 32, 0.3);
}

.click-hint {
  margin-top: 0.75rem;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.7rem;
  color: var(--text-dim);
  letter-spacing: 0.05em;
  animation: hintPulse 2s ease-in-out infinite;
}

@keyframes hintPulse {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 1; }
}

/* ===== RESULT SECTION ===== */
.result-section {
  text-align: center;
  margin-bottom: 1rem;
}

.banner {
  font-family: 'Cinzel', serif;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  animation: bannerSlide 0.4s ease-out;
}

.banner-critical {
  color: var(--gold-bright);
  background: rgba(218, 165, 32, 0.12);
  border: 1px solid rgba(218, 165, 32, 0.3);
  text-shadow: 0 0 10px rgba(218, 165, 32, 0.4);
}

.banner-fumble {
  color: var(--combat-red);
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.25);
  text-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
}

@keyframes bannerSlide {
  from { opacity: 0; transform: translateY(-10px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Calculation */
.calc-block {
  margin: 0 auto;
  max-width: 220px;
}

.calc-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0;
}

.calc-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.calc-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.nat-20 { color: var(--gold-bright); text-shadow: 0 0 8px rgba(218, 165, 32, 0.4); }
.nat-1 { color: var(--combat-red); }

.calc-modifier {
  opacity: 0;
  animation: calcReveal 0.3s ease-out 0.3s forwards;
}

.calc-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-muted), transparent);
  margin: 0.35rem 0;
  opacity: 0;
  animation: calcReveal 0.3s ease-out 0.5s forwards;
}

.calc-total {
  opacity: 0;
  animation: calcReveal 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.7s forwards;
}

@keyframes calcReveal {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.total-value {
  font-size: 1.4rem;
  font-weight: 700;
}

.total-value.critical { color: var(--gold-bright); text-shadow: 0 0 12px rgba(218, 165, 32, 0.5); }
.total-value.fumble   { color: var(--combat-red); }
.total-value.success  { color: #4ade80; }
.total-value.failure  { color: var(--combat-red); }

/* DC Section */
.dc-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  opacity: 0;
  animation: calcReveal 0.4s ease-out 1s forwards;
}

.dc-label {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.8rem;
  color: var(--text-dim);
}

.dc-result {
  font-family: 'Cinzel', serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
}

.dc-success {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.25);
}

.dc-failure {
  color: var(--combat-red);
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.25);
}

/* ===== BUTTONS ===== */
.dice-actions {
  margin-top: 0.5rem;
}

.roll-btn, .confirm-btn {
  width: 100%;
  padding: 0.9rem 1.5rem;
  border-radius: 10px;
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.roll-btn {
  background: linear-gradient(135deg, var(--gold-dark), var(--gold-muted));
  border: 1px solid var(--gold-muted);
  color: var(--gold-bright);
}

.roll-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--gold-muted), var(--gold));
  color: var(--bg-abyss);
  box-shadow: 0 0 25px rgba(218, 165, 32, 0.3);
  transform: translateY(-1px);
}

.roll-btn-pulse {
  animation: btnPulse 2s ease-in-out infinite;
}

@keyframes btnPulse {
  0%, 100% { box-shadow: 0 0 0 rgba(218, 165, 32, 0); }
  50%      { box-shadow: 0 0 20px rgba(218, 165, 32, 0.2); }
}

.roll-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirm-btn {
  background: var(--bg-surface);
  border: 1px solid var(--bg-overlay);
  color: var(--text-primary);
}

.confirm-btn:hover:not(:disabled) {
  border-color: rgba(218, 165, 32, 0.3);
  background: var(--bg-overlay);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner-inline {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid var(--bg-overlay);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ===== TRANSITIONS ===== */
.dice-modal-enter-active { transition: all 0.3s ease-out; }
.dice-modal-leave-active { transition: all 0.2s ease-in; }
.dice-modal-enter-from { opacity: 0; }
.dice-modal-leave-to   { opacity: 0; }
.dice-modal-enter-from .dice-card { transform: translateY(30px) scale(0.92); opacity: 0; }
.dice-modal-leave-to .dice-card   { transform: translateY(-10px) scale(0.97); opacity: 0; }

.result-reveal-enter-active { transition: all 0.4s ease-out; }
.result-reveal-enter-from { opacity: 0; transform: translateY(12px); }
</style>
