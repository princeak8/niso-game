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
  <div class="bg-[#132E4C] border-2 border-[#389E5F]/50 rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col justify-between">
    
    <div>
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🏦</span>
          <h3 class="font-black text-base text-white uppercase tracking-tight">
            National Reserve Token Store
          </h3>
        </div>
        <span class="text-xs font-black px-2.5 py-1 rounded-md bg-[#389E5F]/30 text-[#86EFAC] border border-[#389E5F]/60">
          Total Bag: {{ totalTokens }} Tokens
        </span>
      </div>

      <p class="text-xs text-[#E2E8F0] font-bold mb-3.5">
        1 Token = 10 MW. Spare tokens remain in the depot until dispatched to a power station rack.
      </p>

      <!-- Store Stats -->
      <div class="grid grid-cols-2 gap-3.5 mb-3.5">
        <div class="bg-[#091B2E] p-3.5 rounded-xl border border-slate-700 text-center shadow-inner">
          <div class="text-[11px] font-black uppercase text-[#CBD5E1]">Available in Store</div>
          <div class="text-3xl font-black font-mono text-[#4ADE80] mt-1">
            {{ storeTokens }} <span class="text-xs font-sans font-bold text-[#CBD5E1]">({{ storeTokens * 10 }} MW)</span>
          </div>
        </div>

        <div class="bg-[#091B2E] p-3.5 rounded-xl border border-slate-700 text-center shadow-inner">
          <div class="text-[11px] font-black uppercase text-[#CBD5E1]">Dispatched on Grid</div>
          <div class="text-3xl font-black font-mono text-[#FCD34D] mt-1">
            {{ usedTokens }} <span class="text-xs font-sans font-bold text-[#CBD5E1]">({{ usedTokens * 10 }} MW)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Draggable Token Handle -->
    <div class="p-3 bg-[#091B2E] rounded-xl border-2 border-[#389E5F]/50 flex items-center justify-between shadow-md">
      <div class="flex items-center gap-2.5">
        <div
          draggable="true"
          @dragstart="handleDragStart"
          class="w-11 h-11 rounded-full bg-gradient-to-br from-[#4ADE80] to-[#2B7A49] border-2 border-[#BBF7D0] text-white font-black text-sm flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg shadow-green-950/70 hover:scale-105 transition"
          :class="{ 'opacity-40 pointer-events-none': isLocked || storeTokens <= 0 }"
        >
          10
        </div>
        <div>
          <div class="text-xs font-black text-white">Interactive Dispatch Token</div>
          <div class="text-[11px] font-bold text-[#CBD5E1]">Drag to any station card or tap (+) on station</div>
        </div>
      </div>

      <span class="text-xs font-mono font-black text-[#86EFAC] bg-[#389E5F]/20 px-2 py-1 rounded border border-[#389E5F]/40">
        {{ storeTokens }} left
      </span>
    </div>

  </div>
</template>
