import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Persona } from "../../types";
import { PERSONAS } from "../../constants/personas";
import { personaColor, Colors } from "../../constants/theme";
import { Button } from "../../components/ui/Button";
import { useUserStore } from "../../stores/useUserStore";

export default function PersonaScreen() {
  const router = useRouter();
  const { setPersona, completeOnboarding } = useUserStore();
  const [selected, setSelected] = useState<Persona | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    setPersona(selected);
    completeOnboarding();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: Colors.textPrimary }}>
            Choose your AI companion
          </Text>
          <Text style={{ fontSize: 16, color: Colors.textSecondary, lineHeight: 24 }}>
            Pick how you want the AI to talk to you. You can switch anytime.
          </Text>
        </View>

        <View style={{ gap: 14 }}>
          {PERSONAS.map((p) => {
            const isActive = selected === p.id;
            const color = personaColor[p.id];
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelected(p.id)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: isActive ? color + "18" : Colors.surface,
                  borderRadius: 18,
                  padding: 20,
                  borderWidth: 2,
                  borderColor: isActive ? color : "transparent",
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Text style={{ fontSize: 32 }}>{p.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: isActive ? color : Colors.textPrimary }}>
                      {p.label}
                    </Text>
                    <Text style={{ fontSize: 12, color, fontWeight: "600" }}>{p.tagline}</Text>
                  </View>
                  {isActive && (
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 20 }}>
                  {p.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button label="Start your journey" onPress={handleContinue} size="lg" disabled={!selected} />
      </ScrollView>
    </SafeAreaView>
  );
}
