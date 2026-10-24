<script setup lang="ts">
import { computed } from 'vue';
import { RoundDefinition } from '../../types/grid';

const props = defineProps<{
  round: RoundDefinition;
  timerSeconds: number;
  timerRunning: boolean;
  isLocked: boolean;
  isSubmitted: boolean;
  totalGenTokens: number;
  totalGenMW: number;
  effectiveDemandTokens: number;
  effectiveDemandMW: number;
  gapTokens: number;
  gapMW: number;
  hasReserveBonus: boolean;
  isGasRampViolated: boolean;
}>();

const emit = defineEmits<{
  (e: 'startTimer'): void;
  (e: 'pauseTimer'): void;
  (e: 'submitRound'): void;
  (e: 'unlockRound'): void;
}>();

// Timer format MM:SS
const formattedTime = computed(() => {
  const m = Math.floor(props.timerSeconds / 60);
  const s = props.timerSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
});

// Timer percent remaining (out of 120s)
const timerPercent = computed(() => {
  return (props.timerSeconds / 120) * 100;
});
</script>

<template>
  <div class="bg-[#132E4C] border border-[#389E5F]/50 rounded-xl p-2 sm:p-2.5 shadow-lg">
    
    <!-- Top Row: Round Info & 2-Minute Timer -->
    <div class="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-700/80">
      
      <!-- Round Name, Time of Day, and Badge -->
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-[10px] font-black px-2 py-0.5 rounded bg-[#389E5F]/30 text-[#86EFAC] border border-[#389E5F]/60 uppercase tracking-wide">
          {{ round.isPractice ? 'Practice' : `Round ${round.id}/6` }}
        </span>
        <span class="text-[10px] font-mono font-black text-[#FCD34D] flex items-center gap-1 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/40">
          <span>⏰</span>
          <span>{{ round.timeOfDay }}</span>
        </span>
        <h2 class="text-sm sm:text-base font-black text-white tracking-tight">
          {{ round.name }}
        </h2>
      </div>

      <!-- 2-Minute Countdown Timer Widget & Actions -->
      <div class="flex items-center gap-2">
        <div class="text-right">
          <span
            class="text-xl sm:text-2xl font-black font-mono tracking-tight leading-none"
            :class="[
              isLocked ? 'text-slate-400' :
              timerSeconds <= 10 && timerSeconds > 0 ? 'text-[#F87171] animate-bounce' :
              timerSeconds <= 30 ? 'text-[#FBBF24]' : 'text-[#4ADE80]'
            ]"
          >
            {{ formattedTime }}
          </span>
          <span class="text-[9px] font-bold uppercase text-slate-300 block -mt-0.5">
            {{ isLocked ? 'Locked' : 'Timer' }}
          </span>
        </div>

        <!-- Timer Controls / Lock Actions -->
        <div class="flex items-center gap-1.5">
          <button
            v-if="!timerRunning && !isLocked && !isSubmitted"
            type="button"
            @click="emit('startTimer')"
            class="p-1 px-2.5 rounded-lg bg-[#389E5F] hover:bg-[#2B7A49] text-white font-black text-xs shadow border border-[#52BF7B] transition active:scale-95 cursor-pointer"
            title="Start Timer"
          >
            ▶ Play
          </button>

          <button
            v-else-if="timerRunning && !isLocked"
            type="button"
            @click="emit('pauseTimer')"
            class="p-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border border-slate-600 transition cursor-pointer"
            title="Pause Timer"
          >
            ⏸ Pause
          </button>

          <!-- Submit Dispatch Button -->
          <button
            v-if="!isSubmitted"
            type="button"
            @click="emit('submitRound')"
            class="px-3 py-1 rounded-lg bg-[#389E5F] hover:bg-[#2B7A49] active:bg-[#1E5C35] text-white font-black text-xs shadow border border-[#BBF7D0] transition active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            <span>✓</span>
            <span>Lock & Submit</span>
          </button>

          <button
            v-else
            type="button"
            @click="emit('unlockRound')"
            class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#FCD34D] font-black text-xs border border-amber-500/40 cursor-pointer"
          >
            ✎ Edit
          </button>
        </div>
      </div>

    </div>

    <!-- Timer Progress Bar -->
    <div class="w-full bg-slate-950 h-1 rounded-full my-1 overflow-hidden">
      <div
        class="h-full transition-all duration-1000 rounded-full"
        :class="timerSeconds <= 10 ? 'bg-rose-500' : timerSeconds <= 30 ? 'bg-amber-500' : 'bg-teal-500'"
        :style="{ width: `${timerPercent}%` }"
      ></div>
    </div>

    <!-- "Hands Off!" Dramatic Lockout Banner -->
    <div
      v-if="isLocked && timerSeconds === 0"
      class="p-1.5 rounded-lg bg-rose-600 text-white font-black text-center text-xs tracking-wide uppercase shadow border border-rose-300 flex items-center justify-center gap-2 my-1"
    >
      <span>🔔 HANDS OFF! 2-Minute Dispatch Time Expired. Scored automatically.</span>
    </div>

    <!-- Live Grid Demand vs Generation Telemetry Bar -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-1.5 mt-1">
      
      <!-- Total System Demand -->
      <div class="bg-[#091B2E] px-2 py-1 rounded-lg border border-slate-700/80 shadow-sm flex items-center justify-between">
        <div>
          <div class="text-[9px] font-bold uppercase text-slate-300">System Demand</div>
          <div class="text-sm sm:text-base font-black font-mono text-white leading-tight">
            {{ round.demandMW }} <span class="text-[10px] font-sans font-bold text-slate-300">MW</span>
          </div>
        </div>
        <div class="text-[10px] text-slate-300 font-mono font-bold">
          {{ round.demandTokens }} tok
        </div>
      </div>

      <!-- Kano Solar Contribution -->
      <div class="bg-[#091B2E] px-2 py-1 rounded-lg border border-yellow-500/40 shadow-sm flex items-center justify-between">
        <div>
          <div class="text-[9px] font-bold uppercase text-yellow-300 flex items-center gap-1">
            <span>☀️</span>
            <span>Kano Solar</span>
          </div>
          <div class="text-sm sm:text-base font-black font-mono text-yellow-300 leading-tight">
            {{ round.solarMW }} <span class="text-[10px] font-sans font-bold text-slate-300">MW</span>
          </div>
        </div>
        <div class="text-[10px] text-yellow-200 font-mono font-bold">
          {{ round.solarTokens }} tok
        </div>
      </div>

      <!-- Tokens Needed (Thermal + Hydro) -->
      <div class="bg-[#091B2E] px-2 py-1 rounded-lg border border-[#389E5F]/50 shadow-sm flex items-center justify-between">
        <div>
          <div class="text-[9px] font-bold uppercase text-[#86EFAC]">Net Needed</div>
          <div class="text-sm sm:text-base font-black font-mono text-[#4ADE80] leading-tight">
            {{ round.tokensNeeded * 10 }} <span class="text-[10px] font-sans font-bold text-slate-300">MW</span>
          </div>
        </div>
        <div class="text-[10px] text-[#BBF7D0] font-mono font-bold">
          {{ round.tokensNeeded }} tok
        </div>
      </div>

      <!-- Live Dispatch Balance Gap -->
      <div
        class="px-2 py-1 rounded-lg border flex items-center justify-between shadow-sm"
        :class="[
          gapMW === 0
            ? 'bg-[#143D24] border-[#389E5F] text-white'
            : gapTokens <= 2
            ? 'bg-amber-950/60 border-amber-400 text-amber-100'
            : 'bg-rose-950/80 border-rose-500 text-white'
        ]"
      >
        <div>
          <div class="text-[9px] font-bold uppercase tracking-wider">
            {{ gapMW === 0 ? 'Grid Balance' : 'Mismatch Gap' }}
          </div>
          <div class="text-sm sm:text-base font-black font-mono leading-tight">
            {{ gapMW === 0 ? '0 MW Gap' : `${gapMW > 0 ? (totalGenMW > effectiveDemandMW ? '+' : '-') : ''}${gapMW} MW` }}
          </div>
        </div>
        <div class="text-[10px] font-black tracking-tight" :class="gapMW === 0 ? 'text-[#86EFAC]' : 'text-white'">
          {{ gapTokens === 0 ? 'Exact (+3)' : `${gapTokens} tok off` }}
        </div>
      </div>

    </div>

    <!-- Active Event Badge Banner if present in round -->
    <div
      v-if="round.eventTitle"
      class="mt-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-200 text-[11px] flex items-center justify-between"
    >
      <div class="flex items-center gap-1.5 truncate">
        <span class="text-xs">⚠️</span>
        <span class="font-bold text-amber-300 uppercase">{{ round.eventTitle }}:</span>
        <span class="text-slate-200 truncate">{{ round.eventDescription }}</span>
      </div>
      <span class="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 ml-1">
        {{ round.eventBadge }}
      </span>
    </div>

  </div>
</template>
