<script setup lang="ts">
defineProps<{
  show: boolean;
  title: string;
  badge: string;
  description: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
  >
    <div class="max-w-lg w-full bg-[#0C2340] border-2 border-rose-500 rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
      
      <!-- Top Alert Header -->
      <div class="bg-rose-600 px-6 py-4 flex items-center justify-between text-white">
        <div class="flex items-center gap-3">
          <span class="text-2xl animate-bounce">🚨</span>
          <div>
            <div class="text-[10px] font-black uppercase tracking-widest text-rose-200">
              National Control Centre (NCC) Dispatch Flash
            </div>
            <h3 class="text-lg md:text-xl font-black uppercase tracking-tight">
              {{ title }}
            </h3>
          </div>
        </div>
        <span class="text-xs font-black px-2.5 py-1 rounded bg-black/30 border border-white/20 uppercase">
          {{ badge }}
        </span>
      </div>

      <!-- Body Content -->
      <div class="p-6 text-slate-100">
        <p class="text-sm md:text-base leading-relaxed text-slate-200 font-medium">
          {{ description }}
        </p>

        <div class="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
          <div class="font-bold text-teal-300 uppercase tracking-wider mb-1">
            Dispatch Instructions:
          </div>
          <ul class="list-disc list-inside space-y-1 text-slate-300">
            <li>Rebalance generation to match system demand within 2 minutes.</li>
            <li>Verify spinning reserves on Kainji Hydro.</li>
            <li>Observe thermal ramp rate restrictions on all operational gas units.</li>
          </ul>
        </div>

        <!-- Action Button -->
        <div class="mt-6 flex justify-end">
          <button
            type="button"
            @click="emit('close')"
            class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-rose-950/60 border border-rose-400 transition active:scale-95"
          >
            Acknowledge Emergency & Dispatch
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes scaleUp {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
.animate-scaleUp {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
