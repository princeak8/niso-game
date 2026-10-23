import { ref, computed, onMounted, onUnmounted } from 'vue';
import { FrequencyTelemetry } from '../types/grid';

export interface FrequencyHistoryPoint {
  time: number; // elapsed seconds
  frequency: number;
}

export function useGridFrequency(
  getGenMW: () => number,
  getDemandMW: () => number
) {
  const currentFrequency = ref(50.0);
  const targetFrequency = 50.0;
  const rocof = ref(0.0); // Hz/s
  const history = ref<FrequencyHistoryPoint[]>([]);
  const isControllerView = ref(false);

  // Physics parameters (Simplified Nigerian Grid Model)
  const H = 4.0; // System inertia constant (seconds)
  const D = 1.2; // Load damping coefficient (% / %)
  const Sbase = 250.0; // System base power rating (MW)
  const governorDroop = 0.04; // 4% droop governor

  let animFrameId: number | null = null;
  let lastTimestamp = performance.now();
  let elapsedSeconds = 0;

  // Operating status band according to NISO / NERC Grid Code
  const statusBand = computed<'normal' | 'alert' | 'critical-low' | 'critical-high'>(() => {
    const f = currentFrequency.value;
    if (f >= 49.5 && f <= 50.5) return 'normal';
    if (f < 48.8) return 'critical-low';
    if (f > 51.5) return 'critical-high';
    return 'alert';
  });

  const controllerMessage = computed<string>(() => {
    const gen = getGenMW();
    const demand = getDemandMW();
    const diff = gen - demand;
    const f = currentFrequency.value;

    if (Math.abs(diff) === 0 && Math.abs(f - 50.0) < 0.08) {
      return 'NCC Osogbo: Grid in equilibrium at 50.00 Hz. Spinning reserves standing by.';
    }
    if (f < 48.8) {
      return `CRITICAL UNDER-FREQUENCY (${f.toFixed(2)} Hz)! ROCOF: ${rocof.value.toFixed(2)} Hz/s. Under-Frequency Load Shedding (UFLS Stage 1) initiated to prevent system collapse!`;
    }
    if (f > 51.2) {
      return `OVER-FREQUENCY ALARM (${f.toFixed(2)} Hz)! Surplus generation of +${diff} MW. Instructing thermal stations to back down immediately.`;
    }
    if (diff < 0) {
      return `Generation Deficit (${diff} MW)! Frequency drifting down (${f.toFixed(2)} Hz). Dispatching Kainji Hydro governor response and raising gas setpoints.`;
    }
    if (diff > 0) {
      return `Generation Surplus (+${diff} MW)! Frequency rising (${f.toFixed(2)} Hz). Backing down gas turbines or trimming hydro flow.`;
    }
    return 'System recovering towards nominal 50.00 Hz.';
  });

  function updatePhysics(timestamp: number) {
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1); // clamp dt to max 0.1s
    lastTimestamp = timestamp;
    elapsedSeconds += dt;

    const gen = getGenMW();
    const demand = getDemandMW();
    const P_imbalance = gen - demand; // in MW

    // Swing equation: df/dt = (f0 / (2 * H)) * ((Pgen - Pdem) / Sbase - D * (f - f0)/f0)
    const f = currentFrequency.value;
    const deltaF_pu = (f - targetFrequency) / targetFrequency;

    // Governor restoring action (primary frequency control)
    let governorAction = 0;
    if (Math.abs(deltaF_pu) > 0.001) { // 0.05 Hz deadband
      governorAction = -deltaF_pu / governorDroop * 0.15;
    }

    const df_dt = (targetFrequency / (2 * H)) * (P_imbalance / Sbase - D * deltaF_pu) + governorAction;
    rocof.value = df_dt;

    // Small organic micro-noise to simulate real AC turbine grid rhythm
    const noise = (Math.sin(elapsedSeconds * 4.3) + Math.cos(elapsedSeconds * 2.7)) * 0.003;

    let nextF = f + df_dt * dt + noise;
    // Hard physics clamping between 47.0 Hz (blackout) and 53.0 Hz
    nextF = Math.max(47.0, Math.min(53.0, nextF));
    currentFrequency.value = nextF;

    // Record history every ~0.25 seconds
    if (history.value.length === 0 || elapsedSeconds - history.value[history.value.length - 1].time >= 0.25) {
      history.value.push({
        time: parseFloat(elapsedSeconds.toFixed(2)),
        frequency: parseFloat(nextF.toFixed(3)),
      });

      // Keep only last 40 seconds of data (approx 160 points)
      if (history.value.length > 160) {
        history.value.shift();
      }
    }

    animFrameId = requestAnimationFrame(updatePhysics);
  }

  function resetFrequency() {
    currentFrequency.value = 50.0;
    rocof.value = 0.0;
    history.value = [];
    elapsedSeconds = 0;
    lastTimestamp = performance.now();
  }

  onMounted(() => {
    lastTimestamp = performance.now();
    animFrameId = requestAnimationFrame(updatePhysics);
  });

  onUnmounted(() => {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
    }
  });

  return {
    currentFrequency,
    targetFrequency,
    rocof,
    history,
    statusBand,
    controllerMessage,
    isControllerView,
    resetFrequency,
  };
}
