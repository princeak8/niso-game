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
    <div class="bg-[#0F243A] border-2 border-[#1E3A5F] rounded-xl p-3.5 sm:p-4 shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#1E3A5F]">
        <div>
          <div class="text-xs font-black uppercase tracking-wider text-[#86EFAC]">
            Facilitator Master Deck
          </div>
          <h2 class="text-lg md:text-xl font-black text-white">
            Grid Inspector Command & Scoring Console
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="showSolutionModal = true"
            class="px-3 py-1.5 rounded-lg bg-[#389E5F] hover:bg-[#2B7A49] text-white font-black text-xs uppercase tracking-wider shadow flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <span>🔑</span>
            <span>Solution Key</span>
          </button>

          <button
            type="button"
            @click="handleRingBell"
            class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider shadow flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <span>🔔</span>
            <span>Ring Bell: "Hands Off!"</span>
          </button>
        </div>
      </div>

      <!-- 1. Horizontal Round Selector Bar -->
      <div class="bg-[#0B1726] p-2.5 rounded-xl border border-[#1E3A5F] mt-3 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-black uppercase tracking-wider text-slate-200 shrink-0">
            1. Orchestrate Round:
          </span>
          <div class="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
            <button
              v-for="(r, idx) in game.ROUNDS"
              :key="r.id"
              type="button"
              @click="game.initializeRound(idx)"
              class="py-1 px-2.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
              :class="game.currentRoundIndex.value === idx
                ? 'bg-[#389E5F] text-white border-[#BBF7D0] font-black shadow-md shadow-[#389E5F]/30'
                : 'bg-[#0F243A] text-slate-300 border-[#1E3A5F] hover:text-white hover:border-slate-500'"
            >
              <span class="font-black">{{ r.isPractice ? 'Practice' : `Round ${r.id}` }}</span>
              <span class="text-[10px] font-mono opacity-80">{{ r.timeOfDay }}</span>
              <span class="text-[10px] font-mono font-bold" :class="game.currentRoundIndex.value === idx ? 'text-[#BBF7D0]' : 'text-[#86EFAC]'">
                {{ r.demandMW }}MW
              </span>
            </button>
          </div>
        </div>

        <div class="text-xs text-[#86EFAC] font-bold shrink-0 bg-[#143D24] px-2.5 py-1 rounded-lg border border-[#389E5F]/50">
          Tokens Needed: <strong class="text-white font-mono">{{ game.currentRound.value.tokensNeeded }}</strong> ({{ game.currentRound.value.tokensNeeded * 10 }} MW)
        </div>
      </div>

      <!-- 2. Controls Grid: Timer & In-Game Contingencies -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        
        <!-- 2-Minute Timer Controls -->
        <div class="bg-[#0B1726] p-3 rounded-xl border border-[#1E3A5F] flex flex-col justify-between">
          <div class="flex items-center justify-between mb-1.5">
            <div class="text-xs font-black uppercase text-slate-200">
              2. Round Timer (2:00 Minutes)
            </div>
            <span class="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide" :class="game.isLocked.value ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-[#143D24] text-[#4ADE80] border border-[#389E5F]/50'">
              {{ game.isLocked.value ? 'Locked (Hands Off)' : game.timerRunning.value ? 'Running' : 'Paused' }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-3">
            <span class="text-2xl sm:text-3xl font-black font-mono text-[#4ADE80] leading-none">
              {{ Math.floor(game.timerSeconds.value / 60) }}:{{ (game.timerSeconds.value % 60) < 10 ? '0' : '' }}{{ game.timerSeconds.value % 60 }}
            </span>
            <div class="flex gap-1.5 flex-1 max-w-xs">
              <button
                type="button"
                @click="game.startTimer"
                class="flex-1 py-1.5 rounded-lg bg-[#389E5F] hover:bg-[#2B7A49] text-white font-black text-xs uppercase shadow transition cursor-pointer"
              >
                Start
              </button>
              <button
                type="button"
                @click="game.pauseTimer"
                class="flex-1 py-1.5 rounded-lg bg-[#132E4C] hover:bg-[#1E3A5F] text-white font-bold text-xs uppercase transition cursor-pointer"
              >
                Pause
              </button>
              <button
                type="button"
                @click="game.resetTimer"
                class="flex-1 py-1.5 rounded-lg bg-[#132E4C] hover:bg-[#1E3A5F] text-slate-200 font-bold text-xs uppercase transition cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Manual Event Injections -->
        <div class="bg-[#0B1726] p-3 rounded-xl border border-[#1E3A5F] flex flex-col justify-between">
          <div class="text-xs font-black uppercase text-slate-200 mb-1.5">
            3. In-Game Contingency Injections
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              @click="handleTriggerTrip"
              class="py-1.5 px-2.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/60 text-white font-black text-xs flex items-center justify-between transition cursor-pointer"
            >
              <span>🚨 Inject Egbin Trip (R3)</span>
              <span class="text-[10px] font-mono font-bold bg-rose-900 px-1 py-0.2 rounded">0MW</span>
            </button>
            <button
              type="button"
              @click="game.advanceNextRound"
              class="py-1.5 px-2.5 rounded-lg bg-[#132E4C] hover:bg-[#1E3A5F] border border-[#1E3A5F] text-white font-bold text-xs flex items-center justify-between transition cursor-pointer"
            >
              <span>Advance Next Round</span>
              <span class="text-sm font-bold">→</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Multi-Team Tournament Scoreboard & Inspector Sheets -->
    <div class="bg-[#0F243A] border-2 border-[#1E3A5F] rounded-2xl p-5 shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-[#1E3A5F]">
        <div>
          <h3 class="text-lg font-black text-white uppercase tracking-tight">
            Multi-Team Tournament Standings & Inspector Sheet
          </h3>
          <p class="text-xs text-slate-300 font-medium">
            Official ranking awarded at the end: 1st (10 pts), 2nd (7 pts), 3rd (5 pts), Others (3 pts).
          </p>
        </div>

        <!-- Add Team Form -->
        <div class="flex items-center gap-2">
          <input
            v-model="newTeamName"
            type="text"
            placeholder="New Team Name..."
            class="bg-[#0B1726] border-2 border-[#1E3A5F] text-white rounded-lg px-3 py-1.5 text-xs font-bold focus:border-[#389E5F] focus:ring-2 focus:ring-[#389E5F]"
            @keyup.enter="handleAddTeam"
          />
          <button
            type="button"
            @click="handleAddTeam"
            class="px-4 py-2 rounded-lg bg-[#389E5F] hover:bg-[#2B7A49] text-white font-black text-xs uppercase shadow-md transition"
          >
            + Add Team
          </button>
        </div>
      </div>

      <!-- Leaderboard & Score Table -->
      <div class="overflow-x-auto mt-4 rounded-xl border-2 border-[#1E3A5F]">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#0B1726] text-slate-200 text-xs uppercase font-black border-b-2 border-[#1E3A5F]">
              <th class="p-3">Rank</th>
              <th class="p-3">Team</th>
              <th class="p-3 text-center">Practice</th>
              <th class="p-3 text-center">R1</th>
              <th class="p-3 text-center">R2</th>
              <th class="p-3 text-center">R3 (Trip)</th>
              <th class="p-3 text-center">R4 (Restart)</th>
              <th class="p-3 text-center">R5 (Peak)</th>
              <th class="p-3 text-center">R6 (Outage)</th>
              <th class="p-3 text-center font-black text-[#4ADE80]">Total Game Pts</th>
              <th class="p-3 text-center font-black text-amber-300">Tournament Rank Pts</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#1E3A5F] text-xs font-mono">
            <tr
              v-for="team in game.teams.value"
              :key="team.id"
              class="hover:bg-[#132E4C]/50 transition"
              :class="{ 'bg-[#143D24]/40': team.rank === 1 }"
            >
              <!-- Rank Badge -->
              <td class="p-3 font-sans font-black">
                <span
                  class="w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-black shadow"
                  :class="[
                    team.rank === 1 ? 'bg-amber-400 text-black font-black ring-2 ring-amber-300 shadow-md' :
                    team.rank === 2 ? 'bg-slate-200 text-black font-black' :
                    team.rank === 3 ? 'bg-amber-700 text-white font-bold' :
                    'bg-[#0B1726] text-slate-300 border border-slate-700 font-bold'
                  ]"
                >
                  {{ team.rank || '-' }}
                </span>
              </td>

              <!-- Team Name -->
              <td class="p-3 font-sans font-black text-white text-sm">
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
                    class="font-black text-xs"
                    :class="team.scores[roundId]?.finalScore === 0 ? 'text-rose-400' : 'text-white'"
                  >
                    {{ roundId === 0 ? '✓' : `+${team.scores[roundId]?.finalScore}` }}
                  </span>
                  
                  <!-- Dispute Override Button -->
                  <button
                    type="button"
                    @click="overrideTeamId = team.id; selectedRoundToScore = roundId; overrideScoreValue = team.scores[roundId]?.finalScore || 0"
                    title="Facilitator Override Dispute"
                    class="text-[10px] text-slate-400 hover:text-[#4ADE80] underline font-sans font-bold"
                  >
                    adj
                  </button>
                </div>
                <span v-else class="text-slate-500 font-sans text-xs font-bold">-</span>
              </td>

              <!-- Total Game Points -->
              <td class="p-3 text-center font-black text-base text-[#4ADE80]">
                {{ team.totalScore }}
              </td>

              <!-- Tournament Points Allocated -->
              <td class="p-3 text-center font-black text-base text-amber-300">
                {{ team.tournamentPoints }} pts
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Facilitator Dispute Arbiter Drawer if override clicked -->
      <div
        v-if="overrideTeamId"
        class="mt-4 p-4 rounded-xl bg-amber-950/40 border-2 border-amber-500/60 text-amber-100 text-xs flex flex-wrap items-center justify-between gap-3 animate-fadeIn"
      >
        <div class="flex items-center gap-2">
          <span class="text-2xl">⚖️</span>
          <div>
            <div class="font-black uppercase tracking-wider text-amber-300 text-xs">
              Facilitator Dispute Arbiter:
            </div>
            <span class="font-medium text-slate-200">
              Adjusting Round {{ selectedRoundToScore }} Score for
              <strong class="text-white">{{ game.teams.value.find(t => t.id === overrideTeamId)?.name }}</strong>
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model.number="overrideScoreValue"
            type="number"
            min="0"
            max="4"
            class="w-16 bg-[#0B1726] border-2 border-amber-500 text-white rounded-lg p-1.5 text-center font-mono font-black text-sm"
          />
          <button
            type="button"
            @click="setOverrideScore(overrideTeamId, selectedRoundToScore)"
            class="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase shadow transition"
          >
            Confirm Override
          </button>
          <button
            type="button"
            @click="overrideTeamId = null"
            class="px-3 py-2 text-slate-300 hover:text-white font-bold"
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
