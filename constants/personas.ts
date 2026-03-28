import { Persona } from "../types";

export interface PersonaDef {
  id: Persona;
  label: string;
  description: string;
  emoji: string;
  tagline: string;
}

export const PERSONAS: PersonaDef[] = [
  {
    id: "friend",
    label: "Friend",
    description: "Casual, empathetic, like texting a close friend",
    emoji: "🧡",
    tagline: "Warm and real",
  },
  {
    id: "counsellor",
    label: "Counsellor",
    description: "Supportive, guided, reflective listening",
    emoji: "💙",
    tagline: "Thoughtful and steady",
  },
  {
    id: "psychiatrist",
    label: "Psychiatrist",
    description: "Clinical, structured, evidence-based",
    emoji: "🩵",
    tagline: "Clear and grounded",
  },
];
