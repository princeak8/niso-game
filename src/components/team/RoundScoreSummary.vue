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
  <div class="bg-[#132E4C] border-2 border-[#389E5F] rounded-2xl p-5 md:p-6 shadow-2xl mt-6 animate-fadeIn">
    
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b-2 border-slate-700">
      <div>
        <div class="text-xs font-black uppercase tracking-wider text-[#86EFAC]">
          Grid Inspector Official Round Report
        </div>
        <h3 class="text-2xl font-black text-white mt-0.5">
          {{ score.roundName }} Evaluation
        </h3>
      </div>

      <div class="text-right">
        <span class="text-xs uppercase font-black text-[#CBD5E1]">Round Score</span>
        <div class="text-3xl md:text-4xl font-black font-mono text-[#4ADE80]">
          {{ isPractice ? 'PRACTICE' : `+${score.finalScore} PTS` }}
        </div>
      </div>
    </div>

    <!-- Frequency Alarm Banner if gap >= 3 -->
    <div
      v-if="score.isFrequencyAlarm"
      class="mt-4 p-3.5 rounded-xl bg-rose-600 text-white font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 animate-pulse border-2 border-rose-300"
    >
      <span>🚨</span>
      <span>FREQUENCY ALARM! Severe generation imbalance (≥ 30 MW gap). System frequency destabilized! (0 Points)</span>
      <span>🚨</span>
    </div>

    <!-- Gas Ramp Violation Banner if violated -->
    <div
      v-if="score.gasRampViolated"
      class="mt-4 p-3.5 rounded-xl bg-rose-950 border-2 border-rose-500 text-rose-100 font-black text-sm text-center"
    >
      ⚠️ <strong>GAS RAMP RULE VIOLATION:</strong> Gas units moved by more than 3 tokens! Rule penalty applied: <strong>0 points for this round</strong>.
    </div>

    <!-- Detailed Score Breakdown Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-5">
      
      <!-- Base Match Score -->
      <div class="bg-[#091B2E] p-3.5 rounded-xl border-2 border-slate-700">
        <div class="text-[11px] uppercase font-black text-[#CBD5E1]">Generation vs Demand</div>
        <div class="text-xl font-black font-mono mt-1" :class="score.gapTokens === 0 ? 'text-[#4ADE80]' : 'text-amber-400'">
          {{ score.gapTokens === 0 ? 'Exact Match' : `${score.gapTokens} Off (${score.gapMW} MW)` }}
        </div>
        <div class="text-xs font-black text-[#86EFAC] font-mono mt-0.5">
          {{ score.baseMatchPoints }} / 3 pts
        </div>
      </div>

      <!-- Reserve Bonus -->
      <div class="bg-[#091B2E] p-3.5 rounded-xl border-2 border-slate-700">
        <div class="text-[11px] uppercase font-black text-[#CBD5E1]">Spinning Reserve</div>
        <div class="text-xl font-black font-mono mt-1" :class="score.hasReserveBonus ? 'text-[#4ADE80]' : 'text-slate-400'">
          {{ score.hasReserveBonus ? 'Maintained' : 'Exhausted' }}
        </div>
        <div class="text-xs font-black font-mono mt-0.5" :class="score.hasReserveBonus ? 'text-[#4ADE80]' : 'text-slate-500'">
          {{ score.hasReserveBonus ? '+1 Bonus Pt' : '0 Bonus' }}
        </div>
      </div>

      <!-- Load Shedding Penalty -->
      <div class="bg-[#091B2E] p-3.5 rounded-xl border-2 border-slate-700">
        <div class="text-[11px] uppercase font-black text-[#CBD5E1]">Load Shedding Cut</div>
        <div class="text-xl font-black font-mono mt-1" :class="score.loadShedTokens > 0 ? 'text-[#FDA4AF]' : 'text-white'">
          {{ score.loadShedTokens }} Tokens ({{ score.loadShedTokens * 10 }} MW)
        </div>
        <div class="text-xs font-black font-mono mt-0.5" :class="score.loadShedTokens > 0 ? 'text-[#FDA4AF]' : 'text-slate-500'">
          {{ score.loadShedPenalty > 0 ? `-${score.loadShedPenalty} Pt` : '0 Penalty' }}
        </div>
      </div>

      <!-- Gas Ramp Delta -->
      <div class="bg-[#091B2E] p-3.5 rounded-xl border-2 border-slate-700">
        <div class="text-[11px] uppercase font-black text-[#CBD5E1]">Gas Ramp Check</div>
        <div class="text-xs font-mono font-bold mt-1 text-slate-100">
          Egbin: {{ score.egbinChange }} · Geregu: {{ score.gereguChange }}
        </div>
        <div class="text-xs font-black font-mono mt-1" :class="score.gasRampViolated ? 'text-rose-400' : 'text-[#4ADE80]'">
          {{ score.gasRampViolated ? 'VIOLATED (0 PTS)' : 'Within ±3 tokens ✓' }}
        </div>
      </div>

    </div>

    <!-- Official Teaching Line (from Guide) -->
    <div class="p-5 rounded-2xl bg-[#143D24] border-2 border-[#389E5F] text-white my-5 shadow-lg">
      <div class="text-xs font-black uppercase tracking-widest text-[#86EFAC] mb-1">
        Teaching Line From NISO Facilitator:
      </div>
      <p class="text-lg md:text-xl font-black italic tracking-tight text-white leading-snug">
        "{{ score.teachingLine }}"
      </p>
    </div>

    <!-- Action Button to Advance -->
    <div class="flex justify-end mt-4">
      <button
        v-if="hasNextRound"
        type="button"
        @click="emit('advance')"
        class="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#389E5F] hover:bg-[#2B7A49] active:bg-[#1E5C35] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-green-950/60 border-2 border-[#BBF7D0] flex items-center justify-center gap-2 transition active:scale-95"
      >
        <span>Advance to Next Round</span>
        <span>→</span>
      </button>

      <div v-else class="text-center sm:text-right">
        <span class="text-base font-black text-amber-300">
          All 6 Scored Rounds Completed! Proceed to Debrief & Tour Bridge.
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
