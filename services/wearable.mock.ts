import { WearableReading } from "../types";

let intervalId: ReturnType<typeof setInterval> | null = null;
let currentReading: WearableReading = generateReading(false);

function generateReading(stressed: boolean): WearableReading {
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;
  return {
    heartRate: stressed ? rand(90, 130) : rand(60, 90),
    hrv: stressed ? rand(15, 40) : rand(40, 80),
    skinConductance: stressed ? rand(5, 15) : rand(1, 5),
    timestamp: Date.now(),
  };
}

export function startMockWearable(onReading: (r: WearableReading) => void) {
  stopMockWearable();
  let tick = 0;
  intervalId = setInterval(() => {
    tick++;
    const stressed = tick % 5 === 0;
    currentReading = generateReading(stressed);
    onReading(currentReading);
  }, 30000);
  onReading(currentReading);
}

export function stopMockWearable() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function getCurrentReading(): WearableReading {
  return currentReading;
}
