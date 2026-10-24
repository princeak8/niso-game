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
  <div class="bg-[#132E4C] border border-[#389E5F]/50 rounded-lg p-1.5 shadow-md flex flex-col justify-between text-xs">
    
    <div>
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center gap-1">
          <span class="text-sm">🔌</span>
          <h3 class="font-black text-xs text-white uppercase tracking-tight">
            Load Shedding
          </h3>
        </div>
        <span class="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-rose-500/25 text-[#FDA4AF] border border-rose-500/50">
          Last Resort (-1 pt/tok)
        </span>
      </div>

      <!-- Token Selector Buttons -->
      <div class="grid grid-cols-4 gap-1 mb-1.5">
        <button
          v-for="tokens in [0, 1, 2, 3]"
          :key="tokens"
          type="button"
          @click="emit('update:loadShedTokens', tokens)"
          :disabled="isLocked"
          :class="[
            'py-1 rounded font-black text-[10px] border transition flex flex-col items-center justify-center cursor-pointer',
            loadShedTokens === tokens
              ? tokens === 0
                ? 'bg-[#389E5F] text-white border-[#BBF7D0] shadow-sm'
                : 'bg-rose-600 text-white border-rose-300 shadow-sm'
              : 'bg-[#091B2E] text-slate-200 hover:text-white border-slate-700 hover:bg-slate-800'
          ]"
        >
          <span>{{ tokens === 0 ? '0 Cut' : `${tokens} Tok` }}</span>
          <span class="text-[8.5px] font-mono opacity-80">{{ tokens * 10 }}MW</span>
        </button>
      </div>
    </div>

    <!-- Live Status / Penalty Alert -->
    <div
      class="px-2 py-1 rounded border text-[9.5px] flex items-center justify-between shadow-inner"
      :class="loadShedTokens > 0 ? 'bg-rose-950/60 border-rose-500 text-rose-100' : 'bg-[#091B2E] border-slate-700 text-slate-300'"
    >
      <span class="font-bold truncate">
        {{ loadShedTokens > 0 ? `Cutting ${loadShedTokens * 10}MW load` : 'Full demand supplied' }}
      </span>
      <span class="font-bold font-mono px-1 rounded shrink-0 ml-1" :class="loadShedTokens > 0 ? 'bg-rose-500/30 text-rose-300' : 'text-slate-400'">
        {{ loadShedTokens > 0 ? `-${loadShedTokens}pt` : '0pt' }}
      </span>
    </div>

  </div>
</template>
