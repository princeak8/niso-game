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
  <div class="bg-[#0B1E33] border-2 border-teal-500/50 rounded-2xl p-5 shadow-2xl mt-6 animate-fadeIn">
    
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
      <div>
        <div class="text-[10px] font-bold uppercase tracking-wider text-teal-300">
          Grid Inspector Official Round Report
        </div>
        <h3 class="text-xl font-black text-white">
          {{ score.roundName }} Evaluation
        </h3>
      </div>

      <div class="text-right">
        <span class="text-xs uppercase font-bold text-slate-400">Round Score</span>
        <div class="text-3xl font-black font-mono text-teal-300">
          {{ isPractice ? 'PRACTICE' : `+${score.finalScore} PTS` }}
        </div>
      </div>
    </div>

    <!-- Frequency Alarm Banner if gap >= 3 -->
    <div
      v-if="score.isFrequencyAlarm"
      class="mt-4 p-3 rounded-xl bg-rose-600 text-white font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 animate-pulse border-2 border-rose-300"
    >
      <span>🚨</span>
      <span>FREQUENCY ALARM! Severe generation imbalance (≥ 30 MW gap). System frequency destabilized! (0 Points)</span>
      <span>🚨</span>
    </div>

    <!-- Gas Ramp Violation Banner if violated -->
    <div
      v-if="score.gasRampViolated"
      class="mt-4 p-3 rounded-xl bg-rose-950 border border-rose-500 text-rose-200 font-bold text-sm text-center"
    >
      ⚠️ <strong>GAS RAMP RULE VIOLATION:</strong> Gas units moved by more than 3 tokens! Rule penalty applied: <strong>0 points for this round</strong>.
    </div>

    <!-- Detailed Score Breakdown Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
      
      <!-- Base Match Score -->
      <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <div class="text-[10px] uppercase font-bold text-slate-400">Generation vs Demand</div>
        <div class="text-lg font-black font-mono mt-0.5" :class="score.gapTokens === 0 ? 'text-emerald-400' : 'text-amber-400'">
          {{ score.gapTokens === 0 ? 'Exact Match' : `${score.gapTokens} Off (${score.gapMW} MW)` }}
        </div>
        <div class="text-xs font-bold text-teal-300 font-mono mt-0.5">
          {{ score.baseMatchPoints }} / 3 pts
        </div>
      </div>

      <!-- Reserve Bonus -->
      <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <div class="text-[10px] uppercase font-bold text-slate-400">Spinning Reserve</div>
        <div class="text-lg font-black font-mono mt-0.5" :class="score.hasReserveBonus ? 'text-emerald-400' : 'text-slate-400'">
          {{ score.hasReserveBonus ? 'Maintained' : 'Exhausted' }}
        </div>
        <div class="text-xs font-bold font-mono mt-0.5" :class="score.hasReserveBonus ? 'text-emerald-400' : 'text-slate-500'">
          {{ score.hasReserveBonus ? '+1 Bonus Pt' : '0 Bonus' }}
        </div>
      </div>

      <!-- Load Shedding Penalty -->
      <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <div class="text-[10px] uppercase font-bold text-slate-400">Load Shedding Cut</div>
        <div class="text-lg font-black font-mono mt-0.5" :class="score.loadShedTokens > 0 ? 'text-rose-400' : 'text-slate-300'">
          {{ score.loadShedTokens }} Tokens ({{ score.loadShedTokens * 10 }} MW)
        </div>
        <div class="text-xs font-bold font-mono mt-0.5" :class="score.loadShedTokens > 0 ? 'text-rose-400' : 'text-slate-500'">
          {{ score.loadShedPenalty > 0 ? `-${score.loadShedPenalty} Pt` : '0 Penalty' }}
        </div>
      </div>

      <!-- Gas Ramp Delta -->
      <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
        <div class="text-[10px] uppercase font-bold text-slate-400">Gas Ramp Check</div>
        <div class="text-xs font-mono mt-0.5 text-slate-200">
          Egbin: {{ score.egbinChange }} · Geregu: {{ score.gereguChange }}
        </div>
        <div class="text-xs font-bold font-mono mt-1" :class="score.gasRampViolated ? 'text-rose-400' : 'text-emerald-400'">
          {{ score.gasRampViolated ? 'VIOLATED (0 PTS)' : 'Within ±3 tokens ✓' }}
        </div>
      </div>

    </div>

    <!-- Official Teaching Line (from Guide) -->
    <div class="p-4 rounded-xl bg-teal-950/40 border border-teal-500/40 text-teal-100 my-4">
      <div class="text-[10px] font-black uppercase tracking-widest text-teal-300 mb-1">
        Teaching Line From NISO Facilitator:
      </div>
      <p class="text-base md:text-lg font-bold italic tracking-tight text-white leading-snug">
        "{{ score.teachingLine }}"
      </p>
    </div>

    <!-- Action Button to Advance -->
    <div class="flex justify-end mt-4">
      <button
        v-if="hasNextRound"
        type="button"
        @click="emit('advance')"
        class="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0D626C] hover:bg-[#0A4D54] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg border border-teal-400/40 flex items-center justify-center gap-2 transition active:scale-95"
      >
        <span>Advance to Next Round</span>
        <span>→</span>
      </button>

      <div v-else class="text-center sm:text-right">
        <span class="text-sm font-bold text-amber-300">
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
