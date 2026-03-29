export interface OnboardingQuestion {
  id: number;
  emoji: string;
  question: string;
  options: { value: string; label: string }[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 1,
    emoji: "🧠",
    question: "What weighs most on your mind?",
    options: [
      { value: "family_expectations", label: "Family Expectations" },
      { value: "work_deadlines", label: "Work Deadlines" },
      { value: "academic_pressure", label: "Academic Pressure" },
      { value: "financial_stability", label: "Financial Stability" },
      { value: "social_connections", label: "Social Connections" },
      { value: "health_concerns", label: "Health Concerns" },
    ],
  },
  {
    id: 2,
    emoji: "🎂",
    question: "How old are you?",
    options: [
      { value: "under_18", label: "Under 18" },
      { value: "18_24", label: "18–24" },
      { value: "25_32", label: "25–32" },
      { value: "33_above", label: "33 and above" },
    ],
  },
  {
    id: 3,
    emoji: "☀️",
    question: "What does your typical day look like right now?",
    options: [
      { value: "student", label: "Student juggling studies" },
      { value: "professional", label: "Working professional" },
      { value: "between_things", label: "Between things" },
      { value: "something_else", label: "Something else" },
    ],
  },
  {
    id: 4,
    emoji: "💭",
    question: "What's been weighing on you the most?",
    options: [
      { value: "career_future", label: "Career and future" },
      { value: "relationships", label: "Relationships" },
      { value: "studies_performance", label: "Studies and performance" },
      { value: "feeling_empty", label: "Just feeling empty" },
      { value: "everything", label: "Everything at once" },
      { value: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: 5,
    emoji: "🌙",
    question: "How has your sleep been feeling recently?",
    options: [
      { value: "sleeping_well", label: "Sleeping well" },
      { value: "hard_to_fall_asleep", label: "Takes me a while to fall asleep" },
      { value: "waking_up", label: "Waking up in the middle of the night" },
      { value: "exhausted", label: "Exhausted no matter how much I sleep" },
    ],
  },
  {
    id: 6,
    emoji: "💬",
    question: "How comfortable are you talking about how you feel?",
    options: [
      { value: "very_comfortable", label: "Very comfortable" },
      { value: "somewhat", label: "Somewhat — depends on the day" },
      { value: "not_very", label: "Honestly not very" },
      { value: "new_for_me", label: "This is new for me" },
    ],
  },
];
