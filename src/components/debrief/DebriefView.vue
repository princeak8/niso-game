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
    <div class="bg-[#0B1E33] border border-[#0D626C]/40 rounded-2xl p-6 shadow-xl">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-xl bg-[#0D626C] text-white flex items-center justify-center text-2xl shadow-lg border border-teal-300/30">
          📋
        </div>
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-teal-300">
            NISO Acculturation Programme · Day 2 Reflection
          </span>
          <h2 class="text-xl md:text-2xl font-black text-white mt-0.5">
            Post-Game Debrief & Control Room Tour Bridge
          </h2>
          <p class="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            The game taught how a power grid operates in an <em>ideal world</em>.
            Before stepping into the <strong>National Control Centre (NCC) Osogbo</strong> for your guided virtual tour, explore why real-world grid operations are vastly more complex.
          </p>
        </div>
      </div>
    </div>

    <!-- Section 1: The 5 Guided Debrief Questions -->
    <div class="bg-[#0B1E33] border border-[#0D626C]/40 rounded-2xl p-6 shadow-xl">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/60">
        <div>
          <h3 class="text-lg font-black text-white uppercase tracking-tight">
            1. The Five Debrief Questions (From Exercise Guide)
          </h3>
          <p class="text-xs text-slate-400">
            Click through each question to review participant experiences and technical insights.
          </p>
        </div>
        <span class="text-xs font-mono font-bold text-teal-300">
          Question {{ activeQuestionIndex + 1 }} of {{ DEBRIEF_QUESTIONS.length }}
        </span>
      </div>

      <!-- Question Selector Tabs -->
      <div class="grid grid-cols-5 gap-2 mb-6">
        <button
          v-for="(q, idx) in DEBRIEF_QUESTIONS"
          :key="q.id"
          type="button"
          @click="activeQuestionIndex = idx"
          :class="[
            'p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5',
            activeQuestionIndex === idx
              ? 'bg-[#0D626C] text-white border-teal-300 font-black shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
          ]"
        >
          <span class="text-[10px] font-bold uppercase">Q{{ q.id }}</span>
          <span class="text-xs font-mono truncate w-full hidden sm:block">{{ q.question.substring(0, 14) }}...</span>
        </button>
      </div>

      <!-- Active Question Detailed Card -->
      <div class="bg-slate-950/80 p-5 rounded-2xl border border-teal-500/30">
        <div class="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest mb-1">
          Context: {{ DEBRIEF_QUESTIONS[activeQuestionIndex].context }}
        </div>
        <h4 class="text-lg md:text-xl font-black text-white mb-3">
          "{{ DEBRIEF_QUESTIONS[activeQuestionIndex].question }}"
        </h4>

        <div class="mt-4 pt-3 border-t border-slate-800">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Key Participant Insights & Facilitator Debrief Notes:
          </div>
          <ul class="space-y-2">
            <li
              v-for="(answer, aIdx) in DEBRIEF_QUESTIONS[activeQuestionIndex].sampleAnswers"
              :key="aIdx"
              class="flex items-start gap-2 text-xs md:text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800"
            >
              <span class="text-teal-400 font-bold">▸</span>
              <span>{{ answer }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Section 2: Interactive "Ideal World" List Builder -->
    <div class="bg-[#0B1E33] border border-[#0D626C]/40 rounded-2xl p-6 shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/60">
        <div>
          <h3 class="text-lg font-black text-white uppercase tracking-tight">
            2. The "Ideal World" List Builder (Flip-Chart)
          </h3>
          <p class="text-xs text-slate-400">
            In question 5, dispatchers list what made the game easier than running the real Nigerian grid.
          </p>
        </div>
        <span class="text-[10px] font-bold px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
          {{ idealWorldItems.length }} Assumptions Tracked
        </span>
      </div>

      <!-- List of Assumptions & Realities -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          v-for="item in idealWorldItems"
          :key="item.id"
          class="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-teal-300 border border-slate-700">
                {{ item.category }}
              </span>
              <span class="text-[10px] text-emerald-400 font-bold">Ideal World Assumption</span>
            </div>
            <h5 class="text-sm font-bold text-white mb-2 leading-snug">
              {{ item.idealAssumption }}
            </h5>
          </div>

          <div class="pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/90 leading-relaxed">
            <strong class="text-amber-400">Real Life in Nigeria:</strong> {{ item.realWorldReality }}
          </div>
        </div>
      </div>

      <!-- Add New Custom Assumption -->
      <div class="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          + Add Participant Observation to Ideal List
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            v-model="newIdealAssumption"
            type="text"
            placeholder="In the game (Ideal Assumption)..."
            class="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-teal-500"
          />
          <input
            v-model="newRealReality"
            type="text"
            placeholder="In real life (Nigerian Grid Reality)..."
            class="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs font-medium focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div class="flex justify-end">
          <button
            type="button"
            @click="handleAddIdealItem"
            class="px-4 py-2 rounded-xl bg-[#0D626C] hover:bg-[#0A4D54] text-white font-bold text-xs uppercase tracking-wider transition"
          >
            Add to Flip-Chart List
          </button>
        </div>
      </div>
    </div>

    <!-- Section 3: Ideal vs Reality Bridge to Control Room Tour -->
    <div class="bg-[#0B1E33] border border-[#0D626C]/40 rounded-2xl p-6 shadow-xl">
      <div class="mb-4 pb-3 border-b border-slate-700/60">
        <h3 class="text-lg font-black text-white uppercase tracking-tight">
          3. "Ideal vs Reality" Bridge (Guided Virtual Tour Prep)
        </h3>
        <p class="text-xs text-slate-400">
          Step 7 from the exercise guide: "Keep your list of ideal things. In the tour, watch for how real life is different."
        </p>
      </div>

      <!-- Comparative Bridge Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          v-for="point in TOUR_BRIDGE_POINTS"
          :key="point.title"
          class="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3"
        >
          <div class="flex items-center gap-2">
            <span class="text-xl">{{ point.icon }}</span>
            <h4 class="font-extrabold text-sm text-teal-300 uppercase">
              {{ point.title }}
            </h4>
          </div>

          <div class="text-xs text-slate-300">
            <strong class="text-slate-400 uppercase text-[10px] block">Game Principle:</strong>
            {{ point.gameConcept }}
          </div>

          <div class="text-xs text-cyan-200 bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-500/20 leading-relaxed">
            <strong class="text-cyan-400 uppercase text-[10px] block">NCC Osogbo Control Room Reality:</strong>
            {{ point.nccReality }}
          </div>
        </div>
      </div>

      <!-- Inductee Tour Question Notepad -->
      <div class="bg-slate-950/80 p-4 rounded-xl border border-teal-500/40">
        <div class="text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">
          Your Question for the NCC Control Room Dispatch Engineers:
        </div>
        <p class="text-xs text-slate-400 mb-3">
          As instructed in Step 7 of the guide, write down one specific operational question based on what you experienced during the simulation.
        </p>

        <div class="flex flex-col sm:flex-row gap-2">
          <input
            v-model="userTourQuestion"
            type="text"
            placeholder="e.g., How does NCC Osogbo manage spinning reserve when hydro water head is low during the dry season?"
            class="flex-1 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="button"
            @click="handleSaveQuestion"
            class="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider transition whitespace-nowrap"
          >
            Save Note
          </button>
        </div>

        <div v-if="isQuestionSaved" class="mt-2 text-xs font-bold text-emerald-400 animate-fadeIn">
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
