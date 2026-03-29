import React from "react";
import { View, Text, ScrollView, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, GradientColors, stressColor, personaColor } from "../constants/theme";
import { useHealthStore } from "../stores/useHealthStore";
import { useUserStore } from "../stores/useUserStore";
import { COMMUNITIES, COMMUNITY_SUGGESTIONS } from "../constants/communities";
import { AffirmationEntry } from "../types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const HISTORY_CARD_WIDTH = SCREEN_WIDTH - 60;

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
  const insets = useSafeAreaInsets();
  const { affirmationHistory } = useHealthStore();
  const { persona, joinedCommunities, joinCommunity } = useUserStore();

  const [latest, ...rest] = affirmationHistory;

  const suggestedCommunities = (COMMUNITY_SUGGESTIONS[persona] || [])
    .map((id) => COMMUNITIES.find((c) => c.id === id))
    .filter((c): c is typeof COMMUNITIES[0] => c !== undefined)
    .filter((c) => !joinedCommunities.includes(c.id));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={[]}>
      {/* Header */}
      <LinearGradient
        colors={GradientColors.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingHorizontal: 20, paddingTop: insets.top + 12, paddingBottom: 18, flexDirection: "row", alignItems: "center", gap: 12 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "800", color: Colors.white }}>Words of Care</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {affirmationHistory.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60, gap: 12, paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 40 }}>💬</Text>
            <Text style={{ fontSize: 16, color: Colors.textSecondary, textAlign: "center", lineHeight: 24 }}>
              No affirmations yet.{"\n"}We'll send you one when your stress is elevated.
            </Text>
          </View>
        ) : (
          <>
            {/* Latest — prominent centered card */}
            {latest && (
              <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 }}>
                <LinearGradient
                  colors={GradientColors.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 22, padding: 24, gap: 12 }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 1 }}>
                      Most Recent
                    </Text>
                    <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
                      {formatTimestamp(latest.timestamp)}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 38, color: "rgba(255,255,255,0.3)", fontWeight: "900", lineHeight: 32 }}>"</Text>
                  <Text style={{ fontSize: 18, color: Colors.white, lineHeight: 28, fontWeight: "600", marginTop: -10 }}>
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
              </View>
            )}

            {/* Previous affirmations — horizontal slider */}
            {rest.length > 0 && (
              <View style={{ marginBottom: 28 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: Colors.textSecondary, paddingHorizontal: 20, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Previous
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={rest}
                  keyExtractor={(e) => e.id}
                  snapToInterval={HISTORY_CARD_WIDTH + 12}
                  decelerationRate="fast"
                  contentContainerStyle={{ gap: 12, paddingHorizontal: 20 }}
                  renderItem={({ item: entry }) => (
                    <View
                      style={{
                        width: HISTORY_CARD_WIDTH,
                        backgroundColor: Colors.surface,
                        borderRadius: 16,
                        padding: 18,
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
                        <Text style={{ fontSize: 11, color: Colors.textSecondary, marginLeft: "auto" as any }}>
                          {formatTimestamp(entry.timestamp)}
                        </Text>
                      </View>
                    </View>
                  )}
                />
              </View>
            )}
          </>
        )}

        {/* Recommended communities */}
        {suggestedCommunities.length > 0 && (
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.textPrimary, marginBottom: 4 }}>
              Communities for you
            </Text>
            <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 16 }}>
              Connect with others who understand
            </Text>
            <View style={{ gap: 12 }}>
              {suggestedCommunities.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => router.push(`/communities/${c.id}`)}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{c.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: Colors.textPrimary }}>{c.name}</Text>
                    <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
                      {c.description}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4 }}>
                      {c.memberCount} members · {c.activeNow > 0 ? `${c.activeNow} active` : ""}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => { joinCommunity(c.id); router.push(`/communities/${c.id}`); }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 10,
                      backgroundColor: Colors.primary,
                    }}
                  >
                    <Text style={{ color: Colors.white, fontWeight: "600", fontSize: 13 }}>Join</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
