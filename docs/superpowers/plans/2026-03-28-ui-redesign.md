# MindWell UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul MindWell's color system, onboarding flow, home/community/profile screens, and add an affirmations history page.

**Architecture:** Replace purple theme with a blue gradient system (`#0DB5F0 → #09A8E0`), add a 6-question onboarding carousel before persona selection, redesign the home screen layout, fix notch padding globally, and add a new `app/affirmations.tsx` page backed by a persisted affirmation history in `useHealthStore`.

**Tech Stack:** React Native, Expo Router, NativeWind, Zustand, expo-linear-gradient, react-native-safe-area-context

---

## File Map

**New files:**
- `constants/questions.ts` — onboarding question data
- `app/onboarding/questions.tsx` — question carousel screen
- `app/affirmations.tsx` — affirmations history screen

**Modified files:**
- `types/index.ts` — add `AffirmationEntry` interface, `OnboardingAnswers` type
- `constants/theme.ts` — new blue gradient palette
- `components/ui/Button.tsx` — gradient primary variant
- `app/_layout.tsx` — SafeAreaProvider, updated tint color, pass metadata to showAffirmation
- `stores/useUserStore.ts` — add `onboardingAnswers`
- `stores/useHealthStore.ts` — add `affirmationHistory`, update `showAffirmation` signature
- `services/api.ts` — update `getAffirmation` return type
- `services/llm.mock.ts` — `getAffirmation` returns `{ text, stressLevel }` object
- `app/onboarding/wearable.tsx` — remove demo language, real devices selectable, navigate to questions
- `app/onboarding/persona.tsx` — no logic change; receives navigation from questions
- `app/index.tsx` — full home screen redesign
- `app/communities/index.tsx` — spacing improvements
- `app/profile.tsx` — SafeAreaView from context, remove hackathon label, add affirmations link
- `components/StressChart.tsx` — zone bands, weekly average, gradient line
- `CLAUDE.md` — updated color tokens

---

## Task 1: Install expo-linear-gradient

**Files:**
- Run: `package.json` (modified by install)

- [ ] **Step 1: Install the package**

```bash
cd D:/work/react-native/mindwell
npx expo install expo-linear-gradient
```

Expected output: package added to `node_modules` and `package.json`.

- [ ] **Step 2: Verify install**

```bash
node -e "require('./node_modules/expo-linear-gradient/build/index.js'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install expo-linear-gradient"
```

---

## Task 2: Update types/index.ts — add AffirmationEntry

**Files:**
- Modify: `types/index.ts`

- [ ] **Step 1: Add AffirmationEntry and OnboardingAnswers**

Replace the full contents of `types/index.ts` with:

```typescript
export type Persona = "friend" | "counsellor" | "psychiatrist";
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

- [ ] **Step 2: Commit**

```bash
git add types/index.ts
git commit -m "feat: add AffirmationEntry and OnboardingAnswers types"
```

---

## Task 3: Update constants/theme.ts — new blue palette

**Files:**
- Modify: `constants/theme.ts`

- [ ] **Step 1: Replace theme with blue gradient system**

Replace full contents of `constants/theme.ts`:

```typescript
import { Persona, StressLevel } from "../types";

export const Colors = {
  // Primary — use as solid fallback; use GradientColors for gradient
  primary: "#09A8E0",
  primaryLight: "#0DB5F0",
  primaryMuted: "#E8F6FD",
  primaryDark: "#0790C0",

  // Dark mode surfaces (reserved for dark mode only)
  darkBackground: "#170E48",
  darkSurface: "#1E1456",

  // Stress levels
  calm: "#4CAF50",
  mild: "#FFC107",
  moderate: "#FF9800",
  severe: "#F44336",

  // UI surfaces (light mode)
  surface: "#F5F9FD",
  background: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2ECF5",

  // Persona accents
  friendAccent: "#FF8A65",
  counsellorAccent: "#42A5F5",
  psychiatristAccent: "#26A69A",

  white: "#FFFFFF",
  overlay: "rgba(0,0,0,0.4)",
};

// Use with expo-linear-gradient: colors={GradientColors.primary} start={{x:0,y:0}} end={{x:1,y:0}}
export const GradientColors = {
  primary: ["#0DB5F0", "#09A8E0"] as [string, string],
};

export const personaColor: Record<Persona, string> = {
  friend: Colors.friendAccent,
  counsellor: Colors.counsellorAccent,
  psychiatrist: Colors.psychiatristAccent,
};

export const stressColor: Record<StressLevel, string> = {
  calm: Colors.calm,
  mild: Colors.mild,
  moderate: Colors.moderate,
  severe: Colors.severe,
};
```

- [ ] **Step 2: Commit**

```bash
git add constants/theme.ts
git commit -m "feat: update color system to blue gradient palette"
```

---

## Task 4: Update Button component — gradient primary

**Files:**
- Modify: `components/ui/Button.tsx`

- [ ] **Step 1: Replace Button with gradient-aware version**

Replace full contents of `components/ui/Button.tsx`:

```typescript
import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, GradientColors } from "../../constants/theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  color?: string;
}

export const Button = ({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  color,
}: ButtonProps) => {
  const padding: ViewStyle =
    size === "sm" ? { paddingVertical: 8, paddingHorizontal: 16 }
    : size === "lg" ? { paddingVertical: 16, paddingHorizontal: 32 }
    : { paddingVertical: 12, paddingHorizontal: 24 };

  const fontSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;
  const borderRadius = 12;
  const opacity = disabled || loading ? 0.5 : 1;

  const inner = loading ? (
    <ActivityIndicator color={variant === "primary" ? Colors.white : color || Colors.primary} />
  ) : (
    <Text style={{ color: variant === "primary" ? Colors.white : color || Colors.primary, fontSize, fontWeight: "600" }}>
      {label}
    </Text>
  );

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={{ borderRadius, overflow: "hidden", opacity }}
      >
        <LinearGradient
          colors={GradientColors.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[{ alignItems: "center", justifyContent: "center" }, padding]}
        >
          {inner}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        { borderRadius, alignItems: "center", justifyContent: "center" },
        variant === "outline"
          ? { borderWidth: 1.5, borderColor: color || Colors.primary }
          : {},
        padding,
        { opacity },
      ]}
    >
      {inner}
    </TouchableOpacity>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/Button.tsx
git commit -m "feat: gradient primary variant for Button component"
```

---

## Task 5: Update stores — useUserStore (onboardingAnswers)

**Files:**
- Modify: `stores/useUserStore.ts`

- [ ] **Step 1: Add onboardingAnswers to store**

Replace full contents of `stores/useUserStore.ts`:

```typescript
import { create } from "zustand";
import { Persona, UserProfile, OnboardingAnswers } from "../types";

interface UserState extends UserProfile {
  setAnonymousName: (name: string) => void;
  setPersona: (persona: Persona) => void;
  completeOnboarding: () => void;
  setOnboardingAnswer: (questionId: number, value: string | null) => void;
  joinCommunity: (id: string) => void;
  leaveCommunity: (id: string) => void;
}

const adjectives = ["Quiet", "Gentle", "Bright", "Calm", "Soft", "Warm", "Kind", "Clear"];
const nouns = ["Maple", "River", "Dawn", "Cloud", "Birch", "Tide", "Sage", "Pebble"];

function generateName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
}

export const useUserStore = create<UserState>((set) => ({
  anonymousName: generateName(),
  persona: "friend",
  onboardingComplete: false,
  joinedCommunities: [],
  onboardingAnswers: {},
  setAnonymousName: (name) => set({ anonymousName: name }),
  setPersona: (persona) => set({ persona }),
  completeOnboarding: () => set({ onboardingComplete: true }),
  setOnboardingAnswer: (questionId, value) =>
    set((s) => ({ onboardingAnswers: { ...s.onboardingAnswers, [questionId]: value } })),
  joinCommunity: (id) =>
    set((s) => ({
      joinedCommunities: s.joinedCommunities.includes(id)
        ? s.joinedCommunities
        : [...s.joinedCommunities, id],
    })),
  leaveCommunity: (id) =>
    set((s) => ({ joinedCommunities: s.joinedCommunities.filter((c) => c !== id) })),
}));
```

- [ ] **Step 2: Commit**

```bash
git add stores/useUserStore.ts
git commit -m "feat: add onboardingAnswers to useUserStore"
```

---

## Task 6: Update stores — useHealthStore (affirmation history)

**Files:**
- Modify: `stores/useHealthStore.ts`

- [ ] **Step 1: Add affirmationHistory and update showAffirmation**

Replace full contents of `stores/useHealthStore.ts`:

```typescript
import { create } from "zustand";
import { WearableReading, StressPrediction, AffirmationEntry, Persona, StressLevel } from "../types";
import { predictStress } from "../services/predictions.mock";
import { startMockWearable, stopMockWearable } from "../services/wearable.mock";

const SEED_AFFIRMATIONS: AffirmationEntry[] = [
  {
    id: "seed-1",
    text: "You're doing beautifully — keep riding this peaceful wave.",
    timestamp: Date.now() - 86400000 * 2,
    persona: "friend",
    stressLevel: "calm",
  },
  {
    id: "seed-2",
    text: "Your body's asking for a pause. Even 60 seconds of stillness helps.",
    timestamp: Date.now() - 86400000 * 4,
    persona: "counsellor",
    stressLevel: "moderate",
  },
  {
    id: "seed-3",
    text: "A little tension means you're engaged with life. You've got this.",
    timestamp: Date.now() - 86400000 * 6,
    persona: "friend",
    stressLevel: "mild",
  },
];

interface HealthState {
  readings: WearableReading[];
  predictions: StressPrediction[];
  latestPrediction: StressPrediction | null;
  wearableConnected: boolean;
  wearableMode: "connected" | "none";
  affirmationVisible: boolean;
  currentAffirmation: string;
  affirmationHistory: AffirmationEntry[];
  startWearable: () => void;
  stopWearable: () => void;
  showAffirmation: (text: string, persona: Persona, stressLevel: StressLevel) => void;
  dismissAffirmation: () => void;
  setWearableMode: (mode: "connected" | "none") => void;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  readings: [],
  predictions: [],
  latestPrediction: null,
  wearableConnected: false,
  wearableMode: "none",
  affirmationVisible: false,
  currentAffirmation: "",
  affirmationHistory: SEED_AFFIRMATIONS,

  startWearable: () => {
    if (get().wearableConnected) return;
    set({ wearableConnected: true });
    startMockWearable((reading) => {
      const prediction = predictStress(reading);
      set((s) => ({
        readings: [...s.readings.slice(-20), reading],
        predictions: [...s.predictions.slice(-20), prediction],
        latestPrediction: prediction,
      }));
    });
  },

  stopWearable: () => {
    stopMockWearable();
    set({ wearableConnected: false });
  },

  showAffirmation: (text, persona, stressLevel) => {
    const entry: AffirmationEntry = {
      id: `aff-${Date.now()}`,
      text,
      timestamp: Date.now(),
      persona,
      stressLevel,
    };
    set((s) => ({
      affirmationVisible: true,
      currentAffirmation: text,
      affirmationHistory: [entry, ...s.affirmationHistory],
    }));
  },

  dismissAffirmation: () => set({ affirmationVisible: false }),
  setWearableMode: (mode) => set({ wearableMode: mode }),
}));
```

- [ ] **Step 2: Commit**

```bash
git add stores/useHealthStore.ts
git commit -m "feat: add affirmation history to useHealthStore"
```

---

## Task 7: Update services — api.ts + llm.mock.ts

**Files:**
- Modify: `services/llm.mock.ts` (lines 79–82)
- Modify: `services/api.ts` (lines 13–15)

`llm.mock.ts` currently returns a plain string from `getAffirmation`. The return type stays as `string` — the API layer is the right place to keep things simple. No change needed to the mock's return type. The stressLevel is already available in `_layout.tsx` from `latestPrediction.level`. **Skip this task** — no changes needed to these files.

---

## Task 8: Update app/_layout.tsx — SafeAreaProvider + updated tint + showAffirmation

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Update layout with SafeAreaProvider and new tint color**

Replace full contents of `app/_layout.tsx`:

```typescript
import React, { useEffect } from "react";
import { Tabs, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { useUserStore } from "../stores/useUserStore";
import { useHealthStore } from "../stores/useHealthStore";
import { getAffirmation } from "../services/api";
import "../global.css";

function TabNavigator() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" as const },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: "Community",
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
          href: "/communities",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  const { onboardingComplete, persona } = useUserStore();
  const { startWearable, latestPrediction, showAffirmation } = useHealthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inOnboarding = segments[0] === "onboarding";
    if (!onboardingComplete && !inOnboarding) {
      router.replace("/onboarding");
    } else if (onboardingComplete && inOnboarding) {
      router.replace("/");
    }
  }, [onboardingComplete, segments]);

  useEffect(() => {
    if (onboardingComplete) {
      startWearable();
    }
  }, [onboardingComplete, startWearable]);

  useEffect(() => {
    if (latestPrediction && (latestPrediction.level === "moderate" || latestPrediction.level === "severe")) {
      getAffirmation(latestPrediction.score, persona).then((msg) => {
        showAffirmation(msg, persona, latestPrediction.level);
      });
    }
  }, [latestPrediction?.timestamp, persona, showAffirmation]);

  return (
    <SafeAreaProvider>
      <TabNavigator />
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: add SafeAreaProvider and update affirmation metadata in layout"
```

---

## Task 9: Create constants/questions.ts

**Files:**
- Create: `constants/questions.ts`

- [ ] **Step 1: Create the questions data file**

Create `constants/questions.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add constants/questions.ts
git commit -m "feat: add onboarding questions data file"
```

---

## Task 10: Create app/onboarding/questions.tsx

**Files:**
- Create: `app/onboarding/questions.tsx`

- [ ] **Step 1: Create the question carousel screen**

Create `app/onboarding/questions.tsx`:

```typescript
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, GradientColors } from "../../constants/theme";
import { ONBOARDING_QUESTIONS } from "../../constants/questions";
import { useUserStore } from "../../stores/useUserStore";
import { Button } from "../../components/ui/Button";

export default function QuestionsScreen() {
  const router = useRouter();
  const { setOnboardingAnswer } = useUserStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const question = ONBOARDING_QUESTIONS[currentIndex];
  const total = ONBOARDING_QUESTIONS.length;
  const isLast = currentIndex === total - 1;

  const handleContinue = () => {
    setOnboardingAnswer(question.id, selected);
    if (isLast) {
      router.push("/onboarding/persona");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const handleSkip = () => {
    setOnboardingAnswer(question.id, null);
    if (isLast) {
      router.push("/onboarding/persona");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const progress = (currentIndex + 1) / total;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top"]}>
      {/* Progress bar */}
      <View style={{ height: 4, backgroundColor: Colors.surface, marginHorizontal: 24, marginTop: 12, borderRadius: 2 }}>
        <LinearGradient
          colors={GradientColors.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 4, width: `${progress * 100}%`, borderRadius: 2 }}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: 40 }}>
        {/* Question header */}
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: "600" }}>
            Question {currentIndex + 1} of {total}
          </Text>
          <Text style={{ fontSize: 36 }}>{question.emoji}</Text>
          <Text style={{ fontSize: 24, fontWeight: "800", color: Colors.textPrimary, lineHeight: 32 }}>
            {question.question}
          </Text>
        </View>

        {/* Options */}
        <View style={{ gap: 10 }}>
          {question.options.map((opt) => {
            const isActive = selected === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setSelected(opt.value)}
                activeOpacity={0.8}
                style={{
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: isActive ? Colors.primary : Colors.border,
                  backgroundColor: isActive ? Colors.primaryMuted : Colors.surface,
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? Colors.primary : Colors.textPrimary,
                }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Actions */}
        <Button
          label={isLast ? "See my companion options →" : "Continue →"}
          onPress={handleContinue}
          size="lg"
          disabled={!selected}
        />

        <TouchableOpacity onPress={handleSkip} style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 14, color: Colors.textSecondary }}>Skip this question</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/onboarding/questions.tsx
git commit -m "feat: add onboarding questions carousel screen"
```

---

## Task 11: Update app/onboarding/wearable.tsx — remove demo language

**Files:**
- Modify: `app/onboarding/wearable.tsx`

- [ ] **Step 1: Replace with real-device-first UI**

Replace full contents of `app/onboarding/wearable.tsx`:

```typescript
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../constants/theme";
import { useHealthStore } from "../../stores/useHealthStore";

const devices = [
  { id: "apple-watch", name: "Apple Watch", icon: "watch-outline" as const, subtitle: "Series 4 and later" },
  { id: "oura", name: "Oura Ring", icon: "radio-outline" as const, subtitle: "Gen 3 and later" },
  { id: "fitbit", name: "Fitbit", icon: "fitness-outline" as const, subtitle: "Sense, Versa, Charge" },
  { id: "samsung", name: "Samsung Galaxy Watch", icon: "watch-outline" as const, subtitle: "Galaxy Watch 4 and later" },
];

export default function WearableScreen() {
  const router = useRouter();
  const { setWearableMode } = useHealthStore();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    setWearableMode("connected");
    router.push("/onboarding/questions");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: 40 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: Colors.textPrimary }}>
            Connect your device
          </Text>
          <Text style={{ fontSize: 16, color: Colors.textSecondary, lineHeight: 24 }}>
            MindWell reads biometric data from your wearable to understand your stress patterns.
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          {devices.map((d) => {
            const isActive = selected === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                onPress={() => setSelected(d.id)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: isActive ? Colors.primaryMuted : Colors.surface,
                  borderRadius: 16,
                  padding: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  borderWidth: 2,
                  borderColor: isActive ? Colors.primary : Colors.border,
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: isActive ? Colors.primary : Colors.border,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name={d.icon} size={22} color={isActive ? Colors.white : Colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: isActive ? Colors.primary : Colors.textPrimary }}>
                    {d.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
                    {d.subtitle}
                  </Text>
                </View>
                {isActive && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: "center", lineHeight: 20 }}>
          Don't have a supported device? You can still use MindWell — we'll estimate your wellness from your answers and daily check-ins.
        </Text>

        <Button
          label="Continue"
          onPress={handleContinue}
          size="lg"
          disabled={!selected}
        />
        <Text style={{ fontSize: 12, color: Colors.textSecondary, textAlign: "center" }}>
          You can change this later in Profile
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/onboarding/wearable.tsx
git commit -m "feat: replace demo mode with real device selection in wearable screen"
```

---

## Task 12: Redesign app/index.tsx — home screen

**Files:**
- Modify: `app/index.tsx`

The current home screen has "Talk to AI" pre-highlighted in primary color and daily tip at the bottom. New layout: gradient header → daily tip (prominent) → mood ring → two equal action cards → conditional affirmation banner.

- [ ] **Step 1: Replace home screen**

Replace full contents of `app/index.tsx`:

```typescript
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MoodRing } from "../components/MoodRing";
import { AffirmationBanner } from "../components/AffirmationBanner";
import { Colors, GradientColors } from "../constants/theme";
import { useUserStore } from "../stores/useUserStore";
import { useHealthStore } from "../stores/useHealthStore";
import { formatGreeting } from "../utils/formatters";

const DAILY_TIPS = [
  "Taking 3 slow breaths can reduce cortisol levels within 60 seconds.",
  "A 10-minute walk outside lowers stress hormones significantly.",
  "Writing down one thing you're grateful for shifts your mental baseline.",
  "Drinking water when anxious activates your body's calming response.",
  "Five minutes of sunlight in the morning sets your circadian rhythm.",
  "Putting your phone down 30 minutes before sleep improves HRV overnight.",
  "Naming your emotion out loud reduces its intensity by up to 50%.",
];

function getDailyTip(): string {
  const dayIndex = new Date().getDay();
  return DAILY_TIPS[dayIndex];
}

export default function HomeScreen() {
  const router = useRouter();
  const { anonymousName } = useUserStore();
  const { latestPrediction, affirmationVisible, currentAffirmation, dismissAffirmation } = useHealthStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top"]}>
      {/* Gradient header */}
      <LinearGradient
        colors={GradientColors.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}
      >
        <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", fontWeight: "500" }}>
          {formatGreeting()}
        </Text>
        <Text style={{ fontSize: 26, fontWeight: "800", color: Colors.white, marginTop: 2 }}>
          {anonymousName} 👋
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 40 }}>

        {/* Daily Tip — prominent */}
        <View style={{
          backgroundColor: Colors.surface,
          borderRadius: 16,
          padding: 18,
          borderLeftWidth: 4,
          borderLeftColor: Colors.primary,
        }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: Colors.primary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
            ✦ Today's Tip
          </Text>
          <Text style={{ fontSize: 15, color: Colors.textPrimary, lineHeight: 22 }}>
            {getDailyTip()}
          </Text>
          <TouchableOpacity onPress={() => router.push("/affirmations")} style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 13, color: Colors.primary, fontWeight: "600" }}>
              View affirmations history →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feeling / Mood */}
        <View style={{
          backgroundColor: Colors.surface,
          borderRadius: 16,
          padding: 20,
          alignItems: "center",
          gap: 10,
        }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSecondary, alignSelf: "flex-start" }}>
            HOW YOU'RE FEELING
          </Text>
          <MoodRing prediction={latestPrediction} />
          <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
            Tap the ring to see your stress score
          </Text>
        </View>

        {/* Action cards — equal weight, no pre-highlight */}
        <View>
          <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginBottom: 12 }}>
            WHAT WOULD YOU LIKE TO DO?
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push("/chat")}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: Colors.surface,
                borderRadius: 16,
                padding: 18,
                gap: 12,
                minHeight: 120,
                justifyContent: "space-between",
                borderWidth: 1.5,
                borderColor: Colors.border,
              }}
            >
              <View style={{
                width: 42, height: 42, borderRadius: 21,
                backgroundColor: Colors.primaryMuted,
                alignItems: "center", justifyContent: "center",
              }}>
                <Ionicons name="chatbubble-ellipses" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.textPrimary }}>Talk to AI</Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
                  Chat with your companion
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/communities")}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: Colors.surface,
                borderRadius: 16,
                padding: 18,
                gap: 12,
                minHeight: 120,
                justifyContent: "space-between",
                borderWidth: 1.5,
                borderColor: Colors.border,
              }}
            >
              <View style={{
                width: 42, height: 42, borderRadius: 21,
                backgroundColor: Colors.primaryMuted,
                alignItems: "center", justifyContent: "center",
              }}>
                <Ionicons name="people" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.textPrimary }}>Communities</Text>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
                  Connect anonymously
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Affirmation banner — conditional */}
        {affirmationVisible && (
          <AffirmationBanner message={currentAffirmation} onDismiss={dismissAffirmation} />
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/index.tsx
git commit -m "feat: redesign home screen with gradient header, prominent tip, equal action cards"
```

---

## Task 13: Update app/communities/index.tsx — spacing

**Files:**
- Modify: `app/communities/index.tsx`

- [ ] **Step 1: Improve spacing throughout**

Replace full contents of `app/communities/index.tsx`:

```typescript
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CommunityCard } from "../../components/CommunityCard";
import { Colors } from "../../constants/theme";
import { COMMUNITIES, COMMUNITY_SUGGESTIONS } from "../../constants/communities";
import { useUserStore } from "../../stores/useUserStore";
import { CommunitySize } from "../../types";

export default function CommunitiesScreen() {
  const router = useRouter();
  const { joinedCommunities, joinCommunity, persona } = useUserStore();
  const [sizeFilter, setSizeFilter] = useState<CommunitySize | "all">("all");

  const suggested = (COMMUNITY_SUGGESTIONS[persona] || [])
    .map((id) => COMMUNITIES.find((c) => c.id === id))
    .filter((c): c is typeof COMMUNITIES[0] => c !== undefined);

  const filtered = COMMUNITIES.filter((c) =>
    sizeFilter === "all" ? true : c.sizeType === sizeFilter
  );

  const categories = [...new Set(filtered.map((c) => c.category))];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
          <Text style={{ fontSize: 26, fontWeight: "800", color: Colors.textPrimary }}>
            Find your community
          </Text>
        </View>

        {/* Size filter */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: "row", backgroundColor: Colors.surface, borderRadius: 12, padding: 4 }}>
            {(["all", "small", "large"] as const).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setSizeFilter(f)}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 10,
                  backgroundColor: sizeFilter === f ? Colors.primary : "transparent",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: "600" as const, color: sizeFilter === f ? Colors.white : Colors.textSecondary }}>
                  {f === "all" ? "All" : f === "small" ? "Small (5–10)" : "Large (50+)"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Suggested */}
        {sizeFilter === "all" && suggested.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary, paddingHorizontal: 20, marginBottom: 12 }}>
              ✨ Recommended for you
            </Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={suggested}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
              renderItem={({ item: c }) => (
                <CommunityCard
                  community={c}
                  joined={joinedCommunities.includes(c.id)}
                  onJoin={() => joinCommunity(c.id)}
                  onPress={() => router.push(`/communities/${c.id}`)}
                  compact
                />
              )}
            />
          </View>
        )}

        {/* Browse by category */}
        <View style={{ paddingHorizontal: 20, gap: 24 }}>
          {categories.map((cat) => (
            <View key={cat}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                {cat}
              </Text>
              <View style={{ gap: 12 }}>
                {filtered.filter((c) => c.category === cat).map((c) => (
                  <CommunityCard
                    key={c.id}
                    community={c}
                    joined={joinedCommunities.includes(c.id)}
                    onJoin={() => { joinCommunity(c.id); router.push(`/communities/${c.id}`); }}
                    onPress={() => router.push(`/communities/${c.id}`)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/communities/index.tsx
git commit -m "fix: improve spacing throughout communities screen"
```

---

## Task 14: Redesign components/StressChart.tsx

**Files:**
- Modify: `components/StressChart.tsx`

- [ ] **Step 1: Replace chart with zone bands and weekly average**

Replace full contents of `components/StressChart.tsx`:

```typescript
import React from "react";
import { View, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { StressPrediction } from "../types";
import { stressColor, Colors } from "../constants/theme";

interface StressChartProps {
  predictions: StressPrediction[];
}

const MOCK_WEEK: StressPrediction[] = (() => {
  const seed = [0.3, 0.6, 0.2, 0.75, 0.45, 0.15, 0.55];
  const now = Date.now();
  return seed.map((score, i) => ({
    score,
    level: score < 0.25 ? "calm" : score < 0.5 ? "mild" : score < 0.75 ? "moderate" : "severe",
    timestamp: now - (6 - i) * 86400000,
  }));
})();

const MOCK_PREV_WEEK_AVG = 0.48;

function weekAverage(data: StressPrediction[]): number {
  return data.reduce((sum, p) => sum + p.score, 0) / data.length;
}

export const StressChart = ({ predictions }: StressChartProps) => {
  const data = predictions.length >= 7 ? predictions.slice(-7) : MOCK_WEEK;
  const avg = weekAverage(data);
  const prevAvg = MOCK_PREV_WEEK_AVG;
  const trend = avg < prevAvg ? "down" : "up";
  const trendLabel = trend === "down" ? "↓ Lower than last week" : "↑ Higher than last week";
  const trendColor = trend === "down" ? Colors.calm : Colors.moderate;

  const chartData = data.map((p) => ({
    value: Math.round(p.score * 100),
    label: new Date(p.timestamp).toLocaleDateString("en", { weekday: "short" }),
    dataPointColor: stressColor[p.level],
  }));

  const levelLabel = avg < 0.25 ? "calm" : avg < 0.5 ? "mild" : avg < 0.75 ? "moderate" : "severe";

  return (
    <View style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 14 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>
          Your Stress This Week
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["calm", "mild", "moderate", "severe"] as const).map((level) => (
            <View key={level} style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: stressColor[level] }} />
            </View>
          ))}
        </View>
      </View>

      {/* Chart */}
      <View style={{ borderRadius: 12, overflow: "hidden" }}>
        <LineChart
          data={chartData}
          height={150}
          color={Colors.primary}
          thickness={2.5}
          dataPointsColor={Colors.primary}
          startFillColor={Colors.primaryMuted}
          endFillColor={Colors.background}
          areaChart
          curved
          yAxisTextStyle={{ color: Colors.textSecondary, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: Colors.textSecondary, fontSize: 10 }}
          maxValue={100}
          noOfSections={4}
          rulesColor={Colors.border}
          yAxisColor="transparent"
          xAxisColor={Colors.border}
          hideYAxisText
        />
      </View>

      {/* Legend row */}
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        {(["calm", "mild", "moderate", "severe"] as const).map((level) => (
          <View key={level} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stressColor[level] }} />
            <Text style={{ fontSize: 11, color: Colors.textSecondary, textTransform: "capitalize" }}>{level}</Text>
          </View>
        ))}
      </View>

      {/* Weekly average */}
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12,
      }}>
        <View>
          <Text style={{ fontSize: 11, color: Colors.textSecondary, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
            Weekly Average
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "800", color: Colors.textPrimary, marginTop: 2 }}>
            {Math.round(avg * 100)}
            <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.textSecondary }}>/100</Text>
          </Text>
          <Text style={{ fontSize: 12, color: stressColor[levelLabel], fontWeight: "600", marginTop: 2, textTransform: "capitalize" }}>
            {levelLabel} stress
          </Text>
        </View>
        <Text style={{ fontSize: 13, fontWeight: "600", color: trendColor }}>
          {trendLabel}
        </Text>
      </View>
    </View>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add components/StressChart.tsx
git commit -m "feat: redesign stress chart with legend, weekly average, and trend indicator"
```

---

## Task 15: Update app/profile.tsx — notch fix, remove hackathon, add affirmations link

**Files:**
- Modify: `app/profile.tsx`

- [ ] **Step 1: Update profile screen**

Replace full contents of `app/profile.tsx`:

```typescript
import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StressChart } from "../components/StressChart";
import { PersonaSelector } from "../components/PersonaSelector";
import { Card } from "../components/ui/Card";
import { Colors } from "../constants/theme";
import { useUserStore } from "../stores/useUserStore";
import { useHealthStore } from "../stores/useHealthStore";
import { COMMUNITIES } from "../constants/communities";

export default function ProfileScreen() {
  const router = useRouter();
  const { anonymousName, persona, setAnonymousName, setPersona, joinedCommunities, leaveCommunity } = useUserStore();
  const { predictions, wearableConnected, wearableMode } = useHealthStore();
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

        {/* AI Persona */}
        <Card>
          <Text style={{ fontSize: 13, fontWeight: "600" as const, color: Colors.textSecondary, marginBottom: 12 }}>AI COMPANION STYLE</Text>
          <PersonaSelector active={persona} onChange={setPersona} />
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

        {/* Stress history */}
        <StressChart predictions={predictions} />

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

- [ ] **Step 2: Commit**

```bash
git add app/profile.tsx
git commit -m "fix: profile screen notch, remove hackathon label, add affirmations link"
```

---

## Task 16: Create app/affirmations.tsx — affirmations history page

**Files:**
- Create: `app/affirmations.tsx`

- [ ] **Step 1: Create affirmations history screen**

Create `app/affirmations.tsx`:

```typescript
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, GradientColors, stressColor, personaColor } from "../constants/theme";
import { useHealthStore } from "../stores/useHealthStore";
import { AffirmationEntry } from "../types";

function formatTimestamp(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }
  const days = Math.floor(diff / 86400000);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString("en", { month: "short", day: "numeric" });
}

function PersonaBadge({ persona }: { persona: AffirmationEntry["persona"] }) {
  const color = personaColor[persona];
  const label = persona.charAt(0).toUpperCase() + persona.slice(1);
  return (
    <View style={{ backgroundColor: color + "20", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color }}>{label}</Text>
    </View>
  );
}

function StressDot({ level }: { level: AffirmationEntry["stressLevel"] }) {
  return (
    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stressColor[level] }} />
  );
}

export default function AffirmationsScreen() {
  const router = useRouter();
  const { affirmationHistory } = useHealthStore();

  const [latest, ...rest] = affirmationHistory;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top"]}>
      {/* Header */}
      <LinearGradient
        colors={GradientColors.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18, flexDirection: "row", alignItems: "center", gap: 12 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "800", color: Colors.white }}>Words of Care</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
        {affirmationHistory.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60, gap: 12 }}>
            <Text style={{ fontSize: 40 }}>💬</Text>
            <Text style={{ fontSize: 16, color: Colors.textSecondary, textAlign: "center", lineHeight: 24 }}>
              No affirmations yet.{"\n"}We'll send you one when your stress is elevated.
            </Text>
          </View>
        ) : (
          <>
            {/* Latest — highlighted */}
            {latest && (
              <LinearGradient
                colors={GradientColors.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 18, padding: 20, gap: 12 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 1 }}>
                    Most Recent
                  </Text>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
                    {formatTimestamp(latest.timestamp)}
                  </Text>
                </View>
                <Text style={{ fontSize: 34, color: "rgba(255,255,255,0.3)", fontWeight: "900", lineHeight: 30 }}>"</Text>
                <Text style={{ fontSize: 17, color: Colors.white, lineHeight: 26, fontWeight: "500", marginTop: -8 }}>
                  {latest.text}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <PersonaBadge persona={latest.persona} />
                  <StressDot level={latest.stressLevel} />
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "capitalize" }}>
                    {latest.stressLevel} stress
                  </Text>
                </View>
              </LinearGradient>
            )}

            {/* Previous affirmations */}
            {rest.length > 0 && (
              <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSecondary, marginTop: 4 }}>
                EARLIER
              </Text>
            )}
            {rest.map((entry) => (
              <View
                key={entry.id}
                style={{
                  backgroundColor: Colors.surface,
                  borderRadius: 14,
                  padding: 16,
                  gap: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
              >
                <Text style={{ fontSize: 15, color: Colors.textPrimary, lineHeight: 22 }}>
                  {entry.text}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <PersonaBadge persona={entry.persona} />
                  <StressDot level={entry.stressLevel} />
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, textTransform: "capitalize" }}>
                    {entry.stressLevel} stress
                  </Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary, marginLeft: "auto" }}>
                    {formatTimestamp(entry.timestamp)}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/affirmations.tsx
git commit -m "feat: add affirmations history screen with latest highlighted"
```

---

## Task 17: Update CLAUDE.md — new color tokens

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update the color palette table in CLAUDE.md**

Find the color palette table under `## Design system` and replace it with:

```markdown
| Token                | Value      | Usage                                       |
| -------------------- | ---------- | ------------------------------------------- |
| `primary`            | `#09A8E0`  | Solid accent fallback                       |
| `primaryLight`       | `#0DB5F0`  | Gradient start                              |
| `primaryMuted`       | `#E8F6FD`  | Badge backgrounds, tinted surfaces          |
| `primaryGradient`    | `#0DB5F0 → #09A8E0` | Buttons, headers (left→right)    |
| `darkBackground`     | `#170E48`  | Dark mode screen background only           |
| `darkSurface`        | `#1E1456`  | Dark mode card background only             |
| `calm`               | `#4CAF50`  | Low stress indicator                        |
| `mild`               | `#FFC107`  | Mild stress indicator                       |
| `moderate`           | `#FF9800`  | Moderate stress indicator                   |
| `severe`             | `#F44336`  | High stress indicator                       |
| `surface`            | `#F5F9FD`  | Card backgrounds                            |
| `background`         | `#FFFFFF`  | Screen backgrounds                          |
| `textPrimary`        | `#0F172A`  | Main text                                   |
| `textSecondary`      | `#64748B`  | Muted/supporting text                       |
| `friendAccent`       | `#FF8A65`  | Friend persona accent                       |
| `counsellorAccent`   | `#42A5F5`  | Counsellor persona accent                   |
| `psychiatristAccent` | `#26A69A`  | Psychiatrist persona accent                 |
```

Also update the note under **Current phase:** to remove "hackathon" language — change it to:

> **Current phase:** UI/UX design and frontend implementation only. All backend calls, ML inference, and LLM integration are mocked/stubbed for now.

(It likely already says this — verify no "hackathon" language remains in CLAUDE.md.)

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with new blue gradient color tokens"
```

---

## Final verification

- [ ] Run the app and confirm:
  1. Onboarding flows: Welcome → Connect Device → Questions (6 screens with progress bar) → Choose AI Companion → Home
  2. Home screen: gradient header, prominent daily tip, equal action cards (neither pre-highlighted)
  3. Communities: consistent spacing, category headers uppercase
  4. Profile: correct top padding, no "Hackathon Build" text, affirmations link present
  5. Stress chart: legend + weekly average visible
  6. Affirmations screen accessible from home "View affirmations history →" and from profile link
  7. Affirmations screen: latest shown in gradient card, others in flat list below

```bash
npx expo start
```
