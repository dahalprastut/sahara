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
