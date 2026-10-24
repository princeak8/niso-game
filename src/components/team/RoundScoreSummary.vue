<script setup lang="ts">
import { computed } from 'vue';
import { RoundScore } from '../../types/grid';

const props = defineProps<{
  score: RoundScore;
  isPractice: boolean;
  hasNextRound: boolean;
}>();

const emit = defineEmits<{
  (e: 'advance'): void;
}>();
</script>

<template>
  <div class="bg-[#132E4C] border border-[#389E5F] rounded-lg p-1.5 sm:p-2 shadow-lg my-1 animate-fadeIn text-xs">
    
    <!-- Top Row: Round Info, Teaching Quote, Score & Action -->
    <div class="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-slate-700">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-[#4ADE80]"></span>
        <div>
          <span class="text-[8px] font-black uppercase text-[#86EFAC] block leading-none">Official Round Report</span>
          <h3 class="text-xs sm:text-sm font-black text-white leading-tight">
            {{ score.roundName }} Result
          </h3>
        </div>
      </div>

      <!-- Teaching Line Quote (Compact Inline) -->
      <div class="hidden md:flex flex-1 max-w-md items-center px-2 py-0.5 rounded bg-[#143D24] border border-[#389E5F]/50 text-slate-100 text-[10px] italic truncate">
        "{{ score.teachingLine }}"
      </div>

      <div class="flex items-center gap-1.5">
        <div class="text-right">
          <div class="text-base sm:text-lg font-black font-mono text-[#4ADE80] leading-none">
            {{ isPractice ? 'PRACTICE' : `+${score.finalScore} PTS` }}
          </div>
        </div>

        <!-- Advance Button -->
        <button
          v-if="hasNextRound"
          type="button"
          @click="emit('advance')"
          class="px-2.5 py-0.5 rounded-lg bg-[#389E5F] hover:bg-[#2B7A49] active:bg-[#1E5C35] text-white font-black text-xs uppercase shadow border border-[#BBF7D0] flex items-center gap-1 transition active:scale-95 cursor-pointer"
        >
          <span>Next Round</span>
          <span>→</span>
        </button>
        <span v-else class="text-[10px] font-bold text-amber-300">
          Completed! Go to Debrief →
        </span>
      </div>
    </div>

    <!-- Frequency Alarm or Gas Ramp Banner (If any) -->
    <div
      v-if="score.isFrequencyAlarm"
      class="my-0.5 p-0.5 rounded bg-rose-600 text-white font-bold text-[9px] text-center"
    >
      🚨 FREQUENCY ALARM: Imbalance ≥30MW. System frequency destabilized (0 pts).
    </div>
    <div
      v-else-if="score.gasRampViolated"
      class="my-0.5 p-0.5 rounded bg-rose-950 border border-rose-500 text-rose-200 font-bold text-[9px] text-center"
    >
      ⚠️ GAS RAMP RULE VIOLATION: Moved &gt;3 tokens (0 pts).
    </div>

    <!-- Detailed Score Breakdown Grid (Single compact row) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1 mt-1">
      
      <!-- Base Match Score -->
      <div class="bg-[#091B2E] px-1.5 py-0.5 rounded border border-slate-700/80 flex items-center justify-between">
        <div>
          <div class="text-[8px] uppercase font-bold text-slate-300">Gen vs Demand</div>
          <div class="text-[11px] font-black font-mono" :class="score.gapTokens === 0 ? 'text-[#4ADE80]' : 'text-amber-400'">
            {{ score.gapTokens === 0 ? 'Exact Match' : `${score.gapTokens} Off` }}
          </div>
        </div>
        <span class="text-[9px] font-mono font-bold text-[#86EFAC]">{{ score.baseMatchPoints }}/3 pts</span>
      </div>

      <!-- Reserve Bonus -->
      <div class="bg-[#091B2E] px-1.5 py-0.5 rounded border border-slate-700/80 flex items-center justify-between">
        <div>
          <div class="text-[8px] uppercase font-bold text-slate-300">Spinning Reserve</div>
          <div class="text-[11px] font-black font-mono" :class="score.hasReserveBonus ? 'text-[#4ADE80]' : 'text-slate-400'">
            {{ score.hasReserveBonus ? 'Maintained' : 'Exhausted' }}
          </div>
        </div>
        <span class="text-[9px] font-mono font-bold" :class="score.hasReserveBonus ? 'text-[#4ADE80]' : 'text-slate-500'">
          {{ score.hasReserveBonus ? '+1 pt' : '0 pt' }}
        </span>
      </div>

      <!-- Load Shedding Penalty -->
      <div class="bg-[#091B2E] px-1.5 py-0.5 rounded border border-slate-700/80 flex items-center justify-between">
        <div>
          <div class="text-[8px] uppercase font-bold text-slate-300">Load Shed Cut</div>
          <div class="text-[11px] font-black font-mono" :class="score.loadShedTokens > 0 ? 'text-[#FDA4AF]' : 'text-white'">
            {{ score.loadShedTokens }} Tok ({{ score.loadShedTokens * 10 }}MW)
          </div>
        </div>
        <span class="text-[9px] font-mono font-bold" :class="score.loadShedPenalty > 0 ? 'text-[#FDA4AF]' : 'text-slate-500'">
          {{ score.loadShedPenalty > 0 ? `-${score.loadShedPenalty} pt` : '0 pt' }}
        </span>
      </div>

      <!-- Gas Ramp Delta -->
      <div class="bg-[#091B2E] px-1.5 py-0.5 rounded border border-slate-700/80 flex items-center justify-between">
        <div>
          <div class="text-[8px] uppercase font-bold text-slate-300">Gas Ramp Check</div>
          <div class="text-[9px] font-mono font-bold text-slate-200">
            E:{{ score.egbinChange }} · G:{{ score.gereguChange }}
          </div>
        </div>
        <span class="text-[9px] font-mono font-bold" :class="score.gasRampViolated ? 'text-rose-400' : 'text-[#4ADE80]'">
          {{ score.gasRampViolated ? 'Fail' : 'Pass ✓' }}
        </span>
      </div>

    </div>

  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
