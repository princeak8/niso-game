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
    <div class="w-full px-3 py-1.5 flex flex-wrap items-center justify-between gap-2">
      
      <!-- Brand & Title -->
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-[#389E5F] flex items-center justify-center font-black tracking-widest text-sm text-white shadow-md border border-[#52BF7B]/60 shrink-0">
          NISO
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <h1 class="font-black text-sm md:text-base tracking-tight uppercase text-white leading-none">
              Keep the Lights On
            </h1>
            <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#389E5F]/30 text-[#86EFAC] border border-[#389E5F]/60 uppercase leading-none">
              Grid Balancing
            </span>
          </div>
          <p class="text-[10px] text-slate-300 font-medium hidden lg:block leading-tight mt-0.5">
            Nigerian Independent System Operator · Staff Acculturation
          </p>
        </div>
      </div>

      <!-- Navigation Tabs & Round Progression (Horizontal Inline) -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Navigation Tabs -->
        <div class="flex items-center bg-[#091B2E] p-0.5 rounded-lg border border-slate-700 shadow-inner">
          <button
            type="button"
            @click="emit('update:activeTab', 'team')"
            :class="[
              'px-2.5 py-1 rounded text-xs font-black transition-all flex items-center gap-1',
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
              'px-2.5 py-1 rounded text-xs font-black transition-all flex items-center gap-1',
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
              'px-2.5 py-1 rounded text-xs font-black transition-all flex items-center gap-1',
              activeTab === 'debrief'
                ? 'bg-[#389E5F] text-white shadow shadow-green-950/60'
                : 'text-[#E2E8F0] hover:text-white hover:bg-slate-800'
            ]"
          >
            <span>📋</span>
            <span>Debrief</span>
          </button>
        </div>

        <!-- Compact Round Progression Breadcrumbs (Inline with tabs) -->
        <div
          v-if="activeTab === 'team'"
          class="hidden sm:flex items-center gap-1 p-0.5 bg-[#091B2E] rounded-lg border border-slate-700 shadow-inner"
        >
          <button
            v-for="(r, idx) in ROUNDS"
            :key="r.id"
            type="button"
            @click="initializeRound(idx)"
            class="py-0.5 px-2 rounded border text-center transition flex items-center gap-1 cursor-pointer whitespace-nowrap text-[10px]"
            :class="[
              currentRoundIndex === idx
                ? 'bg-[#389E5F] text-white border-[#BBF7D0] font-black shadow-sm'
                : roundScores[r.id]
                ? 'bg-[#132E4C] text-[#86EFAC] border-[#389E5F]/60 font-bold hover:bg-[#1E3A5F]'
                : 'bg-[#0B1726] text-slate-300 border-slate-700 font-medium hover:text-white'
            ]"
            :title="`${r.name} (${r.demandMW} MW)`"
          >
            <span class="font-bold">{{ r.isPractice ? 'P' : `R${r.id}` }}</span>
            <span class="font-mono opacity-80">{{ r.timeOfDay }}</span>
            <span v-if="roundScores[r.id]" class="text-[#4ADE80] font-black">✓</span>
          </button>
        </div>
      </div>

      <!-- Auxiliary Controls -->
      <div class="flex items-center gap-1.5">
        <!-- Solution Key Button -->
        <button
          type="button"
          @click="emit('openSolutionKey')"
          title="Facilitator Solution Key & Verification"
          class="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 flex items-center gap-1 transition"
        >
          <span>🔑</span>
          <span class="hidden md:inline">Key</span>
        </button>

        <!-- Theme Toggle -->
        <button
          type="button"
          @click="emit('toggleTheme')"
          :title="theme === 'light' ? 'Switch to Dark Control Room' : 'Switch to Clean White Background'"
          class="px-2 py-1 rounded-lg text-xs font-black border flex items-center gap-1 transition shadow-sm"
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
          class="p-1 px-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          <span v-if="!isMuted">🔊</span>
          <span v-else>🔇</span>
        </button>
      </div>

    </div>
  </header>
</template>
