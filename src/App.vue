<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppHeader from './components/layout/AppHeader.vue';
import TeamPlayView from './components/team/TeamPlayView.vue';
import FacilitatorDashboard from './components/facilitator/FacilitatorDashboard.vue';
import DebriefView from './components/debrief/DebriefView.vue';
import SolutionKeyModal from './components/facilitator/SolutionKeyModal.vue';

const activeTab = ref<'team' | 'facilitator' | 'debrief'>('team');
const theme = ref<'light' | 'dark'>('light'); // White background by default
const showSolutionKey = ref(false);

function handleToggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('niso_theme_mode', theme.value);
  }
}

onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('niso_theme_mode');
    if (saved === 'light' || saved === 'dark') {
      theme.value = saved;
    }
  }
});
</script>

<template>
  <div
    class="min-h-screen flex flex-col font-sans transition-colors duration-200"
    :class="[
      theme === 'light' ? 'theme-light bg-white text-slate-900' : 'theme-dark bg-[#0B1726] text-white'
    ]"
  >
    <!-- Application Header -->
    <AppHeader
      :active-tab="activeTab"
      :theme="theme"
      @update:active-tab="tab => activeTab = tab"
      @toggle-theme="handleToggleTheme"
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
    <footer class="bg-[#091B2E] border-t-2 border-[#1E3A5F] py-4 px-6 text-center text-xs text-slate-200">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="font-bold">
          NISO Staff Acculturation Programme · Exercise Guide 3: Keep the Lights On
        </div>
        <div class="font-mono text-xs font-bold text-[#4ADE80] bg-[#143D24] px-3 py-1 rounded-full border border-[#389E5F]/50">
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
  background: #091B2E;
}
::-webkit-scrollbar-thumb {
  background: #389E5F;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #2B7A49;
}
</style>
