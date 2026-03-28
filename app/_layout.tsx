import React, { useEffect } from "react";
import { Tabs, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";
import { useUserStore } from "../stores/useUserStore";
import { useHealthStore } from "../stores/useHealthStore";
import { getAffirmation } from "../services/api";
import "../global.css";

function TabNavigator() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" as const },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: "Community",
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
          href: "/communities",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  const { onboardingComplete, persona } = useUserStore();
  const { startWearable, latestPrediction, showAffirmation } = useHealthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inOnboarding = segments[0] === "onboarding";
    if (!onboardingComplete && !inOnboarding) {
      router.replace("/onboarding");
    } else if (onboardingComplete && inOnboarding) {
      router.replace("/");
    }
  }, [onboardingComplete, segments]);

  useEffect(() => {
    if (onboardingComplete) {
      startWearable();
    }
  }, [onboardingComplete]);

  useEffect(() => {
    if (latestPrediction && (latestPrediction.level === "moderate" || latestPrediction.level === "severe")) {
      getAffirmation(latestPrediction.score, persona).then((msg) => {
        showAffirmation(msg);
      });
    }
  }, [latestPrediction?.timestamp]);

  return <TabNavigator />;
}
