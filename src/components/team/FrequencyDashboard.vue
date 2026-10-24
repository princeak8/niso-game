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

// Latest Y coordinate on the oscilloscope chart [48.5, 51.5] -> [height, 0]
const latestChartY = computed(() => {
  const minF = 48.5;
  const maxF = 51.5;
  const height = 90;
  const f = Math.max(minF, Math.min(maxF, props.frequency));
  const normalizedF = (f - minF) / (maxF - minF);
  return height - normalizedF * height;
});

// Calculate SVG polyline points for rolling history
const chartPoints = computed(() => {
  const width = 360;
  const height = 90;
  const minF = 48.5;
  const maxF = 51.5;

  if (!props.history || props.history.length < 2) {
    const y = latestChartY.value;
    return `0,${y.toFixed(1)} ${width},${y.toFixed(1)}`;
  }
  const pts = props.history;
  const count = pts.length;

  return pts
    .map((p, idx) => {
      const x = (idx / (count - 1)) * width;
      const f = Math.max(minF, Math.min(maxF, p.frequency));
      const normalizedF = (f - minF) / (maxF - minF);
      const y = height - normalizedF * height;
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
  <div class="bg-[#0B1E33] border border-[#0D626C]/40 rounded-lg p-1.5 shadow-md">
    
    <!-- Header with Frequency & Controller View Toggle -->
    <div class="flex flex-wrap items-center justify-between gap-1 mb-1 pb-1 border-b border-slate-700/60">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full animate-ping shrink-0" :class="{
          'bg-emerald-400': statusBand === 'normal',
          'bg-amber-400': statusBand === 'alert',
          'bg-rose-500': statusBand.startsWith('critical')
        }"></span>
        <h2 class="text-xs font-black uppercase tracking-wider text-slate-200">
          Grid Frequency (50.00 Hz)
        </h2>
        <span class="text-[8.5px] font-bold px-1.5 py-0.2 rounded border" :class="statusBadgeClass">
          {{ statusBand === 'normal' ? 'Normal (49.5–50.5)' : statusBand === 'alert' ? 'Alert Band' : 'CRITICAL TRIP' }}
        </span>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          @click="emit('update:isControllerView', !isControllerView)"
          :class="[
            'px-2 py-0.5 rounded text-[9.5px] font-bold border transition flex items-center gap-1 cursor-pointer',
            isControllerView
              ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
          ]"
        >
          <span>🎧</span>
          <span>Voice {{ isControllerView ? 'ON' : 'OFF' }}</span>
        </button>
      </div>
    </div>

    <!-- Main Visuals Grid: Gauge + Rolling Line Chart -->
    <div class="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center">
      
      <!-- Semi-Circular Radial Gauge -->
      <div class="sm:col-span-5 flex flex-col items-center justify-center p-1 bg-[#071626] rounded-lg border border-slate-800">
        <div class="relative w-28 h-14 sm:w-32 sm:h-16 flex items-end justify-center">
          
          <!-- Gauge Arc Background SVG -->
          <svg viewBox="0 0 200 110" class="w-full h-full overflow-visible">
            <!-- Critical Low Red Band (48.0 - 48.8) -->
            <path d="M 20 100 A 80 80 0 0 1 45 45" fill="none" stroke="#EF4444" stroke-width="15" stroke-linecap="round" />
            <!-- Alert Low Amber Band (48.8 - 49.5) -->
            <path d="M 45 45 A 80 80 0 0 1 75 25" fill="none" stroke="#F59E0B" stroke-width="15" />
            <!-- Normal NISO Green Band (49.5 - 50.5) -->
            <path d="M 75 25 A 80 80 0 0 1 125 25" fill="none" stroke="#389E5F" stroke-width="18" />
            <!-- Alert High Amber Band (50.5 - 51.2) -->
            <path d="M 125 25 A 80 80 0 0 1 155 45" fill="none" stroke="#F59E0B" stroke-width="15" />
            <!-- Critical High Red Band (51.2 - 52.0) -->
            <path d="M 155 45 A 80 80 0 0 1 180 100" fill="none" stroke="#EF4444" stroke-width="15" stroke-linecap="round" />

            <!-- Dial Tick Labels so user can clearly see where it points -->
            <text x="24" y="98" fill="#CBD5E1" font-size="8.5" font-weight="800" font-family="monospace" text-anchor="middle">48</text>
            <text x="50" y="58" fill="#FDE047" font-size="8.5" font-weight="800" font-family="monospace" text-anchor="middle">49</text>
            <text x="100" y="38" fill="#4ADE80" font-size="9.5" font-weight="900" font-family="monospace" text-anchor="middle">50</text>
            <text x="150" y="58" fill="#FDE047" font-size="8.5" font-weight="800" font-family="monospace" text-anchor="middle">51</text>
            <text x="176" y="98" fill="#CBD5E1" font-size="8.5" font-weight="800" font-family="monospace" text-anchor="middle">52</text>

            <!-- 50.0 Hz Center Marker Notch -->
            <line x1="100" y1="10" x2="100" y2="28" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" />
            <!-- 49.5 Marker -->
            <line x1="75" y1="18" x2="78" y2="30" stroke="#FFFFFF" stroke-width="2" />
            <!-- 50.5 Marker -->
            <line x1="125" y1="18" x2="122" y2="30" stroke="#FFFFFF" stroke-width="2" />

            <!-- High-Visibility Dynamic SVG Needle Hand (Centered at 100, 100) -->
            <g :transform="`rotate(${needleAngle} 100 100)`" class="transition-transform duration-100 ease-out">
              <!-- High-Contrast White Silhouette -->
              <polygon points="96,100 104,100 101.5,10 98.5,10" fill="#FFFFFF" />
              <!-- Red Main Blade -->
              <polygon points="97,100 103,100 101,11 99,11" fill="#DC2626" />
              <!-- Prominent Sharp Pointer Arrowhead -->
              <polygon points="93,24 107,24 100,6" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.8" />
              <!-- Center Ridge Highlight -->
              <line x1="100" y1="95" x2="100" y2="8" stroke="#FEE2E2" stroke-width="1.2" />
            </g>

            <!-- Needle Pivot Cap Hub -->
            <circle cx="100" cy="100" r="8" fill="#0B1E33" stroke="#FFFFFF" stroke-width="2.5" />
            <circle cx="100" cy="100" r="4.5" fill="#EF4444" stroke="#FFFFFF" stroke-width="1" />
            <circle cx="100" cy="100" r="1.5" fill="#FFFFFF" />
          </svg>
        </div>

        <!-- Frequency Digital Readout -->
        <div class="mt-0.5 text-center">
          <div class="text-sm sm:text-base font-black font-mono tracking-tight leading-tight" :class="{
            'text-[#4ADE80]': statusBand === 'normal',
            'text-[#FBBF24]': statusBand === 'alert',
            'text-[#F87171]': statusBand.startsWith('critical')
          }">
            {{ frequency.toFixed(2) }} <span class="text-[9.5px] font-sans font-extrabold text-slate-300">Hz</span>
          </div>

          <div class="flex items-center justify-center gap-1.5 text-[8.5px] font-mono font-bold text-slate-300">
            <span>RoCoF: <b :class="rocof < 0 ? 'text-[#FCD34D]' : 'text-white'">{{ (rocof >= 0 ? '+' : '') + rocof.toFixed(2) }}</b></span>
            <span>·</span>
            <span>Δ: <b :class="imbalanceMW < 0 ? 'text-[#FDA4AF]' : imbalanceMW > 0 ? 'text-[#7DD3FC]' : 'text-[#86EFAC]'">{{ (imbalanceMW >= 0 ? '+' : '') + imbalanceMW }}MW</b></span>
          </div>
        </div>
      </div>

      <!-- 40-Second Rolling Oscilloscope Chart -->
      <div class="sm:col-span-7 flex flex-col justify-between p-1.5 bg-[#091B2E] rounded-lg border border-slate-700 min-h-[76px]">
        <div class="flex items-center justify-between text-[8.5px] font-black text-slate-300 mb-0.5">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="tracking-wide uppercase">Frequency Oscilloscope</span>
          </div>
          <span class="font-mono text-[#4ADE80] font-bold">Nominal: 50.00 Hz</span>
        </div>

        <div class="relative w-full h-11 sm:h-12 bg-slate-950 rounded border border-slate-800 p-0.5 overflow-hidden">
          <!-- Grid Reference Lines -->
          <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-[#389E5F]/50 border-dashed"></div>
          <div class="absolute inset-x-0 top-[20%] border-b border-amber-400/20 text-[7px] text-amber-300/80 pl-0.5 font-mono">50.5</div>
          <div class="absolute inset-x-0 bottom-[20%] border-b border-amber-400/20 text-[7px] text-amber-300/80 pl-0.5 font-mono">49.5</div>

          <!-- Dynamic SVG Waveform & Live Pointer Hand -->
          <svg viewBox="0 0 360 90" class="w-full h-full overflow-visible" preserveAspectRatio="none">
            <!-- Background Glow Line -->
            <polyline
              v-if="chartPoints"
              fill="none"
              stroke="#22C55E"
              stroke-width="4"
              opacity="0.25"
              stroke-linecap="round"
              stroke-linejoin="round"
              :points="chartPoints"
            />
            <!-- Sharp Foreground Signal Waveform -->
            <polyline
              v-if="chartPoints"
              fill="none"
              stroke="#4ADE80"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              :points="chartPoints"
            />

            <!-- Current Frequency Horizontal Guideline -->
            <line
              x1="0"
              :y1="latestChartY"
              x2="360"
              :y2="latestChartY"
              stroke="#F59E0B"
              stroke-width="1"
              stroke-dasharray="3,3"
              opacity="0.6"
            />

            <!-- Live Frequency Oscilloscope Hand / Tracer Beacon -->
            <g :transform="`translate(355, ${latestChartY})`">
              <!-- Radar Ping -->
              <circle cx="0" cy="0" r="7" fill="#EF4444" opacity="0.4" class="animate-ping" />
              <!-- White Outer Contrast Ring -->
              <circle cx="0" cy="0" r="5" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.8" />
              <!-- Center Dot -->
              <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
              <!-- Pointer Arrowhead -->
              <polygon points="-7,0 -13,-3.5 -13,3.5" fill="#FDE047" stroke="#000000" stroke-width="0.8" />
            </g>
          </svg>
        </div>

        <div class="flex justify-between items-center text-[7.5px] text-slate-400 font-mono mt-0.5">
          <span>-40s</span>
          <span>-20s</span>
          <span class="font-bold flex items-center gap-1">
            <span>Now:</span>
            <span :class="{
              'text-[#4ADE80]': statusBand === 'normal',
              'text-[#FBBF24]': statusBand === 'alert',
              'text-[#F87171]': statusBand.startsWith('critical')
            }">{{ frequency.toFixed(2) }} Hz</span>
          </span>
        </div>
      </div>

    </div>

    <!-- Controller Annotation Banner -->
    <div
      v-if="isControllerView"
      class="mt-1.5 p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-[10px] flex items-center gap-1.5"
    >
      <span class="text-sm">🎙️</span>
      <p class="font-mono text-cyan-100 truncate flex-1">
        {{ controllerMessage }}
      </p>
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
