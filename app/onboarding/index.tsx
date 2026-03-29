import React from "react";
import { View, Text, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "../../components/ui/Button";
import { Colors } from "../../constants/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 24 }}>
        <Text style={{ fontSize: 56 }}>🧠</Text>
        <View style={{ alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 36, fontWeight: "800", color: Colors.white, letterSpacing: -0.5 }}>
            Sahara
          </Text>
          <Text style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 24 }}>
            Your mental wellness companion.{"\n"}Understand yourself better, one breath at a time.
          </Text>
        </View>
        <View style={{ width: "100%", gap: 12, marginTop: 16 }}>
          <Button
            label="Get Started"
            onPress={() => router.replace("/onboarding/wearable")}
            variant="outline"
            size="lg"
            color={Colors.white}
          />
        </View>
        <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: 8 }}>
          Private by design. All data stays on your device.
        </Text>
      </View>
    </SafeAreaView>
  );
}
