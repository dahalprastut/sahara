import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../constants/theme";
import { useHealthStore } from "../../stores/useHealthStore";

const devices = [
  { id: "apple-watch", name: "Apple Watch", icon: "watch-outline" as const, subtitle: "Series 4 and later" },
  { id: "oura", name: "Oura Ring", icon: "radio-outline" as const, subtitle: "Gen 3 and later" },
  { id: "fitbit", name: "Fitbit", icon: "fitness-outline" as const, subtitle: "Sense, Versa, Charge" },
  { id: "samsung", name: "Samsung Galaxy Watch", icon: "watch-outline" as const, subtitle: "Galaxy Watch 4 and later" },
];

export default function WearableScreen() {
  const router = useRouter();
  const { setWearableMode } = useHealthStore();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    setWearableMode("connected");
    router.push("/onboarding/questions");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: 40 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: Colors.textPrimary }}>
            Connect your device
          </Text>
          <Text style={{ fontSize: 16, color: Colors.textSecondary, lineHeight: 24 }}>
            MindWell reads biometric data from your wearable to understand your stress patterns.
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          {devices.map((d) => {
            const isActive = selected === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                onPress={() => setSelected(d.id)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: isActive ? Colors.primaryMuted : Colors.surface,
                  borderRadius: 16,
                  padding: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  borderWidth: 2,
                  borderColor: isActive ? Colors.primary : Colors.border,
                }}
              >
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: isActive ? Colors.primary : Colors.border,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Ionicons name={d.icon} size={22} color={isActive ? Colors.white : Colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: isActive ? Colors.primary : Colors.textPrimary }}>
                    {d.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary, marginTop: 2 }}>
                    {d.subtitle}
                  </Text>
                </View>
                {isActive && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => {
            setWearableMode("none");
            router.push("/onboarding/questions");
          }}
          style={{ alignItems: "center" }}
        >
          <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: "center", lineHeight: 20 }}>
            Don't have a supported device?{" "}
            <Text style={{ color: Colors.primary, fontWeight: "600" }}>Continue without one →</Text>
          </Text>
        </TouchableOpacity>

        <Button
          label="Continue"
          onPress={handleContinue}
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
