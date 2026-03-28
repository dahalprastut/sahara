# CLAUDE.md — MindWell (Mental Health Companion App)

## Project overview

MindWell is a mental health mobile application that reads data from wearables (smartwatches, rings), runs it through an ML model to predict stress/anxiety/depression, and delivers AI-powered affirmations and chat support via push notifications. Users can also join anonymous communities for peer support.

**Current phase:** UI/UX design and frontend implementation only. All backend calls, ML inference, and LLM integration are mocked/stubbed for now.

---

## Tech stack

- **Framework:** React Native with Expo (managed workflow)
- **Language:** TypeScript (strict mode)
- **Navigation:** Expo Router (file-based routing)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **State management:** Zustand (lightweight, no boilerplate)
- **Icons:** `@expo/vector-icons` (Ionicons set preferred)
- **Animations:** `react-native-reanimated` for micro-interactions
- **Charts:** `react-native-gifted-charts` for stress history visualization

### Future integrations (stub for now)

- **Backend API:** Express.js REST API (base URL will be `http://localhost:3001/api`)
- **Database:** Supabase (Postgres + Realtime for community chat)
- **ML model:** Python Flask service for stress prediction
- **LLM:** Anthropic Claude API for affirmations and chat
- **Wearable SDK:** Apple HealthKit / Google Health Connect (mocked with random data generators for now)
- **Push notifications:** Expo Notifications

---

## Project structure

```
mindwell/
├── app/                        # Expo Router file-based routes
│   ├── _layout.tsx             # Root layout (tab navigator)
│   ├── index.tsx               # Home / Dashboard screen
│   ├── chat.tsx                # AI Chat screen
│   ├── communities/
│   │   ├── index.tsx           # Community discovery/browse
│   │   └── [id].tsx            # Community chat room
│   ├── profile.tsx             # Settings & stress history
│   └── onboarding/
│       ├── index.tsx           # Welcome screen
│       ├── wearable.tsx        # Connect wearable (or skip/mock)
│       └── persona.tsx         # Choose AI persona
├── components/
│   ├── ui/                     # Reusable primitives (Button, Card, Badge, etc.)
│   ├── AffirmationBanner.tsx   # Notification-style affirmation card
│   ├── MoodRing.tsx            # Circular mood indicator (green→yellow→red)
│   ├── PersonaSelector.tsx     # Friend / Counsellor / Psychiatrist picker
│   ├── ChatBubble.tsx          # Message bubble for AI and community chat
│   ├── CommunityCard.tsx       # Card for community discovery list
│   └── StressChart.tsx         # 7-day stress history line chart
├── services/
│   ├── api.ts                  # API client (axios instance, base URL config)
│   ├── wearable.mock.ts        # Mock wearable data generator
│   ├── predictions.mock.ts     # Mock ML prediction responses
│   └── llm.mock.ts             # Mock LLM affirmation and chat responses
├── stores/
│   ├── useUserStore.ts         # User profile, persona, onboarding state
│   ├── useHealthStore.ts       # Wearable readings, stress scores
│   ├── useChatStore.ts         # Chat message history with AI
│   └── useCommunityStore.ts    # Joined communities, community messages
├── constants/
│   ├── theme.ts                # Color palette, spacing, typography tokens
│   ├── personas.ts             # Persona definitions and system prompts
│   └── communities.ts          # Seed data for mock communities
├── types/
│   └── index.ts                # Shared TypeScript types/interfaces
└── utils/
    ├── formatters.ts           # Date, time, score formatting helpers
    └── stressLevel.ts          # Score → level mapping (calm/mild/moderate/severe)
```

---

## Design system

### Color palette

The app uses a calming, wellness-oriented palette. All colors are defined in `constants/theme.ts`.

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

### Typography

- **Headings:** System font, bold (700), sizes 28/22/18
- **Body:** System font, regular (400), size 16, line-height 1.5
- **Caption:** System font, regular (400), size 13, color `textSecondary`
- **Chat bubbles:** Size 15, line-height 1.4

### Spacing scale

4, 8, 12, 16, 20, 24, 32, 48 (use Tailwind classes via NativeWind: `p-2`, `p-4`, `gap-3`, etc.)

### Corner radii

- Cards: 16px
- Buttons: 12px
- Chat bubbles: 18px (with tail-side 4px)
- Avatars: full round
- Input fields: 12px

---

## Screen specifications

### 1. Onboarding flow (3 screens)

**Welcome:** App logo, tagline ("Your mental wellness companion"), "Get Started" button. Simple, calming illustration or gradient background.

**Connect wearable:** Option to connect Apple Watch / Oura Ring / Fitbit. Show a "Use Demo Mode" button that generates mock biometric data. This should be the prominent option.

**Choose persona:** Three large selectable cards showing the AI chat personas:

- **Friend** — "Casual, empathetic, like texting a close friend" (warm orange accent)
- **Counsellor** — "Supportive, guided, reflective listening" (calm blue accent)
- **Psychiatrist** — "Clinical, structured, evidence-based" (teal accent)

User taps to select, then "Continue" navigates to home. Selection is stored in `useUserStore`.

### 2. Home / Dashboard (`app/index.tsx`)

**Top section:**

- Greeting: "Hey [anonymous_name]" with current time-of-day context
- If an affirmation was recently triggered, show `<AffirmationBanner>` — a soft-colored card with the LLM-generated message, dismissable with swipe

**Center:**

- `<MoodRing>` — a large circular indicator (120px diameter) with gradient fill reflecting current stress score. Tap to see the numeric score and timestamp.
- Below the ring: a text label like "You're feeling calm" / "Mild stress detected"

**Bottom cards (2 action cards side by side):**

- "Talk to AI" → navigates to `chat.tsx`
- "Communities" → navigates to `communities/index.tsx`

**Bottom nav bar (tab navigator):**

- Home (filled house icon)
- Chat (message bubble icon)
- Communities (people icon)
- Profile (person icon)

### 3. AI Chat (`app/chat.tsx`)

**Header:**

- `<PersonaSelector>` — horizontal pill/chip row to switch persona (Friend / Counsellor / Psychiatrist). Active pill uses the persona's accent color. Switching persona clears the conversation or starts a new session.

**Chat area:**

- Standard message list, newest at bottom, auto-scroll
- AI messages: left-aligned, surface-colored bubble, small "AI" avatar with persona icon
- User messages: right-aligned, primary-colored bubble, white text
- Typing indicator (three animated dots) when waiting for response

**Input area:**

- Text input with rounded corners, send button (arrow icon)
- Small disclaimer text above input: "AI companion, not a substitute for professional help"

**Mock behavior:** When user sends a message, wait 1-2 seconds (simulate latency), then return a mock response from `services/llm.mock.ts`. Responses should be contextually plausible — store 20-30 pre-written responses per persona.

### 4. Community discovery (`app/communities/index.tsx`)

**Top:**

- Section title "Find your community"
- Toggle: "Small groups (5-10)" / "Large groups (50+)" — horizontal segmented control

**Suggested section:**

- "Recommended for you" label
- Horizontal scrollable row of `<CommunityCard>` components
- Card shows: emoji icon, community name, member count, "Active now" / "3 online" indicator

**Browse section:**

- Vertical list of all communities grouped by category
- Categories: Career Pressure, Burnout, Breakup Recovery, Mid-life Crisis, Academic Stress, General Wellness
- Each card: name, short description (1 line), member count, "Join" button

**Join flow:** Tapping "Join" shows a brief bottom sheet confirming anonymous name and community guidelines, then navigates to the community chat.

### 5. Community chat (`app/communities/[id].tsx`)

**Header:** Community name, member count, back button

**Pinned banner:** Community guidelines in a collapsible card at top

**Chat area:**

- Messages from all members, each with their anonymous name and a colored initial avatar (deterministic color from name hash)
- No profile pictures, no real names
- Messages show relative timestamps ("2m ago", "1h ago")

**Input:** Same style as AI chat input

**Mock behavior:** Pre-populate with 10-15 seed messages. When user sends a message, it appears immediately (local-first). Simulate 1-2 "other users" typing and responding with pre-written messages after random delays (5-15 seconds).

### 6. Profile (`app/profile.tsx`)

**User section:** Anonymous name (editable), persona preference (tap to change)

**Stress history:** `<StressChart>` — 7-day line chart with colored zones (green/yellow/orange/red bands). Plotted from mock data in `useHealthStore`.

**Wearable status:** Connected device name or "Demo mode" indicator, reconnect button

**Joined communities:** List of joined communities with "Leave" option

**App info:** Version, "About MindWell" link, disclaimer about AI not replacing professional care

---

## Mock data strategy

All mock data lives in `services/` and is imported by stores. This keeps the data layer separate so swapping in real API calls later is a clean replacement.

### `wearable.mock.ts`

```typescript
// Generates random biometric readings every 30 seconds
// Heart rate: 60-100 bpm (normal) or 90-130 (stressed)
// HRV: 40-80ms (normal) or 15-40ms (stressed)
// Skin conductance: 1-5 μS (normal) or 5-15 μS (stressed)
// Export: startMockWearable(), stopMockWearable(), getCurrentReading()
```

### `predictions.mock.ts`

```typescript
// Takes wearable reading, returns stress score 0.0-1.0
// Simple threshold logic: low HRV + high HR + high SC = high score
// Export: predictStress(reading: WearableReading): StressPrediction
```

### `llm.mock.ts`

```typescript
// Returns persona-appropriate responses
// Affirmations: pool of 30+ messages per stress level
// Chat: keyword-matched responses with fallback generic replies
// Export: getAffirmation(level, persona): string
// Export: getChatResponse(message, persona, history): string
```

---

## API stub pattern

All API calls go through `services/api.ts`. For now, each function hits mock data. When the backend is ready, only this file changes.

```typescript
// services/api.ts
const USE_MOCK = true; // flip to false when backend is ready
const API_BASE = "http://localhost:3001/api";

export async function submitWearableData(reading: WearableReading) {
	if (USE_MOCK) return predictions.mock.predictStress(reading);
	return fetch(`${API_BASE}/predict`, { method: "POST", body: JSON.stringify(reading) });
}

export async function getAffirmation(score: number, persona: Persona) {
	if (USE_MOCK) return llm.mock.getAffirmation(score, persona);
	return fetch(`${API_BASE}/affirmation`, { method: "POST", body: JSON.stringify({ score, persona }) });
}

export async function sendChatMessage(message: string, persona: Persona, history: Message[]) {
	if (USE_MOCK) return llm.mock.getChatResponse(message, persona, history);
	return fetch(`${API_BASE}/chat`, { method: "POST", body: JSON.stringify({ message, persona, history }) });
}
```

---

## TypeScript types

```typescript
// types/index.ts

type Persona = "friend" | "counsellor" | "psychiatrist";
type StressLevel = "calm" | "mild" | "moderate" | "severe";
type CommunitySize = "small" | "large";

interface WearableReading {
	heartRate: number;
	hrv: number;
	skinConductance: number;
	timestamp: number;
}

interface StressPrediction {
	score: number; // 0.0 to 1.0
	level: StressLevel;
	timestamp: number;
}

interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	persona: Persona;
	timestamp: number;
}

interface Community {
	id: string;
	name: string;
	category: string;
	description: string;
	emoji: string;
	sizeType: CommunitySize;
	memberCount: number;
	activeNow: number;
}

interface CommunityMessage {
	id: string;
	communityId: string;
	anonymousName: string;
	content: string;
	timestamp: number;
}

interface UserProfile {
	anonymousName: string;
	persona: Persona;
	onboardingComplete: boolean;
	joinedCommunities: string[];
}
```

---

## Coding conventions

- Use functional components with hooks only, no class components
- Prefer `const` arrow functions for components: `const MyComponent = () => { ... }`
- Use NativeWind className strings for styling, avoid inline `style` objects unless dynamic
- Every component gets its own file; no multi-component files
- Name files in PascalCase for components (`MoodRing.tsx`), camelCase for utilities (`formatters.ts`)
- Use Zustand `create` with TypeScript generics for type-safe stores
- Keep business logic in stores and services, components should be thin
- Prefer `expo-router` `Link` and `useRouter` for navigation
- All mock data is deterministic with seeded random when possible (consistent demo experience)

---

## Commands

```bash
# Install dependencies
npx create-expo-app mindwell --template blank-typescript
cd mindwell
npx expo install nativewind tailwindcss expo-router react-native-reanimated react-native-gifted-charts react-native-svg @expo/vector-icons zustand

# Start dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Run on web (for quick preview)
npx expo start --web
```

---

## Important notes

- All data is local and mocked; no real user data is collected or stored
- The wearable connection is simulated; no actual HealthKit/Health Connect integration needed for demo
- Community "other users" are simulated bots with pre-written messages
- Dark mode support is nice-to-have; build light mode first
- Accessibility: ensure minimum touch targets (44x44), readable contrast ratios
- Always show the mental health disclaimer on chat screens
