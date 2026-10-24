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
import PlantIcon from './PlantIcon.vue';
import type { PlantKind } from '../../types/grid';

const game = useGameState();

const legend: { kind: PlantKind; label: string }[] = [
  { kind: 'hydro', label: 'Hydro' },
  { kind: 'gas', label: 'Gas turbine' },
  { kind: 'steam', label: 'Steam / thermal' },
  { kind: 'solar', label: 'Solar PV' },
];

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
  <div class="space-y-1">

    <!-- Top Row: Compact Team Identity & Practice Walkthrough Hint -->
    <div class="w-full flex flex-wrap items-center justify-between gap-1 px-2 py-0.5 bg-[#0F243A] border border-[#1E3A5F] rounded-lg shadow-sm text-xs">
      
      <!-- Team Identity & Roles -->
      <div class="flex items-center gap-2 flex-wrap">
        <div class="flex items-center gap-1">
          <span class="text-xs">👥</span>
          <span class="text-[10px] font-bold uppercase text-slate-300">Team:</span>
          <select
            :value="game.activeTeamId.value"
            @change="e => game.switchActiveTeam((e.target as HTMLSelectElement).value)"
            class="bg-[#0B1726] border border-[#389E5F] text-[#86EFAC] font-black text-xs rounded px-1.5 py-0.5 shadow-inner cursor-pointer"
          >
            <option v-for="t in game.teams.value" :key="t.id" :value="t.id">
              {{ t.name }}
            </option>
          </select>
          <button
            type="button"
            @click="openEditTeam"
            class="text-[10px] text-[#4ADE80] hover:text-[#86EFAC] underline font-bold cursor-pointer"
          >
            ✎ Edit
          </button>
        </div>

        <div class="text-[10px] text-slate-300 font-mono hidden md:flex items-center gap-1.5">
          <span>Disp: <strong class="text-white">{{ game.activeTeam.value.dispatcherName || 'Unassigned' }}</strong></span>
          <span class="text-slate-500">·</span>
          <span>Check: <strong class="text-white">{{ game.activeTeam.value.checkerName || 'Unassigned' }}</strong></span>
        </div>
      </div>

      <!-- Practice Round Hint or Scorecard Export -->
      <div class="flex items-center gap-2">
        <div
          v-if="game.currentRound.value.isPractice"
          class="hidden lg:flex items-center gap-1 text-[11px] text-[#86EFAC] bg-[#143D24] px-2 py-0.5 rounded border border-[#389E5F]/50"
        >
          <span>💡</span>
          <span>Practice: Kainji (40MW) + Egbin (60MW) + Geregu (60MW) = 160MW. Tap +/− to test!</span>
        </div>

        <button
          type="button"
          @click="handleCopyScorecard"
          class="px-2 py-0.5 rounded-lg bg-[#132E4C] hover:bg-[#1E3A5F] text-white border border-[#389E5F]/60 text-[10px] font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer"
          title="Copy text scorecard"
        >
          <span>📋</span>
          <span>{{ copiedToast ? 'Copied!' : 'Copy Scorecard' }}</span>
        </button>
      </div>

    </div>

    <!-- Live Round Banner with Countdown Timer & Telemetry HUD -->
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

    <!-- Inline Round Score Summary (Shown when submitted or locked) -->
    <RoundScoreSummary
      v-if="game.isSubmitted.value || (game.isLocked.value && game.timerSeconds.value === 0)"
      :score="game.currentScoreBreakdown.value"
      :is-practice="game.currentRound.value.isPractice"
      :has-next-round="game.currentRoundIndex.value < game.ROUNDS.length - 1"
      @advance="game.advanceNextRound"
    />

    <!-- National Grid Dispatch Ring Container (Circular Perimeter & Center Hub) -->
    <div class="relative w-full rounded-xl p-1.5 sm:p-2 bg-[#0F243A] border border-[#1E3A5F] shadow-lg overflow-hidden">
      
      <!-- Perimeter Title Bar -->
      <div class="relative z-10 flex flex-wrap items-center justify-between gap-1 mb-1 pb-0.5 border-b border-[#1E3A5F]">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-[#389E5F] animate-ping"></span>
          <h3 class="text-xs font-black uppercase tracking-wider text-white">
            National Grid Dispatch Ring
          </h3>
          <span class="text-[9px] text-slate-300 hidden md:inline">
            · 4 Regional Stations feeding NCC Osogbo Central Hub
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="text-[9px] text-[#4ADE80] font-mono font-bold bg-[#143D24] px-1.5 py-0.2 rounded border border-[#389E5F]/50">
            Total Gen: {{ game.totalGenerationMW.value }} MW
          </span>
          <span class="text-[9px] text-amber-300 font-mono font-bold bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-500/40 hidden sm:inline">
            Gas Ramp: ±30 MW max
          </span>
        </div>
      </div>

      <!-- 3-COLUMN PERIMETER DISPATCH RING: West Stations | NCC Central Hub | East Stations -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-1.5 md:gap-2 items-stretch relative z-10">

        <!-- ========================================================
             WEST REGIONAL PERIMETER (Left Column: lg:col-span-4)
             ======================================================== -->
        <div class="lg:col-span-4 flex flex-col gap-1">
          <!-- Station 1: Kainji Hydro -->
          <StationCard
            id="kainji"
            name="Hydro Plant"
            real-name="Kainji Hydroelectric"
            location="Niger River · Niger"
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

          <!-- Station 2: Egbin Gas Station A -->
          <StationCard
            id="egbin"
            name="Gas Station A"
            real-name="Egbin Thermal Power"
            location="Ikorodu · Lagos"
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
        </div>

        <!-- ========================================================
             CENTRAL DISPATCH HUB (Center Column: lg:col-span-4)
             Frequency Dashboard + Token Depot + Load Shedding
             ======================================================== -->
        <div class="lg:col-span-4 flex flex-col gap-1 justify-between">

          <!-- Central Hub Header Badge -->
          <div class="w-full text-center py-0.5 px-2 rounded bg-[#143D24] border border-[#389E5F] shadow flex items-center justify-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-ping"></span>
            <span class="text-[10px] font-black uppercase text-[#86EFAC]">Central Grid Controller · NCC Osogbo</span>
          </div>

          <!-- Central Frequency Dashboard -->
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

          <!-- Central Token Depot & Load Shed Tray (Side-by-side on wide) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-1">
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

        </div>

        <!-- ========================================================
             EAST REGIONAL PERIMETER (Right Column: lg:col-span-4)
             ======================================================== -->
        <div class="lg:col-span-4 flex flex-col gap-1">

          <!-- Station 3: Kano Solar -->
          <StationCard
            id="kano"
            name="Solar Power Plant"
            real-name="Kano Solar Farm"
            location="Kumbotso · Kano"
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

          <!-- Station 4: Geregu Gas Turbine -->
          <StationCard
            id="geregu"
            name="Gas Station B"
            real-name="Geregu Power Plant"
            location="Ajaokuta · Kogi"
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

        </div>

      </div>

      <!-- Legend Footer Bar (Compact inline) -->
      <div class="mt-1 pt-0.5 border-t border-[#1E3A5F] flex flex-wrap items-center justify-center gap-3 text-[9px] text-slate-400 font-bold">
        <span v-for="k in legend" :key="k.kind" class="flex items-center gap-1">
          <PlantIcon :kind="k.kind" :size="14" :active="false" />
          <span>{{ k.label }}</span>
        </span>
      </div>

    </div>

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
      <div class="max-w-md w-full bg-[#0F243A] border-2 border-[#389E5F] rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-100">
        <div class="flex items-center justify-between pb-3 border-b-2 border-[#1E3A5F] mb-4">
          <h3 class="text-base font-black uppercase text-white">
            👥 Set Team Name & Roles
          </h3>
          <button
            type="button"
            @click="showTeamEditModal = false"
            class="text-slate-400 hover:text-white font-black text-lg p-1"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3.5 text-xs">
          <div>
            <label class="block font-black text-slate-200 uppercase text-[11px] mb-1">Team Name:</label>
            <input
              v-model="editTeamName"
              type="text"
              placeholder="e.g. Team Niger, Table 3, Grid Ops..."
              class="w-full bg-[#0B1726] border-2 border-[#1E3A5F] rounded-lg p-2.5 text-white font-bold focus:border-[#389E5F] focus:ring-2 focus:ring-[#389E5F]"
            />
          </div>

          <div>
            <label class="block font-black text-[#86EFAC] uppercase text-[11px] mb-1">
              Dispatcher Name (Moves tokens on board):
            </label>
            <input
              v-model="editDispatcherName"
              type="text"
              placeholder="e.g. Engr. Tunde..."
              class="w-full bg-[#0B1726] border-2 border-[#1E3A5F] rounded-lg p-2.5 text-white font-bold focus:border-[#389E5F] focus:ring-2 focus:ring-[#389E5F]"
            />
          </div>

          <div>
            <label class="block font-black text-amber-300 uppercase text-[11px] mb-1">
              Checker Name (Counts & verifies MW tokens):
            </label>
            <input
              v-model="editCheckerName"
              type="text"
              placeholder="e.g. Engr. Chioma..."
              class="w-full bg-[#0B1726] border-2 border-[#1E3A5F] rounded-lg p-2.5 text-white font-bold focus:border-[#389E5F] focus:ring-2 focus:ring-[#389E5F]"
            />
          </div>

          <p class="text-[11px] text-slate-300 italic pt-1 font-medium">
            * Per NISO Exercise Guide Step 2: Choose one "dispatcher" to move tokens and one "checker" to count.
          </p>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            @click="showTeamEditModal = false"
            class="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="saveTeamEdit"
            class="px-6 py-2.5 rounded-xl bg-[#389E5F] hover:bg-[#2B7A49] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#389E5F]/30 transition"
          >
            Save Team
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.ring-stage { position: relative; z-index: 10; display: flex; flex-direction: column; gap: 1.25rem; }
.ring-lines { display: none; }
.ring-node, .ring-hub { position: relative; margin-bottom: 50em; clear: both; }
.ring-tag {
  display: flex; justify-content: space-between; gap: .5rem;
  font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: .03em;
  padding: 0 .25rem .35rem;
}
.ring-tag span:last-child { font-family: 'JetBrains Mono', monospace; opacity: .8; }

.ring-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem 1.25rem; font-size: 12px; font-weight: 800; }
.ring-legend-item { display: inline-flex; align-items: center; gap: .4rem; opacity: .9; }

@media (min-width: 1024px) {
  .ring-stage { display: block; height: 1060px; --node-w: 270px; --hub-w: 310px; }
  .ring-lines { display: block; position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
  .ring-outline { fill: none; stroke: #389E5F; stroke-width: 1.5; stroke-dasharray: 3 7; opacity: .5; vector-effect: non-scaling-stroke; }
  .ring-outline-inner { stroke: #38BDF8; opacity: .3; }
  .ring-line { stroke-width: 2.5; opacity: .75; vector-effect: non-scaling-stroke; }
  .ring-node { position: absolute; width: var(--node-w); transform: translate(-50%, -50%); z-index: 2; }
  .ring-hub  { position: absolute; left: 50%; top: 50%; width: var(--hub-w); transform: translate(-50%, -50%); z-index: 3; }
  .ring-legend { position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); z-index: 3; }
}
@media (min-width: 1280px) {
  .ring-stage { --node-w: 310px; --hub-w: 350px; }
}
</style>
