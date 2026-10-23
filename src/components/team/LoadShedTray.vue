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
  <div class="bg-[#0B1E33] border border-[#0D626C]/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
    
    <div>
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🔌</span>
          <h3 class="font-extrabold text-sm md:text-base text-slate-100 uppercase tracking-tight">
            Emergency Load Shedding
          </h3>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
          Last Resort Mechanism
        </span>
      </div>

      <p class="text-xs text-slate-400 mb-3">
        Rule 5: You may cut demand by up to 3 tokens (30 MW). <strong>Each token cut costs −1 point</strong> because customers lose power!
      </p>

      <!-- Token Selector Buttons -->
      <div class="grid grid-cols-4 gap-2 mb-3">
        <button
          v-for="tokens in [0, 1, 2, 3]"
          :key="tokens"
          type="button"
          @click="emit('update:loadShedTokens', tokens)"
          :disabled="isLocked"
          :class="[
            'py-2.5 rounded-xl font-bold text-xs md:text-sm border transition flex flex-col items-center justify-center gap-0.5',
            loadShedTokens === tokens
              ? tokens === 0
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                : 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-950/50'
              : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
          ]"
        >
          <span>{{ tokens === 0 ? 'None (0)' : `${tokens} Token${tokens > 1 ? 's' : ''}` }}</span>
          <span class="text-[10px] font-mono opacity-80">{{ tokens * 10 }} MW</span>
        </button>
      </div>
    </div>

    <!-- Live Status / Penalty Alert -->
    <div
      class="p-2.5 rounded-xl border text-xs flex items-center justify-between"
      :class="loadShedTokens > 0 ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' : 'bg-slate-950/60 border-slate-800 text-slate-400'"
    >
      <span class="font-medium">
        {{ loadShedTokens > 0 ? `Cutting ${loadShedTokens * 10} MW of customer load` : 'Full demand supplied (zero load shed)' }}
      </span>
      <span class="font-bold font-mono px-2 py-0.5 rounded" :class="loadShedTokens > 0 ? 'bg-rose-500/30 text-rose-300' : 'bg-slate-800 text-slate-400'">
        Penalty: {{ loadShedTokens > 0 ? `-${loadShedTokens} pt` : '0 pt' }}
      </span>
    </div>

  </div>
</template>
