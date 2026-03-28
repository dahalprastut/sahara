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
