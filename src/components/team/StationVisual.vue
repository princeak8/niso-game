<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  id: 'kainji' | 'egbin' | 'geregu' | 'kano';
  plantType: 'Hydro' | 'Gas' | 'Solar';
  currentMW: number;
  currentTokens: number;
  roundId: number;
  isTripped?: boolean;
}>();

// Determine if solar is operating in night/dawn mode
const isSolarNight = computed(() => {
  return props.id === 'kano' && (props.roundId === 0 || props.roundId === 5 || props.roundId === 6 || props.currentMW === 0);
});
</script>

<template>
  <div class="relative w-full h-5 sm:h-6 rounded overflow-hidden border border-black/30 shadow-inner mb-0.5">
    
    <!-- 1. HYDRO POWER PLANT (KAINJI HYDROELECTRIC DAM) -->
    <div v-if="plantType === 'Hydro'" class="relative w-full h-full bg-gradient-to-b from-[#0284C7] via-[#0369A1] to-[#0C4A6E]">
      <svg viewBox="0 0 400 96" class="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="damWall" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#94A3B8" />
            <stop offset="50%" stop-color="#64748B" />
            <stop offset="100%" stop-color="#475569" />
          </linearGradient>
          <linearGradient id="reservoirWater" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#38BDF8" />
            <stop offset="100%" stop-color="#0284C7" />
          </linearGradient>
          <linearGradient id="dischargeWater" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#E0F2FE" />
            <stop offset="100%" stop-color="#38BDF8" />
          </linearGradient>
        </defs>

        <!-- Upstream Reservoir Water -->
        <rect x="0" y="0" width="130" height="96" fill="url(#reservoirWater)" />
        <!-- Water ripple lines upstream -->
        <path d="M 5,20 Q 35,16 65,20 T 125,20" fill="none" stroke="#BAE6FD" stroke-width="1.5" opacity="0.6" />
        <path d="M 10,45 Q 40,41 70,45 T 125,45" fill="none" stroke="#BAE6FD" stroke-width="1.5" opacity="0.5" />
        <path d="M 5,70 Q 35,66 65,70 T 125,70" fill="none" stroke="#BAE6FD" stroke-width="1.5" opacity="0.4" />

        <!-- Mountain / Hillside Background -->
        <path d="M 0,40 L 40,10 L 90,30 L 130,5 L 140,96 L 0,96 Z" fill="#334155" opacity="0.3" />

        <!-- Massive Curved Concrete Dam Structure -->
        <path d="M 125,0 L 165,0 L 220,96 L 145,96 Z" fill="url(#damWall)" stroke="#334155" stroke-width="1.5" />

        <!-- Concrete Spillway Chutes (3 Spillways) -->
        <!-- Spillway 1 -->
        <path d="M 140,18 L 152,18 L 175,96 L 160,96 Z" fill="#334155" />
        <!-- Spillway 2 -->
        <path d="M 155,18 L 167,18 L 190,96 L 175,96 Z" fill="#334155" />
        <!-- Spillway 3 -->
        <path d="M 170,18 L 182,18 L 205,96 L 190,96 Z" fill="#334155" />

        <!-- Water Rushing Down Spillways (Animated if Generating) -->
        <g v-if="currentMW > 0">
          <path d="M 142,20 L 150,20 L 173,96 L 162,96 Z" fill="url(#dischargeWater)" opacity="0.9" />
          <path d="M 157,20 L 165,20 L 188,96 L 177,96 Z" fill="url(#dischargeWater)" opacity="0.9" />
          <path d="M 172,20 L 180,20 L 203,96 L 192,96 Z" fill="url(#dischargeWater)" opacity="0.9" />
          
          <!-- Animated Flow Streams -->
          <line x1="146" y1="20" x2="167" y2="96" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="8 4" class="animate-cascade" />
          <line x1="161" y1="20" x2="182" y2="96" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="8 4" class="animate-cascade" />
          <line x1="176" y1="20" x2="197" y2="96" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="8 4" class="animate-cascade" />

          <!-- Foaming Discharge Rapids at Base -->
          <ellipse cx="185" cy="92" rx="35" ry="8" fill="#FFFFFF" opacity="0.85" />
          <ellipse cx="195" cy="88" rx="25" ry="6" fill="#E0F2FE" opacity="0.9" />
        </g>
        <g v-else>
          <!-- Spillway Gates Closed -->
          <rect x="141" y="16" width="10" height="8" fill="#EF4444" />
          <rect x="156" y="16" width="10" height="8" fill="#EF4444" />
          <rect x="171" y="16" width="10" height="8" fill="#EF4444" />
        </g>

        <!-- Dam Crest Road / Walkway on Top -->
        <rect x="125" y="0" width="40" height="8" fill="#CBD5E1" stroke="#475569" stroke-width="1" />
        <!-- Railings on top -->
        <line x1="125" y1="2" x2="165" y2="2" stroke="#FFFFFF" stroke-width="1.5" />

        <!-- Powerhouse Building at Dam Base -->
        <rect x="220" y="45" width="85" height="51" fill="#1E293B" stroke="#0F172A" stroke-width="1.5" />
        <rect x="225" y="40" width="75" height="6" fill="#475569" />
        <!-- Generator Hall Windows -->
        <rect x="230" y="55" width="12" height="18" fill="#38BDF8" opacity="0.8" />
        <rect x="248" y="55" width="12" height="18" fill="#38BDF8" opacity="0.8" />
        <rect x="266" y="55" width="12" height="18" fill="#38BDF8" opacity="0.8" />
        <rect x="284" y="55" width="12" height="18" fill="#38BDF8" opacity="0.8" />

        <!-- High-Voltage Transmission Tower / Pylon on Right Bank -->
        <g transform="translate(330, 8) scale(0.75)">
          <!-- Lattice Pylon Legs -->
          <line x1="20" y1="10" x2="5" y2="110" stroke="#E2E8F0" stroke-width="2.5" />
          <line x1="20" y1="10" x2="35" y2="110" stroke="#E2E8F0" stroke-width="2.5" />
          <!-- Crossbars -->
          <line x1="0" y1="35" x2="40" y2="35" stroke="#E2E8F0" stroke-width="2" />
          <line x1="5" y1="65" x2="35" y2="65" stroke="#E2E8F0" stroke-width="2" />
          <!-- Cross Lattice -->
          <line x1="10" y1="35" x2="30" y2="65" stroke="#E2E8F0" stroke-width="1.5" />
          <line x1="30" y1="35" x2="10" y2="65" stroke="#E2E8F0" stroke-width="1.5" />
          <line x1="8" y1="65" x2="32" y2="100" stroke="#E2E8F0" stroke-width="1.5" />
          <line x1="32" y1="65" x2="8" y2="100" stroke="#E2E8F0" stroke-width="1.5" />
          <!-- Insulators -->
          <line x1="0" y1="35" x2="0" y2="44" stroke="#389E5F" stroke-width="3" />
          <line x1="40" y1="35" x2="40" y2="44" stroke="#389E5F" stroke-width="3" />
          <!-- Power lines running out -->
          <path d="M 0,44 Q 30,55 60,50" fill="none" stroke="#FCD34D" stroke-width="1.5" opacity="0.9" />
          <path d="M 40,44 Q 70,55 100,50" fill="none" stroke="#FCD34D" stroke-width="1.5" opacity="0.9" />
        </g>
      </svg>
    </div>


    <!-- 2. GAS A: EGBIN THERMAL & STEAM POWER STATION -->
    <div v-else-if="id === 'egbin'" class="relative w-full h-full bg-gradient-to-b from-[#1E293B] to-[#0F172A]">
      <svg viewBox="0 0 400 96" class="w-full h-full" preserveAspectRatio="none">
        <!-- Lagoon / River Foreground Water (Egbin is on Lagos Lagoon) -->
        <rect x="0" y="80" width="400" height="16" fill="#0C4A6E" opacity="0.6" />
        <path d="M 0,86 Q 100,82 200,86 T 400,86" fill="none" stroke="#38BDF8" stroke-width="1" opacity="0.4" />

        <!-- Main Boiler & Turbine Hall Complex -->
        <rect x="60" y="42" width="180" height="42" fill="#334155" stroke="#1E293B" stroke-width="1.5" />
        <rect x="55" y="38" width="190" height="6" fill="#475569" />
        <!-- Industrial Louvers & Vent Grilles -->
        <line x1="70" y1="52" x2="110" y2="52" stroke="#1E293B" stroke-width="2" />
        <line x1="70" y1="58" x2="110" y2="58" stroke="#1E293B" stroke-width="2" />
        <line x1="70" y1="64" x2="110" y2="64" stroke="#1E293B" stroke-width="2" />
        <line x1="70" y1="70" x2="110" y2="70" stroke="#1E293B" stroke-width="2" />

        <!-- Gas Pipeline Supply Feed (Yellow pipes) -->
        <path d="M 0,72 L 55,72 L 55,60 L 65,60" fill="none" stroke="#FBBF24" stroke-width="4" />
        <circle cx="55" cy="66" r="4" fill="#D97706" />

        <!-- Steam Drum / Reheater Housing -->
        <rect x="125" y="26" width="70" height="18" fill="#1E293B" stroke="#475569" stroke-width="1" />
        <ellipse cx="160" cy="26" rx="30" ry="5" fill="#64748B" />

        <!-- 3 TALL ICONIC THERMAL EXHAUST CHIMNEYS WITH RED & WHITE STRIPES -->
        <!-- Stack 1 -->
        <g transform="translate(130, 2)">
          <path d="M 3,40 L 5,0 L 15,0 L 17,40 Z" fill="#E2E8F0" stroke="#334155" stroke-width="0.8" />
          <!-- Red aviation stripes -->
          <polygon points="4.8,4 15.2,4 14.8,11 5.2,11" fill="#EF4444" />
          <polygon points="4.4,18 15.6,18 16.2,25 3.8,25" fill="#EF4444" />
          <polygon points="3.6,32 16.4,32 16.8,39 3.2,39" fill="#EF4444" />
          <!-- Steam Plume (if operating and not tripped) -->
          <g v-if="currentMW > 0 && !isTripped" class="animate-steam">
            <ellipse cx="10" cy="-4" rx="7" ry="4" fill="#FFFFFF" opacity="0.6" />
            <ellipse cx="12" cy="-10" rx="10" ry="5" fill="#FFFFFF" opacity="0.4" />
            <ellipse cx="14" cy="-17" rx="13" ry="6" fill="#FFFFFF" opacity="0.2" />
          </g>
        </g>

        <!-- Stack 2 (Center) -->
        <g transform="translate(160, 0)">
          <path d="M 3,42 L 5,0 L 15,0 L 17,42 Z" fill="#E2E8F0" stroke="#334155" stroke-width="0.8" />
          <polygon points="4.8,4 15.2,4 14.8,11 5.2,11" fill="#EF4444" />
          <polygon points="4.4,18 15.6,18 16.2,25 3.8,25" fill="#EF4444" />
          <polygon points="3.6,32 16.4,32 16.8,39 3.2,39" fill="#EF4444" />
          <g v-if="currentMW > 0 && !isTripped" class="animate-steam" style="animation-delay: 0.6s;">
            <ellipse cx="10" cy="-4" rx="8" ry="5" fill="#FFFFFF" opacity="0.6" />
            <ellipse cx="11" cy="-11" rx="11" ry="6" fill="#FFFFFF" opacity="0.4" />
            <ellipse cx="13" cy="-18" rx="14" ry="7" fill="#FFFFFF" opacity="0.2" />
          </g>
        </g>

        <!-- Stack 3 -->
        <g transform="translate(190, 4)">
          <path d="M 3,38 L 5,0 L 15,0 L 17,38 Z" fill="#E2E8F0" stroke="#334155" stroke-width="0.8" />
          <polygon points="4.8,4 15.2,4 14.8,11 5.2,11" fill="#EF4444" />
          <polygon points="4.4,18 15.6,18 16.2,25 3.8,25" fill="#EF4444" />
          <polygon points="3.6,32 16.4,32 16.8,39 3.2,39" fill="#EF4444" />
          <g v-if="currentMW > 0 && !isTripped" class="animate-steam" style="animation-delay: 1.2s;">
            <ellipse cx="10" cy="-4" rx="7" ry="4" fill="#FFFFFF" opacity="0.6" />
            <ellipse cx="9" cy="-10" rx="9" ry="5" fill="#FFFFFF" opacity="0.4" />
            <ellipse cx="8" cy="-16" rx="12" ry="6" fill="#FFFFFF" opacity="0.2" />
          </g>
        </g>

        <!-- Gas Flame Combustion Window inside boiler hall -->
        <g v-if="currentMW > 0 && !isTripped" transform="translate(85, 62)">
          <ellipse cx="12" cy="12" rx="14" ry="8" fill="#F59E0B" opacity="0.4" />
          <!-- Animated Flame -->
          <path d="M 8,16 Q 12,2 14,8 Q 16,0 18,16 Z" fill="#FBBF24" class="animate-flame" />
          <path d="M 10,16 Q 13,6 15,10 Q 16,5 17,16 Z" fill="#38BDF8" opacity="0.8" />
        </g>

        <!-- High-Voltage Switchyard on Right -->
        <g transform="translate(260, 40)">
          <!-- Transformer Banks -->
          <rect x="0" y="24" width="28" height="20" fill="#1E293B" stroke="#475569" stroke-width="1.5" />
          <line x1="5" y1="20" x2="5" y2="24" stroke="#CBD5E1" stroke-width="2" />
          <circle cx="5" cy="19" r="2" fill="#F59E0B" />
          <line x1="14" y1="20" x2="14" y2="24" stroke="#CBD5E1" stroke-width="2" />
          <circle cx="14" cy="19" r="2" fill="#F59E0B" />
          <line x1="23" y1="20" x2="23" y2="24" stroke="#CBD5E1" stroke-width="2" />
          <circle cx="23" cy="19" r="2" fill="#F59E0B" />

          <!-- Substation Pylon -->
          <line x1="45" y1="0" x2="35" y2="44" stroke="#94A3B8" stroke-width="2" />
          <line x1="45" y1="0" x2="55" y2="44" stroke="#94A3B8" stroke-width="2" />
          <line x1="30" y1="14" x2="60" y2="14" stroke="#94A3B8" stroke-width="2" />
          <line x1="33" y1="28" x2="57" y2="28" stroke="#94A3B8" stroke-width="1.5" />
          <line x1="30" y1="14" x2="100" y2="10" stroke="#FCD34D" stroke-width="1.5" opacity="0.8" />
        </g>

        <!-- Emergency Tripped Graphic in Round 3 -->
        <g v-if="isTripped">
          <rect x="0" y="0" width="400" height="96" fill="#991B1B" opacity="0.4" />
          <rect x="70" y="30" width="260" height="34" rx="8" fill="#7F1D1D" stroke="#EF4444" stroke-width="2" />
          <text x="200" y="52" fill="#FFFFFF" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">
            🚨 UNIT TRIPPED OFFLINE (0 MW) 🚨
          </text>
        </g>
      </svg>

      <!-- Emergency Tripped Overlay Banner -->
      <div v-if="isTripped" class="absolute inset-0 flex items-center justify-center bg-rose-950/80 backdrop-blur-xs text-white font-black text-[9px] tracking-wider uppercase border border-rose-500">
        <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping mr-1"></span>
        <span>🚨 TRIPPED OFFLINE (0 MW)</span>
      </div>
    </div>


    <!-- 3. GAS B: GEREGU GAS TURBINE POWER PLANT -->
    <div v-else-if="id === 'geregu'" class="relative w-full h-full bg-gradient-to-b from-[#18181B] to-[#27272A]">
      <svg viewBox="0 0 400 96" class="w-full h-full" preserveAspectRatio="none">
        <!-- Industrial Base Grid Floor -->
        <rect x="0" y="78" width="400" height="18" fill="#09090B" />

        <!-- Gas Turbine Enclosure (Aeroderivative Unit) -->
        <rect x="70" y="44" width="160" height="38" rx="4" fill="#3F3F46" stroke="#18181B" stroke-width="1.5" />
        <!-- Air Intake Filter House (Left) -->
        <rect x="40" y="24" width="36" height="58" fill="#27272A" stroke="#52525B" stroke-width="1.5" />
        <!-- Louver slats on filter house -->
        <line x1="44" y1="32" x2="72" y2="32" stroke="#71717A" stroke-width="2" />
        <line x1="44" y1="40" x2="72" y2="40" stroke="#71717A" stroke-width="2" />
        <line x1="44" y1="48" x2="72" y2="48" stroke="#71717A" stroke-width="2" />
        <line x1="44" y1="56" x2="72" y2="56" stroke="#71717A" stroke-width="2" />
        <line x1="44" y1="64" x2="72" y2="64" stroke="#71717A" stroke-width="2" />
        <line x1="44" y1="72" x2="72" y2="72" stroke="#71717A" stroke-width="2" />

        <!-- High-Pressure Natural Gas Pipeline with Valves -->
        <path d="M 0,82 L 40,82 L 40,70 L 75,70" fill="none" stroke="#F59E0B" stroke-width="5" />
        <circle cx="20" cy="82" r="5" fill="#D97706" />
        <rect x="18" y="74" width="4" height="6" fill="#F59E0B" />

        <!-- Twin Gas Turbine Exhaust Ducts -->
        <!-- Stack 1 -->
        <rect x="170" y="10" width="22" height="36" fill="#52525B" stroke="#27272A" stroke-width="1.5" />
        <ellipse cx="181" cy="10" rx="11" ry="3.5" fill="#71717A" />
        <!-- Stack 2 -->
        <rect x="200" y="14" width="22" height="32" fill="#52525B" stroke="#27272A" stroke-width="1.5" />
        <ellipse cx="211" cy="14" rx="11" ry="3.5" fill="#71717A" />

        <!-- Exhaust Heat Waves (if generating) -->
        <g v-if="currentMW > 0">
          <path d="M 175,8 Q 181,0 187,8" fill="none" stroke="#FBBF24" stroke-width="2" opacity="0.6" class="animate-pulse" />
          <path d="M 205,12 Q 211,4 217,12" fill="none" stroke="#FBBF24" stroke-width="2" opacity="0.6" class="animate-pulse" />
        </g>

        <!-- Cutaway Chamber: Spinning Gas Turbine Rotor & Combustion Flame -->
        <rect x="85" y="52" width="75" height="24" rx="4" fill="#09090B" stroke="#F59E0B" stroke-width="1" />
        
        <!-- Rotating Turbine Blades Motif -->
        <g transform="translate(100, 64)">
          <circle cx="0" cy="0" r="10" fill="none" stroke="#71717A" stroke-width="1.5" />
          <line x1="-9" y1="0" x2="9" y2="0" stroke="#E4E4E7" stroke-width="2" />
          <line x1="0" y1="-9" x2="0" y2="9" stroke="#E4E4E7" stroke-width="2" />
          <line x1="-6" y1="-6" x2="6" y2="6" stroke="#E4E4E7" stroke-width="2" />
          <line x1="-6" y1="6" x2="6" y2="-6" stroke="#E4E4E7" stroke-width="2" />
          <circle cx="0" cy="0" r="3" fill="#F59E0B" />
        </g>

        <!-- Roaring Gas Burner Flame Jets -->
        <g v-if="currentMW > 0" transform="translate(125, 64)">
          <ellipse cx="14" cy="0" rx="16" ry="8" fill="#F59E0B" opacity="0.5" />
          <path d="M 0,-6 Q 16,-1 24,0 Q 16,1 0,6 Z" fill="#FBBF24" class="animate-flame" />
          <path d="M 0,-3 Q 10,-1 16,0 Q 10,1 0,3 Z" fill="#38BDF8" />
        </g>

        <!-- Generator & Output Transformers on Right -->
        <rect x="235" y="50" width="45" height="32" fill="#27272A" stroke="#52525B" stroke-width="1.5" />
        <rect x="240" y="44" width="35" height="6" fill="#71717A" />
        <circle cx="248" cy="62" r="5" fill="#38BDF8" opacity="0.8" />
        <circle cx="265" cy="62" r="5" fill="#38BDF8" opacity="0.8" />

        <!-- 330kV Pylon on far right -->
        <g transform="translate(325, 12) scale(0.75)">
          <line x1="20" y1="5" x2="5" y2="100" stroke="#D4D4D8" stroke-width="2.5" />
          <line x1="20" y1="5" x2="35" y2="100" stroke="#D4D4D8" stroke-width="2.5" />
          <line x1="0" y1="30" x2="40" y2="30" stroke="#D4D4D8" stroke-width="2" />
          <line x1="5" y1="55" x2="35" y2="55" stroke="#D4D4D8" stroke-width="2" />
          <line x1="0" y1="30" x2="80" y2="25" stroke="#FCD34D" stroke-width="1.5" />
          <line x1="40" y1="30" x2="100" y2="25" stroke="#FCD34D" stroke-width="1.5" />
        </g>
      </svg>
    </div>


    <!-- 4. SOLAR POWER PLANT (KANO SOLAR PHOTOVOLTAIC FARM) -->
    <div v-else-if="plantType === 'Solar'" class="relative w-full h-full transition-colors duration-500" :class="isSolarNight ? 'bg-gradient-to-b from-[#0F172A] via-[#1E1B4B] to-[#020617]' : 'bg-gradient-to-b from-[#38BDF8] via-[#7DD3FC] to-[#FEF08A]'">
      <svg viewBox="0 0 400 96" class="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="solarPanelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1E3A8A" />
            <stop offset="50%" stop-color="#1D4ED8" />
            <stop offset="100%" stop-color="#0284C7" />
          </linearGradient>
          <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FEF08A" />
            <stop offset="60%" stop-color="#FBBF24" />
            <stop offset="100%" stop-color="#EA580C" />
          </linearGradient>
        </defs>

        <!-- DAYTIME SUN & CLEAR SAVANNAH SKY -->
        <g v-if="!isSolarNight">
          <!-- Distant Northern Savannah Horizon Dunes -->
          <path d="M 0,65 Q 120,55 240,65 T 400,60 L 400,96 L 0,96 Z" fill="#CA8A04" opacity="0.4" />
          <path d="M 0,72 Q 100,66 220,72 T 400,70 L 400,96 L 0,96 Z" fill="#EAB308" opacity="0.3" />

          <!-- Radiant Golden Sun -->
          <g transform="translate(60, 22)">
            <!-- Outer Pulsing Glow -->
            <circle cx="0" cy="0" r="22" fill="#FEF08A" opacity="0.35" class="animate-ping" style="animation-duration: 3s;" />
            <circle cx="0" cy="0" r="16" fill="#FDE047" opacity="0.6" />
            <!-- Core Sun -->
            <circle cx="0" cy="0" r="11" fill="url(#sunGrad)" />
            <!-- Sunburst Rays -->
            <line x1="0" y1="-14" x2="0" y2="-20" stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round" />
            <line x1="0" y1="14" x2="0" y2="20" stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round" />
            <line x1="-14" y1="0" x2="-20" y2="0" stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round" />
            <line x1="14" y1="0" x2="20" y2="0" stroke="#FBBF24" stroke-width="2.5" stroke-linecap="round" />
            <line x1="-10" y1="-10" x2="-15" y2="-15" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" />
            <line x1="10" y1="10" x2="15" y2="15" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" />
            <line x1="10" y1="-10" x2="15" y2="-15" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" />
            <line x1="-10" y1="10" x2="-15" y2="15" stroke="#FBBF24" stroke-width="2" stroke-linecap="round" />
          </g>
        </g>

        <!-- NIGHT / SUNSET MODE (0 MW) -->
        <g v-else>
          <!-- Dark Horizon -->
          <path d="M 0,65 Q 120,55 240,65 T 400,60 L 400,96 L 0,96 Z" fill="#0F172A" opacity="0.8" />
          <!-- Twinkling Stars -->
          <circle cx="30" cy="15" r="1.5" fill="#FFFFFF" opacity="0.9" />
          <circle cx="85" cy="10" r="1.2" fill="#FFFFFF" opacity="0.8" />
          <circle cx="140" cy="22" r="1.5" fill="#FFFFFF" opacity="0.7" />
          <circle cx="210" cy="12" r="1" fill="#FFFFFF" opacity="0.9" />
          <circle cx="280" cy="18" r="1.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="340" cy="8" r="1.2" fill="#FFFFFF" opacity="0.9" />
          <!-- Crescent Moon -->
          <path d="M 50,15 A 8 8 0 0 0 58,28 A 10 10 0 1 1 50,15 Z" fill="#FDE047" opacity="0.85" />
        </g>

        <!-- PHOTOVOLTAIC SOLAR PANEL ARRAYS IN 3D PERSPECTIVE -->
        <!-- Front Row Panel 1 -->
        <g transform="translate(130, 48)">
          <!-- Mounting Frame Legs -->
          <line x1="5" y1="36" x2="5" y2="44" stroke="#64748B" stroke-width="2" />
          <line x1="65" y1="36" x2="65" y2="44" stroke="#64748B" stroke-width="2" />
          <!-- Angled Blue Panel Surface -->
          <polygon points="0,36 15,10 75,10 60,36" :fill="isSolarNight ? '#1E293B' : 'url(#solarPanelGrad)'" stroke="#94A3B8" stroke-width="1.5" />
          <!-- Silicon Grid Lines -->
          <line x1="30" y1="23" x2="45" y2="23" stroke="#BAE6FD" stroke-width="1" opacity="0.7" />
          <line x1="20" y1="36" x2="35" y2="10" stroke="#BAE6FD" stroke-width="1" opacity="0.7" />
          <line x1="40" y1="36" x2="55" y2="10" stroke="#BAE6FD" stroke-width="1" opacity="0.7" />
        </g>

        <!-- Front Row Panel 2 -->
        <g transform="translate(200, 48)">
          <line x1="5" y1="36" x2="5" y2="44" stroke="#64748B" stroke-width="2" />
          <line x1="65" y1="36" x2="65" y2="44" stroke="#64748B" stroke-width="2" />
          <polygon points="0,36 15,10 75,10 60,36" :fill="isSolarNight ? '#1E293B' : 'url(#solarPanelGrad)'" stroke="#94A3B8" stroke-width="1.5" />
          <line x1="30" y1="23" x2="45" y2="23" stroke="#BAE6FD" stroke-width="1" opacity="0.7" />
          <line x1="20" y1="36" x2="35" y2="10" stroke="#BAE6FD" stroke-width="1" opacity="0.7" />
          <line x1="40" y1="36" x2="55" y2="10" stroke="#BAE6FD" stroke-width="1" opacity="0.7" />
        </g>

        <!-- Front Row Panel 3 -->
        <g transform="translate(270, 48)">
          <line x1="5" y1="36" x2="5" y2="44" stroke="#64748B" stroke-width="2" />
          <line x1="65" y1="36" x2="65" y2="44" stroke="#64748B" stroke-width="2" />
          <polygon points="0,36 15,10 75,10 60,36" :fill="isSolarNight ? '#1E293B' : 'url(#solarPanelGrad)'" stroke="#94A3B8" stroke-width="1.5" />
          <line x1="30" y1="23" x2="45" y2="23" stroke="#BAE6FD" stroke-width="1" opacity="0.7" />
          <line x1="20" y1="36" x2="35" y2="10" stroke="#BAE6FD" stroke-width="1" opacity="0.7" />
          <line x1="40" y1="36" x2="55" y2="10" stroke="#BAE6FD" stroke-width="1" opacity="0.7" />
        </g>

        <!-- Back Row Panels (Receding Perspective) -->
        <g transform="translate(150, 32) scale(0.7)">
          <polygon points="0,30 12,8 60,8 48,30" :fill="isSolarNight ? '#0F172A' : '#1D4ED8'" stroke="#94A3B8" stroke-width="1" />
        </g>
        <g transform="translate(210, 32) scale(0.7)">
          <polygon points="0,30 12,8 60,8 48,30" :fill="isSolarNight ? '#0F172A' : '#1D4ED8'" stroke="#94A3B8" stroke-width="1" />
        </g>
        <g transform="translate(270, 32) scale(0.7)">
          <polygon points="0,30 12,8 60,8 48,30" :fill="isSolarNight ? '#0F172A' : '#1D4ED8'" stroke="#94A3B8" stroke-width="1" />
        </g>

        <!-- Central Inverter Kiosk & Step-up Substation on Right -->
        <g transform="translate(350, 52)">
          <rect x="0" y="10" width="36" height="30" fill="#E2E8F0" stroke="#475569" stroke-width="1.5" />
          <rect x="0" y="6" width="36" height="4" fill="#389E5F" />
          <!-- Danger High Voltage Symbol -->
          <polygon points="18,16 14,24 17,24 15,30 22,22 19,22" fill="#EAB308" />
        </g>
      </svg>

      <!-- Night Indicator (Only shown if night/0MW) -->
      <div v-if="isSolarNight" class="absolute top-0.5 right-1 flex items-center gap-1 bg-black/70 px-1.5 py-0.2 rounded text-amber-200 font-bold text-[8px] uppercase">
        <span>🌙 Night (0MW)</span>
      </div>
    </div>

  </div>
</template>

<style scoped>
@keyframes cascade {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -24; }
}
.animate-cascade {
  animation: cascade 0.8s linear infinite;
}

@keyframes steam {
  0% { transform: translateY(0) scale(0.9); opacity: 0.7; }
  50% { opacity: 0.4; }
  100% { transform: translateY(-16px) scale(1.3); opacity: 0; }
}
.animate-steam {
  animation: steam 1.8s ease-out infinite;
}

@keyframes flame {
  0%, 100% { transform: scaleY(1); opacity: 0.9; }
  50% { transform: scaleY(1.15) scaleX(0.95); opacity: 1; }
}
.animate-flame {
  transform-origin: bottom center;
  animation: flame 0.35s ease-in-out infinite;
}
</style>
