import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AffirmationBanner } from "../components/AffirmationBanner";
import { Colors, GradientColors } from "../constants/theme";
import { useUserStore } from "../stores/useUserStore";
import { useHealthStore } from "../stores/useHealthStore";
import { formatGreeting } from "../utils/formatters";
import { getCurrentReading } from "../services/wearable.mock";
import { StressLevel } from "../types";

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

type MetricStatus = "good" | "ok" | "low";

const STATE_CONFIG: Record<StressLevel, { label: string; sublabel: string; color: string; bg: string }> = {
  calm:     { label: "CALM",     sublabel: "You're glowing today!",           color: Colors.calm,     bg: "#F0FAF0" },
  mild:     { label: "MILD",     sublabel: "A little tension — you've got it.", color: Colors.mild,     bg: "#FFFBEB" },
  moderate: { label: "MODERATE", sublabel: "Let's take it one breath at a time.", color: Colors.moderate, bg: "#FFF4E5" },
  severe:   { label: "STRESSED", sublabel: "It's okay — let's slow down together.", color: Colors.severe,   bg: "#FFF0F0" },
};


function metricDot(status: MetricStatus): string {
  if (status === "good") return "🟢";
  if (status === "ok") return "🟡";
  return "🔴";
}

function sleepStatus(h: number): MetricStatus {
  return h >= 7 ? "good" : h >= 5 ? "ok" : "low";
}
function hrStatus(bpm: number): MetricStatus {
  return bpm <= 80 ? "good" : bpm <= 100 ? "ok" : "low";
}
function stepsStatus(s: number): MetricStatus {
  return s >= 7000 ? "good" : s >= 4000 ? "ok" : "low";
}
function hrvStatus(ms: number): MetricStatus {
  return ms >= 50 ? "good" : ms >= 30 ? "ok" : "low";
}

// Deterministic mock values seeded by day of week
const MOCK_SLEEP = [7.2, 6.8, 8.1, 7.5, 6.2, 7.8, 8.3];
const MOCK_STEPS = [6200, 8400, 5100, 9200, 4800, 7600, 10200];

export default function HomeScreen() {
  const router = useRouter();
  const { anonymousName } = useUserStore();
  const { latestPrediction, affirmationVisible, currentAffirmation, dismissAffirmation } = useHealthStore();
  const insets = useSafeAreaInsets();

  const latestReading = useHealthStore((s) => s.readings[s.readings.length - 1]);
  // Fall back to the current mock reading so data is present before the first interval fires
  const reading = latestReading ?? getCurrentReading();
  const level: StressLevel = latestPrediction?.level ?? "calm";
  const state = STATE_CONFIG[level];

  const dow = new Date().getDay();
  const sleepHours = MOCK_SLEEP[dow];
  const steps = MOCK_STEPS[dow];
  const heartRate = Math.round(reading.heartRate);
  const hrv = Math.round(reading.hrv);

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

        {/* Current state card */}
        <View style={{ backgroundColor: Colors.surface, borderRadius: 16, padding: 20, gap: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: Colors.textSecondary }}>
            CURRENT STATE
          </Text>

          {/* State badge + sublabel */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ backgroundColor: state.bg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}>
              <Text style={{ fontSize: 22, fontWeight: "900", color: state.color, letterSpacing: 1 }}>
                {state.label}
              </Text>
            </View>
            <Text style={{ flex: 1, fontSize: 14, color: Colors.textSecondary, lineHeight: 20 }}>
              {state.sublabel}
            </Text>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: Colors.border }} />

          {/* Metric tiles */}
          <Text style={{ fontSize: 11, fontWeight: "600", color: Colors.textSecondary, letterSpacing: 0.8 }}>
            WHAT'S INFLUENCING THIS
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <View style={{ flex: 1, minWidth: "45%", backgroundColor: Colors.background, borderRadius: 12, padding: 12, gap: 4, borderWidth: 1, borderColor: Colors.border }}>
              <Text style={{ fontSize: 18 }}>🌙</Text>
              <Text style={{ fontSize: 17, fontWeight: "800", color: Colors.textPrimary }}>{sleepHours}h</Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Sleep</Text>
              <Text style={{ fontSize: 11 }}>{metricDot(sleepStatus(sleepHours))}</Text>
            </View>
            <View style={{ flex: 1, minWidth: "45%", backgroundColor: Colors.background, borderRadius: 12, padding: 12, gap: 4, borderWidth: 1, borderColor: Colors.border }}>
              <Text style={{ fontSize: 18 }}>❤️</Text>
              <Text style={{ fontSize: 17, fontWeight: "800", color: Colors.textPrimary }}>{heartRate} bpm</Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Heart Rate</Text>
              <Text style={{ fontSize: 11 }}>{metricDot(hrStatus(heartRate))}</Text>
            </View>
            <View style={{ flex: 1, minWidth: "45%", backgroundColor: Colors.background, borderRadius: 12, padding: 12, gap: 4, borderWidth: 1, borderColor: Colors.border }}>
              <Text style={{ fontSize: 18 }}>🏃</Text>
              <Text style={{ fontSize: 17, fontWeight: "800", color: Colors.textPrimary }}>
                {steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : steps}
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Steps</Text>
              <Text style={{ fontSize: 11 }}>{metricDot(stepsStatus(steps))}</Text>
            </View>
            <View style={{ flex: 1, minWidth: "45%", backgroundColor: Colors.background, borderRadius: 12, padding: 12, gap: 4, borderWidth: 1, borderColor: Colors.border }}>
              <Text style={{ fontSize: 18 }}>📊</Text>
              <Text style={{ fontSize: 17, fontWeight: "800", color: Colors.textPrimary }}>{hrv} ms</Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>HRV</Text>
              <Text style={{ fontSize: 11 }}>{metricDot(hrvStatus(hrv))}</Text>
            </View>
          </View>
        </View>



      </ScrollView>
    </SafeAreaView>
  );
}
