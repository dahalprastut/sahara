export const Colors = {
  primary: "#6C63FF",
  primaryMuted: "#EAE8FF",
  primaryDark: "#5A52D5",
  calm: "#4CAF50",
  mild: "#FFC107",
  moderate: "#FF9800",
  severe: "#F44336",
  surface: "#F8F7FC",
  background: "#FFFFFF",
  textPrimary: "#1A1A2E",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  friendAccent: "#FF8A65",
  counsellorAccent: "#42A5F5",
  psychiatristAccent: "#26A69A",
  white: "#FFFFFF",
  overlay: "rgba(0,0,0,0.4)",
};

export const personaColor: Record<string, string> = {
  friend: Colors.friendAccent,
  counsellor: Colors.counsellorAccent,
  psychiatrist: Colors.psychiatristAccent,
};

export const stressColor: Record<string, string> = {
  calm: Colors.calm,
  mild: Colors.mild,
  moderate: Colors.moderate,
  severe: Colors.severe,
};
