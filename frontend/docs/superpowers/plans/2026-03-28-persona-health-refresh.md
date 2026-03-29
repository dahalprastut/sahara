# Persona & Health UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three old AI personas with Pragati and Kulman, redesign the home screen (happiness level + persona cards), lock persona in chat, and replace the profile stress chart with a tabbed health chart.

**Architecture:** Persona type is the root change — updating `types/index.ts` cascades to constants, theme, stores, mocks, and screens. Each screen is updated independently after the shared layer is stable. A new `HealthTabChart` component owns the tabbed bar chart logic with inline mock data.

**Tech Stack:** React Native + Expo Router, NativeWind, Zustand, react-native-gifted-charts (BarChart), TypeScript strict mode.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `types/index.ts` | `Persona` union type |
| Modify | `constants/personas.ts` | `PERSONAS` array |
| Modify | `constants/theme.ts` | `personaColor` map, remove `psychiatristAccent` |
| Modify | `constants/communities.ts` | `COMMUNITY_SUGGESTIONS` keyed by new personas |
| Modify | `services/llm.mock.ts` | Chat response pools for pragati/kulman |
| Modify | `stores/useChatStore.ts` | Default `activePersona` |
| Modify | `stores/useUserStore.ts` | Default `persona` |
| Modify | `stores/useHealthStore.ts` | Seed affirmation persona refs |
| **Create** | `components/HealthTabChart.tsx` | 3-tab health chart |
| Modify | `app/index.tsx` | Happiness section + persona cards |
| Modify | `app/chat.tsx` | Locked persona from nav params |
| Modify | `app/profile.tsx` | Persona selector cards + HealthTabChart |

---

## Task 1: Update type system — Persona type, theme, and persona constants

**Files:**
- Modify: `types/index.ts`
- Modify: `constants/personas.ts`
- Modify: `constants/theme.ts`

- [ ] **Step 1: Update `types/index.ts`**

Replace line 1:
```typescript
export type Persona = "pragati" | "kulman";
export type StressLevel = "calm" | "mild" | "moderate" | "severe";
export type CommunitySize = "small" | "large";

export type OnboardingAnswers = Record<number, string | null>;

export interface AffirmationEntry {
  id: string;
  text: string;
  timestamp: number;
  persona: Persona;
  stressLevel: StressLevel;
}

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
  onboardingAnswers: OnboardingAnswers;
}
```

- [ ] **Step 2: Update `constants/personas.ts`**

Replace entire file:
```typescript
import { Persona } from "../types";

export interface PersonaDef {
  id: Persona;
  label: string;
  description: string;
  emoji: string;
  tagline: string;
}

export const PERSONAS: PersonaDef[] = [
  {
    id: "pragati",
    label: "Pragati",
    description: "Progressive, helpful, and always in your corner as a mentor",
    emoji: "🌸",
    tagline: "Your growth guide",
  },
  {
    id: "kulman",
    label: "Kulman",
    description: "Cool, happy, and funny — here to lighten up your day",
    emoji: "😎",
    tagline: "The cool one",
  },
];
```

- [ ] **Step 3: Update `constants/theme.ts`**

Replace entire file:
```typescript
import { Persona, StressLevel } from "../types";

export const Colors = {
  primary: "#09A8E0",
  primaryLight: "#0DB5F0",
  primaryMuted: "#E8F6FD",
  primaryDark: "#0790C0",

  darkBackground: "#170E48",
  darkSurface: "#1E1456",

  calm: "#4CAF50",
  mild: "#FFC107",
  moderate: "#FF9800",
  severe: "#F44336",

  surface: "#F5F9FD",
  background: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2ECF5",

  pragatiAccent: "#FF8A65",
  kulmanAccent: "#42A5F5",

  white: "#FFFFFF",
  overlay: "rgba(0,0,0,0.4)",
};

export const GradientColors = {
  primary: ["#0DB5F0", "#09A8E0"] as [string, string],
};

export const personaColor: Record<Persona, string> = {
  pragati: Colors.pragatiAccent,
  kulman: Colors.kulmanAccent,
};

export const stressColor: Record<StressLevel, string> = {
  calm: Colors.calm,
  mild: Colors.mild,
  moderate: Colors.moderate,
  severe: Colors.severe,
};
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd D:/work/react-native/mindwell
npx tsc --noEmit 2>&1 | head -40
```

Expected: errors about `friend`, `counsellor`, `psychiatrist` being invalid — that's correct, we'll fix them in subsequent tasks.

- [ ] **Step 5: Commit**

```bash
git add types/index.ts constants/personas.ts constants/theme.ts
git commit -m "feat: replace persona type with pragati/kulman; update theme tokens"
```

---

## Task 2: Update COMMUNITY_SUGGESTIONS

**Files:**
- Modify: `constants/communities.ts`

- [ ] **Step 1: Update `COMMUNITY_SUGGESTIONS` at the bottom of `constants/communities.ts`**

Replace lines 145–149:
```typescript
export const COMMUNITY_SUGGESTIONS: Record<Persona, string[]> = {
  pragati: ["burnout", "career-pressure", "anxiety-circle"],
  kulman: ["general-wellness", "breakup", "loneliness"],
};
```

- [ ] **Step 2: Commit**

```bash
git add constants/communities.ts
git commit -m "feat: update community suggestions for pragati/kulman personas"
```

---

## Task 3: Update LLM mock responses for new personas

**Files:**
- Modify: `services/llm.mock.ts`

- [ ] **Step 1: Replace `chatResponses` and keyword matching in `services/llm.mock.ts`**

Replace entire file:
```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add services/llm.mock.ts
git commit -m "feat: add Pragati and Kulman chat response pools to llm.mock"
```

---

## Task 4: Update stores to use new persona defaults

**Files:**
- Modify: `stores/useChatStore.ts`
- Modify: `stores/useUserStore.ts`
- Modify: `stores/useHealthStore.ts`

- [ ] **Step 1: Update default `activePersona` in `stores/useChatStore.ts`**

Change line 20:
```typescript
  activePersona: "pragati",
```

- [ ] **Step 2: Update default `persona` in `stores/useUserStore.ts`**

Change line 24:
```typescript
  persona: "pragati",
```

- [ ] **Step 3: Update seed affirmation persona refs in `stores/useHealthStore.ts`**

Replace the `SEED_AFFIRMATIONS` constant (lines 6–28):
```typescript
const SEED_AFFIRMATIONS: AffirmationEntry[] = [
  {
    id: "seed-1",
    text: "You're doing beautifully — keep riding this peaceful wave.",
    timestamp: Date.now() - 86400000 * 2,
    persona: "pragati",
    stressLevel: "calm",
  },
  {
    id: "seed-2",
    text: "Your body's asking for a pause. Even 60 seconds of stillness helps.",
    timestamp: Date.now() - 86400000 * 4,
    persona: "kulman",
    stressLevel: "moderate",
  },
  {
    id: "seed-3",
    text: "A little tension means you're engaged with life. You've got this.",
    timestamp: Date.now() - 86400000 * 6,
    persona: "pragati",
    stressLevel: "mild",
  },
];
```

- [ ] **Step 4: Verify TypeScript compiles cleanly**

```bash
cd D:/work/react-native/mindwell
npx tsc --noEmit 2>&1 | head -40
```

Expected: zero errors (or only errors in the screen files we haven't updated yet — `app/index.tsx`, `app/chat.tsx`, `app/profile.tsx`).

- [ ] **Step 5: Commit**

```bash
git add stores/useChatStore.ts stores/useUserStore.ts stores/useHealthStore.ts
git commit -m "feat: update store defaults and seed data to pragati/kulman personas"
```

---

## Task 5: Create HealthTabChart component

**Files:**
- Create: `components/HealthTabChart.tsx`

- [ ] **Step 1: Create `components/HealthTabChart.tsx`**

```typescript
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { Colors } from "../constants/theme";

type HealthTab = "sleep" | "heart" | "battery";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const SLEEP_DATA = [7, 6, 8, 5, 9, 7, 7];
const HEART_DATA = [68, 72, 75, 88, 65, 70, 73];
const BATTERY_DATA = [80, 65, 72, 35, 90, 68, 70];

function sleepColor(hours: number): string {
  if (hours >= 8) return Colors.calm;
  if (hours >= 6) return Colors.kulmanAccent;
  return Colors.mild;
}

function heartColor(bpm: number): string {
  if (bpm < 70) return Colors.calm;
  if (bpm <= 85) return Colors.kulmanAccent;
  return Colors.moderate;
}

function batteryColor(pct: number): string {
  if (pct >= 70) return Colors.calm;
  if (pct >= 40) return Colors.kulmanAccent;
  return Colors.mild;
}

interface TabConfig {
  label: string;
  emoji: string;
  data: number[];
  maxValue: number;
  unit: string;
  colorFn: (v: number) => string;
  avgLabel: (avg: number) => string;
  legend: { color: string; label: string }[];
}

const TAB_CONFIG: Record<HealthTab, TabConfig> = {
  sleep: {
    label: "Sleep",
    emoji: "💤",
    data: SLEEP_DATA,
    maxValue: 10,
    unit: "h",
    colorFn: sleepColor,
    avgLabel: (avg) => `${avg.toFixed(1)}h avg`,
    legend: [
      { color: Colors.calm, label: "≥8h great" },
      { color: Colors.kulmanAccent, label: "6–8h good" },
      { color: Colors.mild, label: "<6h low" },
    ],
  },
  heart: {
    label: "Heart Rate",
    emoji: "❤️",
    data: HEART_DATA,
    maxValue: 120,
    unit: "bpm",
    colorFn: heartColor,
    avgLabel: (avg) => `${Math.round(avg)} bpm avg`,
    legend: [
      { color: Colors.calm, label: "<70 restful" },
      { color: Colors.kulmanAccent, label: "70–85 normal" },
      { color: Colors.moderate, label: ">85 elevated" },
    ],
  },
  battery: {
    label: "Body Battery",
    emoji: "⚡",
    data: BATTERY_DATA,
    maxValue: 100,
    unit: "%",
    colorFn: batteryColor,
    avgLabel: (avg) => `${Math.round(avg)}% avg`,
    legend: [
      { color: Colors.calm, label: "≥70% high" },
      { color: Colors.kulmanAccent, label: "40–70% ok" },
      { color: Colors.mild, label: "<40% low" },
    ],
  },
};

const TABS: HealthTab[] = ["sleep", "heart", "battery"];

export const HealthTabChart = () => {
  const [activeTab, setActiveTab] = useState<HealthTab>("sleep");
  const config = TAB_CONFIG[activeTab];

  const barData = config.data.map((value, i) => ({
    value,
    label: DAYS[i],
    frontColor: config.colorFn(value),
    topLabelComponent: () => (
      <Text style={{ fontSize: 9, color: Colors.textSecondary, marginBottom: 2 }}>
        {value}{config.unit}
      </Text>
    ),
  }));

  const avg = config.data.reduce((s, v) => s + v, 0) / config.data.length;

  return (
    <View style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 14 }}>
      {/* Title */}
      <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
        Your Health This Week
      </Text>

      {/* Tab bar */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {TABS.map((tab) => {
          const isActive = tab === activeTab;
          const cfg = TAB_CONFIG[tab];
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: isActive ? Colors.primary : Colors.background,
                borderWidth: 1,
                borderColor: isActive ? Colors.primary : Colors.border,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "700", color: isActive ? Colors.white : Colors.textSecondary }}>
                {cfg.emoji} {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bar chart */}
      <View style={{ borderRadius: 12, overflow: "hidden" }}>
        <BarChart
          data={barData}
          height={140}
          barWidth={28}
          spacing={12}
          noOfSections={4}
          maxValue={config.maxValue}
          yAxisColor="transparent"
          xAxisColor={Colors.border}
          rulesColor={Colors.border}
          yAxisTextStyle={{ color: Colors.textSecondary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10 }}
          hideYAxisText
          barBorderRadius={6}
          isAnimated
        />
      </View>

      {/* Legend + average */}
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        {config.legend.map((l) => (
          <View key={l.label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: l.color }} />
            <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{l.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 }}>
        <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Weekly Average
        </Text>
        <Text style={{ fontSize: 20, fontWeight: "800", color: Colors.textPrimary, marginTop: 2 }}>
          {config.avgLabel(avg)}
        </Text>
      </View>
    </View>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd D:/work/react-native/mindwell
npx tsc --noEmit 2>&1 | grep HealthTabChart
```

Expected: no output (no errors for this file).

- [ ] **Step 3: Commit**

```bash
git add components/HealthTabChart.tsx
git commit -m "feat: add HealthTabChart component with sleep/heart/battery tabs"
```

---

## Task 6: Update home screen

**Files:**
- Modify: `app/index.tsx`

- [ ] **Step 1: Replace `app/index.tsx`**

```typescript
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AffirmationBanner } from "../components/AffirmationBanner";
import { Colors, GradientColors, personaColor } from "../constants/theme";
import { useUserStore } from "../stores/useUserStore";
import { useHealthStore } from "../stores/useHealthStore";
import { formatGreeting } from "../utils/formatters";

const DAILY_AFFIRMATIONS = [
  "You are not defined by your hardest days. You are defined by how gently you treat yourself through them.",
  "Rest is not a reward — it is a right. You are allowed to simply be.",
  "Growth does not always look like progress. Sometimes it looks like stillness and choosing peace.",
  "Your feelings are valid. All of them. Even the ones that make no sense right now.",
  "You have survived every difficult day so far. Today is no different.",
  "Small steps still move you forward. You don't have to do it all at once.",
  "Being kind to yourself is not weakness — it is the foundation of everything.",
];

function getDailyAffirmation(): string {
  return DAILY_AFFIRMATIONS[new Date().getDay()];
}

function getHappiness(score: number | null): { emoji: string; label: string } {
  const h = score === null ? 0.75 : 1 - score;
  if (h >= 0.75) return { emoji: "😄", label: "You're glowing today!" };
  if (h >= 0.50) return { emoji: "😊", label: "Feeling pretty good!" };
  if (h >= 0.25) return { emoji: "🙂", label: "Not bad, you're getting there!" };
  return { emoji: "😌", label: "Aww, I can feel a bit better than this!!" };
}

export default function HomeScreen() {
  const router = useRouter();
  const { anonymousName } = useUserStore();
  const { latestPrediction, affirmationVisible, currentAffirmation, dismissAffirmation } = useHealthStore();
  const insets = useSafeAreaInsets();

  const happiness = getHappiness(latestPrediction?.score ?? null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={[]}>
      <LinearGradient
        colors={GradientColors.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 20 }}
      >
        <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", fontWeight: "500" }}>
          {formatGreeting()}
        </Text>
        <Text style={{ fontSize: 26, fontWeight: "800", color: Colors.white, marginTop: 2 }}>
          {anonymousName} 👋
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 40 }}>

        {/* Word of the Day */}
        <TouchableOpacity
          onPress={() => router.push("/affirmations")}
          activeOpacity={0.92}
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 20,
            padding: 24,
            borderLeftWidth: 5,
            borderLeftColor: Colors.primary,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.primary, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>
            ✦ Word of the Day
          </Text>
          <Text style={{ fontSize: 34, color: Colors.primary, fontWeight: "900", lineHeight: 28, marginBottom: 6, opacity: 0.35 }}>"</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.textPrimary, lineHeight: 28, marginTop: -4 }}>
            {getDailyAffirmation()}
          </Text>
          <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: "600", marginTop: 16 }}>
            See all affirmations →
          </Text>
        </TouchableOpacity>

        {/* Affirmation banner — above happiness */}
        {affirmationVisible && (
          <AffirmationBanner message={currentAffirmation} onDismiss={dismissAffirmation} />
        )}

        {/* Happiness level */}
        <View style={{
          backgroundColor: Colors.surface,
          borderRadius: 16,
          padding: 20,
          alignItems: "center",
          gap: 8,
        }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSecondary, alignSelf: "flex-start" }}>
            YOUR HAPPINESS LEVEL
          </Text>
          <Text style={{ fontSize: 56 }}>{happiness.emoji}</Text>
          <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.textPrimary }}>{happiness.label}</Text>
        </View>

        {/* AI companions */}
        <View>
          <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 4 }}>
            YOUR AI COMPANIONS
          </Text>
          <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 12 }}>
            Two personalities, one goal — brighten your day ✨
          </Text>

          {/* Pragati card */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/chat", params: { persona: "pragati" } })}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#FFF8F5",
              borderRadius: 16,
              padding: 18,
              borderWidth: 1.5,
              borderColor: Colors.pragatiAccent,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              marginBottom: 10,
            }}
          >
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: Colors.pragatiAccent,
              alignItems: "center", justifyContent: "center",
            }}>
              <Text style={{ fontSize: 26 }}>🌸</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#E64A19" }}>Pragati</Text>
              <Text style={{ fontSize: 12, color: "#795548", marginTop: 2 }}>Progressive · Helpful · Mentor</Text>
            </View>
            <Text style={{ fontSize: 20, color: Colors.pragatiAccent }}>→</Text>
          </TouchableOpacity>

          {/* Kulman card */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/chat", params: { persona: "kulman" } })}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#F0F7FF",
              borderRadius: 16,
              padding: 18,
              borderWidth: 1.5,
              borderColor: Colors.kulmanAccent,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: Colors.kulmanAccent,
              alignItems: "center", justifyContent: "center",
            }}>
              <Text style={{ fontSize: 26 }}>😎</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#1565C0" }}>Kulman</Text>
              <Text style={{ fontSize: 12, color: "#37474F", marginTop: 2 }}>Cool · Happy · Funny</Text>
            </View>
            <Text style={{ fontSize: 20, color: Colors.kulmanAccent }}>→</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd D:/work/react-native/mindwell
npx tsc --noEmit 2>&1 | grep "app/index"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/index.tsx
git commit -m "feat: redesign home screen with happiness level and Pragati/Kulman persona cards"
```

---

## Task 7: Update chat screen

**Files:**
- Modify: `app/chat.tsx`

- [ ] **Step 1: Replace `app/chat.tsx`**

```typescript
import React, { useState, useRef, useEffect } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ChatBubble } from "../components/ChatBubble";
import { Colors, personaColor } from "../constants/theme";
import { useChatStore } from "../stores/useChatStore";
import { Persona } from "../types";

const PERSONA_EMOJI: Record<Persona, string> = {
  pragati: "🌸",
  kulman: "😎",
};

const PERSONA_LABEL: Record<Persona, string> = {
  pragati: "Pragati",
  kulman: "Kulman",
};

function TypingIndicator() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}>
      <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primaryMuted, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 14 }}>🤖</Text>
      </View>
      <View style={{ flexDirection: "row", gap: 4, backgroundColor: Colors.surface, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.textSecondary, opacity: 0.6 }} />
        ))}
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const { messages, isTyping, activePersona, setPersona, sendMessage } = useChatStore();
  const insets = useSafeAreaInsets();
  const { persona: personaParam } = useLocalSearchParams<{ persona?: string }>();

  useEffect(() => {
    const valid: Persona = personaParam === "kulman" ? "kulman" : "pragati";
    setPersona(valid);
  }, [personaParam]);

  useEffect(() => {
    const t = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(t);
  }, [messages.length, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    void sendMessage(text);
  };

  const accentColor = personaColor[activePersona];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={90}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: insets.top + 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: Colors.textPrimary }}>
            {PERSONA_EMOJI[activePersona]} {PERSONA_LABEL[activePersona]}
          </Text>
          <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
            Your AI companion
          </Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={{ paddingVertical: 12 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: 40, gap: 12 }}>
              <Text style={{ fontSize: 48 }}>{PERSONA_EMOJI[activePersona]}</Text>
              <Text style={{ fontSize: 17, fontWeight: "700", color: Colors.textPrimary }}>
                Hi, I'm {PERSONA_LABEL[activePersona]}
              </Text>
              <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 21 }}>
                Share what's on your mind. Everything here is private and judgment-free.
              </Text>
            </View>
          }
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* Disclaimer */}
        <Text style={{ fontSize: 11, color: Colors.textSecondary, textAlign: "center", paddingHorizontal: 16, paddingVertical: 4 }}>
          AI companion — not a substitute for professional help
        </Text>

        {/* Input */}
        <View style={{ flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: "flex-end" }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            style={{
              flex: 1,
              backgroundColor: Colors.surface,
              borderRadius: 22,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 15,
              color: Colors.textPrimary,
              maxHeight: 100,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || isTyping}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: input.trim() && !isTyping ? accentColor : Colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-up" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd D:/work/react-native/mindwell
npx tsc --noEmit 2>&1 | grep "app/chat"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/chat.tsx
git commit -m "feat: lock persona in chat via nav params; show persona name in header"
```

---

## Task 8: Update profile screen

**Files:**
- Modify: `app/profile.tsx`

- [ ] **Step 1: Replace `app/profile.tsx`**

```typescript
import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { HealthTabChart } from "../components/HealthTabChart";
import { Card } from "../components/ui/Card";
import { Colors, personaColor } from "../constants/theme";
import { useUserStore } from "../stores/useUserStore";
import { useHealthStore } from "../stores/useHealthStore";
import { COMMUNITIES } from "../constants/communities";
import { Persona } from "../types";

const PERSONA_EMOJI: Record<Persona, string> = {
  pragati: "🌸",
  kulman: "😎",
};

const PERSONA_BG: Record<Persona, string> = {
  pragati: "#FFF8F5",
  kulman: "#F0F7FF",
};

const PERSONA_NAME_COLOR: Record<Persona, string> = {
  pragati: "#E64A19",
  kulman: "#1565C0",
};

const PERSONA_TRAIT: Record<Persona, string> = {
  pragati: "Progressive · Helpful · Mentor",
  kulman: "Cool · Happy · Funny",
};

export default function ProfileScreen() {
  const router = useRouter();
  const { anonymousName, persona, setAnonymousName, setPersona, joinedCommunities, leaveCommunity } = useUserStore();
  const { wearableConnected, wearableMode } = useHealthStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(anonymousName);

  const joinedList = COMMUNITIES.filter((c) => joinedCommunities.includes(c.id));

  const wearableLabel = wearableConnected
    ? wearableMode === "connected" ? "Connected · Running" : "Running"
    : "Not connected";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 24, gap: 20, paddingBottom: 40 }}>
        <Text style={{ fontSize: 26, fontWeight: "800", color: Colors.textPrimary }}>Profile</Text>

        {/* Anonymous name */}
        <Card>
          <Text style={{ fontSize: 13, fontWeight: "600" as const, color: Colors.textSecondary, marginBottom: 8 }}>YOUR ANONYMOUS NAME</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryMuted, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 22 }}>🎭</Text>
            </View>
            {editingName ? (
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                style={{ flex: 1, fontSize: 18, fontWeight: "700" as const, color: Colors.textPrimary, borderBottomWidth: 2, borderBottomColor: Colors.primary, paddingBottom: 2 }}
                onBlur={() => { setAnonymousName(nameInput); setEditingName(false); }}
                onSubmitEditing={() => { setAnonymousName(nameInput); setEditingName(false); }}
              />
            ) : (
              <Text style={{ flex: 1, fontSize: 18, fontWeight: "700" as const, color: Colors.textPrimary }}>{anonymousName}</Text>
            )}
            <TouchableOpacity onPress={() => {
              if (editingName) { setAnonymousName(nameInput); setEditingName(false); }
              else { setEditingName(true); }
            }}>
              <Ionicons name={editingName ? "checkmark" : "pencil"} size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* AI Companion Style */}
        <Card>
          <Text style={{ fontSize: 13, fontWeight: "600" as const, color: Colors.textSecondary, marginBottom: 12 }}>AI COMPANION STYLE</Text>
          <View style={{ gap: 10 }}>
            {(["pragati", "kulman"] as Persona[]).map((p) => {
              const isActive = persona === p;
              const color = personaColor[p];
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPersona(p)}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: PERSONA_BG[p],
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 2,
                    borderColor: isActive ? color : "transparent",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 22 }}>{PERSONA_EMOJI[p]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "800", color: PERSONA_NAME_COLOR[p] }}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>{PERSONA_TRAIT[p]}</Text>
                  </View>
                  {isActive && (
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Wearable */}
        <Card>
          <Text style={{ fontSize: 13, fontWeight: "600" as const, color: Colors.textSecondary, marginBottom: 8 }}>WEARABLE</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: wearableConnected ? Colors.calm : Colors.moderate }} />
            <Text style={{ fontSize: 15, color: Colors.textPrimary, fontWeight: "600" as const }}>
              {wearableLabel}
            </Text>
          </View>
        </Card>

        {/* Health chart */}
        <HealthTabChart />

        {/* Affirmations history link */}
        <TouchableOpacity
          onPress={() => router.push("/affirmations")}
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 14,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            borderWidth: 1.5,
            borderColor: Colors.border,
          }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryMuted, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 18 }}>💬</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.textPrimary }}>Affirmation History</Text>
            <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>Words of care from your journey</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Joined communities */}
        {joinedList.length > 0 && (
          <Card>
            <Text style={{ fontSize: 13, fontWeight: "600" as const, color: Colors.textSecondary, marginBottom: 12 }}>MY COMMUNITIES</Text>
            <View style={{ gap: 10 }}>
              {joinedList.map((c) => (
                <View key={c.id} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push(`/communities/${c.id}`)}>
                    <Text style={{ fontSize: 15, fontWeight: "600" as const, color: Colors.textPrimary }}>{c.name}</Text>
                    <Text style={{ fontSize: 12, color: Colors.textSecondary }}>{c.memberCount} members</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => Alert.alert("Leave community?", `Leave ${c.name}?`, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Leave", style: "destructive", onPress: () => leaveCommunity(c.id) },
                    ])}
                  >
                    <Text style={{ fontSize: 13, color: Colors.severe }}>Leave</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* App info */}
        <Card>
          <Text style={{ fontSize: 13, fontWeight: "600" as const, color: Colors.textSecondary, marginBottom: 8 }}>ABOUT</Text>
          <Text style={{ fontSize: 14, color: Colors.textSecondary }}>MindWell v1.0</Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 8, lineHeight: 18 }}>
            ⚠️ This app uses AI and is not a substitute for professional mental health care. If you are in crisis, please contact a mental health professional or emergency services.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Verify full TypeScript compile**

```bash
cd D:/work/react-native/mindwell
npx tsc --noEmit 2>&1
```

Expected: zero errors.

- [ ] **Step 3: Start dev server and verify visually**

```bash
cd D:/work/react-native/mindwell
npx expo start --web
```

Check:
- Home screen: happiness emoji shows, Pragati/Kulman cards visible, affirmation card at top
- Tap Pragati → chat opens with 🌸 Pragati header, no persona switcher
- Tap Kulman → chat opens with 😎 Kulman header, send button is blue
- Profile → AI Companion Style shows two persona cards with checkmark on active
- Profile → health tabs switch between Sleep/Heart Rate/Body Battery with colored bars

- [ ] **Step 4: Commit**

```bash
git add app/profile.tsx
git commit -m "feat: update profile with persona cards and HealthTabChart"
```
