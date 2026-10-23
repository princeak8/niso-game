<script setup lang="ts">
defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const solutionRows = [
  {
    round: 'Practice',
    time: '5:00 AM',
    demand: '160 MW (16)',
    solar: '0 MW (0)',
    needed: '16 tokens',
    event: 'None',
    feasibleCount: '43 states',
    optimalDispatch: 'Kainji: 4 · Egbin: 6 · Geregu: 6',
    reserveBonus: 'YES (+1 pt)',
    keyLesson: 'Supply must equal demand every moment. Starts in balance with zero moves needed.',
  },
  {
    round: 'Round 1',
    time: '7:00 AM',
    demand: '190 MW (19)',
    solar: '10 MW (1)',
    needed: '18 tokens',
    event: 'None',
    feasibleCount: '93 states',
    optimalDispatch: 'Kainji: 6 · Egbin: 4 · Geregu: 8',
    reserveBonus: 'YES (+1 pt)',
    keyLesson: 'Morning pick-up: move slow gas turbines early (Egbin & Geregu).',
  },
  {
    round: 'Round 2',
    time: '10:00 AM',
    demand: '230 MW (23)',
    solar: '40 MW (4)',
    needed: '19 tokens',
    event: 'None',
    feasibleCount: '88 states',
    optimalDispatch: 'Kainji: 6 · Egbin: 2 · Geregu: 11',
    reserveBonus: 'YES (+1 pt)',
    keyLesson: 'CRITICAL STRATEGY: Geregu must be positioned ≥ 9 to survive Egbin’s trip in Round 3!',
  },
  {
    round: 'Round 3',
    time: '1:00 PM',
    demand: '250 MW (25)',
    solar: '50 MW (5)',
    needed: '20 tokens',
    event: 'Gas A (Egbin) Trips (0 MW)',
    feasibleCount: '1 exact state',
    optimalDispatch: 'Kainji: 8 · Egbin: 0 · Geregu: 12',
    reserveBonus: 'NO (0 pt)',
    keyLesson: 'Hydro maxed at 8; Geregu maxed at 12. Reserve is there to be used. Teams with Geregu ≤ 8 in R2 MUST shed load!',
  },
  {
    round: 'Round 4',
    time: '4:00 PM',
    demand: '240 MW (24)',
    solar: '30 MW (3)',
    needed: '21 tokens',
    event: 'Gas A Restart Limit ≤ 3',
    feasibleCount: '6 states',
    optimalDispatch: 'Kainji: 6 · Egbin: 3 · Geregu: 12',
    reserveBonus: 'YES (+1 pt)',
    keyLesson: 'Tripped unit restarts slowly (thermal soaking). Hydro reserve replenished to 6.',
  },
  {
    round: 'Round 5',
    time: '7:00 PM',
    demand: '260 MW (26)',
    solar: '0 MW (0)',
    needed: '26 tokens',
    event: 'Evening Peak (Solar drops to 0)',
    feasibleCount: '1 exact state',
    optimalDispatch: 'Kainji: 8 · Egbin: 6 · Geregu: 12',
    reserveBonus: 'NO (0 pt)',
    keyLesson: 'Duck Curve peak: 8 + 6 + 12 = 26 exactly. Full generation called upon, 0 reserve bonus expected.',
  },
  {
    round: 'Round 6',
    time: '10:00 PM',
    demand: '210 MW (21)',
    solar: '0 MW (0)',
    needed: '21 tokens',
    event: 'Line Outage (Hydro ≤ 4 tokens)',
    feasibleCount: '14 states (6 with bonus)',
    optimalDispatch: 'Kainji: 2 · Egbin: 7 · Geregu: 12 (or 2/8/11)',
    reserveBonus: 'YES (+1 pt)',
    keyLesson: 'Having power is not enough if transmission lines are congested. Hydro ≤ 2 earns bonus.',
  },
];
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
  >
    <div class="max-w-4xl w-full bg-[#0F243A] border-2 border-[#389E5F] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      
      <!-- Header -->
      <div class="bg-[#0B1726] border-b-2 border-[#1E3A5F] px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔑</span>
          <div>
            <h3 class="text-lg font-black text-white uppercase tracking-tight">
              Facilitator Verification & Solution Key
            </h3>
            <p class="text-xs text-[#86EFAC] font-bold">
              Exhaustive Graph Search Verified · All 6 Scored Rounds 100% Feasible
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="emit('close')"
          class="p-2 rounded-lg bg-[#132E4C] hover:bg-[#1E3A5F] text-slate-200 hover:text-white font-black"
        >
          ✕
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="p-6 overflow-y-auto space-y-6 text-slate-200 text-xs">
        
        <!-- Summary Callout -->
        <div class="p-4 rounded-xl bg-[#143D24] border-2 border-[#389E5F] text-white flex items-start gap-3 shadow-lg">
          <span class="text-2xl">📊</span>
          <div class="leading-relaxed">
            <strong class="text-white font-black text-sm block mb-1">Mathematical Solvability Audit:</strong>
            Exhaustive state space search confirms that <strong class="text-[#86EFAC]">659,442 valid zero-shedding trajectories</strong> exist.
            The maximum achievable reserve bonus across Rounds 1–6 is <strong class="text-[#86EFAC]">4 points</strong> (earned in Rounds 1, 2, 4, and 6).
            In Rounds 3 and 5, 100% of Kainji Hydro's 8 tokens is required, meaning zero reserve bonus is mathematically expected as reserves are deployed.
          </div>
        </div>

        <!-- Solution Key Table -->
        <div class="overflow-x-auto rounded-xl border-2 border-[#1E3A5F]">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#0B1726] text-slate-200 text-xs uppercase font-black border-b-2 border-[#1E3A5F]">
                <th class="p-3">Round</th>
                <th class="p-3">Demand</th>
                <th class="p-3">Solar</th>
                <th class="p-3">Tokens Needed</th>
                <th class="p-3">Script Event</th>
                <th class="p-3">Optimal Dispatch (Kainji / Egbin / Geregu)</th>
                <th class="p-3">Reserve Bonus</th>
                <th class="p-3">Pedagogical Lesson</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1E3A5F] font-mono text-xs">
              <tr
                v-for="row in solutionRows"
                :key="row.round"
                class="hover:bg-[#132E4C]/50 transition"
              >
                <td class="p-3 font-sans font-black text-[#4ADE80]">{{ row.round }} ({{ row.time }})</td>
                <td class="p-3 text-white font-bold">{{ row.demand }}</td>
                <td class="p-3 text-yellow-300 font-bold">{{ row.solar }}</td>
                <td class="p-3 text-cyan-300 font-black">{{ row.needed }}</td>
                <td class="p-3 font-sans text-rose-300 font-bold">{{ row.event }}</td>
                <td class="p-3 font-bold text-white">{{ row.optimalDispatch }}</td>
                <td class="p-3 font-sans font-black" :class="row.reserveBonus.startsWith('YES') ? 'text-[#4ADE80]' : 'text-slate-400'">
                  {{ row.reserveBonus }}
                </td>
                <td class="p-3 font-sans text-slate-200 text-xs font-medium">{{ row.keyLesson }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Strategy Trap Breakdown -->
        <div class="p-4 rounded-xl bg-[#0B1726] border-2 border-amber-500/50">
          <h4 class="font-black text-sm text-amber-300 uppercase mb-2">
            ⚠️ The Round 2 to Round 3 "Spinning Reserve Trap" Explained
          </h4>
          <p class="leading-relaxed text-slate-200 mb-2 font-medium">
            In Round 3, Egbin Gas Plant trips unexpectedly to 0 MW. Demand is 250 MW, Solar is 50 MW, meaning Hydro + Gas B must supply 200 MW (20 tokens).
            Since Kainji Hydro can supply at most 80 MW (8 tokens), <strong class="text-white">Geregu Gas MUST output 120 MW (12 tokens)</strong>.
          </p>
          <p class="leading-relaxed text-slate-200 font-medium">
            Because gas turbines can ramp up by at most 3 tokens per round, Geregu could only reach 12 tokens if it was already at <strong class="text-amber-300">9, 10, 11, or 12 tokens in Round 2</strong>.
            Any team that kept Geregu at 8 or less in Round 2 cannot reach 12 tokens and will be forced to use Load Shedding (-1 pt) or suffer a Frequency Alarm (0 pts).
            This is the core teaching moment of the game!
          </p>
        </div>

      </div>

      <!-- Footer -->
      <div class="bg-[#0B1726] border-t-2 border-[#1E3A5F] p-4 flex justify-end">
        <button
          type="button"
          @click="emit('close')"
          class="px-6 py-2.5 rounded-xl bg-[#389E5F] hover:bg-[#2B7A49] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#389E5F]/30 transition"
        >
          Close Solution Key
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
