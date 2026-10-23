export interface DebriefQuestion {
  id: number;
  question: string;
  context: string;
  sampleAnswers: string[];
}

export const DEBRIEF_QUESTIONS: DebriefQuestion[] = [
  {
    id: 1,
    question: 'How did it feel when Gas A (Egbin) tripped?',
    context: 'Round 3: 1:00 PM unexpected generation loss of 120 MW.',
    sampleAnswers: [
      'Panic and urgency — 120 MW dropped to zero in a split second.',
      'Scramble to check if Kainji Hydro had enough reserve spaces left.',
      'Realized how fragile the grid is when a massive thermal station drops without warning.',
    ],
  },
  {
    id: 2,
    question: 'Why did the reserve matter?',
    context: 'Spinning reserve on Kainji Hydro (keeping at least 2 empty spaces).',
    sampleAnswers: [
      'Without reserve on Kainji Hydro, there is zero fast-acting generation to arrest frequency collapse.',
      'Gas turbines cannot ramp up fast enough; Kainji Hydro was the only station capable of immediate emergency backup.',
      'Reserve must be planned rounds in advance — you cannot create reserve in the middle of a crisis.',
    ],
  },
  {
    id: 3,
    question: "Why can't a gas station just jump to full power?",
    context: 'Thermal ramp constraints (max 3 tokens / 30 MW per round; restart limit $\le 30$ MW).',
    sampleAnswers: [
      'Thermal stress on turbine blades and boiler/combustor metals requires gradual heating and cooling.',
      'Gas compressor pressure stabilization and turbine synchronization take considerable time.',
      'Rapid ramp rates risk mechanical failure, thermal shock, and catastrophic equipment damage.',
    ],
  },
  {
    id: 4,
    question: 'What happened at 7:00 PM, and why?',
    context: 'Round 5: Evening peak demand (260 MW) coincidental with Kano Solar falling to zero.',
    sampleAnswers: [
      'The "Duck Curve" phenomenon: people return home, turn on lighting/cooling, and demand peaks exactly when solar irradiance drops to zero.',
      'Every conventional station (Kainji, Egbin, Geregu) had to be maxed out or ramped hard to survive without solar.',
      'Zero reserve was available because all generation was needed simply to keep the lights on.',
    ],
  },
  {
    id: 5,
    question: 'What made this game easier than real life?',
    context: 'The "Ideal World" vs the everyday operational reality of the Nigerian Electricity Supply Industry (NESI).',
    sampleAnswers: [
      'Gas was always available when we wanted to ramp (in real life, gas supply and pipeline pressure frequently drop).',
      'Demand was known precisely in advance (in real life, demand fluctuates dynamically every second).',
      'Every transmission line carried power smoothly (except the scripted R6 outage).',
      'DisCos took all the power dispatched to them without load rejection.',
      'The dispatcher had 100% complete, immediate visibility of all 4 stations at once.',
    ],
  },
];

export interface IdealWorldItem {
  id: string;
  idealAssumption: string;
  realWorldReality: string;
  category: 'Gas' | 'Demand' | 'Transmission' | 'DisCos' | 'SCADA' | 'Custom';
  isPredefined: boolean;
}

export const INITIAL_IDEAL_WORLD_ITEMS: IdealWorldItem[] = [
  {
    id: 'gas-avail',
    idealAssumption: 'Gas is always available at full pipeline pressure',
    realWorldReality: 'Gas pipeline vandalism, condensate buildup, low pressure at Egbin/Geregu, and unpaid gas invoices often curtail generation.',
    category: 'Gas',
    isPredefined: true,
  },
  {
    id: 'demand-known',
    idealAssumption: 'Demand is known exactly in advance for each hour',
    realWorldReality: 'Customer demand is volatile and weather-dependent; dispatchers must constantly forecast and track instantaneous system load.',
    category: 'Demand',
    isPredefined: true,
  },
  {
    id: 'lines-work',
    idealAssumption: 'Every transmission line works without tripping',
    realWorldReality: 'Overhead lines trip from vegetation contact, line faults, lightning, insulator flashovers, and thermal overload (e.g., 330kV lines).',
    category: 'Transmission',
    isPredefined: true,
  },
  {
    id: 'discos-take-power',
    idealAssumption: 'Every DisCo takes exactly the power allocated to it',
    realWorldReality: 'DisCos frequently reject load due to feeder faults, rainstorms, or commercial reasons, causing frequency to spike dangerously.',
    category: 'DisCos',
    isPredefined: true,
  },
  {
    id: 'dispatcher-sees-all',
    idealAssumption: 'Dispatcher sees everything at once with 100% clarity',
    realWorldReality: 'SCADA telemetry gaps, fiber/radio communication outages, and RTU failures mean dispatchers must make voice calls to sub-stations.',
    category: 'SCADA',
    isPredefined: true,
  },
];

export const TOUR_BRIDGE_POINTS = [
  {
    icon: '⚡',
    title: '50.00 Hz Target Frequency',
    gameConcept: 'Keep generation = demand to keep frequency needle at 50 Hz.',
    nccReality: 'NCC Osogbo monitors the frequency meter continuously. If frequency drifts below 48.8 Hz, automated Under-Frequency Load Shedding (UFLS) triggers in stages to prevent total system collapse.',
  },
  {
    icon: '🌊',
    title: 'Spinning Reserves (Kainji Hydro)',
    gameConcept: 'Keep 2 empty slots on Kainji for quick backup.',
    nccReality: 'Kainji and Jebba hydro stations are vital black-start and primary governor response providers on the Nigerian grid, maintaining frequency stability when thermal units trip.',
  },
  {
    icon: '🔥',
    title: 'Slow Gas Ramp (Egbin & Geregu)',
    gameConcept: 'Gas stations can only move 3 tokens per round.',
    nccReality: 'Heavy-duty industrial gas turbines at Egbin and Geregu require controlled acceleration and thermal soaking. Dispatchers at NCC must send dispatch instructions 30-60 minutes in advance.',
  },
  {
    icon: '🔌',
    title: 'Load Shedding as Last Resort',
    gameConcept: 'Cut 1-3 tokens of demand at -1 point penalty.',
    nccReality: 'When generation cannot meet demand or transmission corridors are congested, NCC operators issue emergency load-shed instructions to regional DisCos to preserve grid integrity.',
  },
];
