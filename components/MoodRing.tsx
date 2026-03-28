import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { stressLabels, stressEmoji } from "../utils/stressLevel";
import { stressColor } from "../constants/theme";
import { StressPrediction } from "../types";
import { Colors } from "../constants/theme";
import { formatScore } from "../utils/formatters";

interface MoodRingProps {
  prediction: StressPrediction | null;
}

export const MoodRing = ({ prediction }: MoodRingProps) => {
  const [showDetail, setShowDetail] = React.useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const level = prediction?.level || "calm";
  const color = stressColor[level];
  const score = prediction?.score || 0;

  useEffect(() => {
    if (level === "moderate" || level === "severe") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [level]);

  return (
    <View style={{ alignItems: "center", gap: 12 }}>
      <TouchableOpacity onPress={() => setShowDetail((v) => !v)} activeOpacity={0.9}>
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: color + "22",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 5,
            borderColor: color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <Text style={{ fontSize: 40 }}>{stressEmoji[level]}</Text>
          {showDetail && (
            <Text style={{ fontSize: 13, fontWeight: "700", color, marginTop: 4 }}>
              {formatScore(score)}
            </Text>
          )}
        </Animated.View>
      </TouchableOpacity>
      <Text style={{ fontSize: 17, fontWeight: "600", color: Colors.textPrimary }}>
        {stressLabels[level]}
      </Text>
      {showDetail && prediction && (
        <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
          Updated {new Date(prediction.timestamp).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
};
