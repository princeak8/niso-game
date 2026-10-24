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
  <div class="bg-[#132E4C] border border-[#389E5F]/50 rounded-lg p-1 sm:p-1.5 shadow-md flex flex-col justify-between text-xs">
    
    <div>
      <div class="flex items-center justify-between mb-0.5">
        <div class="flex items-center gap-1">
          <span class="text-sm">🏦</span>
          <h3 class="font-black text-[11px] text-white uppercase tracking-tight">
            Reserve Depot
          </h3>
        </div>
        <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#389E5F]/30 text-[#86EFAC] border border-[#389E5F]/60">
          {{ storeTokens }} / {{ totalTokens }} Left
        </span>
      </div>

      <!-- Store Stats -->
      <div class="grid grid-cols-2 gap-1 mb-1">
        <div class="bg-[#091B2E] p-1 rounded border border-slate-700/80 text-center">
          <div class="text-[8px] font-bold uppercase text-slate-300">In Depot</div>
          <div class="text-xs sm:text-sm font-black font-mono text-[#4ADE80]">
            {{ storeTokens }} <span class="text-[8px] text-slate-300 font-sans">({{ storeTokens * 10 }}MW)</span>
          </div>
        </div>

        <div class="bg-[#091B2E] p-1 rounded border border-slate-700/80 text-center">
          <div class="text-[8px] font-bold uppercase text-slate-300">On Grid</div>
          <div class="text-xs sm:text-sm font-black font-mono text-[#FCD34D]">
            {{ usedTokens }} <span class="text-[8px] text-slate-300 font-sans">({{ usedTokens * 10 }}MW)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Draggable Token Handle -->
    <div class="p-1 bg-[#091B2E] rounded border border-[#389E5F]/40 flex items-center justify-between shadow-sm">
      <div class="flex items-center gap-1.5">
        <div
          draggable="true"
          @dragstart="handleDragStart"
          class="w-5 h-5 rounded-full bg-gradient-to-br from-[#4ADE80] to-[#2B7A49] border border-[#BBF7D0] text-white font-black text-[10px] flex items-center justify-center cursor-grab active:cursor-grabbing shadow hover:scale-105 transition"
          :class="{ 'opacity-40 pointer-events-none': isLocked || storeTokens <= 0 }"
        >
          10
        </div>
        <div class="text-[9px] text-slate-200 font-bold leading-tight">
          Drag token or tap (+/−)
        </div>
      </div>

      <span class="text-[9px] font-mono font-bold text-[#86EFAC]">
        {{ storeTokens * 10 }}MW
      </span>
    </div>

  </div>
</template>
