import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../constants/theme";

const devices = [
  { id: "apple-watch", name: "Apple Watch", icon: "watch-outline" as const },
  { id: "oura", name: "Oura Ring", icon: "radio-outline" as const },
  { id: "fitbit", name: "Fitbit", icon: "fitness-outline" as const },
];

export default function WearableScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: Colors.textPrimary }}>
            Connect your wearable
          </Text>
          <Text style={{ fontSize: 16, color: Colors.textSecondary, lineHeight: 24 }}>
            MindWell reads biometric data to detect stress patterns. Or use Demo Mode.
          </Text>
        </View>

        {/* Demo mode — prominent */}
        <TouchableOpacity
          onPress={() => setSelected("demo")}
          style={{
            backgroundColor: selected === "demo" ? Colors.primary : Colors.primaryMuted,
            borderRadius: 16,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            borderWidth: 2,
            borderColor: selected === "demo" ? Colors.primary : "transparent",
          }}
        >
          <Text style={{ fontSize: 32 }}>🎮</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: selected === "demo" ? Colors.white : Colors.primary }}>
              Demo Mode
            </Text>
            <Text style={{ fontSize: 13, color: selected === "demo" ? "rgba(255,255,255,0.8)" : Colors.textSecondary }}>
              Simulated biometric data — great for exploring the app
            </Text>
          </View>
          {selected === "demo" && <Ionicons name="checkmark-circle" size={24} color={Colors.white} />}
        </TouchableOpacity>

        <Text style={{ fontSize: 14, color: Colors.textSecondary, textAlign: "center" }}>— or connect a real device —</Text>

        <View style={{ gap: 10 }}>
          {devices.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={{
                backgroundColor: Colors.surface,
                borderRadius: 14,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                opacity: 0.5,
              }}
              disabled
            >
              <Ionicons name={d.icon} size={26} color={Colors.textSecondary} />
              <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.textSecondary }}>{d.name}</Text>
              <View style={{ marginLeft: "auto" }}>
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>Coming soon</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          label="Continue"
          onPress={() => router.push("/onboarding/persona")}
          size="lg"
          disabled={!selected}
        />
        <Text style={{ fontSize: 12, color: Colors.textSecondary, textAlign: "center" }}>
          You can change this later in Profile
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
