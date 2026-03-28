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
