<script setup lang="ts">
import { computed } from 'vue';
import { FrequencyHistoryPoint } from '../../composables/useGridFrequency';

const props = defineProps<{
  frequency: number;
  rocof: number;
  statusBand: 'normal' | 'alert' | 'critical-low' | 'critical-high';
  history: FrequencyHistoryPoint[];
  imbalanceMW: number;
  controllerMessage: string;
  isControllerView: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:isControllerView', val: boolean): void;
}>();

// Gauge needle angle calculation:
// 48.0 Hz = -90 deg, 50.0 Hz = 0 deg, 52.0 Hz = +90 deg
const needleAngle = computed(() => {
  const f = Math.max(48.0, Math.min(52.0, props.frequency));
  return ((f - 50.0) / 2.0) * 90;
});

// Calculate SVG polyline points for rolling history
const chartPoints = computed(() => {
  if (props.history.length < 2) return '';
  const pts = props.history;
  const count = pts.length;
  const width = 360;
  const height = 90;

  // Map frequency range [48.5, 51.5] to height [height, 0]
  const minF = 48.5;
  const maxF = 51.5;

  return pts
    .map((p, idx) => {
      const x = (idx / (count - 1)) * width;
      const normalizedF = (p.frequency - minF) / (maxF - minF);
      const y = height - Math.max(0, Math.min(1, normalizedF)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
});

const statusBadgeClass = computed(() => {
  switch (props.statusBand) {
    case 'normal':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    case 'alert':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
    case 'critical-low':
    case 'critical-high':
      return 'bg-rose-500/25 text-rose-300 border-rose-500/60 font-black animate-bounce';
  }
});
</script>

<template>
  <div class="bg-[#0B1E33] border border-[#0D626C]/40 rounded-2xl p-4 shadow-xl">
    
    <!-- Header with Frequency & Controller View Toggle -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-700/60">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full animate-ping" :class="{
          'bg-emerald-400': statusBand === 'normal',
          'bg-amber-400': statusBand === 'alert',
          'bg-rose-500': statusBand.startsWith('critical')
        }"></span>
        <h2 class="text-xs md:text-sm font-extrabold uppercase tracking-wider text-slate-200">
          Grid Frequency Simulation (50.00 Hz)
        </h2>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded border" :class="statusBadgeClass">
          {{ statusBand === 'normal' ? 'Normal Band (49.5–50.5 Hz)' : statusBand === 'alert' ? 'Alert Operating Band' : 'CRITICAL UFLS / TRIP' }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="emit('update:isControllerView', !isControllerView)"
          :class="[
            'px-2.5 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1',
            isControllerView
              ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-900/40'
              : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
          ]"
        >
          <span>🎧</span>
          <span>Controller View {{ isControllerView ? 'ON' : 'OFF' }}</span>
        </button>
        <span class="text-[10px] text-slate-400 italic hidden lg:inline">
          Simplified Swing Equation Model
        </span>
      </div>
    </div>

    <!-- Main Visuals Grid: Gauge + Rolling Line Chart -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      
      <!-- Semi-Circular Radial Gauge -->
      <div class="md:col-span-5 flex flex-col items-center justify-center p-2 bg-[#071626] rounded-xl border border-slate-800">
        <div class="relative w-44 h-24 overflow-hidden flex items-end justify-center">
          
          <!-- Gauge Arc Background SVG -->
          <svg viewBox="0 0 200 110" class="w-full h-full">
            <!-- Critical Low Red Band (48.0 - 48.8) -->
            <path d="M 20 100 A 80 80 0 0 1 45 45" fill="none" stroke="#EF4444" stroke-width="14" stroke-linecap="round" />
            <!-- Alert Low Amber Band (48.8 - 49.5) -->
            <path d="M 45 45 A 80 80 0 0 1 75 25" fill="none" stroke="#F59E0B" stroke-width="14" />
            <!-- Normal Green Band (49.5 - 50.5) -->
            <path d="M 75 25 A 80 80 0 0 1 125 25" fill="none" stroke="#10B981" stroke-width="16" />
            <!-- Alert High Amber Band (50.5 - 51.2) -->
            <path d="M 125 25 A 80 80 0 0 1 155 45" fill="none" stroke="#F59E0B" stroke-width="14" />
            <!-- Critical High Red Band (51.2 - 52.0) -->
            <path d="M 155 45 A 80 80 0 0 1 180 100" fill="none" stroke="#EF4444" stroke-width="14" stroke-linecap="round" />

            <!-- 50.0 Hz Center Marker Notch -->
            <line x1="100" y1="12" x2="100" y2="28" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
            <!-- 49.5 Marker -->
            <line x1="75" y1="20" x2="78" y2="30" stroke="#CBD5E1" stroke-width="1.5" />
            <!-- 50.5 Marker -->
            <line x1="125" y1="20" x2="122" y2="30" stroke="#CBD5E1" stroke-width="1.5" />

            <!-- Needle Pivot Base -->
            <circle cx="100" cy="100" r="8" fill="#F8FAFC" />
          </svg>

          <!-- Dynamic SVG Needle -->
          <div
            class="absolute bottom-0 w-1 h-20 bg-rose-500 origin-bottom transition-transform duration-100 rounded-t-full shadow-lg"
            :style="{ transform: `rotate(${needleAngle}deg)` }"
          ></div>
        </div>

        <!-- Frequency Digital Readout -->
        <div class="mt-1 text-center">
          <div class="text-3xl font-black font-mono tracking-tight" :class="{
            'text-emerald-400': statusBand === 'normal',
            'text-amber-400': statusBand === 'alert',
            'text-rose-400': statusBand.startsWith('critical')
          }">
            {{ frequency.toFixed(2) }} <span class="text-sm font-sans text-slate-300">Hz</span>
          </div>

          <div class="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
            <span>ROCOF: <b :class="rocof < 0 ? 'text-amber-400' : 'text-slate-200'">{{ (rocof >= 0 ? '+' : '') + rocof.toFixed(2) }}</b> Hz/s</span>
            <span>·</span>
            <span>Imbalance: <b :class="imbalanceMW < 0 ? 'text-rose-400' : imbalanceMW > 0 ? 'text-cyan-400' : 'text-emerald-400'">{{ (imbalanceMW >= 0 ? '+' : '') + imbalanceMW }}</b> MW</span>
          </div>
        </div>
      </div>

      <!-- 60-Second Rolling Oscilloscope Chart -->
      <div class="md:col-span-7 flex flex-col justify-between p-2.5 bg-[#071626] rounded-xl border border-slate-800 h-full min-h-[140px]">
        <div class="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1 px-1">
          <span>Rolling 40s Frequency Oscilloscope</span>
          <span class="font-mono text-emerald-400">Target: 50.00 Hz</span>
        </div>

        <div class="relative w-full h-24 bg-slate-950/80 rounded-lg border border-slate-800/80 p-1 overflow-hidden">
          
          <!-- Grid Reference Lines -->
          <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-emerald-500/40 border-dashed"></div>
          <div class="absolute inset-x-0 top-[20%] border-b border-amber-500/20 text-[9px] text-amber-500/50 pl-1 font-mono">50.5 Hz</div>
          <div class="absolute inset-x-0 bottom-[20%] border-b border-amber-500/20 text-[9px] text-amber-500/50 pl-1 font-mono">49.5 Hz</div>

          <!-- Dynamic SVG Waveform -->
          <svg viewBox="0 0 360 90" class="w-full h-full overflow-visible" preserveAspectRatio="none">
            <!-- Glow effect filter -->
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <polyline
              v-if="chartPoints"
              fill="none"
              stroke="#10B981"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              filter="url(#glow)"
              :points="chartPoints"
            />
          </svg>
        </div>

        <div class="flex justify-between text-[10px] text-slate-400 font-mono mt-1 px-1">
          <span>-40s</span>
          <span>-20s</span>
          <span>Live Now (0s)</span>
        </div>
      </div>

    </div>

    <!-- Real-Time NCC Osogbo Controller Annotation Banner -->
    <div
      v-if="isControllerView"
      class="mt-3 p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs flex items-start gap-2.5 animate-fadeIn"
    >
      <span class="text-lg">🎙️</span>
      <div class="flex-1">
        <div class="font-bold uppercase tracking-wider text-[11px] text-cyan-300">
          NCC Osogbo Dispatch Console Voice Log:
        </div>
        <p class="font-mono text-xs text-cyan-100 mt-0.5 leading-relaxed">
          {{ controllerMessage }}
        </p>
      </div>
    </div>

  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
