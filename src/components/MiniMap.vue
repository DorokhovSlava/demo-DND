<template>
  <div class="mini-map">
    <div class="map-header">
      <h3 class="map-title">Map</h3>
      <span v-if="playerState?.position" class="map-coords">
        {{ playerState.position.coordinates[0] }}, {{ playerState.position.coordinates[1] }}
      </span>
    </div>

    <div class="map-canvas">
      <svg viewBox="0 0 200 200" class="map-svg">
        <!-- Grid -->
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(139, 122, 101, 0.2)"
              stroke-width="0.5"
            />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#grid)" />

        <!-- Fog of War (only when no state is available) -->
        <rect
          v-if="showFogOfWar"
          width="200"
          height="200"
          fill="rgba(26, 26, 26, 0.35)"
          pointer-events="none"
        />

        <!-- Explored Rooms -->
        <g v-for="room in exploredRooms" :key="room.id">
          <rect
            :x="room.x"
            :y="room.y"
            :width="room.width"
            :height="room.height"
            :fill="getRoomColor(room.type)"
            :stroke="getRoomStroke(room.type)"
            stroke-width="2"
            :opacity="room.visited ? 0.8 : 0.4"
          />
          <text
            :x="room.x + room.width / 2"
            :y="room.y + room.height / 2"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="12"
            :fill="room.visited ? '#d4c5a9' : '#8b7a65'"
            font-family="Cinzel, serif"
          >
            {{ room.label }}
          </text>
        </g>

        <!-- Corridors -->
        <g v-for="corridor in corridors" :key="corridor.id">
          <line
            :x1="corridor.x1"
            :y1="corridor.y1"
            :x2="corridor.x2"
            :y2="corridor.y2"
            stroke="#8b7a65"
            stroke-width="2"
            :opacity="corridor.explored ? 0.6 : 0.3"
          />
        </g>

        <!-- Player Position -->
        <g v-if="playerPosition">
          <circle
            :cx="playerPosition.x"
            :cy="playerPosition.y"
            r="5"
            fill="#ff6b35"
            :stroke="'#fff'"
            stroke-width="2"
          >
            <animate
              attributeName="r"
              values="5;7;5"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <!-- Player direction indicator -->
          <path
            :d="`M ${playerPosition.x} ${playerPosition.y - 5} L ${playerPosition.x - 3} ${playerPosition.y - 10} L ${playerPosition.x + 3} ${playerPosition.y - 10} Z`"
            fill="#ff6b35"
          />
        </g>
      </svg>

      <!-- Legend -->
      <div class="map-legend">
        <div class="legend-item">
          <span class="legend-dot" style="background: #ff6b35;"></span>
          <span class="legend-text">You</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #8b7a65;"></span>
          <span class="legend-text">Room</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #d4a373;"></span>
          <span class="legend-text">Visited</span>
        </div>
      </div>
    </div>

    <div class="map-info">
      <div class="info-item">
        <span class="info-label">Zone:</span>
        <span class="info-value">{{ playerState?.position?.zone || 'Unknown' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Explored:</span>
        <span class="info-value">{{ exploredPercentage }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DungeonMap, PlayerState } from '@/types/game';

interface Room {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'normal' | 'entrance' | 'treasure' | 'danger' | 'boss';
  visited: boolean;
  label: string;
}

interface Corridor {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  explored: boolean;
}

const props = defineProps<{
  playerState: PlayerState | null;
  dungeonMap: DungeonMap | null;
}>();

const showFogOfWar = computed(() => {
  return !props.playerState?.position;
});

const exploredRooms = computed<Room[]>(() => {
  if (!props.playerState) return [];

  const map = props.dungeonMap;
  if (!map || !map.rooms || map.rooms.length === 0 || map.width <= 0 || map.height <= 0) {
    return [];
  }

  const visitedRooms = props.playerState.dungeonContext?.visitedRooms ?? [];
  const currentRoomId = props.playerState.dungeonContext?.roomId;

  const scaleX = 200 / map.width;
  const scaleY = 200 / map.height;

  const toMiniType = (t: string): Room['type'] => {
    const upper = (t ?? '').toUpperCase();
    if (upper.includes('ENTRANCE')) return 'entrance';
    if (upper.includes('TREASURE')) return 'treasure';
    if (upper.includes('BOSS')) return 'boss';
    if (upper.includes('DANGER') || upper.includes('TRAP')) return 'danger';
    return 'normal';
  };

  return map.rooms.map((r, index) => {
    const visited = (currentRoomId != null && r.id === currentRoomId) || visitedRooms.includes(r.id);
    const label = String(index + 1);
    return {
      id: r.id,
      x: r.x * scaleX,
      y: r.y * scaleY,
      width: Math.max(1, r.width * scaleX),
      height: Math.max(1, r.height * scaleY),
      type: toMiniType(r.type),
      visited,
      label,
    };
  });
});

const corridors = computed<Corridor[]>(() => {
  if (!props.playerState) return [];
  return [];
});

const playerPosition = computed(() => {
  if (!props.playerState?.position) return null;

  const [gridX, gridY] = props.playerState.position.coordinates;
  const map = props.dungeonMap;
  const scaleX = map && map.width > 0 ? 200 / map.width : 20;
  const scaleY = map && map.height > 0 ? 200 / map.height : 20;
  const paddingX = scaleX / 2;
  const paddingY = scaleY / 2;

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const x = clamp(gridX * scaleX + paddingX, paddingX, 200 - paddingX);
  const y = clamp(gridY * scaleY + paddingY, paddingY, 200 - paddingY);

  return { x, y };
});

const exploredPercentage = computed(() => {
  const total = exploredRooms.value.length;
  const visited = exploredRooms.value.filter(r => r.visited).length;
  return total > 0 ? Math.round((visited / total) * 100) : 0;
});

function getRoomColor(type: string): string {
  const colors: Record<string, string> = {
    entrance: '#6b7a65',
    normal: '#5a5445',
    treasure: '#d4a373',
    danger: '#8b4543',
    boss: '#6b3543',
  };
  return colors[type] || colors.normal;
}

function getRoomStroke(type: string): string {
  const strokes: Record<string, string> = {
    entrance: '#8b9a85',
    normal: '#8b7a65',
    treasure: '#ffd700',
    danger: '#ff6b35',
    boss: '#dc143c',
  };
  return strokes[type] || strokes.normal;
}
</script>

<style scoped>
.mini-map {
  @apply bg-grimoire-darker border-2 border-ink-dark p-3;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.6),
    inset 0 0 40px rgba(0, 0, 0, 0.2);
}

.map-header {
  @apply flex justify-between items-center mb-3 pb-2 border-b border-ink-dark;
}

.map-title {
  @apply text-sm font-bold text-parchment-dark;
  font-family: 'Cinzel', serif;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.map-coords {
  @apply text-xs text-parchment-dark font-mono;
  font-family: 'Crimson Text', serif;
}

.map-canvas {
  @apply relative mb-3;
  background: linear-gradient(135deg, var(--grimoire-darker) 0%, var(--grimoire-light) 100%);
  border: 2px solid var(--ink-dark);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.6);
}

.map-svg {
  @apply w-full h-auto;
  display: block;
}

.map-legend {
  @apply flex justify-around py-2 mt-2 border-t border-ink-dark;
}

.legend-item {
  @apply flex items-center gap-1;
}

.legend-dot {
  @apply w-2 h-2 rounded-full;
  box-shadow: 0 0 4px currentColor;
}

.legend-text {
  @apply text-xs text-parchment-dark;
  font-family: 'Crimson Text', serif;
}

.map-info {
  @apply space-y-1;
}

.info-item {
  @apply flex justify-between items-center;
}

.info-label {
  @apply text-xs text-parchment-dark;
  font-family: 'Crimson Text', serif;
}

.info-value {
  @apply text-xs font-semibold text-parchment;
  font-family: 'Crimson Text', serif;
}

@media (max-width: 1280px) {
  .mini-map {
    @apply p-2;
  }
  
  .map-legend {
    @apply flex-wrap gap-2;
  }
}
</style>

