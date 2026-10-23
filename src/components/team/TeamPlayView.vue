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
  <div class="space-y-4">

    <!-- Top Row: Compressed Team Identity (Left) + Practice Walkthrough Guide (Right, on same level) -->
    <div class="w-full flex flex-col md:flex-row gap-3 items-stretch">
      
      <!-- Compressed Team Identity & Local Device Status (Left Column: 5/12 width) -->
      <div
        class="bg-[#0F243A] border-2 border-[#1E3A5F] rounded-2xl p-3 shadow-lg flex flex-col justify-between gap-2.5 transition-all"
        :class="game.currentRound.value.isPractice ? 'w-full md:w-5/12' : 'w-full'"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-[#143D24] border-2 border-[#389E5F]/60 flex items-center justify-center text-base shadow-md text-[#4ADE80] shrink-0">
            👥
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-[10px] font-bold uppercase text-slate-300">Team:</span>
              <select
                :value="game.activeTeamId.value"
                @change="e => game.switchActiveTeam((e.target as HTMLSelectElement).value)"
                class="bg-[#0B1726] border-2 border-[#389E5F] text-[#86EFAC] font-black text-xs rounded-lg px-2 py-0.5 focus:ring-2 focus:ring-[#389E5F] shadow-inner"
              >
                <option v-for="t in game.teams.value" :key="t.id" :value="t.id">
                  {{ t.name }}
                </option>
              </select>
              <button
                type="button"
                @click="openEditTeam"
                class="text-[11px] text-[#4ADE80] hover:text-[#86EFAC] underline font-bold transition"
              >
                ✎ Edit
              </button>
            </div>
            <div class="text-[10px] text-slate-300 font-mono font-semibold mt-0.5 flex flex-wrap items-center gap-2">
              <span>Disp: <strong class="text-white font-black">{{ game.activeTeam.value.dispatcherName || 'Unassigned' }}</strong></span>
              <span class="text-slate-500">·</span>
              <span>Check: <strong class="text-white font-black">{{ game.activeTeam.value.checkerName || 'Unassigned' }}</strong></span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1.5 border-t border-[#1E3A5F]">
          <span class="text-[10px] text-slate-300 font-medium italic">
            Auto-saved locally
          </span>

          <button
            type="button"
            @click="handleCopyScorecard"
            class="px-2.5 py-1 rounded-xl bg-[#132E4C] hover:bg-[#1E3A5F] text-white border-2 border-[#389E5F]/60 text-xs font-black flex items-center gap-1.5 shadow-md transition active:scale-95"
            title="Copy text scorecard to share with Inspector or WhatsApp"
          >
            <span>📋</span>
            <span>{{ copiedToast ? 'Copied!' : 'Copy Scorecard' }}</span>
          </button>
        </div>
      </div>

      <!-- Practice Round Guidance Walkthrough Card (Right Column: 7/12 width, exact same level) -->
      <div
        v-if="game.currentRound.value.isPractice"
        class="w-full md:w-7/12 p-3 rounded-2xl bg-[#143D24] border-2 border-[#389E5F] text-white flex items-start gap-2.5 shadow-xl"
      >
        <span class="text-xl shrink-0">💡</span>
        <div class="flex-1 text-xs leading-relaxed">
          <strong class="text-xs font-black text-white uppercase tracking-wide block mb-0.5">
            Practice Round Walkthrough & Dispatch Hints:
          </strong>
          <p class="text-white font-medium text-[11px] leading-snug">
            At 5:00 AM, system demand is 160 MW. Grid starts in exact balance with:
            <strong class="text-[#86EFAC]">Kainji Hydro (40 MW)</strong>, <strong class="text-amber-300">Egbin Gas (60 MW)</strong>, and <strong class="text-amber-300">Geregu Gas (60 MW)</strong>.
            Kano Solar is 0 MW before dawn (Total = 160 MW).
            Tap (+) and (−) on the stations below to observe how the frequency gauge responds!
          </p>
        </div>
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

    <!-- National Grid Dispatch Ring Container (Circular Perimeter & Center Hub) -->
    <div class="relative w-full rounded-3xl p-4 md:p-6 bg-[#0F243A] border-2 border-[#1E3A5F] shadow-2xl overflow-hidden">
      
      <!-- Perimeter Title Bar -->
      <div class="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b-2 border-[#1E3A5F]">
        <div class="flex items-center gap-2.5">
          <span class="w-3.5 h-3.5 rounded-full bg-[#389E5F] animate-ping"></span>
          <div>
            <h3 class="text-sm md:text-base font-black uppercase tracking-wider text-white">
              National Grid Dispatch Ring · Scattered Regional Perimeter
            </h3>
            <p class="text-xs text-slate-300 font-medium">
              4 Regional Stations Positioned at Outer Circular Edges · Feeding NCC Osogbo Central Hub
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-[#4ADE80] font-mono font-bold bg-[#143D24] px-3 py-1 rounded-lg border border-[#389E5F]/50 shadow-sm">
            Total Board Gen: {{ game.totalGenerationMW.value }} MW
          </span>
          <span class="text-xs text-amber-300 font-mono font-bold bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-500/40 shadow-sm hidden sm:inline">
            Gas Ramp: ±30 MW max
          </span>
        </div>
      </div>

      <!-- 3-COLUMN PERIMETER DISPATCH RING: West Stations | NCC Central Hub | East Stations -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">

        <!-- ========================================================
             WEST REGIONAL PERIMETER (Left Column: lg:col-span-4)
             Stacks Kainji (NW) and Egbin (SW) in normal document flow.
             They CANNOT overlap because they are in standard column flow with gap-8!
             ======================================================== -->
        <div class="lg:col-span-4 flex flex-col gap-8">
          
          <!-- Station 1: Kainji Hydro (North-West Circular Edge) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-black px-2 text-[#38BDF8]">
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-[#38BDF8]"></span>
                📍 North-West Circular Edge
              </span>
              <span class="bg-[#0284C7]/20 border border-[#38BDF8]/40 text-[#7DD3FC] px-2 py-0.5 rounded-md text-[10px] font-mono">
                330kV Line → Hub
              </span>
            </div>

            <StationCard
              id="kainji"
              name="Hydro Plant"
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
          </div>

          <!-- Decorative Transmission Corridor Flow Divider -->
          <div class="hidden lg:flex items-center justify-center gap-3 px-4 py-1.5 text-slate-400 text-[10px] font-mono uppercase tracking-widest border-y border-dashed border-[#1E3A5F] bg-[#091B2E]/60 rounded-lg">
            <span class="font-extrabold text-lg">↕ Western 330kV Grid Transmission Corridor</span>
          </div>

          <!-- Station 2: Egbin Gas Station A (South-West Circular Edge) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-black px-2 text-amber-400">
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                📍 South-West Circular Edge
              </span>
              <span class="bg-amber-500/20 border border-amber-400/40 text-amber-300 px-2 py-0.5 rounded-md text-[10px] font-mono">
                330kV Line → Hub
              </span>
            </div>

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
          </div>

        </div>

        <!-- ========================================================
             CENTRAL DISPATCH HUB (Center Column: lg:col-span-4)
             Frequency Dashboard + Token Depot + Load Shedding
             ======================================================== -->
        <div class="lg:col-span-4 flex flex-col gap-6">

          <!-- Central Hub Header Badge -->
          <div class="w-full text-center py-2.5 px-4 rounded-2xl bg-[#143D24] border-2 border-[#389E5F] shadow-xl">
            <div class="text-xs md:text-sm font-black uppercase tracking-wider text-[#86EFAC] flex items-center justify-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#4ADE80] animate-ping"></span>
              🎯 Central Grid Controller · NCC Osogbo
            </div>
            <p class="text-[11px] text-slate-200 font-semibold mt-0.5">
              Live National Dispatch & Frequency Balancing (50.00 Hz)
            </p>
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

          <!-- Central Token Depot & Load Shed Tray -->
          <div class="space-y-4">
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
             Stacks Kano (NE) and Geregu (SE) in normal document flow.
             They CANNOT overlap because they are in standard column flow with gap-8!
             ======================================================== -->
        <div class="lg:col-span-4 flex flex-col gap-8">

          <!-- Station 3: Kano Solar (North-East Circular Edge) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-black px-2 text-yellow-300">
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                📍 North-East Circular Edge
              </span>
              <span class="bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 px-2 py-0.5 rounded-md text-[10px] font-mono">
                330kV Line → Hub
              </span>
            </div>

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

          <!-- Decorative Transmission Corridor Flow Divider -->
          <div class="hidden lg:flex items-center justify-center gap-3 px-4 py-1.5 text-slate-400 text-[10px] font-mono uppercase tracking-widest border-y border-dashed border-[#1E3A5F] bg-[#091B2E]/60 rounded-lg">
            <span>↕ Eastern 330kV Grid Transmission Corridor</span>
          </div>

          <!-- Station 4: Geregu Gas Turbine (South-East Circular Edge) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs font-black px-2 text-amber-400">
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                📍 South-East Circular Edge
              </span>
              <span class="bg-amber-500/20 border border-amber-400/40 text-amber-300 px-2 py-0.5 rounded-md text-[10px] font-mono">
                330kV Line → Hub
              </span>
            </div>

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
          </div>

        </div>

      </div>

      <!-- Legend Footer Bar -->
      <div class="mt-8 pt-4 border-t-2 border-[#1E3A5F] flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 font-bold">
        <span v-for="k in legend" :key="k.kind" class="flex items-center gap-2">
          <PlantIcon :kind="k.kind" :size="24" :active="false" />
          <span>{{ k.label }}</span>
        </span>
      </div>

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
