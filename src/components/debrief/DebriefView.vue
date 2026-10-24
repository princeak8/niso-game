<script setup lang="ts">
import { ref } from 'vue';
import {
  DEBRIEF_QUESTIONS,
  INITIAL_IDEAL_WORLD_ITEMS,
  TOUR_BRIDGE_POINTS,
  IdealWorldItem,
} from '../../data/debriefQuestions';

const activeQuestionIndex = ref<number>(0);
const idealWorldItems = ref<IdealWorldItem[]>([...INITIAL_IDEAL_WORLD_ITEMS]);
const newIdealAssumption = ref('');
const newRealReality = ref('');
const userTourQuestion = ref('');
const isQuestionSaved = ref(false);

function handleAddIdealItem() {
  if (!newIdealAssumption.value.trim()) return;
  idealWorldItems.value.push({
    id: `custom-${Date.now()}`,
    idealAssumption: newIdealAssumption.value.trim(),
    realWorldReality: newRealReality.value.trim() || 'Variable real-world operating constraint in Nigerian grid.',
    category: 'Custom',
    isPredefined: false,
  });
  newIdealAssumption.value = '';
  newRealReality.value = '';
}

function handleSaveQuestion() {
  if (userTourQuestion.value.trim()) {
    isQuestionSaved.value = true;
    setTimeout(() => {
      isQuestionSaved.value = false;
    }, 3000);
  }
}
</script>

<template>
  <div class="space-y-8 animate-fadeIn">
    
    <!-- Top Introduction Banner -->
    <div class="bg-[#0F243A] border-2 border-[#1E3A5F] rounded-2xl p-6 shadow-xl">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-[#143D24] text-[#4ADE80] flex items-center justify-center text-2xl shadow-lg border-2 border-[#389E5F]/60">
          📋
        </div>
        <div>
          <span class="text-xs font-black uppercase tracking-wider text-[#86EFAC]">
            NISO Acculturation Programme · Day 2 Reflection
          </span>
          <h2 class="text-xl md:text-2xl font-black text-white mt-0.5">
            Post-Game Debrief & Control Room Tour Bridge
          </h2>
          <p class="text-xs md:text-sm text-slate-200 mt-1 max-w-3xl leading-relaxed font-medium">
            The game taught how a power grid operates in an <em>ideal world</em>.
            Before stepping into the <strong class="text-white">National Control Centre (NCC) Osogbo</strong> for your guided virtual tour, explore why real-world grid operations are vastly more complex.
          </p>
        </div>
      </div>
    </div>

    <!-- Section 1: The 5 Guided Debrief Questions -->
    <div class="bg-[#0F243A] border-2 border-[#1E3A5F] rounded-2xl p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#1E3A5F]">
        <div>
          <h3 class="text-lg font-black text-white uppercase tracking-tight">
            1. The Five Debrief Questions (From Exercise Guide)
          </h3>
          <p class="text-xs text-slate-300 font-medium">
            Click through each question to review participant experiences and technical insights.
          </p>
        </div>
        <span class="text-xs font-mono font-black text-[#4ADE80] bg-[#143D24] px-3 py-1 rounded-full border border-[#389E5F]/50">
          Question {{ activeQuestionIndex + 1 }} of {{ DEBRIEF_QUESTIONS.length }}
        </span>
      </div>

      <!-- Question Selector Tabs -->
      <div class="grid grid-cols-5 gap-2.5 mb-6">
        <button
          v-for="(q, idx) in DEBRIEF_QUESTIONS"
          :key="q.id"
          type="button"
          @click="activeQuestionIndex = idx"
          :class="[
            'p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5',
            activeQuestionIndex === idx
              ? 'bg-[#389E5F] text-white border-2 border-[#BBF7D0] font-black shadow-lg shadow-[#389E5F]/40'
              : 'bg-[#0B1726] text-slate-300 border border-slate-700 font-bold hover:text-white hover:bg-[#132E4C]'
          ]"
        >
          <span class="text-xs font-black uppercase">Q{{ q.id }}</span>
          <span class="text-xs font-mono truncate w-full hidden sm:block font-bold">{{ q.question.substring(0, 14) }}...</span>
        </button>
      </div>

      <!-- Active Question Detailed Card -->
      <div class="bg-[#0B1726] p-6 rounded-2xl border-2 border-[#389E5F]/60 shadow-inner">
        <div class="text-xs font-mono font-black text-[#4ADE80] uppercase tracking-widest mb-1.5">
          Context: {{ DEBRIEF_QUESTIONS[activeQuestionIndex].context }}
        </div>
        <h4 class="text-lg md:text-xl font-black text-white mb-4">
          "{{ DEBRIEF_QUESTIONS[activeQuestionIndex].question }}"
        </h4>

        <div class="mt-4 pt-3 border-t-2 border-[#1E3A5F]">
          <div class="text-xs font-black uppercase tracking-wider text-slate-200 mb-3">
            Key Participant Insights & Facilitator Debrief Notes:
          </div>
          <ul class="space-y-2.5">
            <li
              v-for="(answer, aIdx) in DEBRIEF_QUESTIONS[activeQuestionIndex].sampleAnswers"
              :key="aIdx"
              class="flex items-start gap-2.5 text-xs md:text-sm text-slate-100 leading-relaxed bg-[#0F243A] p-3 rounded-xl border border-[#1E3A5F] font-medium"
            >
              <span class="text-[#4ADE80] font-black text-base leading-none mt-0.5">▸</span>
              <span>{{ answer }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Section 2: Interactive "Ideal World" List Builder -->
    <div class="bg-[#0F243A] border-2 border-[#1E3A5F] rounded-2xl p-6 shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#1E3A5F]">
        <div>
          <h3 class="text-lg font-black text-white uppercase tracking-tight">
            2. The "Ideal World" List Builder (Flip-Chart)
          </h3>
          <p class="text-xs text-slate-300 font-medium">
            In question 5, dispatchers list what made the game easier than running the real Nigerian grid.
          </p>
        </div>
        <span class="text-xs font-black px-3 py-1 rounded bg-[#143D24] text-[#86EFAC] border border-[#389E5F]/50 uppercase tracking-wide">
          {{ idealWorldItems.length }} Assumptions Tracked
        </span>
      </div>

      <!-- List of Assumptions & Realities -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          v-for="item in idealWorldItems"
          :key="item.id"
          class="bg-[#0B1726] p-4 rounded-xl border border-[#1E3A5F] flex flex-col justify-between shadow-md"
        >
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#143D24] text-[#86EFAC] border border-[#389E5F]/50">
                {{ item.category }}
              </span>
              <span class="text-xs text-[#4ADE80] font-black">Ideal World Assumption</span>
            </div>
            <h5 class="text-sm font-black text-white mb-2 leading-snug">
              {{ item.idealAssumption }}
            </h5>
          </div>

          <div class="pt-2.5 border-t border-[#1E3A5F] text-xs text-slate-300 leading-relaxed font-medium">
            <strong class="text-slate-100 font-black">Real Life in Nigeria:</strong> {{ item.realWorldReality }}
          </div>
        </div>
      </div>

      <!-- Add New Custom Assumption -->
      <div class="bg-[#0B1726] p-5 rounded-xl border-2 border-[#1E3A5F]">
        <div class="text-xs font-black uppercase tracking-wider text-slate-200 mb-2">
          + Add Participant Observation to Ideal List
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            v-model="newIdealAssumption"
            type="text"
            placeholder="In the game (Ideal Assumption)..."
            class="bg-[#0F243A] border-2 border-[#1E3A5F] text-white rounded-lg p-2.5 text-xs font-bold focus:border-[#389E5F] focus:ring-2 focus:ring-[#389E5F]"
          />
          <input
            v-model="newRealReality"
            type="text"
            placeholder="In real life (Nigerian Grid Reality)..."
            class="bg-[#0F243A] border-2 border-[#1E3A5F] text-white rounded-lg p-2.5 text-xs font-bold focus:border-[#389E5F] focus:ring-2 focus:ring-[#389E5F]"
          />
        </div>
        <div class="flex justify-end">
          <button
            type="button"
            @click="handleAddIdealItem"
            class="px-5 py-2.5 rounded-xl bg-[#389E5F] hover:bg-[#2B7A49] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#389E5F]/30 transition"
          >
            Add to Flip-Chart List
          </button>
        </div>
      </div>
    </div>

    <!-- Section 3: Ideal vs Reality Bridge to Control Room Tour -->
    <div class="bg-[#0F243A] border-2 border-[#1E3A5F] rounded-2xl p-6 shadow-xl">
      <div class="mb-4 pb-3 border-b-2 border-[#1E3A5F]">
        <h3 class="text-lg font-black text-white uppercase tracking-tight">
          3. "Ideal vs Reality" Bridge (Guided Virtual Tour Prep)
        </h3>
        <p class="text-xs text-slate-300 font-medium">
          Step 7 from the exercise guide: "Keep your list of ideal things. In the tour, watch for how real life is different."
        </p>
      </div>

      <!-- Comparative Bridge Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          v-for="point in TOUR_BRIDGE_POINTS"
          :key="point.title"
          class="bg-[#0B1726] p-5 rounded-xl border border-[#1E3A5F] space-y-3 shadow-md"
        >
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">{{ point.icon }}</span>
            <h4 class="font-black text-sm text-[#4ADE80] uppercase">
              {{ point.title }}
            </h4>
          </div>

          <div class="text-xs text-slate-200">
            <strong class="text-slate-400 uppercase text-[10px] font-black block mb-0.5">Game Principle:</strong>
            {{ point.gameConcept }}
          </div>

          <div class="text-xs text-sky-100 bg-[#0B2538] p-3 rounded-lg border-2 border-sky-400/40 leading-relaxed font-medium">
            <strong class="text-sky-300 uppercase text-[10px] font-black block mb-0.5">NCC Osogbo Control Room Reality:</strong>
            {{ point.nccReality }}
          </div>
        </div>
      </div>

      <!-- Inductee Tour Question Notepad -->
      <div class="bg-[#0B1726] p-5 rounded-xl border-2 border-[#389E5F]/60">
        <div class="text-xs font-black uppercase tracking-wider text-[#86EFAC] mb-1">
          Your Question for the NCC Control Room Dispatch Engineers:
        </div>
        <p class="text-xs text-slate-300 mb-3 font-medium">
          As instructed in Step 7 of the guide, write down one specific operational question based on what you experienced during the simulation.
        </p>

        <div class="flex flex-col sm:flex-row gap-2.5">
          <input
            v-model="userTourQuestion"
            type="text"
            placeholder="e.g., How does NCC Osogbo manage spinning reserve when hydro water head is low during the dry season?"
            class="flex-1 bg-[#0F243A] border-2 border-[#1E3A5F] text-white rounded-lg p-2.5 text-xs font-bold focus:border-[#389E5F] focus:ring-2 focus:ring-[#389E5F]"
          />
          <button
            type="button"
            @click="handleSaveQuestion"
            class="px-6 py-2.5 rounded-xl bg-[#389E5F] hover:bg-[#2B7A49] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#389E5F]/30 transition whitespace-nowrap"
          >
            Save Note
          </button>
        </div>

        <div v-if="isQuestionSaved" class="mt-2 text-xs font-black text-[#4ADE80] animate-fadeIn">
          ✓ Question saved! Keep this ready for the virtual control room tour engineers.
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
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
