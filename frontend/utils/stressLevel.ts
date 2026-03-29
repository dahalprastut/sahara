import { StressLevel } from "../types";

export function scoreToLevel(score: number): StressLevel {
  if (score < 0.25) return "calm";
  if (score < 0.5) return "mild";
  if (score < 0.75) return "moderate";
  return "severe";
}

export const stressLabels: Record<StressLevel, string> = {
  calm: "You're feeling calm",
  mild: "Mild stress detected",
  moderate: "Moderate stress detected",
  severe: "High stress detected",
};

export const stressEmoji: Record<StressLevel, string> = {
  calm: "😌",
  mild: "😐",
  moderate: "😟",
  severe: "😰",
};
