import { create } from "zustand";
import { ChatMessage, Persona } from "../types";
import { sendChatMessage } from "../services/api";

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  activePersona: Persona;
  setPersona: (p: Persona) => void;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

let msgId = 0;
const uid = () => `msg_${++msgId}_${Date.now()}`;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isTyping: false,
  activePersona: "friend",

  setPersona: (persona) => {
    set({ activePersona: persona, messages: [] });
  },

  sendMessage: async (content) => {
    const { activePersona, messages } = get();
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content,
      persona: activePersona,
      timestamp: Date.now(),
    };
    set({ messages: [...messages, userMsg], isTyping: true });

    try {
      const response = await sendChatMessage(content, activePersona, [...messages, userMsg]);
      const aiMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: response,
        persona: activePersona,
        timestamp: Date.now(),
      };
      set((s) => ({ messages: [...s.messages, aiMsg], isTyping: false }));
    } catch {
      set({ isTyping: false });
    }
  },

  clearChat: () => set({ messages: [] }),
}));
