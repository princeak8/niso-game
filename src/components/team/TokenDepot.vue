<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  storeTokens: number;
  totalTokens: number;
  isLocked: boolean;
}>();

const emit = defineEmits<{
  (e: 'dragStart', event: DragEvent): void;
}>();

const usedTokens = computed(() => props.totalTokens - props.storeTokens);

function handleDragStart(e: DragEvent) {
  if (props.isLocked || props.storeTokens <= 0) {
    e.preventDefault();
    return;
  }
  emit('dragStart', e);
}
</script>

<template>
  <div class="bg-[#0B1E33] border border-[#0D626C]/40 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
    
    <div>
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-xl">🏦</span>
          <h3 class="font-extrabold text-sm md:text-base text-slate-100 uppercase tracking-tight">
            National Reserve Token Store
          </h3>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
          Total Bag: {{ totalTokens }} Tokens
        </span>
      </div>

      <p class="text-xs text-slate-400 mb-3">
        1 Token = 10 MW. Spare tokens remain in the store until dispatched to a power station rack.
      </p>

      <!-- Store Stats -->
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
          <div class="text-[10px] font-bold uppercase text-slate-400">Available in Store</div>
          <div class="text-2xl font-black font-mono text-teal-400">
            {{ storeTokens }} <span class="text-xs font-sans text-slate-400">({{ storeTokens * 10 }} MW)</span>
          </div>
        </div>

        <div class="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-center">
          <div class="text-[10px] font-bold uppercase text-slate-400">Dispatched on Grid</div>
          <div class="text-2xl font-black font-mono text-amber-400">
            {{ usedTokens }} <span class="text-xs font-sans text-slate-400">({{ usedTokens * 10 }} MW)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Draggable Token Handle -->
    <div class="p-3 bg-slate-950/80 rounded-xl border border-teal-500/30 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div
          draggable="true"
          @dragstart="handleDragStart"
          class="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 border-2 border-teal-200 text-teal-950 font-black flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg hover:scale-105 transition"
          :class="{ 'opacity-40 pointer-events-none': isLocked || storeTokens <= 0 }"
        >
          10
        </div>
        <div>
          <div class="text-xs font-bold text-slate-200">Interactive Dispatch Token</div>
          <div class="text-[10px] text-slate-400">Drag to any station card or tap (+) on station</div>
        </div>
      </div>

      <span class="text-xs font-mono font-bold text-teal-300">
        {{ storeTokens }} left
      </span>
    </div>

  </div>
</template>
