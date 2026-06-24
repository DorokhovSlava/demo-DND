<template>
  <div class="selection-page">
    <!-- Vignette -->
    <div class="vignette-overlay" aria-hidden="true"></div>

    <div class="selection-container">
      <!-- Header -->
      <div class="selection-header">
        <h1 class="selection-title">AI Dungeon Master</h1>
        <p class="selection-subtitle">Выбери своего персонажа или создай нового героя</p>
        <div class="gold-divider"></div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Загрузка...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-banner">
        <span class="error-icon">&#9888;</span>
        <span class="error-text">{{ error }}</span>
      </div>

      <!-- Character List -->
      <div v-else class="characters-section">
        <!-- No characters -->
        <div v-if="characters.length === 0" class="empty-state">
          <div class="empty-icon">&#9876;</div>
          <p class="empty-text">У тебя ещё нет персонажей</p>
          <button @click="createCharacter" class="btn-create-first">
            Создать первого персонажа
          </button>
        </div>

        <!-- Character cards -->
        <div v-else class="characters-grid">
          <div
            v-for="character in characters"
            :key="character.playerId"
            class="character-card"
          >
            <div class="card-body">
              <h3 class="char-name">{{ character.name }}</h3>
              <div class="char-tags">
                <span class="char-tag">{{ getRaceName(character.race) }}</span>
                <span class="char-tag">{{ getClassName(character.characterClass) }}</span>
                <span class="char-tag char-tag-level">Ур. {{ character.level }}</span>
              </div>
              <div class="char-meta">
                <span class="char-zone">{{ getZoneName(character.zone) }}</span>
                <span class="char-date">{{ formatDate(character.createdAt) }}</span>
              </div>
            </div>
            <div class="card-actions">
              <button
                @click="selectCharacter(character.playerId)"
                class="btn-play"
              >
                Играть
              </button>
              <button
                @click="deleteCharacter(character.playerId)"
                class="btn-delete"
                :disabled="isDeleting === character.playerId"
              >
                {{ isDeleting === character.playerId ? '...' : 'Удалить' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Create new button -->
        <button
          v-if="characters.length > 0"
          @click="createCharacter"
          class="btn-create-new"
        >
          + Создать нового персонажа
        </button>
      </div>

      <!-- Logout -->
      <button @click="logout" class="btn-logout">
        Выйти
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { apiService, type CharacterSummary } from '@/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
import { useGameStore } from '@/stores/game.store';

const router = useRouter();
const authStore = useAuthStore();
const gameStore = useGameStore();

const isLoading = ref(true);
const error = ref('');
const characters = ref<CharacterSummary[]>([]);
const isDeleting = ref<string | null>(null);

onMounted(async () => {
  await loadCharacters();
});

async function loadCharacters(): Promise<void> {
  isLoading.value = true;
  error.value = '';

  try {
    characters.value = await apiService.getCharacters();
  } catch (err: any) {
    console.error('Failed to load characters', err);
    error.value = err.response?.data?.message || 'Ошибка при загрузке персонажей. Попробуй позже.';
  } finally {
    isLoading.value = false;
  }
}

async function selectCharacter(playerId: string): Promise<void> {
  try {
    gameStore.selectedPlayerId = playerId;
    await apiService.selectCharacter(playerId);
    router.push({ name: 'Game' });
  } catch (err: any) {
    console.error('Failed to select character', err);
    error.value = 'Ошибка при выборе персонажа. Попробуй снова.';
  }
}

async function deleteCharacter(playerId: string): Promise<void> {
  if (!confirm('Ты уверен, что хочешь удалить этого персонажа? Это действие нельзя отменить.')) {
    return;
  }

  isDeleting.value = playerId;
  error.value = '';

  try {
    await apiService.deleteCharacter(playerId);
    await loadCharacters();
  } catch (err: any) {
    console.error('Failed to delete character', err);
    error.value = err.response?.data?.message || 'Ошибка при удалении персонажа. Попробуй снова.';
  } finally {
    isDeleting.value = null;
  }
}

function createCharacter(): void {
  router.push({ name: 'CharacterCreation' });
}

function logout(): void {
  authStore.logout();
  router.push({ name: 'Login' });
}

function getRaceName(race: string): string {
  const raceNames: Record<string, string> = {
    'HUMAN': 'Человек',
    'DWARF': 'Дварф',
    'ELF': 'Эльф',
    'HALFLING': 'Полурослик',
    'ORC': 'Орк',
    'TIEFLING': 'Тифлинг',
  };
  return raceNames[race] || race;
}

function getClassName(clazz: string): string {
  const classNames: Record<string, string> = {
    'FIGHTER': 'Воин',
    'BARBARIAN': 'Варвар',
    'WIZARD': 'Маг',
    'CLERIC': 'Жрец',
    'ROGUE': 'Плут',
    'RANGER': 'Следопыт',
  };
  return classNames[clazz] || clazz;
}

function getZoneName(zone: string): string {
  const zoneNames: Record<string, string> = {
    'DWARVEN_MINES': 'Дварфийские Шахты',
    'ANCIENT_CRYPT': 'Древняя Крипта',
    'DARK_TEMPLE': 'Тёмный Храм',
    'FORGOTTEN_RUINS': 'Забытые Руины',
    'UNDERGROUND_CITY': 'Подземный Город',
  };
  return zoneNames[zone] || zone || 'Неизвестно';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<style scoped>
.selection-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
  background:
    radial-gradient(ellipse 600px 300px at 50% 10%, rgba(218, 165, 32, 0.06), transparent),
    linear-gradient(180deg, var(--bg-abyss) 0%, var(--bg-base) 50%, var(--bg-medium) 100%);
}

.vignette-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
  z-index: 1;
}

.selection-container {
  position: relative;
  z-index: 2;
  max-width: 680px;
  width: 100%;
  padding: 2.5rem;
  background: var(--bg-base);
  border: 1px solid rgba(218, 165, 32, 0.12);
  border-top: 2px solid var(--gold-muted);
  border-radius: 10px;
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(218, 165, 32, 0.05);
  animation: cardEnter 0.5s ease-out;
}

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(15px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Header */
.selection-header {
  text-align: center;
  margin-bottom: 2rem;
}

.selection-title {
  font-family: 'Cinzel', serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 0.06em;
  text-shadow: 0 0 20px rgba(218, 165, 32, 0.2);
  margin: 0 0 0.5rem 0;
}

.selection-subtitle {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0 0 1.25rem 0;
}

.gold-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-muted), var(--gold), var(--gold-muted), transparent);
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 3rem 0;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid var(--bg-surface);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-text {
  color: var(--text-secondary);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem;
}

/* Error */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 8px;
  color: #f87171;
  font-family: 'Cormorant Garamond', serif;
}

.error-icon { font-size: 1.3rem; }

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 0;
}

.empty-icon {
  font-size: 3rem;
  color: var(--gold-muted);
  margin-bottom: 1rem;
}

.empty-text {
  color: var(--text-secondary);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

/* Character grid */
.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.character-card {
  background: var(--bg-medium);
  border: 1px solid var(--bg-surface);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.25s ease;
}

.character-card:hover {
  border-color: rgba(218, 165, 32, 0.25);
  box-shadow: 0 4px 20px rgba(218, 165, 32, 0.08);
  transform: translateY(-2px);
}

.card-body {
  padding: 1.25rem;
}

.char-name {
  font-family: 'Cinzel', serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.6rem 0;
}

.char-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
}

.char-tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: var(--bg-abyss);
  border-radius: 4px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}

.char-tag-level {
  color: var(--gold);
  background: rgba(218, 165, 32, 0.1);
}

.char-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.7rem;
  color: var(--text-dim);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(0, 0, 0, 0.15);
  border-top: 1px solid rgba(218, 165, 32, 0.05);
}

/* Buttons */
.btn-play {
  flex: 1;
  padding: 0.6rem;
  background: linear-gradient(135deg, var(--gold-dark), var(--gold));
  border: none;
  border-radius: 6px;
  color: var(--bg-abyss);
  font-family: 'Cinzel', serif;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(218, 165, 32, 0.3);
}

.btn-play:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(218, 165, 32, 0.4);
  filter: brightness(1.1);
}

.btn-delete {
  padding: 0.6rem 1rem;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 6px;
  color: #f87171;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.2);
  border-color: rgba(220, 38, 38, 0.4);
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-create-first {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, var(--gold-dark), var(--gold));
  border: none;
  border-radius: 8px;
  color: var(--bg-abyss);
  font-family: 'Cinzel', serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(218, 165, 32, 0.3);
}

.btn-create-first:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 24px rgba(218, 165, 32, 0.45);
}

.btn-create-new {
  width: 100%;
  padding: 0.85rem;
  background: var(--bg-medium);
  border: 1px dashed var(--bg-surface);
  border-radius: 8px;
  color: var(--text-secondary);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-create-new:hover {
  border-color: rgba(218, 165, 32, 0.3);
  color: var(--gold);
  background: rgba(218, 165, 32, 0.05);
}

.btn-logout {
  display: block;
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.5rem;
  background: none;
  border: none;
  color: var(--text-dim);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.8rem;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-logout:hover {
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 640px) {
  .selection-container {
    padding: 1.5rem;
  }

  .selection-title {
    font-size: 1.8rem;
  }

  .characters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
