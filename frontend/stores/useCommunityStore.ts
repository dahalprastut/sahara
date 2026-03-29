import { create } from "zustand";
import { CommunityMessage } from "../types";
import { COMMUNITIES } from "../constants/communities";

interface CommunityState {
  messages: Record<string, CommunityMessage[]>;
  addMessage: (communityId: string, anonymousName: string, content: string) => void;
  getMessages: (communityId: string) => CommunityMessage[];
}

const initialMessages: Record<string, CommunityMessage[]> = {};
COMMUNITIES.forEach((c) => {
  initialMessages[c.id] = c.seedMessages;
});

let msgId = 0;
const uid = () => `cmsg_${++msgId}_${Date.now()}`;

const BOT_NAMES = ["StarDust", "CalmWave", "MorningLight", "SilverLake", "GentleFern"];
const BOT_RESPONSES: Record<string, string[]> = {
  "career-pressure": ["That resonates so much.", "I've been there. It gets better.", "Have you considered talking to HR?", "You're not alone in this."],
  burnout: ["Rest is productive too.", "Your worth isn't your output.", "Take it one day at a time.", "How are you doing right now?"],
  breakup: ["Sending you strength 💙", "Healing isn't linear.", "You deserve someone who chooses you every day.", "It's okay to grieve."],
  midlife: ["Reinvention is possible at any age.", "This restlessness is pointing somewhere.", "What lights you up these days?", "Change is scary and necessary."],
  "academic-stress": ["You've gotten through hard semesters before.", "Done > perfect.", "Take a 10 min walk. Seriously.", "What's the actual worst case?"],
  "general-wellness": ["Small steps count! 🌿", "How's your water intake today?", "You're showing up — that matters.", "Celebrate the tiny wins."],
  "anxiety-circle": ["Breathe. You're safe right now.", "Anxiety lies. What's actually true?", "Box breathing really helps.", "You're doing better than you think."],
  loneliness: ["We see you here 🕯️", "You reached out — that's huge.", "Connection starts with one message.", "You belong here."],
};

export const useCommunityStore = create<CommunityState>((set, get) => ({
  messages: initialMessages,

  addMessage: (communityId, anonymousName, content) => {
    const newMsg: CommunityMessage = {
      id: uid(),
      communityId,
      anonymousName,
      content,
      timestamp: Date.now(),
    };
    set((s) => ({
      messages: {
        ...s.messages,
        [communityId]: [...(s.messages[communityId] || []), newMsg],
      },
    }));

    // Simulate bot response after random delay
    const delay = 5000 + Math.random() * 10000;
    setTimeout(() => {
      const pool = BOT_RESPONSES[communityId] || ["Thanks for sharing.", "We hear you.", "Keep going."];
      const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      const botMsg: CommunityMessage = {
        id: uid(),
        communityId,
        anonymousName: botName,
        content: pool[Math.floor(Math.random() * pool.length)],
        timestamp: Date.now(),
      };
      set((s) => ({
        messages: {
          ...s.messages,
          [communityId]: [...(s.messages[communityId] || []), botMsg],
        },
      }));
    }, delay);
  },

  getMessages: (communityId) => get().messages[communityId] || [],
}));
