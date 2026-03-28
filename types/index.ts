export type Persona = "friend" | "counsellor" | "psychiatrist";
export type StressLevel = "calm" | "mild" | "moderate" | "severe";
export type CommunitySize = "small" | "large";

export interface WearableReading {
  heartRate: number;
  hrv: number;
  skinConductance: number;
  timestamp: number;
}

export interface StressPrediction {
  score: number;
  level: StressLevel;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  persona: Persona;
  timestamp: number;
}

export interface Community {
  id: string;
  name: string;
  category: string;
  description: string;
  emoji: string;
  sizeType: CommunitySize;
  memberCount: number;
  activeNow: number;
  seedMessages: CommunityMessage[];
}

export interface CommunityMessage {
  id: string;
  communityId: string;
  anonymousName: string;
  content: string;
  timestamp: number;
}

export interface UserProfile {
  anonymousName: string;
  persona: Persona;
  onboardingComplete: boolean;
  joinedCommunities: string[];
}
