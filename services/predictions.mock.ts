import { WearableReading, StressPrediction } from "../types";
import { scoreToLevel } from "../utils/stressLevel";

export function predictStress(reading: WearableReading): StressPrediction {
  const hrScore = Math.min((reading.heartRate - 60) / 70, 1);
  const hrvScore = Math.max(1 - (reading.hrv - 15) / 65, 0);
  const scScore = Math.min((reading.skinConductance - 1) / 14, 1);
  const score = Math.min(hrScore * 0.3 + hrvScore * 0.5 + scScore * 0.2, 1);

  return {
    score,
    level: scoreToLevel(score),
    timestamp: Date.now(),
  };
}
