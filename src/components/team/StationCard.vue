<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  id: 'kainji' | 'egbin' | 'geregu' | 'kano';
  name: string;
  realName: string;
  location: string;
  plantType: 'Hydro' | 'Gas' | 'Solar';
  maxCapacity: number;
  currentTokens: number;
  maxAllowedInRound: number;
  previousRoundTokens?: number;
  rampLimit?: number;
  isRampViolated?: boolean;
  isControlledByTeam: boolean;
  isLocked: boolean;
  storeTokensAvailable: number;
  roundId: number;
}>();

const emit = defineEmits<{
  (e: 'adjust', delta: number): void;
  (e: 'dropToken'): void;
}>();

// Generation in MW
const currentMW = computed(() => props.currentTokens * 10);
const maxCapacityMW = computed(() => props.maxCapacity * 10);

// Delta from previous round (for gas stations)
const rampChange = computed(() => {
  if (props.previousRoundTokens === undefined) return 0;
  return props.currentTokens - props.previousRoundTokens;
});

// Color themes based on plant type
const theme = computed(() => {
  switch (props.plantType) {
    case 'Hydro':
      return {
        accent: 'teal',
        border: 'border-teal-500/40',
        bg: 'bg-teal-950/20',
        tokenColor: 'bg-gradient-to-br from-teal-400 to-cyan-600 border-teal-200 text-teal-950',
        badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
        icon: '🌊',
      };
    case 'Gas':
      return {
        accent: 'amber',
        border: 'border-amber-500/40',
        bg: 'bg-amber-950/20',
        tokenColor: 'bg-gradient-to-br from-amber-400 to-orange-600 border-amber-200 text-amber-950',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        icon: '🔥',
      };
    case 'Solar':
      return {
        accent: 'yellow',
        border: 'border-yellow-500/40',
        bg: 'bg-yellow-950/20',
        tokenColor: 'bg-gradient-to-br from-yellow-300 to-amber-500 border-yellow-100 text-yellow-950',
        badgeBg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        icon: '☀️',
      };
  }
});

function handleDragOver(e: DragEvent) {
  if (!props.isControlledByTeam || props.isLocked) return;
  e.preventDefault();
}

function handleDrop(e: DragEvent) {
  if (!props.isControlledByTeam || props.isLocked) return;
  e.preventDefault();
  emit('dropToken');
}
</script>

<template>
  <div
    class="relative rounded-2xl border p-4 transition-all duration-200 shadow-lg flex flex-col justify-between"
    :class="[
      theme.border,
      theme.bg,
      isRampViolated ? 'ring-2 ring-rose-500 bg-rose-950/30' : 'bg-[#0B1E33]',
    ]"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    
    <!-- Top Header -->
    <div>
      <div class="flex items-start justify-between gap-2 mb-1.5">
        <div>
          <div class="flex items-center gap-1.5">
            <span class="text-base">{{ theme.icon }}</span>
            <h3 class="font-extrabold text-sm md:text-base text-slate-100 uppercase tracking-tight">
              {{ name }}
            </h3>
          </div>
          <div class="text-[11px] font-semibold text-teal-300 tracking-wide">
            {{ realName }}
          </div>
          <div class="text-[10px] text-slate-400">
            {{ location }}
          </div>
        </div>

        <span class="text-[10px] font-bold px-2 py-0.5 rounded border uppercase" :class="theme.badgeBg">
          {{ plantType }} · {{ maxCapacityMW }} MW
        </span>
      </div>

      <!-- Live Dispatch Readout -->
      <div class="flex items-center justify-between bg-slate-950/60 rounded-xl p-2.5 my-2 border border-slate-800">
        <div>
          <div class="text-[10px] uppercase font-bold text-slate-400">Current Generation</div>
          <div class="text-xl font-black font-mono text-slate-100">
            {{ currentMW }} <span class="text-xs font-sans text-slate-400">MW</span>
          </div>
        </div>
        <div class="text-right">
          <div class="text-[10px] uppercase font-bold text-slate-400">Tokens on Board</div>
          <div class="text-lg font-black font-mono text-teal-300">
            {{ currentTokens }} / {{ maxCapacity }}
          </div>
        </div>
      </div>

      <!-- Ramp Limits & Constraints Info Box -->
      <div class="mb-3 text-[11px] space-y-1">
        
        <!-- Gas Station Ramp Rule -->
        <div v-if="plantType === 'Gas'" class="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <span class="text-slate-400 font-medium">Max Ramp: ±3 tokens</span>
          <span
            class="font-mono font-bold"
            :class="isRampViolated ? 'text-rose-400 animate-pulse' : 'text-slate-200'"
          >
            Change: {{ (rampChange >= 0 ? '+' : '') + rampChange }} tokens
          </span>
        </div>

        <!-- Kainji Reserve Indicator -->
        <div v-if="id === 'kainji'" class="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <span class="text-slate-400 font-medium">Reserve Target:</span>
          <span
            class="font-bold text-[10px] px-1.5 py-0.5 rounded"
            :class="roundId === 6 ? (currentTokens <= 2 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300') : (currentTokens <= 6 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300')"
          >
            {{ roundId === 6 ? 'Max 2 tokens for bonus' : 'Keep ≥2 free slots (≤6)' }}
          </span>
        </div>

        <!-- Kano Solar Dispatcher Note -->
        <div v-if="id === 'kano'" class="text-[10px] text-amber-300/80 italic p-1 bg-amber-950/20 rounded border border-amber-500/20">
          Output determined by natural solar irradiance (facilitator script).
        </div>

        <!-- Ramp Violation Warning -->
        <div v-if="isRampViolated" class="p-1 text-[11px] font-bold text-rose-300 bg-rose-950/50 rounded border border-rose-500/40 text-center">
          ⚠️ RAMP RULE VIOLATION (Round Score = 0)
        </div>
      </div>
    </div>

    <!-- Visual Token Rack (Slots) -->
    <div class="my-2">
      <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex justify-between">
        <span>Capacity Slots (1 token = 10 MW)</span>
        <span v-if="maxAllowedInRound < maxCapacity" class="text-amber-400 font-semibold">
          Constraint: Max {{ maxAllowedInRound }}
        </span>
      </div>

      <div class="grid grid-cols-6 gap-1.5 p-2 bg-slate-950/80 rounded-xl border border-slate-800/90">
        <div
          v-for="slotIndex in maxCapacity"
          :key="slotIndex"
          class="aspect-square rounded-lg flex items-center justify-center font-mono font-bold text-xs transition-all relative"
          :class="[
            slotIndex <= currentTokens
              ? `${theme.tokenColor} shadow-md scale-95`
              : slotIndex > maxAllowedInRound
              ? 'bg-rose-950/40 border border-rose-800/40 text-rose-400 opacity-60'
              : (id === 'kainji' && slotIndex > (roundId === 6 ? 2 : 6))
              ? 'bg-teal-950/40 border border-teal-500/40 border-dashed text-teal-400'
              : 'bg-slate-900 border border-slate-800 text-slate-600'
          ]"
        >
          <!-- Active Token Icon -->
          <span v-if="slotIndex <= currentTokens">●</span>
          <!-- Blocked by Event / Outage -->
          <span v-else-if="slotIndex > maxAllowedInRound" class="text-[9px]">✕</span>
          <!-- Reserve Space Notch on Kainji -->
          <span v-else-if="id === 'kainji' && slotIndex > (roundId === 6 ? 2 : 6)" class="text-[8px] font-sans font-bold">R</span>
          <span v-else class="text-[9px] opacity-40">{{ slotIndex }}</span>
        </div>
      </div>
    </div>

    <!-- Interactive Touch +/- Controls -->
    <div v-if="isControlledByTeam" class="mt-3 pt-2 border-t border-slate-800">
      <div class="grid grid-cols-2 gap-2">
        <!-- Decrement Button -->
        <button
          type="button"
          @click="emit('adjust', -1)"
          :disabled="isLocked || currentTokens <= 0"
          class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none text-slate-100 font-extrabold text-sm md:text-base border border-slate-700 shadow flex items-center justify-center gap-1 transition"
        >
          <span>−</span>
          <span class="text-xs font-mono">10 MW</span>
        </button>

        <!-- Increment Button -->
        <button
          type="button"
          @click="emit('adjust', +1)"
          :disabled="isLocked || currentTokens >= maxAllowedInRound || storeTokensAvailable <= 0"
          class="py-2.5 px-3 rounded-xl bg-[#0D626C] hover:bg-[#0A4D54] active:bg-[#083A3F] disabled:opacity-30 disabled:pointer-events-none text-white font-extrabold text-sm md:text-base border border-teal-400/40 shadow-md flex items-center justify-center gap-1 transition"
        >
          <span>+</span>
          <span class="text-xs font-mono">10 MW</span>
        </button>
      </div>
    </div>

    <!-- Controlled by Facilitator Notice (Solar) -->
    <div v-else class="mt-3 pt-2 border-t border-slate-800 text-center">
      <span class="text-[11px] font-semibold text-slate-400">
        Dispatched automatically by round script
      </span>
    </div>

  </div>
</template>
