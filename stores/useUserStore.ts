import { create } from "zustand";
import { Persona, UserProfile } from "../types";

interface UserState extends UserProfile {
  setAnonymousName: (name: string) => void;
  setPersona: (persona: Persona) => void;
  completeOnboarding: () => void;
  joinCommunity: (id: string) => void;
  leaveCommunity: (id: string) => void;
}

const adjectives = ["Quiet", "Gentle", "Bright", "Calm", "Soft", "Warm", "Kind", "Clear"];
const nouns = ["Maple", "River", "Dawn", "Cloud", "Birch", "Tide", "Sage", "Pebble"];

function generateName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
}

export const useUserStore = create<UserState>((set) => ({
  anonymousName: generateName(),
  persona: "friend",
  onboardingComplete: false,
  joinedCommunities: [],
  setAnonymousName: (name) => set({ anonymousName: name }),
  setPersona: (persona) => set({ persona }),
  completeOnboarding: () => set({ onboardingComplete: true }),
  joinCommunity: (id) =>
    set((s) => ({
      joinedCommunities: s.joinedCommunities.includes(id)
        ? s.joinedCommunities
        : [...s.joinedCommunities, id],
    })),
  leaveCommunity: (id) =>
    set((s) => ({ joinedCommunities: s.joinedCommunities.filter((c) => c !== id) })),
}));
