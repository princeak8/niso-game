<script setup lang="ts">
import type { PlantKind } from '../../types/grid';

withDefaults(defineProps<{
  kind: PlantKind;
  size?: number;
  active?: boolean; // true when the plant is generating (animates)
}>(), {
  size: 56,
  active: true,
});
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    :aria-label="kind + ' power plant'"
    class="plant-icon"
  >
    <!-- ===================== HYDRO: dam wall + water ===================== -->
    <g v-if="kind === 'hydro'">
      <circle cx="32" cy="32" r="30" fill="#0369A1" />
      <!-- reservoir (left) -->
      <path d="M6 22 H24 V50 H10 Z" fill="#38BDF8" opacity="0.9" />
      <path d="M8 28 q4 -3 8 0 t8 0" fill="none" stroke="#E0F2FE" stroke-width="1.6" />
      <path d="M8 36 q4 -3 8 0 t8 0" fill="none" stroke="#E0F2FE" stroke-width="1.6" />
      <!-- dam wall -->
      <path d="M24 16 H36 L44 52 H24 Z" fill="#CBD5E1" stroke="#475569" stroke-width="1.5" />
      <rect x="22" y="14" width="16" height="4" fill="#F1F5F9" stroke="#475569" stroke-width="1" />
      <!-- spill gates -->
      <rect x="27" y="24" width="3" height="10" fill="#475569" />
      <rect x="33" y="24" width="3" height="10" fill="#475569" />
      <!-- discharge -->
      <g :class="{ flow: active }">
        <path d="M28 34 L27 52 M34 34 L35 52" stroke="#FFFFFF" stroke-width="2.5" stroke-dasharray="4 3" />
      </g>
      <path d="M44 52 q4 -3 8 0 t8 0" fill="none" stroke="#BAE6FD" stroke-width="2" />
      <path d="M40 46 q4 -3 8 0 t8 0" fill="none" stroke="#7DD3FC" stroke-width="2" />
      <!-- lightning bolt -->
      <path d="M50 14 L44 24 H49 L46 32 L55 20 H50 Z" fill="#FDE047" stroke="#A16207" stroke-width="0.8" />
    </g>

    <!-- ===================== GAS: turbine + flame ===================== -->
    <g v-else-if="kind === 'gas'">
      <circle cx="32" cy="32" r="30" fill="#B45309" />
      <!-- turbine body -->
      <rect x="10" y="30" width="34" height="18" rx="5" fill="#3F3F46" stroke="#18181B" stroke-width="1.5" />
      <!-- air intake -->
      <rect x="6" y="26" width="9" height="26" fill="#52525B" stroke="#18181B" stroke-width="1.2" />
      <path d="M8 31 H13 M8 36 H13 M8 41 H13 M8 46 H13" stroke="#A1A1AA" stroke-width="1.4" />
      <!-- spinning rotor -->
      <g transform="translate(25 39)">
        <g :class="{ spin: active }">
          <circle r="7" fill="#18181B" stroke="#E4E4E7" stroke-width="1.2" />
          <path d="M0 -6 V6 M-6 0 H6 M-4.2 -4.2 L4.2 4.2 M-4.2 4.2 L4.2 -4.2" stroke="#E4E4E7" stroke-width="1.5" />
        </g>
        <circle r="2" fill="#FBBF24" />
      </g>
      <!-- generator -->
      <rect x="44" y="33" width="10" height="15" fill="#27272A" stroke="#18181B" stroke-width="1.2" />
      <circle cx="49" cy="40" r="2.5" fill="#38BDF8" />
      <!-- exhaust stack -->
      <rect x="34" y="14" width="8" height="17" fill="#71717A" stroke="#18181B" stroke-width="1.2" />
      <!-- flame -->
      <g :class="{ flicker: active }">
        <path d="M38 13 C33 8 38 5 37 1 C42 4 44 9 42 13 C41 11 40 10.5 38 13 Z" fill="#FBBF24" />
        <path d="M38.5 12 C36.5 9.5 39 8 38.5 6 C41 8 41.5 10 40.5 12 Z" fill="#EF4444" />
      </g>
    </g>

    <!-- ===================== STEAM: cooling tower + steam ===================== -->
    <g v-else-if="kind === 'steam'">
      <circle cx="32" cy="32" r="30" fill="#475569" />
      <!-- cooling tower (hyperboloid) -->
      <path d="M14 54 C18 44 20 36 19 28 L45 28 C44 36 46 44 50 54 Z" fill="#E2E8F0" stroke="#1E293B" stroke-width="1.5" />
      <path d="M22 54 C24 46 24 38 23.5 30 M32 54 V30 M42 54 C40 46 40 38 40.5 30" stroke="#94A3B8" stroke-width="1.2" fill="none" />
      <ellipse cx="32" cy="28" rx="13" ry="2.8" fill="#94A3B8" stroke="#1E293B" stroke-width="1.2" />
      <!-- steam puffs -->
      <g :class="{ rise: active }">
        <circle cx="28" cy="20" r="5.5" fill="#FFFFFF" opacity="0.95" />
        <circle cx="36" cy="16" r="6.5" fill="#FFFFFF" opacity="0.85" />
        <circle cx="31" cy="9" r="5" fill="#FFFFFF" opacity="0.7" />
        <circle cx="41" cy="9" r="3.8" fill="#FFFFFF" opacity="0.55" />
      </g>
      <!-- boiler/stack at side -->
      <rect x="51" y="34" width="5" height="20" fill="#CBD5E1" stroke="#1E293B" stroke-width="1" />
      <rect x="51" y="38" width="5" height="3" fill="#EF4444" />
      <rect x="51" y="45" width="5" height="3" fill="#EF4444" />
    </g>

    <!-- ===================== SOLAR: panels + sun ===================== -->
    <g v-else>
      <circle cx="32" cy="32" r="30" fill="#0EA5E9" />
      <!-- sun -->
      <g transform="translate(46 16)">
        <g :class="{ spin: active }" style="transform-box: fill-box; transform-origin: center;">
          <path d="M0 -10 V-6 M0 6 V10 M-10 0 H-6 M6 0 H10 M-7 -7 L-4.5 -4.5 M4.5 4.5 L7 7 M7 -7 L4.5 -4.5 M-4.5 4.5 L-7 7" stroke="#FDE047" stroke-width="2" stroke-linecap="round" />
        </g>
        <circle r="5" fill="#FACC15" stroke="#CA8A04" stroke-width="1" />
      </g>
      <!-- tilted panel -->
      <polygon points="8,48 18,26 54,26 44,48" fill="#1E3A8A" stroke="#E2E8F0" stroke-width="1.8" />
      <path d="M13 37 H49 M24 48 L32 26 M34 48 L41 26" stroke="#93C5FD" stroke-width="1.2" />
      <!-- legs -->
      <path d="M20 48 V56 M38 48 V56 M14 56 H44" stroke="#E2E8F0" stroke-width="2" stroke-linecap="round" />
    </g>
  </svg>
</template>

<style scoped>
.plant-icon { display: block; flex-shrink: 0; filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35)); }

@keyframes pi-spin { to { transform: rotate(360deg); } }
.spin { transform-box: fill-box; transform-origin: center; animation: pi-spin 3s linear infinite; }

@keyframes pi-flicker { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.18); } }
.flicker { transform-box: fill-box; transform-origin: bottom center; animation: pi-flicker 0.4s ease-in-out infinite; }

@keyframes pi-rise {
  0% { transform: translateY(5px); opacity: 0.4; }
  50% { opacity: 1; }
  100% { transform: translateY(-3px); opacity: 0.6; }
}
.rise { animation: pi-rise 2.2s ease-in-out infinite alternate; }

@keyframes pi-flow { to { stroke-dashoffset: -14; } }
.flow path { animation: pi-flow 0.7s linear infinite; }
</style>
