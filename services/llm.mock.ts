import { Persona, StressLevel, ChatMessage } from "../types";

const affirmations: Record<StressLevel, string[]> = {
  calm: [
    "You're doing beautifully — keep riding this peaceful wave.",
    "This calm you're feeling is something you created. Own it.",
    "Harmony looks good on you today.",
    "Your nervous system is thanking you right now.",
    "Peace isn't an accident — it's a practice, and you're nailing it.",
  ],
  mild: [
    "A little tension means you're engaged with life. You've got this.",
    "Notice the stress — then let it be information, not an alarm.",
    "You're carrying something. That's okay. Put it down for one breath.",
    "Mild ripples don't sink boats. You're steady.",
    "Even on rough days, you keep showing up. That matters.",
  ],
  moderate: [
    "Your body's asking for a pause. Even 60 seconds of stillness helps.",
    "You're under pressure right now — that's real. So is your ability to handle it.",
    "This is hard, and you're still here. That counts for everything.",
    "Breathe in for 4, out for 6. Your nervous system will follow.",
    "It's okay to feel this. You don't have to solve it right now.",
  ],
  severe: [
    "High stress is your body asking for care — can you give it one small thing right now?",
    "You're not failing. You're overwhelmed. There's a big difference.",
    "Reach out to someone today — you don't have to carry this alone.",
    "One minute of slow breathing can shift your entire physiology. Try it.",
    "This intensity won't last forever. You have survived every hard day so far.",
  ],
};

const chatResponses: Record<Persona, string[]> = {
  pragati: [
    "Let's break this down — what's the one thing that would make the biggest difference right now?",
    "You're closer than you think. What's one small step you could take today?",
    "Growth isn't always comfortable. The fact that you're here tells me you're ready.",
    "What does the version of you who's already through this look like? Let's work toward that.",
    "You have more tools than you realise. What's worked for you before in hard moments?",
    "Progress, not perfection. What's one thing you did well recently?",
    "Let's reframe this — what's the opportunity hiding inside this challenge?",
    "I hear you. And I also believe you're capable of more than you're giving yourself credit for.",
    "What would you tell a close friend who came to you with this exact situation?",
    "Sometimes the path forward is just the next honest step. What's yours?",
    "You don't have to solve everything today. What's the one priority?",
    "That feeling of being stuck is often a signal that something needs to shift. What feels off?",
  ],
  kulman: [
    "Okay okay, first of all — deep breath. You've survived 100% of your bad days so far 😄",
    "Honestly? That sounds rough. But hey, you texted me, so that's already a win.",
    "Lol I feel you. Life really said 'let me throw everything at once' huh?",
    "Okay real talk — when did you last eat a proper meal and drink some water? Don't lie 😂",
    "You know what? You're actually hilarious for thinking you have to handle all of this alone.",
    "Okay so here's my hot take: this is hard AND you're totally going to get through it.",
    "Sending virtual snacks and good vibes your way 🍕✨",
    "Tell me more — and also, have you considered that you might be being way too hard on yourself?",
    "I mean, for what it's worth, I think you're doing way better than you think.",
    "Okay but like... what if it actually works out? Hear me out 👀",
    "You're not overreacting. Also you're kind of amazing for even trying.",
    "Permission granted to take a break, watch something dumb, and come back to this later 🙌",
  ],
};

export function getAffirmation(level: StressLevel, _persona: Persona): string {
  const pool = affirmations[level];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getChatResponse(
  message: string,
  persona: Persona,
  _history: ChatMessage[]
): string {
  const pool = chatResponses[persona];
  const lower = message.toLowerCase();

  if (lower.includes("sleep") || lower.includes("tired")) {
    return persona === "pragati"
      ? "Sleep is foundational. Without it, nothing else works well. How many hours are you averaging?"
      : "Okay real talk — when did you last sleep properly? That's not optional my friend 😴";
  }
  if (lower.includes("rejection") || lower.includes("rejected") || lower.includes("job rejection")) {
    return persona === "pragati"
      ? `Job rejections are genuinely hard — and when they keep coming, it can start to feel like a verdict on your worth. It's not. It's data.\n\nEvery rejection gets you closer to the yes that's actually right for you. The companies that didn't choose you aren't the ones you're meant to build your career at. That might feel empty to hear right now, but it's true.\n\nHere's something practical: look at your applications as a funnel. Are you getting interviews but not offers? That's an interview skill or fit issue. Not getting calls at all? That's a resume or targeting issue. The pattern tells you exactly where to focus your energy.\n\nYou are not failing — you're in the middle of a process. And the middle always feels the hardest.`
      : `Okay FIRST of all — job rejections are the absolute worst and I want you to know that what you're feeling right now is completely valid. Like, ouch. That stuff genuinely stings 😔\n\nBut real talk? Every single person who's ever had a job they loved got rejected somewhere before they got there. Even the people who make it look effortless. ESPECIALLY those people.\n\nThe job market is kind of brutal right now and it is NOT a reflection of how talented or capable you are — it's a numbers game with too many applicants and too little feedback. You're not the problem.\n\nSo here's what I say: let yourself feel bad about it for like... one evening. Watch something dumb. Eat your comfort food. Then tomorrow, freshen up that resume, tweak something small, and keep going. You're literally one yes away from everything changing 👊`;
  }
  if (lower.includes("work") || lower.includes("job") || lower.includes("boss")) {
    return persona === "pragati"
      ? "Work stress is real. Let's look at what's in your control vs what isn't — that distinction is everything."
      : "Ugh, work stuff. What's been happening? Give me the whole tea ☕";
  }
  if (lower.includes("anxious") || lower.includes("anxiety") || lower.includes("panic")) {
    return persona === "pragati"
      ? "Anxiety often spikes when there's uncertainty. What specifically feels most out of control right now?"
      : "Anxiety is the WORST. Are you feeling it right now or has it been building for a while?";
  }
  if (lower.includes("sad") || lower.includes("cry") || lower.includes("depress")) {
    return persona === "pragati"
      ? "Thank you for sharing that. Low moods often carry information. What do you think your mind is trying to tell you?"
      : "Hey. I see you. That takes courage to say. I'm here — talk to me 💙";
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
