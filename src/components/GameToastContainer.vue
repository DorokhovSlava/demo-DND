<template>
  <Teleport to="body">
    <div class="toast-stack" role="region" aria-label="Игровые уведомления" aria-live="polite">
      <TransitionGroup name="toast" tag="div" class="toast-inner">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="game-toast"
          :class="`toast-${toast.type}`"
          role="alert"
          :aria-label="toast.title"
          @click="dismiss(toast.id)"
        >
          <!-- Icon -->
          <span class="toast-icon" aria-hidden="true">{{ toast.icon }}</span>

          <!-- Content -->
          <div class="toast-body">
            <div class="toast-title">{{ toast.title }}</div>
            <div
              v-for="(line, i) in toast.lines"
              :key="i"
              class="toast-line"
            >{{ line }}</div>
          </div>

          <!-- Dismiss button -->
          <button
            class="toast-dismiss"
            @click.stop="dismiss(toast.id)"
            :aria-label="`Закрыть уведомление: ${toast.title}`"
          >
            ✕
          </button>

          <!-- Progress bar (shrinks over 4s) -->
          <div class="toast-progress"></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useGameToasts } from '@/composables/useGameToasts';

const { toasts, dismiss } = useGameToasts();
</script>

<style scoped>
/* Stack container — fixed top-right */
.toast-stack {
  position: fixed;
  top: 88px;
  right: 16px;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  width: 320px;
  max-width: calc(100vw - 32px);
}

.toast-inner {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

/* Individual toast */
.game-toast {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 36px 12px 14px;
  border: 1px solid rgba(232, 212, 184, 0.2);
  border-radius: 8px;
  background: rgba(15, 10, 26, 0.96);
  backdrop-filter: blur(8px);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  overflow: hidden;
  cursor: pointer;
  pointer-events: all;
  font-family: 'Crimson Text', 'Georgia', serif;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.game-toast:hover {
  transform: translateX(-2px);
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* Loot — gold theme */
.toast-loot {
  border-color: rgba(201, 162, 39, 0.5);
  box-shadow:
    0 4px 20px rgba(201, 162, 39, 0.2),
    inset 0 1px 0 rgba(201, 162, 39, 0.1);
}

.toast-loot .toast-progress {
  background: linear-gradient(90deg, #c9a227, #f0c040);
}

.toast-loot .toast-title {
  color: #f0c040;
}

/* Quest — purple theme */
.toast-quest {
  border-color: rgba(150, 100, 210, 0.5);
  box-shadow:
    0 4px 20px rgba(150, 100, 210, 0.2),
    inset 0 1px 0 rgba(150, 100, 210, 0.1);
}

.toast-quest .toast-progress {
  background: linear-gradient(90deg, #7b4fc9, #a06aef);
}

.toast-quest .toast-title {
  color: #c39aff;
}

/* NPC flee — yellow theme */
.toast-flee {
  border-color: rgba(255, 200, 0, 0.4);
  box-shadow:
    0 4px 20px rgba(255, 200, 0, 0.15),
    inset 0 1px 0 rgba(255, 200, 0, 0.08);
}

.toast-flee .toast-progress {
  background: linear-gradient(90deg, #e0a000, #ffd040);
}

.toast-flee .toast-title {
  color: #ffd040;
}

/* Item pickup — green theme */
.toast-pickup {
  border-color: rgba(80, 180, 80, 0.4);
  box-shadow:
    0 4px 20px rgba(80, 180, 80, 0.15),
    inset 0 1px 0 rgba(80, 180, 80, 0.08);
}

.toast-pickup .toast-progress {
  background: linear-gradient(90deg, #2a8a2a, #4acc4a);
}

.toast-pickup .toast-title {
  color: #6aee6a;
}

/* Info — neutral theme */
.toast-info {
  border-color: rgba(100, 160, 220, 0.4);
}

.toast-info .toast-progress {
  background: linear-gradient(90deg, #4488cc, #66aaee);
}

.toast-info .toast-title {
  color: #88ccff;
}

/* Icon */
.toast-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 1px;
  line-height: 1;
}

/* Body */
.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 0.9rem;
  font-weight: 700;
  font-family: 'Cinzel', 'Georgia', serif;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  line-height: 1.2;
}

.toast-line {
  font-size: 0.85rem;
  color: #c8b89a;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Dismiss button */
.toast-dismiss {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: rgba(200, 184, 154, 0.5);
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: color 0.15s ease, background 0.15s ease;
  padding: 0;
  line-height: 1;
}

.toast-dismiss:hover {
  color: #e8d4b8;
  background: rgba(255, 255, 255, 0.08);
}

.toast-dismiss:focus-visible {
  outline: 2px solid #c9a227;
  outline-offset: 1px;
}

/* Progress bar at the bottom — shrinks in 4s */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  border-radius: 0 0 8px 8px;
  animation: toast-drain 4s linear forwards;
}

@keyframes toast-drain {
  from { width: 100%; }
  to   { width: 0%; }
}

/* TransitionGroup animations */
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.55, 0, 1, 0.45);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(80px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.85);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .toast-stack {
    top: auto;
    bottom: 80px;
    right: 8px;
    left: 8px;
    width: auto;
    max-width: 100%;
  }
}
</style>
