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
  <div class="bg-[#132E4C] border-2 border-[#389E5F]/50 rounded-2xl p-4 md:p-5 shadow-2xl">
    
    <!-- Top Row: Round Info & 2-Minute Timer -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-3.5 border-b-2 border-slate-700">
      
      <!-- Round Name, Time of Day, and Badge -->
      <div>
        <div class="flex items-center gap-2.5">
          <span class="text-xs font-black px-2.5 py-0.5 rounded-md bg-[#389E5F]/30 text-[#86EFAC] border border-[#389E5F]/60 uppercase tracking-wider">
            {{ round.isPractice ? 'Walkthrough' : `Scored Round ${round.id} of 6` }}
          </span>
          <span class="text-xs font-mono font-black text-[#FCD34D] flex items-center gap-1 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/40">
            <span>⏰</span>
            <span>{{ round.timeOfDay }}</span>
          </span>
        </div>

        <h2 class="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
          {{ round.name }}
        </h2>
      </div>

      <!-- 2-Minute Countdown Timer Widget -->
      <div class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-[11px] font-black uppercase tracking-wider" :class="timerSeconds <= 10 && timerSeconds > 0 ? 'text-[#F87171] animate-pulse' : 'text-[#CBD5E1]'">
            {{ isLocked ? 'Dispatch Locked' : 'Round Timer' }}
          </div>
          <div
            class="text-3xl md:text-4xl font-black font-mono tracking-tight"
            :class="[
              isLocked ? 'text-slate-400' :
              timerSeconds <= 10 && timerSeconds > 0 ? 'text-[#F87171] animate-bounce' :
              timerSeconds <= 30 ? 'text-[#FBBF24]' : 'text-[#4ADE80]'
            ]"
          >
            {{ formattedTime }}
          </div>
        </div>

        <!-- Timer Controls / Lock Actions -->
        <div class="flex items-center gap-2">
          <button
            v-if="!timerRunning && !isLocked && !isSubmitted"
            type="button"
            @click="emit('startTimer')"
            class="p-2.5 px-3.5 rounded-xl bg-[#389E5F] hover:bg-[#2B7A49] text-white font-black text-xs shadow-md border border-[#52BF7B] transition active:scale-95"
            title="Start Timer"
          >
            ▶ Play
          </button>

          <button
            v-else-if="timerRunning && !isLocked"
            type="button"
            @click="emit('pauseTimer')"
            class="p-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border border-slate-600 transition"
            title="Pause Timer"
          >
            ⏸ Pause
          </button>

          <!-- Submit Dispatch Button -->
          <button
            v-if="!isSubmitted"
            type="button"
            @click="emit('submitRound')"
            class="px-5 py-2.5 rounded-xl bg-[#389E5F] hover:bg-[#2B7A49] active:bg-[#1E5C35] text-white font-black text-xs md:text-sm shadow-xl shadow-green-950/60 border-2 border-[#BBF7D0] transition active:scale-95 flex items-center gap-1.5"
          >
            <span>✓</span>
            <span>Lock & Submit</span>
          </button>

          <button
            v-else
            type="button"
            @click="emit('unlockRound')"
            class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#FCD34D] font-black text-xs border border-amber-500/40"
          >
            ✎ Edit Dispatch
          </button>
        </div>
      </div>

    </div>

    <!-- Timer Progress Bar -->
    <div class="w-full bg-slate-950 h-1.5 rounded-full mt-3 overflow-hidden">
      <div
        class="h-full transition-all duration-1000 rounded-full"
        :class="timerSeconds <= 10 ? 'bg-rose-500' : timerSeconds <= 30 ? 'bg-amber-500' : 'bg-teal-500'"
        :style="{ width: `${timerPercent}%` }"
      ></div>
    </div>

    <!-- "Hands Off!" Dramatic Lockout Banner -->
    <div
      v-if="isLocked && timerSeconds === 0"
      class="mt-3 p-3.5 rounded-xl bg-rose-600 text-white font-black text-center text-sm md:text-base tracking-wide uppercase shadow-lg shadow-rose-900/50 border-2 border-rose-300 flex flex-col sm:flex-row items-center justify-center gap-2"
    >
      <div class="flex items-center gap-2">
        <span class="text-xl">🔔</span>
        <span>HANDS OFF! 2-Minute Dispatch Time Expired.</span>
      </div>
      <span class="text-xs font-bold bg-black/35 px-3 py-1 rounded-lg border border-white/20 normal-case tracking-normal">
        Scored automatically by the app below ↓ (Inspectors can verify or adjust in Facilitator Deck)
      </span>
    </div>

    <!-- Live Grid Demand vs Generation Telemetry Bar -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4">
      
      <!-- Total System Demand -->
      <div class="bg-[#091B2E] p-3.5 rounded-xl border-2 border-slate-700 shadow-md">
        <div class="text-[11px] font-black uppercase text-[#CBD5E1]">Total System Demand</div>
        <div class="text-2xl md:text-3xl font-black font-mono text-white mt-1">
          {{ round.demandMW }} <span class="text-xs font-sans font-bold text-[#CBD5E1]">MW</span>
        </div>
        <div class="text-xs text-[#E2E8F0] font-mono font-bold mt-0.5">
          {{ round.demandTokens }} tokens
        </div>
      </div>

      <!-- Kano Solar Contribution -->
      <div class="bg-[#091B2E] p-3.5 rounded-xl border-2 border-yellow-500/40 shadow-md">
        <div class="text-[11px] font-black uppercase text-yellow-300 flex items-center gap-1">
          <span>☀️</span>
          <span>Kano Solar Plant</span>
        </div>
        <div class="text-2xl md:text-3xl font-black font-mono text-yellow-300 mt-1">
          {{ round.solarMW }} <span class="text-xs font-sans font-bold text-[#CBD5E1]">MW</span>
        </div>
        <div class="text-xs text-yellow-200 font-mono font-bold mt-0.5">
          {{ round.solarTokens }} token{{ round.solarTokens === 1 ? '' : 's' }}
        </div>
      </div>

      <!-- Tokens Needed (Thermal + Hydro) -->
      <div class="bg-[#091B2E] p-3.5 rounded-xl border-2 border-[#389E5F]/50 shadow-md">
        <div class="text-[11px] font-black uppercase text-[#86EFAC]">Tokens Needed (Net)</div>
        <div class="text-2xl md:text-3xl font-black font-mono text-[#4ADE80] mt-1">
          {{ round.tokensNeeded * 10 }} <span class="text-xs font-sans font-bold text-[#CBD5E1]">MW</span>
        </div>
        <div class="text-xs text-[#BBF7D0] font-mono font-bold mt-0.5">
          {{ round.tokensNeeded }} tokens needed
        </div>
      </div>

      <!-- Live Dispatch Balance Gap -->
      <div
        class="p-3.5 rounded-xl border-2 flex flex-col justify-between shadow-md"
        :class="[
          gapMW === 0
            ? 'bg-[#143D24] border-[#389E5F] text-white'
            : gapTokens <= 2
            ? 'bg-amber-950/60 border-amber-400 text-amber-100'
            : 'bg-rose-950/80 border-rose-500 text-white'
        ]"
      >
        <div class="text-[11px] font-black uppercase tracking-wider">
          {{ gapMW === 0 ? 'Grid Balance: Exact Match' : 'Generation Mismatch Gap' }}
        </div>
        <div class="text-2xl md:text-3xl font-black font-mono mt-1">
          {{ gapMW === 0 ? '0 MW Gap' : `${gapMW > 0 ? (totalGenMW > effectiveDemandMW ? '+' : '-') : ''}${gapMW} MW` }}
        </div>
        <div class="text-xs font-black tracking-tight" :class="gapMW === 0 ? 'text-[#86EFAC]' : 'text-white'">
          {{ gapTokens === 0 ? '✓ Target Met (+3 pts)' : `${gapTokens} token${gapTokens > 1 ? 's' : ''} off` }}
        </div>
      </div>

    </div>

    <!-- Active Event Badge Banner if present in round -->
    <div
      v-if="round.eventTitle"
      class="mt-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <span class="text-base">⚠️</span>
        <span class="font-bold text-amber-300 uppercase tracking-wide">{{ round.eventTitle }}:</span>
        <span class="text-slate-200">{{ round.eventDescription }}</span>
      </div>
      <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
        {{ round.eventBadge }}
      </span>
    </div>

  </div>
</template>
