import { Persona, StressLevel } from "../types";

export const Colors = {
  primary: "#09A8E0",
  primaryLight: "#0DB5F0",
  primaryMuted: "#E8F6FD",
  primaryDark: "#0790C0",

  darkBackground: "#170E48",
  darkSurface: "#1E1456",

  calm: "#4CAF50",
  mild: "#FFC107",
  moderate: "#FF9800",
  severe: "#F44336",

  surface: "#F5F9FD",
  background: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2ECF5",

  pragatiAccent: "#FF8A65",
  kulmanAccent: "#42A5F5",

  white: "#FFFFFF",
  overlay: "rgba(0,0,0,0.4)",
};

export const GradientColors = {
  primary: ["#0DB5F0", "#09A8E0"] as [string, string],
};

export const personaColor: Record<Persona, string> = {
  pragati: Colors.pragatiAccent,
  kulman: Colors.kulmanAccent,
};

export const stressColor: Record<StressLevel, string> = {
  calm: Colors.calm,
  mild: Colors.mild,
  moderate: Colors.moderate,
  severe: Colors.severe,
};
