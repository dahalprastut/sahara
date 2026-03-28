import { create } from "zustand";
import { WearableReading, StressPrediction } from "../types";
import { predictStress } from "../services/predictions.mock";
import { startMockWearable, stopMockWearable } from "../services/wearable.mock";

interface HealthState {
  readings: WearableReading[];
  predictions: StressPrediction[];
  latestPrediction: StressPrediction | null;
  wearableConnected: boolean;
  wearableMode: "demo" | "none";
  affirmationVisible: boolean;
  currentAffirmation: string;
  startWearable: () => void;
  stopWearable: () => void;
  showAffirmation: (text: string) => void;
  dismissAffirmation: () => void;
  setWearableMode: (mode: "demo" | "none") => void;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  readings: [],
  predictions: [],
  latestPrediction: null,
  wearableConnected: false,
  wearableMode: "none",
  affirmationVisible: false,
  currentAffirmation: "",

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

  showAffirmation: (text) => set({ affirmationVisible: true, currentAffirmation: text }),
  dismissAffirmation: () => set({ affirmationVisible: false }),
  setWearableMode: (mode) => set({ wearableMode: mode }),
}));
