<script setup lang="ts">
import { ref } from 'vue';
import { useWebAudioSynth } from '../../composables/useWebAudioSynth';
import { useGameState } from '../../composables/useGameState';
import { ROUNDS } from '../../data/roundScript';

const props = defineProps<{
  activeTab: 'team' | 'facilitator' | 'debrief';
  theme: 'light' | 'dark';
}>();

const emit = defineEmits<{
  (e: 'update:activeTab', tab: 'team' | 'facilitator' | 'debrief'): void;
  (e: 'toggleTheme'): void;
  (e: 'openSolutionKey'): void;
}>();

const { isMuted, toggleMute } = useWebAudioSynth();
const game = useGameState();
const { currentRoundIndex, roundScores, initializeRound } = game;
</script>

<template>
  <header class="bg-[#0E2338] border-b border-[#389E5F] text-white shadow-sm transition-colors duration-200 shrink-0">
    
    <!-- Top Row: Logo & Title + Navigation Tabs (Left) & Auxiliary Controls (Right) -->
    <div class="w-full px-3 py-1 flex items-center justify-between gap-3">
      
      <!-- Left: Logo + "Keep the Lights On" + Tabs Beside It Horizontally -->
      <div class="flex items-center gap-3 min-w-0">
        <!-- Logo & Title -->
        <div class="flex items-center gap-2 shrink-0">
          <div class="w-7 h-7 rounded-lg bg-[#389E5F] flex items-center justify-center font-black tracking-widest text-xs text-white shadow-sm border border-[#52BF7B]/60 shrink-0">
            NISO
          </div>
          <h1 class="font-black text-sm md:text-base tracking-tight uppercase text-white leading-none whitespace-nowrap">
            Keep the Lights On
          </h1>
        </div>

        <!-- Navigation Tabs (Placed Beside Title Horizontally) -->
        <div class="flex items-center bg-[#091B2E] p-0.5 rounded-lg border border-slate-700 shadow-inner shrink-0">
          <button
            type="button"
            @click="emit('update:activeTab', 'team')"
            :class="[
              'px-2.5 py-1 rounded text-xs font-black transition-all flex items-center gap-1 cursor-pointer',
              activeTab === 'team'
                ? 'bg-[#389E5F] text-white shadow shadow-green-950/60'
                : 'text-[#E2E8F0] hover:text-white hover:bg-slate-800'
            ]"
          >
            <span>⚡</span>
            <span>Team Dispatch</span>
          </button>

          <button
            type="button"
            @click="emit('update:activeTab', 'facilitator')"
            :class="[
              'px-2.5 py-1 rounded text-xs font-black transition-all flex items-center gap-1 cursor-pointer',
              activeTab === 'facilitator'
                ? 'bg-[#389E5F] text-white shadow shadow-green-950/60'
                : 'text-[#E2E8F0] hover:text-white hover:bg-slate-800'
            ]"
          >
            <span>🎯</span>
            <span>Facilitator</span>
          </button>

          <button
            type="button"
            @click="emit('update:activeTab', 'debrief')"
            :class="[
              'px-2.5 py-1 rounded text-xs font-black transition-all flex items-center gap-1 cursor-pointer',
              activeTab === 'debrief'
                ? 'bg-[#389E5F] text-white shadow shadow-green-950/60'
                : 'text-[#E2E8F0] hover:text-white hover:bg-slate-800'
            ]"
          >
            <span>📋</span>
            <span>Debrief</span>
          </button>
        </div>
      </div>

      <!-- Right: Auxiliary Controls -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Solution Key Button -->
        <button
          type="button"
          @click="emit('openSolutionKey')"
          title="Facilitator Solution Key & Verification"
          class="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 flex items-center gap-1 transition cursor-pointer"
        >
          <span>🔑</span>
          <span class="hidden md:inline">Key</span>
        </button>

        <!-- Theme Toggle -->
        <button
          type="button"
          @click="emit('toggleTheme')"
          :title="theme === 'light' ? 'Switch to Dark Control Room' : 'Switch to Clean White Background'"
          class="px-2 py-1 rounded-lg text-xs font-black border flex items-center gap-1 transition shadow-sm cursor-pointer"
          :class="theme === 'light'
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/50'"
        >
          <span>{{ theme === 'light' ? '☀️' : '🌙' }}</span>
        </button>

        <!-- Sound Synthesizer Toggle -->
        <button
          type="button"
          @click="toggleMute"
          :title="isMuted ? 'Unmute Audio' : 'Mute Audio'"
          class="p-1 px-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
        >
          <span v-if="!isMuted">🔊</span>
          <span v-else>🔇</span>
        </button>
      </div>

    </div>

    <!-- Bottom Row: Rounds Strip (Positioned Directly Below Header Row for Team Dispatch) -->
    <div
      v-if="activeTab === 'team'"
      class="w-full px-3 py-1 bg-[#091B2E] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto"
    >
      <button
        v-for="(r, idx) in ROUNDS"
        :key="r.id"
        type="button"
        @click="initializeRound(idx)"
        class="py-0.5 px-2.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
        :class="[
          currentRoundIndex === idx
            ? 'bg-[#389E5F] text-white border-[#BBF7D0] font-black shadow-md shadow-[#389E5F]/30'
            : roundScores[r.id]
            ? 'bg-[#132E4C] text-[#86EFAC] border-[#389E5F]/60 font-bold hover:bg-[#1E3A5F]'
            : 'bg-[#0B1726] text-slate-300 border-[#1E3A5F] hover:text-white hover:border-slate-500'
        ]"
        :title="`${r.name} (${r.demandMW} MW)`"
      >
        <span class="font-black">{{ r.isPractice ? 'Practice' : `Round ${r.id}` }}</span>
        <span class="text-[10px] font-mono opacity-80">{{ r.timeOfDay }}</span>
        <span
          class="text-[10px] font-mono font-bold"
          :class="currentRoundIndex === idx ? 'text-[#BBF7D0]' : roundScores[r.id] ? 'text-[#4ADE80]' : 'text-slate-400'"
        >
          {{ roundScores[r.id] ? (r.isPractice ? '✓ Done' : `+${roundScores[r.id]?.finalScore}pts`) : `${r.demandMW}MW` }}
        </span>
      </button>
    </div>

  </header>
</template>
