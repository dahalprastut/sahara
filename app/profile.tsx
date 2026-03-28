import React, { useState } from "react";
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}>
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
            <TouchableOpacity onPress={() => setEditingName(true)}>
              <Ionicons name="pencil" size={20} color={Colors.primary} />
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
              {wearableConnected
                ? wearableMode === "demo" ? "Demo mode · Running" : "Connected · Running"
                : "Not connected"}
            </Text>
          </View>
        </Card>

        {/* Stress history */}
        <StressChart predictions={predictions} />

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
          <Text style={{ fontSize: 14, color: Colors.textSecondary }}>MindWell v1.0.0 — Hackathon Build</Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 8, lineHeight: 18 }}>
            ⚠️ This app uses AI and is not a substitute for professional mental health care. If you are in crisis, please contact a mental health professional or emergency services.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
