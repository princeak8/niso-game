<script setup lang="ts">
import { ref } from 'vue';
import { useGameState } from '../../composables/useGameState';
import { useGridFrequency } from '../../composables/useGridFrequency';
import FrequencyDashboard from './FrequencyDashboard.vue';
import StationCard from './StationCard.vue';
import TokenDepot from './TokenDepot.vue';
import LoadShedTray from './LoadShedTray.vue';
import RoundBanner from './RoundBanner.vue';
import EventPopup from './EventPopup.vue';
import RoundScoreSummary from './RoundScoreSummary.vue';

const game = useGameState();

const showTeamEditModal = ref(false);
const editTeamName = ref('');
const editDispatcherName = ref('');
const editCheckerName = ref('');
const copiedToast = ref(false);

function openEditTeam() {
  editTeamName.value = game.activeTeam.value.name;
  editDispatcherName.value = game.activeTeam.value.dispatcherName || '';
  editCheckerName.value = game.activeTeam.value.checkerName || '';
  showTeamEditModal.value = true;
}

function saveTeamEdit() {
  if (editTeamName.value.trim()) {
    game.updateActiveTeamIdentity(
      editTeamName.value.trim(),
      editDispatcherName.value.trim(),
      editCheckerName.value.trim()
    );
  }
  showTeamEditModal.value = false;
}

function handleCopyScorecard() {
  const text = game.exportTeamScoreText();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
  copiedToast.value = true;
  setTimeout(() => {
    copiedToast.value = false;
  }, 2500);
}

// Hook up frequency simulation
const frequencyEngine = useGridFrequency(
  () => game.totalGenerationMW.value,
  () => game.effectiveDemandMW.value
);

function handleDropToken(stationId: 'kainji' | 'egbin' | 'geregu') {
  if (stationId === 'kainji') game.adjustKainji(+1);
  if (stationId === 'egbin') game.adjustEgbin(+1);
  if (stationId === 'geregu') game.adjustGeregu(+1);
}

function handleDragStart(e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', 'token');
    e.dataTransfer.effectAllowed = 'move';
  }
}
</script>

<template>
  <div class="space-y-6">

    <!-- Team Identity & Local Device Status Banner -->
    <div class="bg-[#0B1E33] border border-[#0D626C]/40 rounded-2xl p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-teal-600/30 border border-teal-400/40 flex items-center justify-center text-lg">
          👥
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold uppercase text-slate-400">Playing on this device as:</span>
            <select
              :value="game.activeTeamId.value"
              @change="e => game.switchActiveTeam((e.target as HTMLSelectElement).value)"
              class="bg-slate-900 border border-slate-700 text-teal-300 font-extrabold text-xs rounded-lg px-2 py-0.5 focus:ring-1 focus:ring-teal-400"
            >
              <option v-for="t in game.teams.value" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>
            <button
              type="button"
              @click="openEditTeam"
              class="text-[11px] text-teal-400 hover:text-teal-200 underline font-semibold"
            >
              ✎ Edit Name / Roles
            </button>
          </div>
          <div class="text-[11px] text-slate-300 font-mono mt-0.5 flex items-center gap-2">
            <span>Dispatcher: <strong class="text-white">{{ game.activeTeam.value.dispatcherName || 'Unassigned' }}</strong></span>
            <span>·</span>
            <span>Checker: <strong class="text-white">{{ game.activeTeam.value.checkerName || 'Unassigned' }}</strong></span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="handleCopyScorecard"
          class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
          title="Copy text scorecard to share with Inspector or WhatsApp"
        >
          <span>📋</span>
          <span>{{ copiedToast ? 'Copied to Clipboard!' : 'Copy Scorecard' }}</span>
        </button>

        <span class="text-[10px] text-slate-400 italic hidden md:inline">
          Auto-saved to device (no DB needed)
        </span>
      </div>
    </div>
    
    <!-- Flip-Chart Style Round Progression Breadcrumb -->
    <div class="bg-[#0B1E33] border border-[#0D626C]/40 rounded-2xl p-3 shadow-md overflow-x-auto">
      <div class="flex items-center justify-between min-w-[680px] gap-2 text-xs">
        <button
          v-for="(r, idx) in game.ROUNDS"
          :key="r.id"
          type="button"
          @click="game.initializeRound(idx)"
          class="flex-1 py-2 px-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5"
          :class="[
            game.currentRoundIndex.value === idx
              ? 'bg-[#0D626C] text-white border-teal-300 font-black shadow-lg scale-102'
              : game.roundScores.value[r.id]
              ? 'bg-slate-900/90 text-teal-300 border-teal-500/40 hover:bg-slate-800'
              : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
          ]"
        >
          <div class="font-bold uppercase text-[10px] tracking-tight">
            {{ r.isPractice ? 'Practice' : `Round ${r.id}` }}
          </div>
          <div class="font-mono text-[11px] font-semibold">
            {{ r.timeOfDay }}
          </div>
          <div class="text-[9px] font-mono mt-0.5" :class="game.roundScores.value[r.id] ? 'text-emerald-400 font-bold' : 'text-slate-500'">
            {{ game.roundScores.value[r.id] ? (r.isPractice ? 'Done' : `+${game.roundScores.value[r.id]?.finalScore} pts`) : `${r.demandMW}MW` }}
          </div>
        </button>
      </div>
    </div>

    <!-- Practice Round Guidance Walkthrough Card (If in Practice) -->
    <div
      v-if="game.currentRound.value.isPractice"
      class="p-4 rounded-2xl bg-teal-950/30 border-2 border-teal-500/40 text-teal-100 flex items-start gap-3 shadow-lg"
    >
      <span class="text-2xl">💡</span>
      <div class="flex-1 text-xs leading-relaxed">
        <strong class="text-sm font-bold text-white uppercase tracking-wide block mb-1">
          Practice Round Walkthrough & Dispatch Hints:
        </strong>
        <p class="text-slate-200">
          At 5:00 AM, system demand is 160 MW. Your grid starts in exact balance with:
          <strong>Kainji Hydro (4 tokens / 40 MW)</strong>, <strong>Egbin Gas (6 tokens / 60 MW)</strong>, and <strong>Geregu Gas (6 tokens / 60 MW)</strong>.
          Kano Solar is at 0 MW because it is before dawn. Total is 16 tokens = 160 MW.
          You do not need to move any tokens, but try tapping (+) and (−) to see how the frequency reacts!
        </p>
      </div>
    </div>

    <!-- Live Round Banner with Countdown Timer & Telemetry -->
    <RoundBanner
      :round="game.currentRound.value"
      :timer-seconds="game.timerSeconds.value"
      :timer-running="game.timerRunning.value"
      :is-locked="game.isLocked.value"
      :is-submitted="game.isSubmitted.value"
      :total-gen-tokens="game.totalGenerationTokens.value"
      :total-gen-m-w="game.totalGenerationMW.value"
      :effective-demand-tokens="game.effectiveDemandTokens.value"
      :effective-demand-m-w="game.effectiveDemandMW.value"
      :gap-tokens="game.gapTokens.value"
      :gap-m-w="game.gapMW.value"
      :has-reserve-bonus="game.hasReserveBonus.value"
      :is-gas-ramp-violated="game.isGasRampViolated.value"
      @start-timer="game.startTimer"
      @pause-timer="game.pauseTimer"
      @submit-round="game.submitRound"
      @unlock-round="game.unlockRound"
    />

    <!-- Frequency Physics Simulation Layer -->
    <FrequencyDashboard
      :frequency="frequencyEngine.currentFrequency.value"
      :rocof="frequencyEngine.rocof.value"
      :status-band="frequencyEngine.statusBand.value"
      :history="frequencyEngine.history.value"
      :imbalance-m-w="game.totalGenerationMW.value - game.effectiveDemandMW.value"
      :controller-message="frequencyEngine.controllerMessage.value"
      :is-controller-view="frequencyEngine.isControllerView.value"
      @update:is-controller-view="val => frequencyEngine.isControllerView.value = val"
    />

    <!-- 4 Power Stations Grid -->
    <div>
      <div class="flex items-center justify-between mb-3 px-1">
        <h3 class="text-xs md:text-sm font-extrabold uppercase tracking-wider text-slate-300">
          Power Station Dispatch Consoles (Total Board: {{ game.totalGenerationMW.value }} MW)
        </h3>
        <span class="text-[11px] text-teal-400 font-mono">
          Gas Ramp Rule: Max ±3 tokens (±30 MW)
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Kainji Hydroelectric Power Station -->
        <StationCard
          id="kainji"
          name="Hydro Power Station"
          real-name="Kainji Hydroelectric"
          location="Niger River · Niger State"
          plant-type="Hydro"
          :max-capacity="8"
          :current-tokens="game.kainjiTokens.value"
          :max-allowed-in-round="game.maxKainji.value"
          :is-controlled-by-team="true"
          :is-locked="game.isLocked.value"
          :store-tokens-available="game.storeTokens.value"
          :round-id="game.currentRound.value.id"
          @adjust="delta => game.adjustKainji(delta)"
          @drop-token="() => handleDropToken('kainji')"
        />

        <!-- Egbin Gas Power Station (Gas A) -->
        <StationCard
          id="egbin"
          name="Gas Station A"
          real-name="Egbin Thermal Power"
          location="Ikorodu · Lagos State"
          plant-type="Gas"
          :max-capacity="12"
          :current-tokens="game.egbinTokens.value"
          :max-allowed-in-round="game.maxEgbin.value"
          :previous-round-tokens="game.previousEgbinTokens.value"
          :ramp-limit="3"
          :is-ramp-violated="game.egbinDelta.value > 3 && !game.currentRound.value.egbinTripped"
          :is-controlled-by-team="true"
          :is-locked="game.isLocked.value"
          :store-tokens-available="game.storeTokens.value"
          :round-id="game.currentRound.value.id"
          @adjust="delta => game.adjustEgbin(delta)"
          @drop-token="() => handleDropToken('egbin')"
        />

        <!-- Geregu Gas Power Station (Gas B) -->
        <StationCard
          id="geregu"
          name="Gas Station B"
          real-name="Geregu Power Plant"
          location="Ajaokuta · Kogi State"
          plant-type="Gas"
          :max-capacity="12"
          :current-tokens="game.gereguTokens.value"
          :max-allowed-in-round="game.maxGeregu.value"
          :previous-round-tokens="game.previousGereguTokens.value"
          :ramp-limit="3"
          :is-ramp-violated="game.gereguDelta.value > 3"
          :is-controlled-by-team="true"
          :is-locked="game.isLocked.value"
          :store-tokens-available="game.storeTokens.value"
          :round-id="game.currentRound.value.id"
          @adjust="delta => game.adjustGeregu(delta)"
          @drop-token="() => handleDropToken('geregu')"
        />

        <!-- Kano Solar Power Plant -->
        <StationCard
          id="kano"
          name="Solar Power Plant"
          real-name="Kano Solar Farm"
          location="Kumbotso · Kano State"
          plant-type="Solar"
          :max-capacity="6"
          :current-tokens="game.kanoTokens.value"
          :max-allowed-in-round="game.maxKano.value"
          :is-controlled-by-team="false"
          :is-locked="game.isLocked.value"
          :store-tokens-available="game.storeTokens.value"
          :round-id="game.currentRound.value.id"
          @adjust="() => {}"
        />

      </div>
    </div>

    <!-- Store & Load Shedding Trays -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TokenDepot
        :store-tokens="game.storeTokens.value"
        :total-tokens="40"
        :is-locked="game.isLocked.value"
        @drag-start="handleDragStart"
      />

      <LoadShedTray
        :load-shed-tokens="game.loadShedTokens.value"
        :is-locked="game.isLocked.value"
        @update:load-shed-tokens="tokens => game.adjustLoadShed(tokens)"
      />
    </div>

    <!-- Round Score Summary (Shown when submitted or locked) -->
    <RoundScoreSummary
      v-if="game.isSubmitted.value || (game.isLocked.value && game.timerSeconds.value === 0)"
      :score="game.currentScoreBreakdown.value"
      :is-practice="game.currentRound.value.isPractice"
      :has-next-round="game.currentRoundIndex.value < game.ROUNDS.length - 1"
      @advance="game.advanceNextRound"
    />

    <!-- Dramatic Event Popup Modal -->
    <EventPopup
      :show="game.showEventModal.value"
      :title="game.activeEvent.value?.title || ''"
      :badge="game.activeEvent.value?.badge || ''"
      :description="game.activeEvent.value?.description || ''"
      @close="game.showEventModal.value = false"
    />

    <!-- Team Name & Roles Edit Modal -->
    <div
      v-if="showTeamEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
    >
      <div class="max-w-md w-full bg-[#0C2340] border-2 border-teal-500 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100">
        <div class="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
          <h3 class="text-base font-black uppercase text-white">
            👥 Set Team Name & Roles
          </h3>
          <button
            type="button"
            @click="showTeamEditModal = false"
            class="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-300 uppercase text-[10px] mb-1">Team Name:</label>
            <input
              v-model="editTeamName"
              type="text"
              placeholder="e.g. Team Niger, Table 3, Grid Ops..."
              class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label class="block font-bold text-teal-300 uppercase text-[10px] mb-1">
              Dispatcher Name (Moves tokens on board):
            </label>
            <input
              v-model="editDispatcherName"
              type="text"
              placeholder="e.g. Engr. Tunde..."
              class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label class="block font-bold text-amber-300 uppercase text-[10px] mb-1">
              Checker Name (Counts & verifies MW tokens):
            </label>
            <input
              v-model="editCheckerName"
              type="text"
              placeholder="e.g. Engr. Chioma..."
              class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-medium focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <p class="text-[11px] text-slate-400 italic pt-1">
            * Per NISO Exercise Guide Step 2: Choose one "dispatcher" to move tokens and one "checker" to count.
          </p>
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            @click="showTeamEditModal = false"
            class="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="saveTeamEdit"
            class="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider"
          >
            Save Team
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
