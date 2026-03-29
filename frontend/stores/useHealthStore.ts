import { create } from "zustand";
import { WearableReading, StressPrediction, AffirmationEntry, Persona, StressLevel } from "../types";
import { predictStress } from "../services/predictions.mock";
import { startMockWearable, stopMockWearable } from "../services/wearable.mock";

const SEED_AFFIRMATIONS: AffirmationEntry[] = [
  {
    id: "seed-1",
    text: "You're doing beautifully — keep riding this peaceful wave.",
    timestamp: Date.now() - 86400000 * 2,
    persona: "pragati",
    stressLevel: "calm",
  },
  {
    id: "seed-2",
    text: "Your body's asking for a pause. Even 60 seconds of stillness helps.",
    timestamp: Date.now() - 86400000 * 4,
    persona: "kulman",
    stressLevel: "moderate",
  },
  {
    id: "seed-3",
    text: "A little tension means you're engaged with life. You've got this.",
    timestamp: Date.now() - 86400000 * 6,
    persona: "pragati",
    stressLevel: "mild",
  },
];

interface HealthState {
  readings: WearableReading[];
  predictions: StressPrediction[];
  latestPrediction: StressPrediction | null;
  wearableConnected: boolean;
  wearableMode: "connected" | "none";
  affirmationVisible: boolean;
  currentAffirmation: string;
  affirmationHistory: AffirmationEntry[];
  startWearable: () => void;
  stopWearable: () => void;
  showAffirmation: (text: string, persona: Persona, stressLevel: StressLevel) => void;
  dismissAffirmation: () => void;
  setWearableMode: (mode: "connected" | "none") => void;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  readings: [],
  predictions: [],
  latestPrediction: null,
  wearableConnected: false,
  wearableMode: "none",
  affirmationVisible: false,
  currentAffirmation: "",
  affirmationHistory: SEED_AFFIRMATIONS,

  startWearable: () => {
    if (get().wearableConnected) return;
    set({ wearableConnected: true });
    startMockWearable((reading) => {
      const prediction = predictStress(reading);
      set((s) => ({
        readings: [...s.readings.slice(-20), reading],
        predictions: [...s.predictions.slice(-20), prediction],
        latestPrediction: prediction,
      }));
    });
  },

  stopWearable: () => {
    stopMockWearable();
    set({ wearableConnected: false });
  },

  showAffirmation: (text, persona, stressLevel) => {
    const entry: AffirmationEntry = {
      id: `aff-${Date.now()}`,
      text,
      timestamp: Date.now(),
      persona,
      stressLevel,
    };
    set((s) => ({
      affirmationVisible: true,
      currentAffirmation: text,
      affirmationHistory: [entry, ...s.affirmationHistory],
    }));
  },

  dismissAffirmation: () => set({ affirmationVisible: false }),
  setWearableMode: (mode) => set({ wearableMode: mode }),
}));
