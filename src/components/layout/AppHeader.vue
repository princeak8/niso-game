<script setup lang="ts">
import { ref } from 'vue';
import { useWebAudioSynth } from '../../composables/useWebAudioSynth';

const props = defineProps<{
  activeTab: 'team' | 'facilitator' | 'debrief';
  isProjectorMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:activeTab', tab: 'team' | 'facilitator' | 'debrief'): void;
  (e: 'update:isProjectorMode', val: boolean): void;
  (e: 'openSolutionKey'): void;
}>();

const { isMuted, toggleMute } = useWebAudioSynth();
</script>

<template>
  <header class="bg-[#0C2340] border-b border-[#0D626C]/40 text-white shadow-xl transition-colors duration-200" :class="{ 'bg-black border-teal-400': isProjectorMode }">
    <div class="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      
      <!-- Brand & Title -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-[#0D626C] flex items-center justify-center font-black tracking-widest text-lg shadow-md border border-teal-300/30">
          NISO
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-extrabold text-base md:text-lg tracking-tight uppercase">
              Keep the Lights On
            </h1>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 tracking-wide uppercase">
              Grid Balancing
            </span>
          </div>
          <p class="text-xs text-slate-300 font-medium hidden sm:block">
            Nigerian Independent System Operator · Staff Acculturation Induction
          </p>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center bg-[#071626] p-1 rounded-xl border border-slate-700/60 shadow-inner">
        <button
          type="button"
          @click="emit('update:activeTab', 'team')"
          :class="[
            'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
            activeTab === 'team'
              ? 'bg-[#0D626C] text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          ]"
        >
          <span>⚡</span>
          <span>Team Dispatch</span>
        </button>

        <button
          type="button"
          @click="emit('update:activeTab', 'facilitator')"
          :class="[
            'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
            activeTab === 'facilitator'
              ? 'bg-[#0D626C] text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          ]"
        >
          <span>🎯</span>
          <span>Facilitator Deck</span>
        </button>

        <button
          type="button"
          @click="emit('update:activeTab', 'debrief')"
          :class="[
            'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5',
            activeTab === 'debrief'
              ? 'bg-[#0D626C] text-white shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          ]"
        >
          <span>📋</span>
          <span>Debrief & Tour</span>
        </button>
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

        <!-- Projector Mode Toggle -->
        <button
          type="button"
          @click="emit('update:isProjectorMode', !isProjectorMode)"
          :title="isProjectorMode ? 'Switch to Normal Dark' : 'Switch to Projector High-Contrast'"
          :class="[
            'px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition',
            isProjectorMode
              ? 'bg-amber-500 text-black border-amber-300 font-bold'
              : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
          ]"
        >
          <span>📽️</span>
          <span class="hidden md:inline">{{ isProjectorMode ? 'Projector ON' : 'Projector' }}</span>
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
