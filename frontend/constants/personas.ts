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
    id: "pragati",
    label: "Pragati",
    description: "Progressive, helpful, and always in your corner as a mentor",
    emoji: "🌸",
    tagline: "Your growth guide",
  },
  {
    id: "kulman",
    label: "Kulman",
    description: "Cool, happy, and funny — here to lighten up your day",
    emoji: "😎",
    tagline: "The cool one",
  },
];
