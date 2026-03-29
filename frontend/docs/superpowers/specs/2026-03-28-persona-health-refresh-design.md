# MindWell — Persona & Health UI Refresh

**Date:** 2026-03-28
**Status:** Approved

---

## Overview

Replace the three existing AI personas (Friend, Counsellor, Psychiatrist) with two new named personas — **Pragati** and **Kulman**. Redesign the home screen action section, chat screen header, profile persona selector, and profile health chart to match.

---

## 1. Personas (app-wide)

Replace `Persona = "friend" | "counsellor" | "psychiatrist"` with `Persona = "pragati" | "kulman"`.

| Field | Pragati | Kulman |
|---|---|---|
| ID | `"pragati"` | `"kulman"` |
| Label | Pragati | Kulman |
| Emoji | 🌸 | 😎 |
| Tagline | "Your growth guide" | "The cool one" |
| Description | Progressive, helpful, mentor | Cool, happy, funny |
| Accent color | `#FF8A65` (warm orange) | `#42A5F5` (sky blue) |

**Files to update:**
- `types/index.ts` — `Persona` type
- `constants/personas.ts` — `PERSONAS` array
- `constants/theme.ts` — `personaColor` map (remove `psychiatristAccent`, rename keys)
- `services/llm.mock.ts` — response pools for both personas
- `stores/useChatStore.ts` — default persona → `"pragati"`
- `stores/useHealthStore.ts` — seed affirmations use new persona IDs
- `app/onboarding/persona.tsx` — renders from `PERSONAS`, no direct changes needed

---

## 2. Home Screen (`app/index.tsx`)

**Section order (top → bottom):**

1. Gradient header (greeting + name) — unchanged
2. "Word of the Day" affirmation card — unchanged
3. `<AffirmationBanner>` (conditional) — moved here, above happiness section
4. **"YOUR HAPPINESS LEVEL"** section — replaces "HOW YOU'RE FEELING"
   - Inverts stress score to happiness: `happiness = 1 - stressScore`
   - When `latestPrediction` is null (no data yet), default to happiness = 0.75 → 😊 "Feeling pretty good!"
   - Single large emoji (56px) + bold label:
     - happiness ≥ 0.75 → 😄 "You're glowing today!"
     - happiness ≥ 0.50 → 😊 "Feeling pretty good!"
     - happiness ≥ 0.25 → 🙂 "Not bad, you're getting there!"
     - happiness < 0.25 → 😌 "Aww, I can feel a bit better than this!!"
   - No MoodRing component, no tap interaction
5. **"YOUR AI COMPANIONS"** section — replaces "WHAT WOULD YOU LIKE TO DO?"
   - Subheading: `"Two personalities, one goal — brighten your day ✨"`
   - Two full-width stacked tappable cards (Pragati on top, Kulman below)
   - Each card: avatar circle with emoji + name (bold) + trait line + arrow `→`
   - Pragati card background: `#FFF8F5` with `#FF8A65` border
   - Kulman card background: `#F0F7FF` with `#42A5F5` border
   - Tap navigates to `/chat?persona=pragati` or `/chat?persona=kulman`

---

## 3. Chat Screen (`app/chat.tsx`)

- Remove `<PersonaSelector>` from header — persona cannot be changed mid-chat
- Read `persona` from `useLocalSearchParams()` on mount; call `setPersona(persona)` if present, else default to `"pragati"`
- Header shows persona name + emoji: e.g. `"🌸 Pragati"` or `"😎 Kulman"`
- Send button accent color uses `personaColor[activePersona]`
- `llm.mock.ts` new response pools:
  - **Pragati:** mentor-style, forward-looking, practical encouragement (12+ responses)
  - **Kulman:** casual, funny, lighthearted banter (12+ responses)
- Keyword-matched responses updated for both personas

---

## 4. Profile Screen (`app/profile.tsx`)

### 4a. AI Companion Style
- Replace `<PersonaSelector>` pill chips with two full-width tappable cards (same visual style as home screen persona cards)
- Active card has filled accent border + checkmark badge
- Tapping sets default persona via `setPersona()`

### 4b. Health This Week (replaces StressChart)
- Section title: `"YOUR HEALTH THIS WEEK"`
- Tab interface with 3 tabs: 💤 Sleep · ❤️ Heart Rate · ⚡ Body Battery
- Default active tab: Sleep
- All tabs use a 7-bar chart (Mon–Sun), bars colored by quality zone:

**Sleep (hours/night):**
- Green (`#4CAF50`): ≥ 8h
- Blue (`#42A5F5`): 6–8h
- Yellow (`#FFC107`): < 6h
- Mock data: `[7, 6, 8, 5, 9, 7, 7]`
- Footer: avg hours + color legend

**Heart Rate (avg bpm/day):**
- Green (`#4CAF50`): < 70 bpm
- Blue (`#42A5F5`): 70–85 bpm
- Orange (`#FF9800`): > 85 bpm
- Mock data: `[68, 72, 75, 88, 65, 70, 73]`
- Footer: avg bpm + color legend

**Body Battery (% remaining end-of-day):**
- Green (`#4CAF50`): ≥ 70%
- Blue (`#42A5F5`): 40–70%
- Yellow (`#FFC107`): < 40%
- Mock data: `[80, 65, 72, 35, 90, 68, 70]`
- Footer: avg % + color legend

**Implementation:** New `HealthTabChart` component in `components/HealthTabChart.tsx`. Uses `react-native-gifted-charts` `BarChart` (already installed). Does not depend on `StressChart` or `predictions` from store — uses its own inline mock data.

---

## 5. What Is Removed

- `MoodRing` component is no longer used on home screen (keep file, just not rendered)
- `PersonaSelector` component no longer rendered in chat or profile (keep file for now)
- `psychiatristAccent` color token removed from theme
- `StressChart` component no longer rendered in profile (keep file)

---

## Out of Scope

- Onboarding persona screen updates (already renders from `PERSONAS` array dynamically)
- Communities screens — no changes
- Dark mode
- Real wearable/health data integration
