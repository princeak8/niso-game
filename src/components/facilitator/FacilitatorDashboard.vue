<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameState } from '../../composables/useGameState';
import { useWebAudioSynth } from '../../composables/useWebAudioSynth';
import SolutionKeyModal from './SolutionKeyModal.vue';

const game = useGameState();
const synth = useWebAudioSynth();

const showSolutionModal = ref(false);
const newTeamName = ref('');
const selectedRoundToScore = ref(game.currentRound.value.id);

// Score override state for facilitator disputes
const overrideTeamId = ref<string | null>(null);
const overrideScoreValue = ref(0);

function handleAddTeam() {
  if (!newTeamName.value.trim()) return;
  const id = `t${game.teams.value.length + 1}`;
  game.teams.value.push({
    id,
    name: newTeamName.value.trim(),
    scores: {},
    totalScore: 0,
    tournamentPoints: 3,
  });
  newTeamName.value = '';
  game.recalculateTeamTotals();
}

function handleRingBell() {
  synth.playBell();
  game.lockRound('Facilitator Bell Rang: Hands off!');
}

function handleTriggerTrip() {
  game.egbinTokens.value = 0;
  synth.playTripAlarm();
  game.activeEvent.value = {
    title: 'Gas A (Egbin) Trips!',
    badge: 'CRITICAL EVENT',
    description: 'Facilitator injected contingency: Egbin Gas Power Station has tripped offline immediately (0 MW)!',
  };
  game.showEventModal.value = true;
}

function setOverrideScore(teamId: string, roundId: number) {
  const team = game.teams.value.find(t => t.id === teamId);
  if (!team) return;
  const existing = team.scores[roundId];
  if (existing) {
    existing.finalScore = overrideScoreValue.value;
    game.recalculateTeamTotals();
  }
  overrideTeamId.value = null;
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- Facilitator Master Control Deck -->
    <div class="bg-[#0B1E33] border border-[#0D626C]/40 rounded-2xl p-4 shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-700/60">
        <div>
          <div class="text-[10px] font-bold uppercase tracking-wider text-teal-300">
            Facilitator Master Deck
          </div>
          <h2 class="text-xl md:text-2xl font-black text-white">
            Grid Inspector Command & Scoring Console
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="showSolutionModal = true"
            class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition"
          >
            <span>🔑</span>
            <span>View Solution Key</span>
          </button>

          <button
            type="button"
            @click="handleRingBell"
            class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition"
          >
            <span>🔔</span>
            <span>Ring Bell: "Hands Off!"</span>
          </button>
        </div>
      </div>

      <!-- Orchestrator Controls Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        
        <!-- Round Selector -->
        <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div class="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
            1. Orchestrate Active Round
          </div>
          <select
            :value="game.currentRoundIndex.value"
            @change="e => game.initializeRound(Number((e.target as HTMLSelectElement).value))"
            class="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs font-bold font-mono focus:ring-2 focus:ring-teal-500"
          >
            <option
              v-for="(r, idx) in game.ROUNDS"
              :key="r.id"
              :value="idx"
            >
              {{ r.name }} ({{ r.timeOfDay }}) - Demand: {{ r.demandMW }}MW
            </option>
          </select>
          <div class="mt-2 text-[11px] text-teal-300 font-medium">
            Tokens Needed: <strong>{{ game.currentRound.value.tokensNeeded }}</strong> ({{ game.currentRound.value.tokensNeeded * 10 }} MW)
          </div>
        </div>

        <!-- 2-Minute Timer Controls -->
        <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div class="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
            2. Round Timer (2:00 Minutes)
          </div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-2xl font-black font-mono text-teal-300">
              {{ Math.floor(game.timerSeconds.value / 60) }}:{{ (game.timerSeconds.value % 60) < 10 ? '0' : '' }}{{ game.timerSeconds.value % 60 }}
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase" :class="game.isLocked.value ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'">
              {{ game.isLocked.value ? 'Locked (Hands Off)' : game.timerRunning.value ? 'Running' : 'Paused' }}
            </span>
          </div>
          <div class="flex gap-1.5">
            <button
              type="button"
              @click="game.startTimer"
              class="flex-1 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs"
            >
              Start
            </button>
            <button
              type="button"
              @click="game.pauseTimer"
              class="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              Pause
            </button>
            <button
              type="button"
              @click="game.resetTimer"
              class="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              Reset
            </button>
          </div>
        </div>

        <!-- Manual Event Injections -->
        <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div class="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
            3. In-Game Contingency Injections
          </div>
          <div class="flex flex-col gap-1.5">
            <button
              type="button"
              @click="handleTriggerTrip"
              class="py-1.5 px-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-bold text-xs text-left flex items-center justify-between"
            >
              <span>🚨 Inject Egbin Gas Trip (R3)</span>
              <span class="text-[10px] font-mono">0 MW</span>
            </button>
            <button
              type="button"
              @click="game.advanceNextRound"
              class="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs text-left flex items-center justify-between"
            >
              <span>Advance to Next Round</span>
              <span class="text-[10px]">→</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Multi-Team Tournament Scoreboard & Inspector Sheets -->
    <div class="bg-[#0B1E33] border border-[#0D626C]/40 rounded-2xl p-4 shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
        <div>
          <h3 class="text-lg font-black text-white uppercase tracking-tight">
            Multi-Team Tournament Standings & Inspector Sheet
          </h3>
          <p class="text-xs text-slate-400">
            Official ranking awarded at the end: 1st (10 pts), 2nd (7 pts), 3rd (5 pts), Others (3 pts).
          </p>
        </div>

        <!-- Add Team Form -->
        <div class="flex items-center gap-2">
          <input
            v-model="newTeamName"
            type="text"
            placeholder="New Team Name..."
            class="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-teal-500"
            @keyup.enter="handleAddTeam"
          />
          <button
            type="button"
            @click="handleAddTeam"
            class="px-3 py-1.5 rounded-lg bg-[#0D626C] hover:bg-[#0A4D54] text-white font-bold text-xs"
          >
            + Add Team
          </button>
        </div>
      </div>

      <!-- Leaderboard & Score Table -->
      <div class="overflow-x-auto mt-4 rounded-xl border border-slate-800">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-950/80 text-slate-300 text-[10px] uppercase font-bold border-b border-slate-800">
              <th class="p-3">Rank</th>
              <th class="p-3">Team</th>
              <th class="p-3 text-center">Practice</th>
              <th class="p-3 text-center">R1</th>
              <th class="p-3 text-center">R2</th>
              <th class="p-3 text-center">R3 (Trip)</th>
              <th class="p-3 text-center">R4 (Restart)</th>
              <th class="p-3 text-center">R5 (Peak)</th>
              <th class="p-3 text-center">R6 (Outage)</th>
              <th class="p-3 text-center font-black text-teal-300">Total Game Pts</th>
              <th class="p-3 text-center font-black text-amber-300">Tournament Rank Pts</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80 text-xs font-mono">
            <tr
              v-for="team in game.teams.value"
              :key="team.id"
              class="hover:bg-slate-800/30 transition"
              :class="{ 'bg-teal-950/20': team.rank === 1 }"
            >
              <!-- Rank Badge -->
              <td class="p-3 font-sans font-black">
                <span
                  class="w-6 h-6 rounded-full inline-flex items-center justify-center text-xs"
                  :class="[
                    team.rank === 1 ? 'bg-amber-500 text-black shadow-md' :
                    team.rank === 2 ? 'bg-slate-300 text-black' :
                    team.rank === 3 ? 'bg-amber-700 text-white' :
                    'bg-slate-800 text-slate-400'
                  ]"
                >
                  {{ team.rank || '-' }}
                </span>
              </td>

              <!-- Team Name -->
              <td class="p-3 font-sans font-bold text-slate-100">
                {{ team.name }}
              </td>

              <!-- Scores per Round (0 to 6) -->
              <td
                v-for="roundId in [0, 1, 2, 3, 4, 5, 6]"
                :key="roundId"
                class="p-3 text-center"
              >
                <div v-if="team.scores[roundId]" class="flex flex-col items-center">
                  <span
                    class="font-bold text-xs"
                    :class="team.scores[roundId]?.finalScore === 0 ? 'text-rose-400' : 'text-slate-100'"
                  >
                    {{ roundId === 0 ? '✓' : `+${team.scores[roundId]?.finalScore}` }}
                  </span>
                  
                  <!-- Dispute Override Button -->
                  <button
                    type="button"
                    @click="overrideTeamId = team.id; selectedRoundToScore = roundId; overrideScoreValue = team.scores[roundId]?.finalScore || 0"
                    title="Facilitator Override Dispute"
                    class="text-[9px] text-slate-500 hover:text-teal-300 underline font-sans"
                  >
                    adj
                  </button>
                </div>
                <span v-else class="text-slate-600 font-sans text-[11px]">-</span>
              </td>

              <!-- Total Game Points -->
              <td class="p-3 text-center font-black text-sm text-teal-300">
                {{ team.totalScore }}
              </td>

              <!-- Tournament Points Allocated -->
              <td class="p-3 text-center font-black text-sm text-amber-300">
                {{ team.tournamentPoints }} pts
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Facilitator Dispute Arbiter Drawer if override clicked -->
      <div
        v-if="overrideTeamId"
        class="mt-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-100 text-xs flex flex-wrap items-center justify-between gap-3 animate-fadeIn"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg">⚖️</span>
          <div>
            <div class="font-bold uppercase tracking-wider text-amber-300">
              Facilitator Dispute Arbiter:
            </div>
            <span>
              Adjusting Round {{ selectedRoundToScore }} Score for
              <strong>{{ game.teams.value.find(t => t.id === overrideTeamId)?.name }}</strong>
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model.number="overrideScoreValue"
            type="number"
            min="0"
            max="4"
            class="w-16 bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 text-center font-mono font-bold"
          />
          <button
            type="button"
            @click="setOverrideScore(overrideTeamId, selectedRoundToScore)"
            class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
          >
            Confirm Override
          </button>
          <button
            type="button"
            @click="overrideTeamId = null"
            class="px-2 py-1.5 text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>

    </div>

    <!-- Solution Key Modal -->
    <SolutionKeyModal
      :show="showSolutionModal"
      @close="showSolutionModal = false"
    />

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
