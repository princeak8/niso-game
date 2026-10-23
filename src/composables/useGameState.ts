import { ref, computed, watch } from 'vue';
import { ROUNDS } from '../data/roundScript';
import { RoundDefinition, RoundScore, TeamScoreboardEntry } from '../types/grid';
import { useWebAudioSynth } from './useWebAudioSynth';

export function useGameState() {
  const synth = useWebAudioSynth();

  // Current active round index (0 = Practice, 1-6 = Scored rounds)
  const currentRoundIndex = ref(0);
  const currentRound = computed<RoundDefinition>(() => ROUNDS[currentRoundIndex.value]);

  // Station token states
  const kainjiTokens = ref(4);
  const egbinTokens = ref(6);
  const gereguTokens = ref(6);
  const kanoTokens = computed(() => currentRound.value.solarTokens);

  // Store of spare tokens (40 total inventory)
  const totalTokensInventory = 40;
  const storeTokens = computed(() => {
    return totalTokensInventory - (kainjiTokens.value + egbinTokens.value + gereguTokens.value + kanoTokens.value);
  });

  // Track previous gas tokens to enforce the 3-token ramp rule
  const previousEgbinTokens = ref(6);
  const previousGereguTokens = ref(6);

  // Load shedding (0 to 3 tokens)
  const loadShedTokens = ref(0);

  // Timer & Round Locks
  const timerSeconds = ref(120); // 2 minutes countdown
  const timerRunning = ref(false);
  const isLocked = ref(false); // "Hands off!" lock
  const isSubmitted = ref(false);
  const roundScores = ref<Record<number, RoundScore>>({});

  // Active event modal
  const showEventModal = ref(false);
  const activeEvent = ref<{ title: string; badge: string; description: string } | null>(null);

  // Facilitator multi-team tournament state with localStorage persistence
  const defaultTeams: TeamScoreboardEntry[] = [
    { id: 't1', name: 'Team Niger (Dispatchers)', dispatcherName: 'Dispatcher 1', checkerName: 'Checker 1', scores: {}, totalScore: 0, tournamentPoints: 0 },
    { id: 't2', name: 'Team Benue (Grid Ops)', dispatcherName: 'Dispatcher 2', checkerName: 'Checker 2', scores: {}, totalScore: 0, tournamentPoints: 0 },
    { id: 't3', name: 'Team Kainji (System Sec)', dispatcherName: 'Dispatcher 3', checkerName: 'Checker 3', scores: {}, totalScore: 0, tournamentPoints: 0 },
    { id: 't4', name: 'Team Osogbo (NCC Control)', dispatcherName: 'Dispatcher 4', checkerName: 'Checker 4', scores: {}, totalScore: 0, tournamentPoints: 0 },
  ];

  function loadSavedTeams(): TeamScoreboardEntry[] {
    if (typeof window === 'undefined') return defaultTeams;
    try {
      const saved = localStorage.getItem('niso_grid_teams');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultTeams;
  }

  function loadSavedActiveTeam(): string {
    if (typeof window === 'undefined') return 't1';
    try {
      return localStorage.getItem('niso_active_team_id') || 't1';
    } catch (e) {
      return 't1';
    }
  }

  const teams = ref<TeamScoreboardEntry[]>(loadSavedTeams());
  const activeTeamId = ref(loadSavedActiveTeam());

  const activeTeam = computed(() => {
    return teams.value.find(t => t.id === activeTeamId.value) || teams.value[0];
  });

  // Persist teams and active team whenever changed
  watch(teams, (val) => {
    try {
      localStorage.setItem('niso_grid_teams', JSON.stringify(val));
    } catch (e) {}
  }, { deep: true });

  watch(activeTeamId, (val) => {
    try {
      localStorage.setItem('niso_active_team_id', val);
    } catch (e) {}
  });

  // Timer interval reference
  let timerInterval: number | null = null;

  // Max allowed tokens per station in current round
  const maxKainji = computed(() => {
    if (currentRound.value.kainjiMaxLimit !== undefined) {
      return currentRound.value.kainjiMaxLimit;
    }
    return 8;
  });

  const maxEgbin = computed(() => {
    if (currentRound.value.egbinTripped) return 0;
    if (currentRound.value.egbinRestartLimit !== undefined) return currentRound.value.egbinRestartLimit;
    return 12;
  });

  const maxGeregu = computed(() => 12);
  const maxKano = computed(() => 6);

  // Generation and Demand calculations
  const totalGenerationTokens = computed(() => {
    return kainjiTokens.value + egbinTokens.value + gereguTokens.value + kanoTokens.value;
  });

  const totalGenerationMW = computed(() => totalGenerationTokens.value * 10);

  const effectiveDemandTokens = computed(() => {
    return Math.max(0, currentRound.value.demandTokens - loadShedTokens.value);
  });

  const effectiveDemandMW = computed(() => effectiveDemandTokens.value * 10);

  const gapTokens = computed(() => {
    return Math.abs(totalGenerationTokens.value - effectiveDemandTokens.value);
  });

  const gapMW = computed(() => gapTokens.value * 10);

  // Ramp checking
  const egbinDelta = computed(() => Math.abs(egbinTokens.value - previousEgbinTokens.value));
  const gereguDelta = computed(() => Math.abs(gereguTokens.value - previousGereguTokens.value));

  const isEgbinRampViolated = computed(() => {
    // If it was tripped by event, that is not a team ramp violation
    if (currentRound.value.egbinTripped) return false;
    return egbinDelta.value > 3;
  });

  const isGereguRampViolated = computed(() => {
    return gereguDelta.value > 3;
  });

  const isGasRampViolated = computed(() => isEgbinRampViolated.value || isGereguRampViolated.value);

  // Reserve checking
  const hasReserveBonus = computed(() => {
    const threshold = currentRound.value.kainjiReserveMaxThreshold ?? 6;
    return kainjiTokens.value <= threshold;
  });

  const availableReserveTokens = computed(() => {
    const threshold = currentRound.value.kainjiReserveMaxThreshold ?? 6;
    return Math.max(0, threshold - kainjiTokens.value);
  });

  // Calculate score for current board state
  const currentScoreBreakdown = computed<RoundScore>(() => {
    const gap = gapTokens.value;
    let base = 0;
    let isAlarm = false;

    if (gap === 0) {
      base = 3;
    } else if (gap === 1) {
      base = 2;
    } else if (gap === 2) {
      base = 1;
    } else {
      base = 0;
      isAlarm = true;
    }

    const resBonus = hasReserveBonus.value ? 1 : 0;
    const loadPenalty = loadShedTokens.value * 1;
    const rampViolated = isGasRampViolated.value;

    let final = 0;
    if (rampViolated) {
      final = 0;
    } else {
      final = Math.max(0, base + resBonus - loadPenalty);
    }

    return {
      roundId: currentRound.value.id,
      roundName: currentRound.value.name,
      demandTokens: currentRound.value.demandTokens,
      solarTokens: currentRound.value.solarTokens,
      kainjiTokens: kainjiTokens.value,
      egbinTokens: egbinTokens.value,
      gereguTokens: gereguTokens.value,
      totalGenerationTokens: totalGenerationTokens.value,
      loadShedTokens: loadShedTokens.value,
      effectiveDemandTokens: effectiveDemandTokens.value,
      gapTokens: gap,
      gapMW: gap * 10,
      baseMatchPoints: base,
      hasReserveBonus: hasReserveBonus.value,
      reserveBonusPoints: resBonus,
      loadShedPenalty: loadPenalty,
      gasRampViolated: rampViolated,
      egbinChange: egbinDelta.value,
      gereguChange: gereguDelta.value,
      finalScore: currentRound.value.isPractice ? 0 : final,
      isFrequencyAlarm: isAlarm,
      teachingLine: currentRound.value.teachingLine,
    };
  });

  // Token manipulation methods
  function adjustKainji(delta: number) {
    if (isLocked.value) return;
    const next = kainjiTokens.value + delta;
    if (next >= 0 && next <= maxKainji.value && storeTokens.value - delta >= 0) {
      kainjiTokens.value = next;
      synth.playTokenClick();
    }
  }

  function adjustEgbin(delta: number) {
    if (isLocked.value) return;
    if (currentRound.value.egbinTripped) return;
    const next = egbinTokens.value + delta;
    if (next >= 0 && next <= maxEgbin.value && storeTokens.value - delta >= 0) {
      egbinTokens.value = next;
      synth.playTokenClick();
    }
  }

  function adjustGeregu(delta: number) {
    if (isLocked.value) return;
    const next = gereguTokens.value + delta;
    if (next >= 0 && next <= maxGeregu.value && storeTokens.value - delta >= 0) {
      gereguTokens.value = next;
      synth.playTokenClick();
    }
  }

  function adjustLoadShed(tokens: number) {
    if (isLocked.value) return;
    if (tokens >= 0 && tokens <= 3) {
      loadShedTokens.value = tokens;
      synth.playTokenClick();
    }
  }

  // Timer controls
  function startTimer() {
    if (timerRunning.value || isLocked.value) return;
    timerRunning.value = true;
    timerInterval = window.setInterval(() => {
      if (timerSeconds.value > 0) {
        timerSeconds.value--;
        if (timerSeconds.value <= 10 && timerSeconds.value > 0) {
          synth.playTick();
        }
        if (timerSeconds.value === 0) {
          submitRound();
        }
      }
    }, 1000);
  }

  function pauseTimer() {
    timerRunning.value = false;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function resetTimer() {
    pauseTimer();
    timerSeconds.value = 120;
    isLocked.value = false;
  }

  function lockRound(reason?: string) {
    pauseTimer();
    isLocked.value = true;
    synth.playBell();
  }

  function unlockRound() {
    isLocked.value = false;
    startTimer();
  }

  function submitRound() {
    lockRound('Round Submitted');
    isSubmitted.value = true;
    const score = { ...currentScoreBreakdown.value };
    roundScores.value[currentRound.value.id] = score;

    // Record to active team
    const team = teams.value.find(t => t.id === activeTeamId.value);
    if (team) {
      team.scores[currentRound.value.id] = score;
      recalculateTeamTotals();
    }

    if (score.finalScore >= 3) {
      synth.playSuccess();
    } else if (score.gasRampViolated || score.isFrequencyAlarm) {
      synth.playPenalty();
    }
  }

  function recalculateTeamTotals() {
    teams.value.forEach(t => {
      let sum = 0;
      Object.entries(t.scores).forEach(([rId, s]) => {
        if (s && Number(rId) > 0) { // Only scored rounds 1-6
          sum += s.finalScore;
        }
      });
      t.totalScore = sum;
    });

    // Rank teams and assign tournament points: 1st=10, 2nd=7, 3rd=5, others=3
    const sorted = [...teams.value].sort((a, b) => b.totalScore - a.totalScore);
    sorted.forEach((team, index) => {
      team.rank = index + 1;
      if (index === 0) team.tournamentPoints = 10;
      else if (index === 1) team.tournamentPoints = 7;
      else if (index === 2) team.tournamentPoints = 5;
      else team.tournamentPoints = 3;
    });
  }

  function initializeRound(roundIndex: number) {
    pauseTimer();
    currentRoundIndex.value = roundIndex;
    timerSeconds.value = 120;
    isLocked.value = false;
    isSubmitted.value = false;
    loadShedTokens.value = 0;

    // Handle round start specifics & events
    const r = ROUNDS[roundIndex];

    if (roundIndex === 0) {
      // Start position (before practice round): Kainji 4, Egbin 6, Geregu 6, Kano 0
      kainjiTokens.value = 4;
      egbinTokens.value = 6;
      gereguTokens.value = 6;
      previousEgbinTokens.value = 6;
      previousGereguTokens.value = 6;
    } else {
      // Record previous round ending gas tokens for ramp limit tracking
      previousEgbinTokens.value = egbinTokens.value;
      previousGereguTokens.value = gereguTokens.value;
    }

    // Trigger round events
    if (r.egbinTripped) {
      egbinTokens.value = 0;
      activeEvent.value = {
        title: r.eventTitle || 'Gas A (Egbin) Trips!',
        badge: r.eventBadge || 'CRITICAL EVENT',
        description: r.eventDescription || 'Egbin Gas Power Station has tripped! Remove all its tokens immediately (0 MW).',
      };
      showEventModal.value = true;
      synth.playTripAlarm();
    } else if (r.egbinRestartLimit !== undefined) {
      activeEvent.value = {
        title: r.eventTitle || 'Cold Restart Restriction',
        badge: r.eventBadge || 'RAMP RESTRICTION',
        description: r.eventDescription || 'Egbin is back online, but thermal restart constraints limit it to 3 tokens (30 MW) or less.',
      };
      showEventModal.value = true;
      synth.playBell();
    } else if (r.kainjiMaxLimit !== undefined) {
      // Round 6 line outage: if kainji exceeds limit, clamp it down
      if (kainjiTokens.value > r.kainjiMaxLimit) {
        kainjiTokens.value = r.kainjiMaxLimit;
      }
      activeEvent.value = {
        title: r.eventTitle || 'Transmission Line Outage',
        badge: r.eventBadge || 'GRID BOTTLENECK',
        description: r.eventDescription || 'Shiroro-Osogbo 330kV line outage! Kainji Hydro can send 4 tokens at most this round.',
      };
      showEventModal.value = true;
      synth.playBell();
    } else {
      synth.playBell();
    }

    startTimer();
  }

  function advanceNextRound() {
    if (currentRoundIndex.value < ROUNDS.length - 1) {
      initializeRound(currentRoundIndex.value + 1);
    }
  }

  function restartGame() {
    roundScores.value = {};
    teams.value.forEach(t => {
      t.scores = {};
      t.totalScore = 0;
      t.tournamentPoints = 0;
    });
    initializeRound(0);
  }

  function switchActiveTeam(teamId: string) {
    activeTeamId.value = teamId;
    const team = teams.value.find(t => t.id === teamId);
    if (team) {
      roundScores.value = { ...team.scores } as Record<number, RoundScore>;
    }
  }

  function updateActiveTeamIdentity(name: string, dispatcherName: string, checkerName: string) {
    const team = teams.value.find(t => t.id === activeTeamId.value);
    if (team) {
      team.name = name;
      team.dispatcherName = dispatcherName;
      team.checkerName = checkerName;
    }
  }

  function exportTeamScoreText(): string {
    const team = activeTeam.value;
    let text = `=== NISO KEEP THE LIGHTS ON DISPATCH SCORECARD ===\n`;
    text += `Team: ${team.name}\n`;
    if (team.dispatcherName) text += `Dispatcher: ${team.dispatcherName}\n`;
    if (team.checkerName) text += `Checker: ${team.checkerName}\n`;
    text += `-------------------------------------------------\n`;
    ROUNDS.forEach(r => {
      const s = team.scores[r.id];
      if (s) {
        text += `${r.name} (${r.timeOfDay}): ${r.isPractice ? 'Practice (Completed)' : `+${s.finalScore} pts`} (Gen: ${s.totalGenerationTokens * 10}MW vs Dem: ${s.effectiveDemandTokens * 10}MW)\n`;
      } else {
        text += `${r.name} (${r.timeOfDay}): Unscored\n`;
      }
    });
    text += `-------------------------------------------------\n`;
    text += `TOTAL GAME POINTS: ${team.totalScore} pts\n`;
    text += `CURRENT RANK: ${team.rank ? `#${team.rank}` : 'Unranked'} (${team.tournamentPoints} Tournament Pts)\n`;
    text += `=================================================`;
    return text;
  }

  return {
    ROUNDS,
    currentRoundIndex,
    currentRound,
    kainjiTokens,
    egbinTokens,
    gereguTokens,
    kanoTokens,
    storeTokens,
    previousEgbinTokens,
    previousGereguTokens,
    loadShedTokens,
    timerSeconds,
    timerRunning,
    isLocked,
    isSubmitted,
    roundScores,
    showEventModal,
    activeEvent,
    teams,
    activeTeamId,
    activeTeam,
    maxKainji,
    maxEgbin,
    maxGeregu,
    maxKano,
    totalGenerationTokens,
    totalGenerationMW,
    effectiveDemandTokens,
    effectiveDemandMW,
    gapTokens,
    gapMW,
    egbinDelta,
    gereguDelta,
    isGasRampViolated,
    hasReserveBonus,
    availableReserveTokens,
    currentScoreBreakdown,
    adjustKainji,
    adjustEgbin,
    adjustGeregu,
    adjustLoadShed,
    startTimer,
    pauseTimer,
    resetTimer,
    lockRound,
    unlockRound,
    submitRound,
    initializeRound,
    advanceNextRound,
    restartGame,
    recalculateTeamTotals,
    switchActiveTeam,
    updateActiveTeamIdentity,
    exportTeamScoreText,
  };
}
