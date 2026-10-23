<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from './components/layout/AppHeader.vue';
import TeamPlayView from './components/team/TeamPlayView.vue';
import FacilitatorDashboard from './components/facilitator/FacilitatorDashboard.vue';
import DebriefView from './components/debrief/DebriefView.vue';
import SolutionKeyModal from './components/facilitator/SolutionKeyModal.vue';

const activeTab = ref<'team' | 'facilitator' | 'debrief'>('team');
const isProjectorMode = ref(false);
const showSolutionKey = ref(false);
</script>

<template>
  <div
    class="min-h-screen text-slate-100 flex flex-col font-sans transition-colors duration-200"
    :class="[
      isProjectorMode ? 'bg-black text-white' : 'bg-[#06121E]'
    ]"
  >
    <!-- Application Header -->
    <AppHeader
      :active-tab="activeTab"
      :is-projector-mode="isProjectorMode"
      @update:active-tab="tab => activeTab = tab"
      @update:is-projector-mode="val => isProjectorMode = val"
      @open-solution-key="showSolutionKey = true"
    />

    <!-- Main Dynamic Content Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
      
      <!-- Team Dispatcher Mode -->
      <TeamPlayView
        v-if="activeTab === 'team'"
      />

      <!-- Facilitator Deck Mode -->
      <FacilitatorDashboard
        v-else-if="activeTab === 'facilitator'"
      />

      <!-- Debrief & Tour Bridge Mode -->
      <DebriefView
        v-else-if="activeTab === 'debrief'"
      />

    </main>

    <!-- Facilitator Solution Key Modal -->
    <SolutionKeyModal
      :show="showSolutionKey"
      @close="showSolutionKey = false"
    />

    <!-- Footer -->
    <footer class="bg-[#071626] border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="font-medium">
          NISO Staff Acculturation Programme · Exercise Guide 3: Keep the Lights On
        </div>
        <div class="font-mono text-[11px] text-teal-400">
          Target System Frequency: 50.00 Hz · 1 Token = 10 MW
        </div>
      </div>
    </footer>

  </div>
</template>

<style>
/* Base typography and custom scrollbars */
html, body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #071626;
}
::-webkit-scrollbar-thumb {
  background: #0D626C;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #0A4D54;
}
</style>
