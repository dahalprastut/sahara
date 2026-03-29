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
