import React from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MoodRing } from "../components/MoodRing";
import { AffirmationBanner } from "../components/AffirmationBanner";
import { Card } from "../components/ui/Card";
import { Colors } from "../constants/theme";
import { useUserStore } from "../stores/useUserStore";
import { useHealthStore } from "../stores/useHealthStore";
import { formatGreeting } from "../utils/formatters";

export default function HomeScreen() {
  const router = useRouter();
  const { anonymousName } = useUserStore();
  const { latestPrediction, affirmationVisible, currentAffirmation, dismissAffirmation } = useHealthStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 14, color: Colors.textSecondary }}>{formatGreeting()}</Text>
            <Text style={{ fontSize: 24, fontWeight: "800", color: Colors.textPrimary }}>{anonymousName} 👋</Text>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryMuted, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 20 }}>🧠</Text>
          </View>
        </View>

        {/* Affirmation banner */}
        {affirmationVisible && (
          <AffirmationBanner message={currentAffirmation} onDismiss={dismissAffirmation} />
        )}

        {/* Mood Ring */}
        <Card style={{ alignItems: "center", paddingVertical: 28 }}>
          <MoodRing prediction={latestPrediction} />
          <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 12 }}>
            Tap the ring to see your stress score
          </Text>
        </Card>

        {/* Action Cards */}
        <Text style={{ fontSize: 18, fontWeight: "700", color: Colors.textPrimary }}>
          What would you like to do?
        </Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push("/chat")}
            activeOpacity={0.85}
            style={{
              flex: 1,
              backgroundColor: Colors.primary,
              borderRadius: 18,
              padding: 20,
              gap: 10,
              minHeight: 140,
              justifyContent: "space-between",
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="chatbubble-ellipses" size={22} color={Colors.white} />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.white }}>Talk to AI</Text>
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
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
              borderRadius: 18,
              padding: 20,
              gap: 10,
              minHeight: 140,
              justifyContent: "space-between",
              borderWidth: 1.5,
              borderColor: Colors.border,
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryMuted, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="people" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary }}>Communities</Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 2 }}>
                Connect anonymously
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Daily tip */}
        <Card>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Text style={{ fontSize: 28 }}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.textPrimary }}>Daily tip</Text>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2, lineHeight: 19 }}>
                Taking 3 slow breaths can reduce cortisol levels within 60 seconds.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
