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
  <header class="bg-[#0E2338] border-b-2 border-[#389E5F] text-white shadow-md transition-colors duration-200">
    <div class="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
      
      <!-- Brand & Title -->
      <div class="flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-[#389E5F] flex items-center justify-center font-black tracking-widest text-xl text-white shadow-lg border-2 border-[#52BF7B]/60">
          NISO
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-black text-lg md:text-xl tracking-tight uppercase text-white">
              Keep the Lights On
            </h1>
            <span class="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-[#389E5F]/30 text-[#86EFAC] border border-[#389E5F]/60 tracking-wider uppercase">
              Grid Balancing
            </span>
          </div>
          <p class="text-xs text-[#E2E8F0] font-bold hidden sm:block">
            Nigerian Independent System Operator · Staff Acculturation Induction
          </p>
        </div>
      </div>

      <!-- Navigation Tabs & Round Progression (Center) -->
      <div class="flex flex-col items-center gap-2">
        <!-- Navigation Tabs -->
        <div class="flex items-center bg-[#091B2E] p-1.5 rounded-xl border border-slate-700 shadow-inner">
          <button
            type="button"
            @click="emit('update:activeTab', 'team')"
            :class="[
              'px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5',
              activeTab === 'team'
                ? 'bg-[#389E5F] text-white shadow-lg shadow-green-950/60 scale-102'
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
              'px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5',
              activeTab === 'facilitator'
                ? 'bg-[#389E5F] text-white shadow-lg shadow-green-950/60 scale-102'
                : 'text-[#E2E8F0] hover:text-white hover:bg-slate-800'
            ]"
          >
            <span>🎯</span>
            <span>Facilitator Deck</span>
          </button>

          <button
            type="button"
            @click="emit('update:activeTab', 'debrief')"
            :class="[
              'px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5',
              activeTab === 'debrief'
                ? 'bg-[#389E5F] text-white shadow-lg shadow-green-950/60 scale-102'
                : 'text-[#E2E8F0] hover:text-white hover:bg-slate-800'
            ]"
          >
            <span>📋</span>
            <span>Debrief & Tour</span>
          </button>
        </div>

        <!-- Flip-Chart Style Round Progression Breadcrumb (Directly under Navigation Tabs, only for Team tab) -->
        <div
          v-if="activeTab === 'team'"
          class="flex items-center gap-1.5 overflow-x-auto max-w-full p-1 bg-[#091B2E] rounded-xl border border-slate-700 shadow-inner"
        >
          <button
            v-for="(r, idx) in ROUNDS"
            :key="r.id"
            type="button"
            @click="initializeRound(idx)"
            class="py-1 px-2.5 rounded-lg border text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer whitespace-nowrap min-w-[70px]"
            :class="[
              currentRoundIndex === idx
                ? 'bg-[#389E5F] text-white border-2 border-[#BBF7D0] font-black shadow-md shadow-[#389E5F]/40'
                : roundScores[r.id]
                ? 'bg-[#132E4C] text-[#86EFAC] border border-[#389E5F]/60 font-bold hover:bg-[#1E3A5F]'
                : 'bg-[#0B1726] text-slate-300 border border-slate-700 font-bold hover:text-white hover:border-slate-500'
            ]"
          >
            <div class="font-black uppercase text-[10px] tracking-tight">
              {{ r.isPractice ? 'Practice' : `Round ${r.id}` }}
            </div>
            <div class="font-mono text-[10px] font-bold">
              {{ r.timeOfDay }}
            </div>
            <div class="text-[9px] font-mono mt-0.5" :class="roundScores[r.id] ? 'text-[#4ADE80] font-black' : 'text-slate-400 font-bold'">
              {{ roundScores[r.id] ? (r.isPractice ? '✓ Done' : `+${roundScores[r.id]?.finalScore} pts`) : `${r.demandMW} MW` }}
            </div>
          </button>
        </div>
      </div>

      <!-- Auxiliary Controls -->
      <div class="flex items-center gap-2">
        <!-- Solution Key Button -->
        <button
          type="button"
          @click="emit('openSolutionKey')"
          title="Facilitator Solution Key & Verification"
          class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 flex items-center gap-1 transition"
        >
          <span>🔑</span>
          <span class="hidden md:inline">Key</span>
        </button>

        <!-- Theme Toggle: White Background / Dark Mode -->
        <button
          type="button"
          @click="emit('toggleTheme')"
          :title="theme === 'light' ? 'Switch to Dark Control Room' : 'Switch to Clean White Background'"
          class="px-3 py-1.5 rounded-lg text-xs font-black border-2 flex items-center gap-1.5 transition shadow-sm"
          :class="theme === 'light'
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/50'"
        >
          <span>{{ theme === 'light' ? '☀️' : '🌙' }}</span>
          <span class="hidden sm:inline">{{ theme === 'light' ? 'White Background' : 'Dark Mode' }}</span>
        </button>

        <!-- Sound Synthesizer Toggle -->
        <button
          type="button"
          @click="toggleMute"
          :title="isMuted ? 'Unmute Audio' : 'Mute Audio'"
          class="p-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <span v-if="!isMuted">🔊</span>
          <span v-else>🔇</span>
        </button>
      </div>

    </div>
  </header>
</template>
