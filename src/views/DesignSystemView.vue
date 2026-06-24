<template>
  <div class="design-system-page min-h-screen p-8">
    <div class="max-w-7xl mx-auto space-y-12">
      <!-- Header -->
      <header class="text-center mb-16 animate-fade-in-down">
        <h1 class="text-6xl font-heading font-bold text-parchment mb-4 text-glow-arcane">
          ✦ Grimoire Design System ✦
        </h1>
        <p class="text-xl text-parchment-dark font-accent">
          Современный алхимический минимализм для AI Dungeon Master
        </p>
      </header>

      <!-- Color Palette -->
      <section class="space-y-6 animate-fade-in-up">
        <h2 class="text-3xl font-heading font-bold text-parchment mb-6">
          Цветовая палитра
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Grimoire -->
          <GrimoireCard variant="grimoire" title="Grimoire" icon="📖">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-grimoire-primary rounded-lg border border-parchment/20"></div>
                <div>
                  <div class="font-mono text-sm">Primary</div>
                  <div class="text-xs text-parchment-dark">#2a1b2d</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-grimoire-darker rounded-lg border border-parchment/20"></div>
                <div>
                  <div class="font-mono text-sm">Darker</div>
                  <div class="text-xs text-parchment-dark">#1a0f1d</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-grimoire-light rounded-lg border border-parchment/20"></div>
                <div>
                  <div class="font-mono text-sm">Light</div>
                  <div class="text-xs text-parchment-dark">#3a2b3d</div>
                </div>
              </div>
            </div>
          </GrimoireCard>

          <!-- Magic Colors -->
          <GrimoireCard variant="grimoire" title="Wisdom" icon="✦" glow glow-color="wisdom">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-wisdom rounded-lg shadow-wisdom"></div>
                <div>
                  <div class="font-mono text-sm text-wisdom">Wisdom</div>
                  <div class="text-xs text-parchment-dark">#64b5f6</div>
                </div>
              </div>
              <p class="text-sm text-parchment-dark">
                Мудрость и магия - синее свечение
              </p>
            </div>
          </GrimoireCard>

          <GrimoireCard variant="grimoire" title="Danger" icon="🔥" glow glow-color="danger">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-danger rounded-lg shadow-danger"></div>
                <div>
                  <div class="font-mono text-sm text-danger">Danger</div>
                  <div class="text-xs text-parchment-dark">#ff6b6b</div>
                </div>
              </div>
              <p class="text-sm text-parchment-dark">
                Опасность и огонь - теплое свечение
              </p>
            </div>
          </GrimoireCard>

          <GrimoireCard variant="grimoire" title="Arcane" icon="◆" glow glow-color="arcane">
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-arcane rounded-lg shadow-arcane"></div>
                <div>
                  <div class="font-mono text-sm text-arcane">Arcane</div>
                  <div class="text-xs text-parchment-dark">#ba68c8</div>
                </div>
              </div>
              <p class="text-sm text-parchment-dark">
                Тайное и аркан - фиолетовое свечение
              </p>
            </div>
          </GrimoireCard>
        </div>
      </section>

      <!-- Typography -->
      <section class="space-y-6">
        <h2 class="text-3xl font-heading font-bold text-parchment mb-6">
          Типографика
        </h2>
        
        <GrimoireCard variant="parchment">
          <div class="space-y-6">
            <div>
              <h1 class="text-5xl font-heading font-bold mb-2">Heading 1 - Cinzel</h1>
              <p class="text-sm text-ink/60 font-mono">Font: Cinzel, Size: 3rem (48px)</p>
            </div>
            <div>
              <h2 class="text-4xl font-heading font-bold mb-2">Heading 2 - Cinzel</h2>
              <p class="text-sm text-ink/60 font-mono">Font: Cinzel, Size: 2.25rem (36px)</p>
            </div>
            <div>
              <p class="text-xl font-body mb-2">
                Body Text - Crimson Text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p class="text-sm text-ink/60 font-mono">Font: Crimson Text, Size: 1rem (16px)</p>
            </div>
            <div>
              <p class="text-lg font-accent font-bold mb-2">Accent Text - Philosopher</p>
              <p class="text-sm text-ink/60 font-mono">Font: Philosopher, Weight: Bold</p>
            </div>
            <div>
              <p class="text-base font-mono mb-2">Monospace - JetBrains Mono</p>
              <p class="text-sm text-ink/60 font-mono">Font: JetBrains Mono, для кода и статов</p>
            </div>
          </div>
        </GrimoireCard>
      </section>

      <!-- Buttons -->
      <section class="space-y-6">
        <h2 class="text-3xl font-heading font-bold text-parchment mb-6">
          Кнопки
        </h2>
        
        <GrimoireCard variant="grimoire" title="Button Variants">
          <div class="flex flex-wrap gap-4">
            <GrimoireButton variant="primary" icon="✦">Primary Button</GrimoireButton>
            <GrimoireButton variant="secondary">Secondary Button</GrimoireButton>
            <GrimoireButton variant="danger" icon="🔥">Danger Button</GrimoireButton>
            <GrimoireButton variant="wisdom" icon="✦">Wisdom Button</GrimoireButton>
            <GrimoireButton variant="nature" icon="🌿">Nature Button</GrimoireButton>
            <GrimoireButton variant="arcane" icon="◆" glow>Arcane Glow</GrimoireButton>
          </div>
        </GrimoireCard>

        <GrimoireCard variant="grimoire" title="Button Sizes">
          <div class="flex flex-wrap items-center gap-4">
            <GrimoireButton size="sm">Small</GrimoireButton>
            <GrimoireButton size="md">Medium</GrimoireButton>
            <GrimoireButton size="lg">Large</GrimoireButton>
          </div>
        </GrimoireCard>

        <GrimoireCard variant="grimoire" title="Button States">
          <div class="flex flex-wrap gap-4">
            <GrimoireButton>Normal</GrimoireButton>
            <GrimoireButton loading>Loading...</GrimoireButton>
            <GrimoireButton disabled>Disabled</GrimoireButton>
          </div>
        </GrimoireCard>
      </section>

      <!-- Inputs -->
      <section class="space-y-6">
        <h2 class="text-3xl font-heading font-bold text-parchment mb-6">
          Поля ввода
        </h2>
        
        <GrimoireCard variant="grimoire">
          <div class="space-y-6">
            <GrimoireInput
              v-model="demoInput1"
              label="Character Name"
              icon="⚔"
              placeholder="Enter character name..."
              hint="Minimum 3 characters"
              glow
            />
            
            <GrimoireInput
              v-model="demoInput2"
              type="password"
              label="Secret Spell"
              icon="🗝"
              placeholder="Enter secret spell..."
              status="success"
            />
            
            <GrimoireInput
              v-model="demoInput3"
              label="Invalid Input"
              icon="⚠"
              error-message="This field is required"
              status="error"
            />
            
            <GrimoireInput
              v-model="demoInput4"
              label="Loading State"
              icon="⚗"
              status="loading"
              disabled
            />
          </div>
        </GrimoireCard>
      </section>

      <!-- Badges -->
      <section class="space-y-6">
        <h2 class="text-3xl font-heading font-bold text-parchment mb-6">
          Бейджи
        </h2>
        
        <GrimoireCard variant="grimoire">
          <div class="space-y-4">
            <div class="flex flex-wrap gap-3">
              <GrimoireBadge variant="wisdom" icon="✦">Wisdom</GrimoireBadge>
              <GrimoireBadge variant="danger" icon="🔥">Danger</GrimoireBadge>
              <GrimoireBadge variant="nature" icon="🌿">Nature</GrimoireBadge>
              <GrimoireBadge variant="arcane" icon="◆">Arcane</GrimoireBadge>
              <GrimoireBadge variant="neutral">Neutral</GrimoireBadge>
            </div>
            
            <div class="flex flex-wrap gap-3">
              <GrimoireBadge variant="wisdom" size="sm" glow>Small Glow</GrimoireBadge>
              <GrimoireBadge variant="danger" size="md" glow>Medium Glow</GrimoireBadge>
              <GrimoireBadge variant="arcane" size="lg" glow>Large Glow</GrimoireBadge>
            </div>
            
            <div class="flex flex-wrap gap-3">
              <GrimoireBadge variant="wisdom" removable @remove="() => {}">Removable</GrimoireBadge>
              <GrimoireBadge variant="arcane" icon="⚔" removable @remove="() => {}">Fighter</GrimoireBadge>
            </div>
          </div>
        </GrimoireCard>
      </section>

      <!-- Cards -->
      <section class="space-y-6">
        <h2 class="text-3xl font-heading font-bold text-parchment mb-6">
          Карточки
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GrimoireCard variant="grimoire" title="Grimoire Card" icon="📖" hoverable>
            <p class="text-parchment-dark">
              Dark themed card with grimoire texture and magical atmosphere.
            </p>
          </GrimoireCard>
          
          <GrimoireCard variant="parchment" title="Parchment Card" icon="📜" hoverable>
            <p class="text-ink/70">
              Light themed card with parchment texture, perfect for readable content.
            </p>
          </GrimoireCard>
          
          <GrimoireCard variant="glass" title="Glass Card" icon="✦" hoverable glow glow-color="arcane">
            <p class="text-parchment-dark">
              Glassmorphism effect with magical glow, great for overlays.
            </p>
          </GrimoireCard>
        </div>
      </section>

      <!-- Loader -->
      <section class="space-y-6">
        <h2 class="text-3xl font-heading font-bold text-parchment mb-6">
          Загрузчик
        </h2>
        
        <GrimoireCard variant="grimoire">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="text-center">
              <GrimoireLoader size="md" variant="arcane" text="Casting spell..." />
            </div>
            <div class="text-center">
              <GrimoireLoader size="md" variant="wisdom" text="Loading wisdom..." show-progress :progress="65" />
            </div>
          </div>
        </GrimoireCard>
      </section>

      <!-- Modal Demo -->
      <section class="space-y-6">
        <h2 class="text-3xl font-heading font-bold text-parchment mb-6">
          Модальное окно
        </h2>
        
        <GrimoireCard variant="grimoire">
          <GrimoireButton @click="showModal = true" icon="✦">
            Open Modal
          </GrimoireButton>
        </GrimoireCard>
      </section>

      <!-- Tooltip Demo -->
      <section class="space-y-6 pb-16">
        <h2 class="text-3xl font-heading font-bold text-parchment mb-6">
          Подсказки
        </h2>
        
        <GrimoireCard variant="grimoire">
          <div class="flex flex-wrap gap-6">
            <GrimoireTooltip text="Top tooltip" position="top">
              <GrimoireButton size="sm">Hover Top</GrimoireButton>
            </GrimoireTooltip>
            
            <GrimoireTooltip text="Right tooltip" position="right">
              <GrimoireButton size="sm">Hover Right</GrimoireButton>
            </GrimoireTooltip>
            
            <GrimoireTooltip text="Arcane tooltip" position="bottom" variant="arcane">
              <GrimoireButton size="sm" variant="arcane">Arcane Tooltip</GrimoireButton>
            </GrimoireTooltip>
            
            <GrimoireTooltip text="Wisdom tooltip" position="left" variant="wisdom">
              <GrimoireButton size="sm" variant="wisdom">Wisdom Tooltip</GrimoireButton>
            </GrimoireTooltip>
          </div>
        </GrimoireCard>
      </section>
    </div>

    <!-- Modal -->
    <GrimoireModal
      v-model="showModal"
      title="Example Modal"
      icon="✦"
      size="md"
    >
      <p class="text-parchment mb-4">
        This is an example of a modal window with the grimoire theme.
        It features smooth animations and can be closed by clicking outside or the X button.
      </p>
      
      <GrimoireCard variant="parchment" class="mb-4">
        <p class="text-ink">
          You can also include other components inside modals, like this parchment card.
        </p>
      </GrimoireCard>

      <template #footer>
        <GrimoireButton variant="secondary" @click="showModal = false">
          Cancel
        </GrimoireButton>
        <GrimoireButton variant="primary" icon="✦" @click="showModal = false">
          Confirm
        </GrimoireButton>
      </template>
    </GrimoireModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  GrimoireButton,
  GrimoireCard,
  GrimoireInput,
  GrimoireBadge,
  GrimoireLoader,
  GrimoireModal,
  GrimoireTooltip,
} from '@/components/ui';

const demoInput1 = ref('');
const demoInput2 = ref('password123');
const demoInput3 = ref('');
const demoInput4 = ref('Loading...');
const showModal = ref(false);
</script>

<style scoped>
.design-system-page {
  min-height: 100vh;
}
</style>

