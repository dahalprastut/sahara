import { Persona, StressLevel } from "../types";

export const Colors = {
  // Primary — use as solid fallback; use GradientColors for gradient
  primary: "#09A8E0",
  primaryLight: "#0DB5F0",
  primaryMuted: "#E8F6FD",
  primaryDark: "#0790C0",

  // Dark mode surfaces (reserved for dark mode only)
  darkBackground: "#170E48",
  darkSurface: "#1E1456",

  // Stress levels
  calm: "#4CAF50",
  mild: "#FFC107",
  moderate: "#FF9800",
  severe: "#F44336",

  // UI surfaces (light mode)
  surface: "#F5F9FD",
  background: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2ECF5",

  // Persona accents
  friendAccent: "#FF8A65",
  counsellorAccent: "#42A5F5",
  psychiatristAccent: "#26A69A",

  white: "#FFFFFF",
  overlay: "rgba(0,0,0,0.4)",
};

// Use with expo-linear-gradient: colors={GradientColors.primary} start={{x:0,y:0}} end={{x:1,y:0}}
export const GradientColors = {
  primary: ["#0DB5F0", "#09A8E0"] as [string, string],
};

export const personaColor: Record<Persona, string> = {
  friend: Colors.friendAccent,
  counsellor: Colors.counsellorAccent,
  psychiatrist: Colors.psychiatristAccent,
};

export const stressColor: Record<StressLevel, string> = {
  calm: Colors.calm,
  mild: Colors.mild,
  moderate: Colors.moderate,
  severe: Colors.severe,
};
