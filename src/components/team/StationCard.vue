<script setup lang="ts">
import { computed } from 'vue';
import StationVisual from './StationVisual.vue';
import PlantIcon from './PlantIcon.vue';
import type { PlantKind } from '../../types/grid';

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
  compact?: boolean; // ring layout: hide the wide banner illustration, show the icon only
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

// Which icon to show. Egbin is a steam-turbine thermal plant, Geregu is a gas turbine.
// (plantType stays 'Gas' for both so the ramp-rule logic is untouched.)
const iconKind = computed<PlantKind>(() => {
  if (props.plantType === 'Hydro') return 'hydro';
  if (props.plantType === 'Solar') return 'solar';
  return props.id === 'egbin' ? 'steam' : 'gas';
});
const typeLabel = computed(() => ({ hydro: 'Hydro', gas: 'Gas', steam: 'Steam', solar: 'Solar' }[iconKind.value]));

// Color themes and distinct borders based on plant type and station identity
const theme = computed(() => {
  if (props.id === 'kainji') {
    return {
      accent: 'green',
      cardClass: 'station-card-hydro',
      border: 'border-2 border-[#389E5F]',
      accentBar: 'bg-[#389E5F]',
      bg: 'bg-[#132E4C]',
      tokenColor: 'bg-gradient-to-br from-[#4ADE80] to-[#2B7A49] border-2 border-[#BBF7D0] text-white font-black shadow-md',
      badgeBg: 'bg-[#389E5F]/30 text-[#86EFAC] border border-[#389E5F]',
      icon: '🌊',
      cardinal: 'North-West Edge · Kainji Dam',
    };
  }
  if (props.id === 'egbin') {
    return {
      accent: 'amber',
      cardClass: 'station-card-gas-a',
      border: 'border-2 border-amber-500',
      accentBar: 'bg-amber-500',
      bg: 'bg-[#132E4C]',
      tokenColor: 'bg-gradient-to-br from-amber-300 to-orange-500 border-2 border-amber-100 text-slate-950 font-black shadow-md',
      badgeBg: 'bg-amber-500/25 text-amber-200 border border-amber-500/50',
      icon: '🏭',
      cardinal: 'South-West Edge · Lagos Coast',
    };
  }
  if (props.id === 'kano') {
    return {
      accent: 'yellow',
      cardClass: 'station-card-solar',
      border: 'border-2 border-yellow-400',
      accentBar: 'bg-yellow-400',
      bg: 'bg-[#132E4C]',
      tokenColor: 'bg-gradient-to-br from-yellow-200 to-amber-400 border-2 border-yellow-100 text-slate-950 font-black shadow-md',
      badgeBg: 'bg-yellow-500/25 text-yellow-200 border border-yellow-500/50',
      icon: '☀️',
      cardinal: 'North-East Edge · Kano Savannah',
    };
  }
  // Geregu Gas B (Gas turbine)
  return {
    accent: 'orange',
    cardClass: 'station-card-gas-b',
    border: 'border-2 border-orange-500',
    accentBar: 'bg-orange-500',
    bg: 'bg-[#132E4C]',
    tokenColor: 'bg-gradient-to-br from-amber-300 to-orange-500 border-2 border-amber-100 text-slate-950 font-black shadow-md',
    badgeBg: 'bg-orange-500/25 text-orange-200 border border-orange-500/50',
    icon: '⚡',
    cardinal: 'South-East Edge · Kogi Confluence',
  };
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
    class="relative rounded-2xl border p-4 transition-all duration-200 shadow-xl flex flex-col justify-between station-card overflow-hidden"
    :class="[
      theme.cardClass,
      theme.border,
      theme.bg,
      isRampViolated ? 'ring-2 ring-rose-500 bg-rose-950/30' : 'bg-[#0B1E33]',
    ]"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <!-- Top Accent Color Strip for Instant Plant Identification -->
    <div class="absolute top-0 left-0 right-0 h-1.5" :class="theme.accentBar"></div>
    
    <div>
      <!-- High-Detail Visual Plant Illustration -->
      <StationVisual
        v-if="!compact"
        :id="id"
        :plant-type="plantType"
        :current-m-w="currentMW"
        :current-tokens="currentTokens"
        :round-id="roundId"
        :is-tripped="id === 'egbin' && roundId === 3"
      />

      <!-- Top Header & Edge Position -->
      <div class="flex items-start justify-between gap-2 mb-2">
        <div>
          <div class="flex items-center gap-1.5">
            <PlantIcon :kind="iconKind" :size="compact ? 48 : 36" :active="currentMW > 0" />
            <h3 class="font-black text-base md:text-lg text-white uppercase tracking-tight">
              {{ name }}
            </h3>
          </div>
          <div class="text-xs font-black text-[#86EFAC] tracking-wide mt-0.5">
            {{ realName }}
          </div>
          <div class="text-[11px] font-bold text-[#CBD5E1]">
            {{ location }}
          </div>
          <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
            📍 {{ theme.cardinal }}
          </div>
        </div>

        <span class="text-xs font-black px-2.5 py-1 rounded-md border uppercase shadow-sm" :class="theme.badgeBg">
          {{ typeLabel }} · {{ maxCapacityMW }} MW
        </span>
      </div>

      <!-- Live Dispatch Readout -->
      <div class="flex items-center justify-between bg-[#091B2E] rounded-xl p-3 my-2 border border-slate-700 shadow-inner">
        <div>
          <div class="text-[11px] uppercase font-black text-[#CBD5E1]">Current Generation</div>
          <div class="text-2xl font-black font-mono text-white mt-0.5">
            {{ currentMW }} <span class="text-sm font-sans font-bold text-[#CBD5E1]">MW</span>
          </div>
        </div>
        <div class="text-right">
          <div class="text-[11px] uppercase font-black text-[#CBD5E1]">Tokens on Board</div>
          <div class="text-xl font-black font-mono text-[#86EFAC] mt-0.5">
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
    <div v-if="isControlledByTeam" class="mt-3 pt-2.5 border-t border-slate-700">
      <div class="grid grid-cols-2 gap-2">
        <!-- Decrement Button -->
        <button
          type="button"
          @click="emit('adjust', -1)"
          :disabled="isLocked || currentTokens <= 0"
          class="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none text-white font-black text-base border-2 border-slate-600 shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <span class="text-xl">−</span>
          <span class="text-xs font-mono font-black">10 MW</span>
        </button>

        <!-- Increment Button -->
        <button
          type="button"
          @click="emit('adjust', +1)"
          :disabled="isLocked || currentTokens >= maxAllowedInRound || storeTokensAvailable <= 0"
          class="py-3 px-3 rounded-xl bg-[#389E5F] hover:bg-[#2B7A49] active:bg-[#1E5C35] disabled:opacity-30 disabled:pointer-events-none text-white font-black text-base border-2 border-[#52BF7B] shadow-lg shadow-green-950/60 flex items-center justify-center gap-1.5 transition active:scale-95"
        >
          <span class="text-xl">+</span>
          <span class="text-xs font-mono font-black">10 MW</span>
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
