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
  friend: [
    "Ugh, I totally get that. It's the worst when everything piles up at once.",
    "Okay wait, tell me more — what's been going on?",
    "Honestly? That sounds really hard. You're not overreacting.",
    "I'd feel the same way. How long has this been building?",
    "You know what, sometimes just saying it out loud helps. Keep going.",
    "That makes so much sense. What do you need right now — to vent or to problem-solve?",
    "I'm here. Take your time.",
    "No judgment here — that sounds genuinely stressful.",
    "Okay real talk: when did you last sleep properly?",
    "You're not alone in this, I promise.",
    "That's a lot to carry. Have you told anyone else about it?",
    "Sometimes things just suck and there's no fixing it, only feeling it. I'm with you.",
  ],
  counsellor: [
    "Thank you for sharing that. What emotion comes up most strongly when you think about it?",
    "I'm hearing a lot of pressure in what you're describing. Can you say more about where that's coming from?",
    "It sounds like this has been weighing on you for some time. How long have you been feeling this way?",
    "What would it look like if this situation improved, even just a little?",
    "Notice any physical sensations as you talk about this — tension, tightness anywhere?",
    "You're being very hard on yourself. What would you say to a friend in your position?",
    "That's a really important insight. Can you sit with that for a moment?",
    "It's okay to not have answers right now. Sometimes naming the feeling is enough.",
    "What's one small thing that felt okay today, even briefly?",
    "You've navigated hard things before. What helped you then?",
    "I want to reflect something back to you — it sounds like you're saying you feel unseen. Is that accurate?",
    "Let's slow down here. What do you need most right now?",
  ],
  psychiatrist: [
    "How long have you been experiencing these symptoms, and have they affected your daily functioning?",
    "Are there specific triggers you've identified, or does it feel more generalized?",
    "Sleep and appetite are often the first things affected by elevated stress. How are both for you?",
    "On a scale of 0 to 10, how would you rate your distress right now compared to your baseline?",
    "Have you tried any structured relaxation techniques — diaphragmatic breathing, progressive muscle relaxation?",
    "What you're describing aligns with a stress response. The good news is it's manageable with the right tools.",
    "Let's look at this systematically. What are the top two stressors right now?",
    "I'd encourage you to track these patterns — when they peak, what preceded them.",
    "Cognitive reframing can help here. What evidence do you have that supports that thought, and what contradicts it?",
    "Has anything changed recently — sleep, diet, routine, relationships — that might be contributing?",
    "These are normal stress responses. The goal is reducing their frequency and intensity.",
    "I'd like to understand your coping repertoire better. What strategies have worked in the past?",
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
    return persona === "friend"
      ? "Okay real talk: when did you last sleep properly?"
      : persona === "counsellor"
      ? "Sleep and rest are foundational. How has your sleep been lately?"
      : "Sleep disruption is often both a symptom and a cause. How many hours are you averaging?";
  }
  if (lower.includes("work") || lower.includes("job") || lower.includes("boss")) {
    return persona === "friend"
      ? "Work stuff is the worst. What's been happening there?"
      : persona === "counsellor"
      ? "Work environments can have a profound impact on our mental state. What's the dynamic like?"
      : "Occupational stress is a significant factor. What specifically about work is most burdensome?";
  }
  if (lower.includes("anxious") || lower.includes("anxiety") || lower.includes("panic")) {
    return persona === "friend"
      ? "Anxiety is so draining. Are you feeling it right now or is this more ongoing?"
      : persona === "counsellor"
      ? "Anxiety often has something it's trying to protect you from. What feels threatened right now?"
      : "Anxiety presents on a spectrum. Are these episodic panic responses or a more persistent baseline elevation?";
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
