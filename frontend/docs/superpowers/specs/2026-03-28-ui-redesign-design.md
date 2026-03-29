# MindWell UI Redesign — Design Spec
**Date:** 2026-03-28

---

## 1. Color System

### Primary gradient
All buttons, active tab indicators, header backgrounds, and key accents use:
```
linear-gradient(to right, #0DB5F0, #09A8E0)
```
For solid fallbacks (shadows, tints, border highlights): use `#09A8E0`.

### Full palette update (replaces current purple #6C63FF system)

| Token            | Value         | Usage                                      |
|------------------|---------------|--------------------------------------------|
| `primary`        | `#09A8E0`     | Solid accent fallback                      |
| `primaryGradient`| `#0DB5F0 → #09A8E0` | Buttons, headers, active states      |
| `primaryMuted`   | `#E8F6FD`     | Badge backgrounds, tinted surfaces         |
| `background`     | `#FFFFFF`     | Screen backgrounds (light mode)            |
| `surface`        | `#F5F9FD`     | Card backgrounds                           |
| `darkBackground` | `#170E48`     | Dark mode screen background only          |
| `darkSurface`    | `#1E1456`     | Dark mode card background only            |
| `textPrimary`    | `#0F172A`     | Main text (light mode)                     |
| `textSecondary`  | `#64748B`     | Muted text                                 |

All other tokens (calm, mild, moderate, severe, persona accents) remain unchanged.

### Required package
`expo-linear-gradient` — install with `npx expo install expo-linear-gradient`. Use its `<LinearGradient>` component wherever gradients are applied.

### Gradient usage rule
- Buttons: `LinearGradient` wrapping `TouchableOpacity`, left→right
- Tab bar active icon: solid `#09A8E0`
- Headers/banners: `LinearGradient` top strip
- Never apply gradient to body text or small icons

---

## 2. Global: Notch / Safe Area

Every screen wraps its root view with `SafeAreaView` from `react-native-safe-area-context` using `edges={['top']}`. No screen should render content under the status bar.

Add `react-native-safe-area-context` if not already installed. Wrap the root `_layout.tsx` with `<SafeAreaProvider>`.

---

## 3. Onboarding Flow (revised)

New sequence:
```
Welcome → Connect Device → Questions (6 screens) → Choose AI Companion → Home
```

### 3a. Welcome screen (`app/onboarding/index.tsx`)
No changes beyond color update.

### 3b. Connect Device (`app/onboarding/wearable.tsx`)
- **Remove all "Demo Mode" language** — no mention of demo, mock, or hackathon
- Show real device options: Apple Watch, Oura Ring, Fitbit, Samsung Galaxy Watch
- Each option is a tappable card with device icon + name
- Below the cards: small helper text — *"Don't have a supported device? You can still use MindWell — we'll estimate your wellness from your answers and daily check-ins."*
- Tapping any device (or the helper link) proceeds to questions
- Data continues to be mocked internally — this is purely a UI change

### 3c. Questions screen (`app/onboarding/questions.tsx`)
Single screen component that cycles through all questions from `constants/questions.ts`.

**Layout per question:**
- Progress bar at top (e.g. "2 of 6") using gradient fill
- Question number label + question text (large, centred)
- Scrollable list of answer option cards (tappable, single-select)
- Selected option: gradient border + light `#E8F6FD` background
- "Continue" button (gradient) — disabled until an option is selected
- "Skip" text link bottom-right (stores null for that question)

**State:** answers stored in `useUserStore` as `onboardingAnswers: Record<number, string | null>`

### 3d. Questions data file (`constants/questions.ts`)
```typescript
export interface OnboardingQuestion {
  id: number;
  emoji: string;
  question: string;
  options: { value: string; label: string; sublabel?: string }[];
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
```

### 3e. AI Companion screen (`app/onboarding/persona.tsx`)
No structural changes — shown after questions complete. Update colors only.

---

## 4. Home Screen Redesign (`app/index.tsx`)

### Layout (top to bottom)
1. **Header strip** — gradient background, greeting + name
2. **Daily Tip card** — prominently placed, full-width, visually distinct (gradient left border or gradient background tint)
3. **Feeling / Mood section** — MoodRing + stress label + numeric score
4. **What would you like to do?** — two cards side by side, NO default highlighted state; both cards are equal weight, neutral until tapped
5. **AffirmationBanner** (conditional) — shown below actions when active

### Daily Tip
- Full-width card with gradient left border (4px, `#0DB5F0 → #09A8E0`)
- Background: `#F5F9FD`
- Tag: "✦ TODAY'S TIP" in primary color, uppercase, small
- Tip text: 16px, `textPrimary`
- Small "View all affirmations →" link below tip text → navigates to `app/affirmations.tsx`

### What would you like to do section
- Label: "What would you like to do?" — `textSecondary`, 13px
- Two equal cards: "Talk to AI" and "Browse Communities"
- Both cards: white background, `surface` border, icon + label
- Active/pressed state only — no card is pre-selected or highlighted by default
- On press: navigate to respective screen

---

## 5. Community Page (`app/communities/index.tsx`)

- Add `paddingHorizontal: 16` to all section containers
- Add `marginBottom: 16` between section headers and their content
- Add `gap: 12` between community cards in the vertical list
- Increase vertical padding on category section headers from current value to 12px top + 8px bottom
- CommunityCard internal padding: ensure 16px all sides

---

## 6. Profile Page (`app/profile.tsx`)

- Wrap root in `SafeAreaView edges={['top']}`
- Add `paddingTop: 16` inside the safe area before the first section
- Remove "Hackathon Build" label from app info section
- Replace version line with: "MindWell v1.0" only

### 7-Day Stress History redesign
Replace current plain line chart with:
- Section header: "Your Stress This Week" with a small stress-level legend (colour dots: calm / mild / moderate / severe)
- Chart background: `#F5F9FD` rounded card
- Line: gradient stroke using primary colors
- Y-axis: hidden; X-axis: day labels (Mon–Sun), small, `textSecondary`
- Coloured zone bands behind the line: green (0–0.25), yellow (0.25–0.5), orange (0.5–0.75), red (0.75–1.0) at low opacity (0.08)
- Below chart: "Weekly average" stat + trend arrow (↑ higher / ↓ lower than last week)

---

## 7. Affirmations History Page (`app/affirmations.tsx`)

New screen. Accessible from:
- Home screen daily tip card ("View all affirmations →" link)
- Profile screen (new list item: "Affirmation History")

### Layout
- Header: gradient strip, title "Words of Care", back button
- **Latest affirmation** — full-width highlighted card at top:
  - Gradient background (primary)
  - White text
  - Large quote marks
  - Timestamp: "Just now" / "Today at 9:41 AM"
  - Persona badge (e.g. "Friend" in persona accent color)
- **Previous affirmations** — flat list below, each item:
  - White card, subtle border
  - Quote text (16px)
  - Timestamp + persona badge
  - Stress level dot (colour-coded) showing what triggered it
- Empty state: "No affirmations yet — we'll send you one when your stress is elevated."

### Data
Affirmations are already stored in `useHealthStore` (`affirmations` array). Each entry needs: `{ text, timestamp, persona, stressLevel }`. Update the store and `llm.mock.ts` to include `persona` and `stressLevel` on each saved affirmation.

---

## 8. Remove All Demo/Hackathon Language

Search and remove/replace across all files:
- "Demo Mode" → remove or replace with device name / "Connected"
- "Hackathon Build" → remove entirely
- "demo" in wearable mode UI labels → use "Connected" or device name
- Any "mock" or "test" visible in UI strings → remove

---

## 9. New Files Summary

| File | Purpose |
|------|---------|
| `constants/questions.ts` | Onboarding question definitions |
| `app/onboarding/questions.tsx` | Question carousel screen |
| `app/affirmations.tsx` | Affirmations history screen |

## 10. Modified Files Summary

| File | Changes |
|------|---------|
| `constants/theme.ts` | New blue gradient palette |
| `CLAUDE.md` | Updated color tokens |
| `app/_layout.tsx` | SafeAreaProvider, gradient tab bar |
| `app/index.tsx` | Home screen redesign |
| `app/onboarding/wearable.tsx` | Remove demo language |
| `app/onboarding/persona.tsx` | Color updates |
| `app/communities/index.tsx` | Spacing improvements |
| `app/profile.tsx` | Notch fix, remove hackathon label, chart redesign |
| `stores/useUserStore.ts` | Add `onboardingAnswers` field |
| `stores/useHealthStore.ts` | Add `persona` + `stressLevel` to affirmation entries |
| `components/StressChart.tsx` | Redesigned chart |
