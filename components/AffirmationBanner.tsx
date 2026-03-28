import React, { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Animated, PanResponder } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";

interface AffirmationBannerProps {
  message: string;
  onDismiss: () => void;
}

export const AffirmationBanner = ({ message, onDismiss }: AffirmationBannerProps) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 50 }).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderMove: (_, g) => { if (g.dy < 0) panY.setValue(g.dy); },
      onPanResponderRelease: (_, g) => {
        if (g.dy < -40) {
          Animated.timing(slideAnim, { toValue: -200, duration: 200, useNativeDriver: true }).start(onDismiss);
        } else {
          Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        transform: [{ translateY: Animated.add(slideAnim, panY) }],
        backgroundColor: Colors.primaryMuted,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
      }}
    >
      <Text style={{ fontSize: 22 }}>✨</Text>
      <Text style={{ flex: 1, fontSize: 15, color: Colors.textPrimary, lineHeight: 22 }}>
        {message}
      </Text>
      <TouchableOpacity onPress={onDismiss}>
        <Ionicons name="close" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};
