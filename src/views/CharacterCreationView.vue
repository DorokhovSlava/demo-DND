<template>
  <div class="creation-page">
    <!-- Vignette -->
    <div class="vignette-overlay" aria-hidden="true"></div>

    <div class="creation-container">
      <!-- Header -->
      <div class="creation-header">
        <h1 class="creation-title">Вход в Подземелье</h1>
        <p class="creation-subtitle">Создай своего героя и выбери подземелье для исследования</p>
        <div class="gold-divider"></div>
      </div>

      <form @submit.prevent="createCharacter" class="creation-form">
        <!-- Character Name -->
        <div class="form-group">
          <label for="characterName" class="form-label">Имя героя</label>
          <input
            id="characterName"
            v-model="form.characterName"
            type="text"
            placeholder="Введи имя своего персонажа"
            required
            :disabled="isCreating"
            class="form-input"
          />
        </div>

        <!-- Race -->
        <div class="form-group">
          <label for="race" class="form-label">Раса</label>
          <select id="race" v-model="form.race" required :disabled="isCreating" class="form-select">
            <option value="" disabled>Выбери расу</option>
            <option value="HUMAN">Человек (+1 Сила, +1 Ловкость)</option>
            <option value="DWARF">Дварф (+2 Телосложение, +1 Сила)</option>
            <option value="ELF">Эльф (+2 Ловкость, +1 Интеллект)</option>
            <option value="HALFLING">Полурослик (+2 Ловкость, +1 Харизма)</option>
            <option value="ORC">Орк (+2 Сила, +1 Телосложение)</option>
            <option value="TIEFLING">Тифлинг (+2 Харизма, +1 Интеллект)</option>
          </select>
        </div>

        <!-- Class -->
        <div class="form-group">
          <label for="characterClass" class="form-label">Класс</label>
          <select id="characterClass" v-model="form.characterClass" required :disabled="isCreating" class="form-select">
            <option value="" disabled>Выбери класс</option>
            <option value="FIGHTER">Воин (30 HP, ближний бой)</option>
            <option value="BARBARIAN">Варвар (35 HP, большой урон)</option>
            <option value="WIZARD">Маг (15 HP, 25 Маны, заклинания)</option>
            <option value="CLERIC">Жрец (22 HP, 20 Маны, лечение)</option>
            <option value="ROGUE">Плут (20 HP, скрытность, крит)</option>
            <option value="RANGER">Следопыт (25 HP, дальний бой)</option>
          </select>
        </div>

        <!-- Dungeon Theme -->
        <div class="form-group">
          <label for="dungeonTheme" class="form-label">Тип подземелья</label>
          <select id="dungeonTheme" v-model="form.dungeonTheme" required :disabled="isCreating" class="form-select">
            <option value="" disabled>Выбери тему подземелья</option>
            <option value="DWARVEN_MINES">Дварфийские Шахты</option>
            <option value="ANCIENT_CRYPT">Древняя Крипта</option>
            <option value="DARK_TEMPLE">Тёмный Храм</option>
            <option value="FORGOTTEN_RUINS">Забытые Руины</option>
            <option value="UNDERGROUND_CITY">Подземный Город</option>
          </select>
        </div>

        <!-- Difficulty -->
        <div class="form-group">
          <label for="difficulty" class="form-label">Сложность</label>
          <select id="difficulty" v-model="form.difficulty" required :disabled="isCreating" class="form-select">
            <option value="" disabled>Выбери сложность</option>
            <option value="EASY">Лёгкая (2 уровня, меньше врагов)</option>
            <option value="NORMAL">Нормальная (3 уровня)</option>
            <option value="HARD">Сложная (4 уровня, больше врагов)</option>
            <option value="DEADLY">Смертельная (5 уровней, много врагов)</option>
          </select>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-banner">
          <span class="error-icon">&#9888;</span>
          <span>{{ error }}</span>
        </div>

        <!-- Buttons -->
        <div class="button-row">
          <button
            type="button"
            @click="goBack"
            :disabled="isCreating"
            class="btn-back"
          >
            &#8592; Назад
          </button>
          <button
            type="submit"
            :disabled="isCreating || !isFormValid"
            class="btn-submit"
          >
            <span v-if="isCreating" class="btn-loading">Создание...</span>
            <span v-else>Создать персонажа</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '@/services/api.service';
import { useGameStore } from '@/stores/game.store';

const router = useRouter();
const gameStore = useGameStore();

const form = ref({
  characterName: '',
  race: '',
  characterClass: '',
  dungeonTheme: '',
  difficulty: '',
});

const isCreating = ref(false);
const error = ref('');

const isFormValid = computed(() => {
  return (
    form.value.characterName.trim().length >= 2 &&
    form.value.race &&
    form.value.characterClass &&
    form.value.dungeonTheme &&
    form.value.difficulty
  );
});

async function createCharacter(): Promise<void> {
  if (!isFormValid.value || isCreating.value) return;

  isCreating.value = true;
  error.value = '';

  try {
    const response = await apiService.createCharacter({
      characterName: form.value.characterName,
      race: form.value.race,
      characterClass: form.value.characterClass,
      dungeonTheme: form.value.dungeonTheme,
      difficulty: form.value.difficulty,
    });

    gameStore.selectedPlayerId = response.playerId;
    gameStore.currentNarrative = response.welcomeNarrative;
    router.push({ name: 'CharacterSelection' });
  } catch (err: any) {
    console.error('Failed to create character', err);
    error.value = err.response?.data?.message || 'Ошибка создания персонажа. Попробуй снова.';
  } finally {
    isCreating.value = false;
  }
}

function goBack(): void {
  router.push({ name: 'CharacterSelection' });
}
</script>

<style scoped>
.creation-page {
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

.creation-container {
  position: relative;
  z-index: 2;
  max-width: 560px;
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
.creation-header {
  text-align: center;
  margin-bottom: 2rem;
}

.creation-title {
  font-family: 'Cinzel', serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 0.04em;
  text-shadow: 0 0 20px rgba(218, 165, 32, 0.2);
  margin: 0 0 0.5rem 0;
}

.creation-subtitle {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.05rem;
  color: var(--text-secondary);
  margin: 0 0 1.25rem 0;
}

.gold-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-muted), var(--gold), var(--gold-muted), transparent);
}

/* Form */
.creation-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-family: 'Cinzel', serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold-muted);
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-deep);
  border: 1px solid var(--bg-surface);
  border-radius: 6px;
  color: var(--text-primary);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1rem;
  transition: all 0.25s ease;
}

.form-input::placeholder {
  color: var(--text-dim);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: rgba(218, 165, 32, 0.4);
  box-shadow: 0 0 12px rgba(218, 165, 32, 0.15);
}

.form-input:disabled,
.form-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-select option {
  background: var(--bg-abyss);
  color: var(--text-primary);
}

/* Error */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: 6px;
  color: #f87171;
  font-family: 'Cormorant Garamond', serif;
}

.error-icon {
  font-size: 1.2rem;
}

/* Buttons */
.button-row {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-back {
  flex: 0.4;
  padding: 0.85rem;
  background: var(--bg-medium);
  border: 1px solid var(--bg-surface);
  border-radius: 6px;
  color: var(--text-secondary);
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover:not(:disabled) {
  border-color: rgba(218, 165, 32, 0.2);
  color: var(--text-primary);
}

.btn-back:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit {
  flex: 1;
  padding: 0.85rem;
  background: linear-gradient(135deg, var(--gold-dark), var(--gold));
  border: none;
  border-radius: 6px;
  color: var(--bg-abyss);
  font-family: 'Cinzel', serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(218, 165, 32, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(218, 165, 32, 0.45);
  filter: brightness(1.1);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loading {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Responsive */
@media (max-width: 640px) {
  .creation-container {
    padding: 1.5rem;
  }

  .creation-title {
    font-size: 1.6rem;
  }

  .button-row {
    flex-direction: column;
  }

  .btn-back {
    flex: 1;
  }
}
</style>
