# NISO "Keep the Lights On" Grid Balancing Game
### Interactive Web Edition for NISO Staff Acculturation Programme (Day 2)

A single self-contained, interactive web implementation of the official **NISO Exercise Guide 3: Keep the Lights On — Grid Balancing Game**.

---

## ⚡ Quick Start

### 1. Run Offline Instantly (Zero Setup)
Simply double-click or open the standalone deliverable in any web browser:
```bash
open keep-the-lights-on.html
```
*(Or [dist/index.html](file:///Users/princeak/Documents/offfice/Training/Game/dist/index.html))*

- **Zero dependencies**: No internet connection, npm, or web server required.
- **Single file**: All Vue 3 runtime code, TypeScript compilation, SVGs, audio synthesizer, and styles are inlined into one 168 KB HTML file.
- **Ready to share**: Email it as an attachment, drop it onto a flash drive, or host on GitHub Pages, Netlify, or internal NISO intranet portals.

---

## 🏗️ Development & Build

```bash
# Start local development server with hot-reload
npm run dev

# Rebuild the single self-contained HTML deliverable
npm run build
```

---

## 🎮 Game Structure & Features

### 1. Real Nigerian Power Stations
- **Kainji Hydroelectric Power Station** (Niger State): Max 8 tokens (80 MW). Fast-acting spinning reserve.
- **Egbin Thermal Power Station** (Lagos State): Max 12 tokens (120 MW). Slow ramp (±3 tokens / round). Subject to surprise trip in Round 3 and cold restart restriction in Round 4.
- **Geregu Power Plant** (Kogi State): Max 12 tokens (120 MW). Slow ramp (±3 tokens / round). Baseload workhorse.
- **Kano Solar Farm** (Kano State): Max 6 tokens (60 MW). Script-dispatched solar generation curve.
- **National Reserve Token Depot**: 40 tokens per team (1 token = 10 MW).

### 2. Real-Time 50.00 Hz Frequency Simulation
- **Physics Layer**: Discretized Swing Equation with inertia ($H = 4.0\text{ s}$), damping factor ($D = 1.2$), and primary governor droop control.
- **Live Gauge & Oscilloscope**: Semi-circular analog speedometer (48.0–52.0 Hz) and 40-second rolling history chart.
- **NCC Osogbo Controller View**: Real-time console annotations explaining dispatcher actions during contingencies.

### 3. Dispatch Modes
- **Team Dispatcher Mode**: Full tactile grid board, drag-and-drop / tap +/- token racks, 2-minute countdown timer with dramatic "Hands off!" lockout bell, event modals, and official teaching lines.
- **Facilitator Master Deck**: Round orchestrator, global timer controls, contingency injector (trigger Egbin trip on demand), multi-team score sheet, facilitator dispute override arbiter, and 10/7/5/3 tournament point leaderboard.
- **Solution Key Modal**: Mathematical proof confirming 659,442 feasible paths, safe dispatch combinations, and the Round 2–3 spinning reserve strategy trap.
- **Debrief & Tour Bridge**: The 5 debrief questions, interactive "Ideal World" flip-chart list builder, and the "Ideal vs Reality" preparation bridge for the National Control Centre (NCC) tour.
