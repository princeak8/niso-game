<script setup lang="ts">
const props = defineProps<{
  loadShedTokens: number;
  isLocked: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:loadShedTokens', tokens: number): void;
}>();
</script>

<template>
  <div class="bg-[#132E4C] border-2 border-[#389E5F]/50 rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col justify-between">
    
    <div>
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🔌</span>
          <h3 class="font-black text-base text-white uppercase tracking-tight">
            Emergency Load Shedding
          </h3>
        </div>
        <span class="text-xs font-black px-2.5 py-1 rounded-md bg-rose-500/25 text-[#FDA4AF] border border-rose-500/50">
          Last Resort Mechanism
        </span>
      </div>

      <p class="text-xs text-[#E2E8F0] font-bold mb-3.5">
        Rule 5: You may cut demand by up to 3 tokens (30 MW). <strong class="text-rose-300">Each token cut costs −1 point</strong> because customers lose power!
      </p>

      <!-- Token Selector Buttons -->
      <div class="grid grid-cols-4 gap-2.5 mb-3.5">
        <button
          v-for="tokens in [0, 1, 2, 3]"
          :key="tokens"
          type="button"
          @click="emit('update:loadShedTokens', tokens)"
          :disabled="isLocked"
          :class="[
            'py-3 rounded-xl font-black text-xs md:text-sm border-2 transition flex flex-col items-center justify-center gap-0.5',
            loadShedTokens === tokens
              ? tokens === 0
                ? 'bg-[#389E5F] text-white border-[#BBF7D0] shadow-lg shadow-green-950/60 scale-102'
                : 'bg-rose-600 text-white border-rose-300 shadow-lg shadow-rose-950/60 scale-102'
              : 'bg-[#091B2E] text-[#E2E8F0] hover:text-white border-slate-700 hover:bg-slate-800'
          ]"
        >
          <span>{{ tokens === 0 ? 'None (0)' : `${tokens} Token${tokens > 1 ? 's' : ''}` }}</span>
          <span class="text-[11px] font-mono font-bold opacity-90">{{ tokens * 10 }} MW</span>
        </button>
      </div>
    </div>

    <!-- Live Status / Penalty Alert -->
    <div
      class="p-3 rounded-xl border-2 text-xs flex items-center justify-between shadow-inner"
      :class="loadShedTokens > 0 ? 'bg-rose-950/60 border-rose-500 text-rose-100' : 'bg-[#091B2E] border-slate-700 text-[#CBD5E1]'"
    >
      <span class="font-black text-sm">
        {{ loadShedTokens > 0 ? `Cutting ${loadShedTokens * 10} MW of customer load` : 'Full demand supplied (zero load shed)' }}
      </span>
      <span class="font-bold font-mono px-2 py-0.5 rounded" :class="loadShedTokens > 0 ? 'bg-rose-500/30 text-rose-300' : 'bg-slate-800 text-slate-400'">
        Penalty: {{ loadShedTokens > 0 ? `-${loadShedTokens} pt` : '0 pt' }}
      </span>
    </div>

  </div>
</template>
