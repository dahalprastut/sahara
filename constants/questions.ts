export interface OnboardingQuestion {
  id: number;
  emoji: string;
  question: string;
  options: { value: string; label: string }[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 1,
    emoji: "⚡",
    question: "What's your main source of stress?",
    options: [
      { value: "work", label: "Work & career pressure" },
      { value: "relationships", label: "Relationships & family" },
      { value: "health", label: "Health & body" },
      { value: "finances", label: "Finances & money" },
      { value: "academic", label: "Academic pressure" },
      { value: "overwhelmed", label: "Just feeling overwhelmed in general" },
    ],
  },
  {
    id: 2,
    emoji: "📅",
    question: "How often do you feel stressed?",
    options: [
      { value: "daily", label: "Almost every day" },
      { value: "weekly", label: "A few times a week" },
      { value: "occasionally", label: "Occasionally" },
      { value: "rarely", label: "Rarely, but it hits hard when it does" },
    ],
  },
  {
    id: 3,
    emoji: "🌙",
    question: "How has your sleep been lately?",
    options: [
      { value: "good", label: "Sleeping well, no issues" },
      { value: "falling_asleep", label: "Taking a while to fall asleep" },
      { value: "waking", label: "Waking up during the night" },
      { value: "exhausted", label: "Feeling exhausted no matter how much I sleep" },
    ],
  },
  {
    id: 4,
    emoji: "🛡️",
    question: "How do you usually cope with stress?",
    options: [
      { value: "talk", label: "I talk to someone I trust" },
      { value: "internalize", label: "I keep it to myself" },
      { value: "distract", label: "I stay busy and distract myself" },
      { value: "no_cope", label: "I don't really have a way to cope" },
    ],
  },
  {
    id: 5,
    emoji: "🎯",
    question: "What are you hoping MindWell helps you with?",
    options: [
      { value: "patterns", label: "Understanding my stress patterns" },
      { value: "talk_to", label: "Having someone to talk to" },
      { value: "less_alone", label: "Feeling less alone" },
      { value: "habits", label: "Building healthier habits" },
      { value: "all", label: "All of the above" },
    ],
  },
  {
    id: 6,
    emoji: "💬",
    question: "How comfortable are you talking about your feelings?",
    options: [
      { value: "very", label: "Very comfortable, I open up easily" },
      { value: "right_person", label: "Comfortable with the right person" },
      { value: "trying", label: "I find it hard but I'm trying" },
      { value: "prefer_data", label: "I prefer not to — I just want data" },
    ],
  },
];
